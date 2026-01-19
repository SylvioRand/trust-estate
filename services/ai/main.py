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

from os import stat
from app.services.llm import LLMService
from app.models import Description, RequestChat, ResponseChat, PostModel

from fastapi import FastAPI, status, Request, Response
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse

from contextlib import asynccontextmanager
from app.services.chromadb import chromadb_service
from app.user_prompt import prompt

import asyncio
import httpx

# ====================== Utils ==================
def format_chroma_response(user_mssg, chroma_text, history: list[str]):
    context = llm_service.format_for_llm(chroma_text)
    formated = "CONTEXT:\n"
    if context:
        formated += context
    else:
        formated += "None"
    if len(history) > 0:
        formated += "USER HISTORY:\n" 
        for elem in history:
            formated += elem + "\n"
    formated += "USER INPUT:\n" + user_mssg
    return formated

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
    else:
        await chromadb_service.create_collection("posts")
        post1 = PostModel(
            id = "moi",
            title = "White house",
            post_type = "sale",
            property_type = "apartment",
            description = "President House, beautiful, smell money",
            price = 80000000,
            zone = "Ivandry",
            surface = 35,
            photos = [],
            features = [],
            tags = ["exclusive", "sold"]
        )
        post2 = PostModel(
            id = "momo",
            title = "Haunted house",
            post_type = "sale",
            property_type = "apartment",
            description = "Horror house, there is ghost here",
            price = 200000000,
            zone = "Ivandry",
            surface = 200,
            photos = [],
            features = ["toilet", "bathroom", "parking", "kitcken"],
            tags = ["urgent"]
        )

        post3 = PostModel(
            id = "koko",
            title = "Haunted house",
            post_type = "sale",
            property_type = "apartment",
            description = "Horror house, there is ghost here",
            price = 100000000,
            zone = "Ivandry",
            surface = 400,
            photos = [],
            tags = ["urgent"]
        )

        await chromadb_service.add_to_collection("posts", post1)
        await chromadb_service.add_to_collection("posts", post2)
        await chromadb_service.add_to_collection("posts", post3)
    yield
    
app = FastAPI(lifespan=lifespan)

# ====================== Default route ================
# @app.get("/")
# def default_root():
#     print("Hello there !")

# ===================== Test LLM messages ===============================


llm_service = LLMService()

# Catch errors of models, type need to be str, or field name incorrect, ...
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
    print("======================================================================")
    print(f"Current: {prompt.get_current()}")
    print(f"history: {prompt.get_history()}")

    print("======================================================================")




    user_mssg = text.message
    sys_prompt = chromadb_service.get_parse_prompt()
    context = None
    chroma_reply = None

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

    print(id_found)
    return ResponseChat(
        reply = llm_response,
        links = id_found
    )

@app.delete("/ai/index/{listingId}")
async def deletePost(listingId: str):
    result = await chromadb_service.remove_data_from_collection("posts", listingId)
    return {
            "success": result
    }

# call the route GET /listings/:id when merging with the main
@app.post("/ai/index")
async def update_datas(to_update: PostModel):
    result = False
    exist = await chromadb_service.is_post_in_collection("posts", to_update.id)

    if not exist:
        result = await chromadb_service.add_to_collection("posts", to_update)
    else:
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
