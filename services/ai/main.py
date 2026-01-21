#******************************************************************************#
#                                                                              #
#                                                         :::      ::::::::    #
#    main.py                                            :+:      :+:    :+:    #
#                                                     +:+ +:+         +:+      #
#    By: aelison <aelison@student.42antananarivo    +#+  +:+       +#+         #
#                                                 +#+#+#+#+#+   +#+            #
#    Created: 2025/12/29 08:30:32 by aelison           #+#    #+#              #
#    Updated: 2026/01/05 15:50:49 by aelison          ###   ########.fr        #
#                                                                              #
#******************************************************************************#

# from os import stat
# from typing import Optional
from app.config import config
from app.services.llm import LLMService
from app.models import Description, RequestChat, ResponseChat, PostModel

from fastapi import FastAPI, status, Request, Response, Header, HTTPException, Depends
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse

from contextlib import asynccontextmanager
from app.services.chromadb import chromadb_service
from app.user_prompt import prompt

import asyncio
import httpx
import jwt

# ====================== Utils ==================
def format_chroma_response(user_mssg, chroma_text, history: list[str]):
    context = llm_service.format_for_llm(chroma_text)
    formated = "CONTEXT:\n"
    line = 1
    if context:
        formated += context
    else:
        formated += "None"
    if len(history) > 1:
        formated += "USER HISTORY (Previous user messages):\n" 
        for elem in history:
            formated += f"{line}. {elem}\n"
            line += 1
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
        await chromadb_service.create_collection("posts")
    yield
    
app = FastAPI(lifespan=lifespan)

# ====================== LLM cases ==================

llm_service = LLMService()

# Catch errors of models, type need to be str, or field name incorrect, value not correct, ...
@app.exception_handler(RequestValidationError)
async def exception_handler(_: Request, exception_error: RequestValidationError):
    return JSONResponse(
            status_code = status.HTTP_400_BAD_REQUEST,
            content = {
                "status": "failure",
                "reason": "invalid format provided",
                "missing_fields": [err["loc"] for err in exception_error.errors()]
                },
            )

@app.get("/ai/health")
async def check_health():
    try:
        await chromadb_service.initRequest()
        return {
            "status": "success"
        }
    except Exception:
        return Response(status_code = status.HTTP_503_SERVICE_UNAVAILABLE)


@app.post("/ai/chat")
async def chatbot(text: RequestChat):
    prompt.add(text.message)
    user_mssg = text.message
    sys_prompt = chromadb_service.get_parse_prompt()
    context = None
    chroma_reply = None

    await chromadb_service.list_collections()

    await chromadb_service.get_all_in_collection("posts")
    if text.context and len(text.context) > 0:
        context = text.context

    if not context:
        chroma_reply = await chromadb_service.get_query(user_mssg, llm_service, sys_prompt)
    else:
        chroma_reply = await chromadb_service.get_post_in_collection("posts", context)
    formated = format_chroma_response(user_mssg, chroma_reply, prompt.get_history())
    id_found = chromadb_service.get_ids_from_query(chroma_reply)
    llm_response = llm_service.generate_response(formated, llm_service.generate_rules())

    return ResponseChat(
        reply = llm_response,
        links = id_found
    )

@app.delete("/ai/index/{listingId}")
async def deletePost(listingId: str, _: dict = Depends(check_keys)):
    result = await chromadb_service.remove_data_from_collection("posts", listingId)
    return {
            "success": result
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
        llm_response = llm_service.generate_response(text.description, llm_service.generate_description())

        return {
            "reply": llm_response
        }

    except Exception as e:
        return JSONResponse(
                status_code = status.HTTP_400_BAD_REQUEST,
                content = {
                    "status": "failure",
                    "reason": e
                }
        )
