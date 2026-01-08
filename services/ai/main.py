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

from app.services.llm import LLMService
from app.models import RequestChat, ResponseChat, PostModel

from fastapi import FastAPI
from contextlib import asynccontextmanager
from app.services.chromadb import chromadb_service

import asyncio
import httpx

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

# ====================== Init connection to service chromadb ==================
@asynccontextmanager
async def lifespan(app: FastAPI):
    is_connected = False
    nb_retry = 20
    interval = 1

    for i in range(nb_retry):
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
            property_type = "house",
            description = "President House, beautiful, smell money",
            price = 1000000,
            zone = "Madagascar",
            surface = None,
            photos = [],
            features = ["toilet", "bathroom", "parking"],
            tags = ["exclusive", "sold", "urgent"]
        )
        post2 = PostModel(
            id = "momo",
            title = "Haunted house",
            post_type = "sale",
            property_type = "house",
            description = "Horror house, there is ghost here",
            price = 200,
            zone = "France",
            surface = 200,
            photos = [],
            features = ["bathroom", "livingroom"],
            tags = ["urgent"]
        )
        await chromadb_service.add_to_collection("posts", post1)
        await chromadb_service.add_to_collection("posts", post2)
        await chromadb_service.get_all_in_collection("posts")
    yield
    
app = FastAPI(lifespan=lifespan)

# ====================== Default route ================
@app.get("/")
def default_root():
    print("Hello there !")

# ===================== Test LLM messages ===============================


llm_service = LLMService()

@app.post("/api/chat")
async def chatbot(text: RequestChat):
    user_mssg = text.message
    context = text.context
    sys_prompt = chromadb_service.get_parse_prompt(text.language)

    chroma_reply = await chromadb_service.get_query(user_mssg, llm_service, sys_prompt)
    chroma_reply = await chromadb_service.add_context_to_query("posts", chroma_reply, context)

    formated = format_chroma_response(user_mssg, chroma_reply)
    llm_response = llm_service.generate_response(formated, llm_service.generate_rules())
    return ResponseChat(
        reply = llm_response,
        sources = None
    )

@app.delete("/api/index/{listingId}")
async def deletePost(listingId: str):
    result = await chromadb_service.remove_data_from_collection("posts", listingId)

    if result:
        return {
             "success": result,
             "listingId": listingId,
             "message": "post deleted"
        }
    return {
            "error": "index not found",
            "message": "listingId not indexed in database"
    }

@app.post("/api/index")
async def update_datas(to_update: PostModel):
    result = False
    exist = await chromadb_service.is_post_in_collection("posts", to_update.id)

    if not exist:
        result = await chromadb_service.add_to_collection("posts", to_update)
    else:
        result = await chromadb_service.update_in_collection("posts", to_update)

    if result:
        return {
                "success": result
        }
    return {
            "error": "failed to update database",
            "message": "failed to update database"
    }
