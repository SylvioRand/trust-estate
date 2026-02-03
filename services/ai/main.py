# **************************************************************************** #
#                                                                              #
#                                                         :::      ::::::::    #
#    main.py                                            :+:      :+:    :+:    #
#                                                     +:+ +:+         +:+      #
#    By: aelison <aelison@student.42antananarivo.m  +#+  +:+       +#+         #
#                                                 +#+#+#+#+#+   +#+            #
#    Created: 2025/12/29 08:30:32 by aelison           #+#    #+#              #
#    Updated: 2026/02/02 08:49:52 by aelison          ###   ########.fr        #
#                                                                              #
# **************************************************************************** #

import asyncio
import httpx
import jwt

from app.config import config
from app.services.llm import LLMService
from app.models import Description, RequestChat, PostModel

from fastapi import FastAPI, status, Request, Header, HTTPException, Depends
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse, StreamingResponse

from contextlib import asynccontextmanager
from app.services.chromadb import chromadb_service

from httpx import HTTPStatusError, RequestError, TimeoutException
from fastapi.middleware.cors import CORSMiddleware

# ====================== Utils ==================
import logging

logging.getLogger('chromadb.telemetry.product.posthog').setLevel(logging.CRITICAL)

def format_chroma_response(user_mssg, chroma_text):
    context = llm_service.format_for_llm(chroma_text)
    formated = "CONTEXT:\n"
    if context:
        formated += context
    else:
        formated += "None"
    formated += "USER INPUT:\n" + user_mssg
    return formated

async def check_keys(x_internal_key: str = Header(None)):
    if not x_internal_key:
        raise HTTPException(
            status_code = 401,
            details = "Missing internal key"
        )
    try:
        payload = jwt.decode(
                x_internal_key,
                config.INTERNAL_KEY,
                algorithms = ["HS256"]
                )
        return payload
    except jwt.PyJWTError:
        raise HTTPException(
            status_code = 401,
            details = "Invalid token"
        )

# ====================== Init connection to service chromadb ==================
@asynccontextmanager
async def lifespan(_: FastAPI):
    is_connected = False
    nb_retry = 5
    interval = 5

    for _ in range(nb_retry):
        try:
            await chromadb_service.initRequest()

            is_connected = True
            break
        except (httpx.ConnectError, Exception) as e:
            print(f"Error {e}. Retry in {interval} seconds.")
            await asyncio.sleep(interval)
    if not is_connected:
        print("Failed to init with server chromadb")
        exit(1)
    else:
        await chromadb_service.create_collection("posts")
    yield
    
app = FastAPI(lifespan=lifespan)

#Enable cross-origin (CORS)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE"],
    allow_headers=["Content-Type", "Authorization"],
)
# ====================== LLM cases ==================

llm_service = LLMService()

@app.exception_handler(RequestValidationError)
async def exception_handler(_: Request):
    return JSONResponse(
            status_code = status.HTTP_400_BAD_REQUEST,
            content = {
                "status": "failure",
                "reason": "invalid format provided",
                },
            )

@app.get("/ai/health")
async def check_health():
    try:
        await chromadb_service.initRequest()
        return {
            "status": "healthy"
        }
    except Exception:
        return JSONResponse(
                status_code = status.HTTP_503_SERVICE_UNAVAILABLE,
                content = {
                    "status": "degraded"
                },
        )

@app.post("/ai/chat/")
async def chatbot(text: RequestChat):

    await chromadb_service.get_all_in_collection("posts")

    user_mssg = text.message
    sys_prompt = chromadb_service.get_parse_prompt()
    context = None
    chroma_reply = None

    if text.context and len(text.context) > 0:
        context = text.context

    if not context:
        chroma_reply = await chromadb_service.get_query(user_mssg, llm_service, sys_prompt)
    else:
        chroma_reply = await chromadb_service.get_query(user_mssg, llm_service, sys_prompt, context)
    formated = format_chroma_response(user_mssg, chroma_reply)
    id_found = chromadb_service.get_ids_from_query(chroma_reply)
    try:
        llm_response = llm_service.generate_stream_response(formated, id_found, llm_service.generate_rules())

        async def wrapper():
            async for content in llm_response:
                yield content

        return StreamingResponse(wrapper(), media_type="text/plain")

    except Exception:
        return JSONResponse(
                status_code = 500,
                content = {
                    "error": "llm_unavailable",
                    "message": "global.500"
                }
        )

@app.delete("/ai/index/{listingId}")
async def deletePost(listingId: str, _: dict = Depends(check_keys)):
    result = await chromadb_service.remove_data_from_collection("posts", listingId)

    if not result:
        return JSONResponse(
                status_code = 404,
                content = {
                    "error": "index_not_found",
                    "message": "ai.listing_not_indexed"
                }
        )
    return {
            "listingId": listingId
    }

@app.post("/ai/index")
async def add_datas(to_update: PostModel, _: dict = Depends(check_keys)):

    result = await chromadb_service.add_to_collection("posts", to_update)

    return {
        "success": result
    }

@app.put("/ai/index")
async def update_datas(to_update: PostModel, _: dict = Depends(check_keys)):
    result = await chromadb_service.update_in_collection("posts", to_update)

    return {
        "success": result
    }

@app.get("/ai/index-status/{listingId}")
async def isListIndexed(listingId: str):
    result = await chromadb_service.is_post_in_collection("posts", listingId)

    return {
        "listingId": listingId,
        "isIndexed": result,
    }

@app.post("/ai/generate")
async def generate_better_description(text: Description):

    try:
        llm_response = llm_service.generate_bloc_response(text.description, llm_service.generate_description())

        return {
            "reply": llm_response
        }

    except HTTPStatusError:
        return JSONResponse(
                status_code = 500,
                content = {
                    "error": "llm_unavailable",
                    "message": "global.500"
                }
        )
    except (RequestError, TimeoutException):
        return JSONResponse(
                status_code = 500,
                content = {
                    "error": "llm_unavailable",
                    "message": "global.500"
                }
        )

    except Exception:
        return JSONResponse(
                status_code = 500,
                content = {
                    "error": "llm_unavailable",
                    "message": "global.500"
                }
        )
