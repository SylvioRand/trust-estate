#******************************************************************************#
#                                                                              #
#                                                         :::      ::::::::    #
#    chromadb.py                                        :+:      :+:    :+:    #
#                                                     +:+ +:+         +:+      #
#    By: aelison <aelison@student.42antananarivo    +#+  +:+       +#+         #
#                                                 +#+#+#+#+#+   +#+            #
#    Created: 2025/12/29 08:29:41 by aelison           #+#    #+#              #
#    Updated: 2026/01/05 16:07:30 by aelison          ###   ########.fr        #
#                                                                              #
#******************************************************************************#

import chromadb
import json
import re

from app.models import PostModel
from app.services.embedding import embeddingService

class ChromadbService:
    def __init__(self):
        self.client = None
        self.collections: dict[str, chromadb.Collection] = {}
        
    def parse_json(self, raw_text):
        pattern = r"```(?:json)?\s*(.*?)\s*```"
        
        match = re.search(pattern, raw_text, re.DOTALL)
        
        if match:
            json_str = match.group(1).strip()
        else:
            json_str = raw_text.strip()
        
        try:
            return json.loads(json_str)
        except json.JSONDecodeError as e:
            print(f"Error: Failed to parse JSON: {e}")
        return None
        
    async def initRequest(self):
        self.client = await chromadb.AsyncHttpClient(host='ft_chromadb', port=8000)

    async def create_collection(self, collection_name="posts"):
        try:
            tmp = await self.client.get_or_create_collection(
                name=collection_name,
                metadata={"hnsw:space": "cosine"}
            )
            self.collections[collection_name] = tmp
            print("Success in create collection !")
            return tmp
        except Exception as e:
            print(f"Error create collection: {e}")

    async def add_to_collection(self, collection_name, data: PostModel):
        target_collection = self.collections.get(collection_name)

        if not target_collection:
            return False
        text = data.get_embedding_format()
        embedding_result = embeddingService.generate_embedding(text)
        metadata = {
            "title": data.title,
            "post_type": data.post_type,
            "property_type": data.property_type,
            "price": data.price,
            "zone": data.zone,
        }
        if data.surface:
            metadata["surface"] = float(data.surface)
        if data.tags:
            metadata["tags"] = json.dumps(data.tags)
        if data.features:
            metadata["features"] = json.dumps(data.features)

        await target_collection.add(
            ids=[data.id],
            documents=[data.get_text_format()],
            embeddings=[embedding_result],
            metadatas=[metadata]
        )
        return True


    async def update_in_collection(self, collection_name, data: PostModel):
        to_find = self.collections.get(collection_name)

        if not to_find:
            return False
        text = data.get_embedding_format()
        embedding_result = embeddingService.generate_embedding(text)
        metadata = {
            "title": data.title,
            "post_type": data.post_type,
            "property_type": data.property_type,
            "price": data.price,
            "zone": data.zone,
        }
        if data.surface:
            metadata["surface"] = float(data.surface)
        if data.tags:
            metadata["tags"] = json.dumps(data.tags)
        if data.features:
            metadata["features"] = json.dumps(data.features)

        await to_find.upsert(
            ids=[data.id],
            documents=[data.get_text_format()],
            embeddings=[embedding_result],
            metadatas=[metadata]
        )
        return True

    async def remove_collection(self, collection_name):
        to_find = self.collections.get(collection_name)

        if not to_find:
            return False
        await self.client.delete_collection(name=collection_name)
        del self.collections[collection_name]

        return True

    async def remove_data_from_collection(self, collection_name, id):
        to_find = self.collections.get(collection_name)

        if not to_find:
            return False
        try:
            tmp = await to_find.get(ids=[id])

            if len(tmp['ids']) == 0:
                return False
            await to_find.delete(ids=[id])
            return True

        except Exception as e:
            print(f"Error deleting data in collection {e}")
        return False

    async def query_in_collection(self, collection_name, text, nb_result=10, filters=None):
        to_find = self.collections.get(collection_name)
        parse_filters = None

        if not to_find:
            return False
        if filters:
            if len(filters) > 1:
                parse_filters = {
                    "$and": [{key: value} for key, value in filters.items()]
                }
            if len(filters) == 1:
                parse_filters = filters

        embedding_format = embeddingService.generate_embedding(text)
        result = await self.collections[collection_name].query(
            query_embeddings=[embedding_format],
            n_results=nb_result,
            where=parse_filters
        )

        return result
    
    async def get_query(self, user_mssg, llm_service):
        parse_prompt = """
        You are a search assistant for a real estate app. 
        Analyze the user's request and output a JSON object with:
        1. "search_text": The semantic part of the query (e.g., "beautiful house with garden").
        2. "filters": A dictionary of metadata filters for ChromaDB.
        
        Available metadata fields: "price", "zone", "post_type" (sale/rent), "property_type" ('apartment', 'house', 'loft', 'land', 'commercial'), 'surface'
        
        Use ChromaDB operators: $gt, $lt, $eq, $gte, $lte.
        
        Example output for "House in Madagascar under 2M":
        {
        "search_text": "house",
        "filters": {
            "zone": "Madagascar",
            "price": {"$lt": 2000000}
        }
        }
        """
        llm_parse_response = llm_service.generate_response(user_mssg, parse_prompt)
        datas = self.parse_json(llm_parse_response)
        if not datas:
            datas = {}
        search_text = datas.get("search_text", user_mssg)
        filters = datas.get("filters", None)
        result = await self.query_in_collection("posts", search_text, 3, filters)
        return result
        
    #================= DEBUG Methods =========================
    async def list_collections(self):
        if self.client:
            result = await self.client.list_collections()
            print(f"nb elem inside collection {len(result)}")

            for elem in result:
                print(f"Name: {elem}")
            return result
    async def get_all_in_collection(self, collection_name):
        target_collection = self.collections.get(collection_name)

        if not target_collection:
            print("Collection not found?")
            return None
        try:
            print("============================================ ALL DATAS ============================================")
            data = await target_collection.get()
            if not data['ids']:
                print(f"No data found in collection: '{collection_name}'")
                return 
                
            for tmp in data:
                print(f"I got: {tmp} = {data[tmp]}")
            print("============================================ END ALL DATAS ============================================")

        except Exception as e:
            print(f"Error in getting data inside collection {e}")

    async def get_one_post_in_collection(self, collection_name, specific_ids):
        target_collection = self.collections.get(collection_name)

        if not target_collection:
            print("Collection not found?")
            return None
        try:
            print("============================================ UNIQUE DATAS ============================================")
            data = await target_collection.get(ids=specific_ids)
            if not data['ids']:
                print(f"No data found for  id: '{specific_ids}'")
                return 
            for tmp in data:
                print(f"I got: {tmp} = {data[tmp]}")
            
            print("============================================ END UNIQUE DATAS ============================================")

        except Exception as e:
            print(f"Error in getting data inside collection {e}")
        

chromadb_service = ChromadbService()
