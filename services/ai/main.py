# **************************************************************************** #
#                                                                              #
#                                                         :::      ::::::::    #
#    main.py                                            :+:      :+:    :+:    #
#                                                     +:+ +:+         +:+      #
#    By: aelison <aelison@student.42antananarivo.m  +#+  +:+       +#+         #
#                                                 +#+#+#+#+#+   +#+            #
#    Created: 2025/12/29 08:30:32 by aelison           #+#    #+#              #
#    Updated: 2026/01/28 10:31:04 by aelison          ###   ########.fr        #
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
    nb_retry = 20
    interval = 1

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
        post1 = PostModel(
                id="je",
                title = "White House",
                description = "President house, with a lot of space",
                price = 1000000000000000,
                type = "sale",
                propertyType = "house",
                surface = 800.0,
                zone = "Ivandry",
                features = {
                    "toilette": 12,
                    "garage": True,
                    "room": 42,
                }
        )
        post2 = PostModel(
                id="moi",
                title = "Black House",
                description = "Dark Vador unique house",
                price = 1000000000000000,
                type = "sale",
                propertyType = "house",
                surface = 800.0,
                zone = "Ivato",
                features = {
                    "toilette": 3,
                    "garage": True,
                    "room": 55,
                },
                tags = ["exclusive"]
        )
        post3 = PostModel(
                id="koko",
                title = "Simple House",
                description = "Minimum requirement to live alone",
                price = 400000000,
                type = "sale",
                propertyType = "house",
                surface = 40.0,
                zone = "Ankadifotsy",
                features = {
                    "toilette": 1,
                    "bedroom": 1,
                    "kitchen": 1,
                },
        )
        await chromadb_service.create_collection("posts")
        await chromadb_service.add_to_collection("posts", post1)
        await chromadb_service.add_to_collection("posts", post2)
        await chromadb_service.add_to_collection("posts", post3)
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

# Catch errors of models, type need to be str, or field name incorrect, value not correct, ...
@app.exception_handler(RequestValidationError)
async def exception_handler(_: Request):
    return JSONResponse(
            status_code = status.HTTP_400_BAD_REQUEST,
            content = {
                "status": "failure",
                "reason": "invalid format provided",
                },
            )

# check if chromadb is ready to get data, query data, delete data, .... 
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
        # chroma_reply = await chromadb_service.get_post_in_collection("posts", context)
    print(f"Here is the chroma replyyyyy = {chroma_reply}")
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
                status_code = 503,
                content = {
                    "error": "llm_unavailable",
                    "message": "ai.llm_service_unavailable"
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

    except HTTPStatusError as e:
        return JSONResponse(
                status_code = 503,
                content = {
                    "error": "llm_unavailable",
                    "message": "ai.llm_service_unavailable"
                }
        )
    except (RequestError, TimeoutException) as e:
        return JSONResponse(
                status_code = 503,
                content = {
                    "error": "llm_unavailable",
                    "message": "ai.llm_service_unavailable"
                }
        )

    except Exception as e:
        return JSONResponse(
                status_code = 400,
                content = {
                    "status": "failure",
                    "reason": e
                }
        )
