# **************************************************************************** #
#                                                                              #
#                                                         :::      ::::::::    #
#    chromadb.py                                        :+:      :+:    :+:    #
#                                                     +:+ +:+         +:+      #
#    By: aelison <aelison@student.42antananarivo.m  +#+  +:+       +#+         #
#                                                 +#+#+#+#+#+   +#+            #
#    Created: 2025/12/29 08:29:41 by aelison           #+#    #+#              #
#    Updated: 2026/01/28 10:30:55 by aelison          ###   ########.fr        #
#                                                                              #
# **************************************************************************** #

from typing import Collection
import chromadb
import json
import re

from chromadb.config import Settings
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
        self.client = await chromadb.AsyncHttpClient(
                host='chromadb-service',
                port=8000,
                settings=Settings(anonymized_telemetry=False)
        )

    async def create_collection(self, collection_name="posts"):
        try:
            tmp = await self.client.get_or_create_collection(
                name=collection_name,
                metadata={"hnsw:space": "cosine"}
            )
            self.collections[collection_name] = tmp
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
            "post_type": data.type,
            "property_type": data.propertyType,
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
            "post_type": data.type,
            "property_type": data.propertyType,
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

    async def query_in_collection(self, collection_name, text, nb_result=10, filters=None, id_ref=None):
        to_find = self.collections.get(collection_name)
        parse_filters = None

        if not to_find:
            return False
        if filters and not id_ref:
            if len(filters) > 1:
                parse_filters = {
                    "$and": [{key: value} for key, value in filters.items()]
                }
            if len(filters) == 1:
                parse_filters = filters
        embedding_format = ""
        if id_ref:
            target_ref = await self.collections[collection_name].get(
                    ids=[id_ref],
                    include=['embeddings']
            )
            embedding_format = target_ref['embeddings'][0]
            parse_filters = { "id": {"$ne": id_ref}}
        else:
            embedding_format = embeddingService.generate_embedding(text)
        result = await self.collections[collection_name].query(
        query_embeddings=[embedding_format],
        n_results=nb_result,
        where=parse_filters
        )
        return result

    def get_parse_prompt(self):
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
        return parse_prompt

    def get_generate_text(self):
        prompt = """
        You are a search assistant for a real estate app. 
        Analyze the user's info and output a JSON object with:
        1. "description": An enhanced description of the infos (ex: Magnifique villa T4 de 250m² nichée dans le quartier prisé d'Ivandry.
        Ce bien d'exception, construit en 2020, vous séduira par ses prestations haut de gamme : 4 chambres spacieuses, 2 salles de bain modernes, une cuisine entièrement équipée et climatisée.
        Profitez d'une piscine privée au cœur d'un jardin arboré de 500m².
        Garage double et gardiennage 24h/24 pour votre sérénité.
        Une opportunité rare pour les familles recherchant confort et sécurité.) 
        2. "wordCount": The number of word inside the description
        3. "alternatives": [
        {
            "style": (ex: "concise"),
            "text": (ex: Villa T4 250m² Ivandry - 4 ch, 2 sdb, piscine, jardin 500m², garage, gardien. État impeccable, construction 2020.)
        }
        ]
        4. "suggestedTitle": a better title for the listing (ex: "Villa T4 de standing avec piscine - Ivandry")
        5. "keywords": all the keywords found in the user's info to generate a good description
        """
        return prompt

    async def get_query(self, user_mssg, llm_service, sys_prompt, id_ref=None):
        llm_parse_response = llm_service.generate_bloc_response(user_mssg, sys_prompt)
        datas = self.parse_json(llm_parse_response)
        if not datas:
            datas = {}
        search_text = datas.get("search_text", user_mssg)
        filters = datas.get("filters", None)
        result = await self.query_in_collection("posts", search_text, 3, filters, id_ref)

        relevant_data = [
                (id, doc, meta, score)
                for id, doc, meta, score in zip(
                    result['ids'][0],
                    result['documents'][0],
                    result['metadatas'][0],
                    result['distances'][0]
                )
                if score < 0.8
        ]
        new_result = {
                "ids": [[id for id, _, _, _ in relevant_data]],
                "documents": [[doc for _, doc, _, _ in relevant_data]],
                "metadatas": [[meta for _, _, meta, _ in relevant_data]],
                "distances": [[score for _, _, _, score in relevant_data]],
        }
        return new_result

    async def is_post_in_collection(self, collection_name, specific_ids):
        target_collection = self.collections.get(collection_name)

        if not target_collection:
            return False
        try:
            data = await target_collection.get(ids=specific_ids)
            if len(data['ids']) == 0:
                return False
        except Exception as e:
            print(f"Error in getting data inside collection {e}")
            return False
        return True
    
    async def get_post_in_collection(self, collection_name, specific_ids):
        target_collection = self.collections.get(collection_name)

        if not target_collection:
            return None
        try:
            data = await target_collection.get(ids=specific_ids)
            if len(data['ids']) == 0:
                return None
            return data
        except Exception as e:
            print(f"Error in getting data inside collection {e}")
            return None

    async def add_context_to_query(self, collection_name, query, context):
        if not context:
            return query
        to_add = await self.get_post_in_collection(collection_name, context)

        if not to_add:
            return query
        query['ids'][0].append(to_add['ids'][0])
        query['metadatas'][0].append(to_add['metadatas'][0])
        query['documents'][0].append(to_add['documents'][0])

        if 'distances' in query and query['distances']:
            query['distances'][0].append(0.0)
        return query
    
    def get_ids_from_query(self, query_result):

        if query_result.get('ids') and len(query_result['ids']) > 0:
            return query_result['ids'][0]
        return []

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

chromadb_service = ChromadbService()
