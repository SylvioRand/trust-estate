# **************************************************************************** #
#                                                                              #
#                                                         :::      ::::::::    #
#    chromadb.py                                        :+:      :+:    :+:    #
#                                                     +:+ +:+         +:+      #
#    By: aelison <aelison@student.42antananarivo.m  +#+  +:+       +#+         #
#                                                 +#+#+#+#+#+   +#+            #
#    Created: 2025/12/29 08:29:41 by aelison           #+#    #+#              #
#    Updated:    2026-02-16 09:59:11 by aelison          ###   ########.fr        #
#                                                                              #
# **************************************************************************** #

from typing import Collection
import chromadb
import json
import re

from app.models import PostModel, metaData
from app.services.embedding import embeddingService

def sort_obj(obj, field, is_minimum):
    tmp = []
    value = None

    for i in range(len(obj['ids'][0])):
        tmp.append({
            "id": obj['ids'][0][i],
            "metadata": obj['metadatas'][0][i],
            "document": obj['documents'][0][i]
        })

    if is_minimum == "min":
        value = min(tmp, key= lambda x: x['metadata'][field])
    else:
        value = max(tmp, key= lambda x: x['metadata'][field])
    return value

def rewrap_as_chromadb_query_format(obj):
    if not obj:
        return {
            'ids': [],
            'distances': [],
            'metadatas': [],
            'documents': [],
            'uris': None,
            'datas': None
    }
    if isinstance(obj, dict):
        obj = [obj]
    return {
            'ids': [[item['id'] for item in obj]],
            'metadatas': [[item['metadata'] for item in obj]],
            'documents': [[item['document'] for item in obj]],
            'distances': [[0.0 for _ in obj]],
            'embeddings': None,
            'uris': None,
            'datas': None
    }


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
        except json.JSONDecodeError:
            return None
        
    async def initRequest(self):
        self.client = await chromadb.AsyncHttpClient(
                host='chromadb-service',
                port=8000,
        )

    async def create_collection(self, collection_name="posts"):
        try:
            tmp = await self.client.get_or_create_collection(
                name=collection_name,
                metadata={"hnsw:space": "cosine"}
            )
            self.collections[collection_name] = tmp
            return tmp
        except Exception:
            return None

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
        if data.photos:
            metadata["photos"] = data.photos[0]

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
        if data.photos:
            metadata["photos"] = data.photos[0]

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

        except Exception:
            return False

    async def query_in_collection(self, collection_name, text, nb_result=10, filters=None, id_ref=None):
        to_find = self.collections.get(collection_name)
        parse_filters = None

        if not to_find:
            return False
        if filters and not id_ref:
            filter_bloc = []
            for key, value in filters.items():
                if isinstance(value, dict):
                    for operator, content in value.items():
                        filter_bloc.append({key: {operator: content}})
                else:
                    filter_bloc.append({key: value})
            if len(filter_bloc) > 1:
                parse_filters = {"$and": filter_bloc}
            else:
                parse_filters = filter_bloc[0]
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
        ROLE: You are a strict JSON generator for a real estate search engine. 
        You only knows the languages French, English and Spanish.

        VALID ZONES = [
        "Ambalavao-Isotry", "Ambatonakanga-Ambohitsorohitra", "Ambatovinaky", "Ambodifilao-Soarano II S", "Ampandrana-Ankadivato", "Amparibe-Avaratr'Imahamasina", "Ampasamadinika-Amboasarikely", "Anatihazo Isotry", "Andavamamba-Anatihazo I", "Andavamamba-Anatihazo II",
        "Andavamamba-Anjezika I", "Andavamamba-Anjezika II", "Andohatapenaka I", "Andohatapenaka II", "Andohatapenaka III", "Andranomanalina Afovoany", "Andranomanalina I", "Andranomanalina-Isotry", "Ankasina", "Antanimalalaka-Analakely",
        "Antetezana Fovoany I", "Antetezana Fovoany II", "Antohomadinika Afovoany III F", "Antohomadinika Atsimo", "Antohomadinika-Antaniavo", "Antohomadinika-FAAMI", "Antohomadinika III G Hangar", "Avaratetezana-Bekiraro", "Cité-Ambodin'Isotry", "Cité Ampefiloha",
        "Cité 67 ha Afovoany-Andrefana", "Cité 67 ha Atsimo", "Cité 67 ha Avaratra-Andrefana", "Cité 67 ha Avaratra-Atsinanana", "Lalamby sy ny Manodidina", "Faravohitra Ambony", "Faravohitra-Mandrosoa", "Isoraka-Ampatsakana", "Tsaralalàna-Isotry FIATA", "Manarintsoa Afovoany",
        "Manarintsoa Anatihazo", "Manarintsoa Antsinanana", "Manarintsoa Isotry", "Ambohipo", "Ambolokandrina", "Androndrakely", "Morarano", "Tsiadana", "Ambohitsoa", "Faliarivo Ambanidia",
        "Mandroseza", "Antanimora Ampasanimalo", "Ambatoroka", "Ambohimiandra", "Miandrarivo", "Manakambahiny", "Mahazoarivo", "Andafiavaratra", "Manjakamiadana", "Ampamantanana",
        "Andohanimandroseza", "Antsahabe", "Volosarika", "Ambohipotsy", "Ambohitsiroa VN", "Ankazotokana Ambony", "Andohamandry", "Fenomanana-Antsahakely", "Ambohibary", "Ankaditapaka-Avaratra",
        "Behoririka-Ambatomitsangana", "Ankadifotsy Antanifotsy", "Ambohibary-Antanimena", "Befelatanana-Ankadifotsy", "Andravoahangy Tsena", "Mandialaza-Ambatomitsangana", "Andravoahangy Andrefana", "Behoririka", "Ampandrana Andrefana", "Ankadivato IIL",
        "Ampahibe", "Antsakaviro-Ambodirotra", "Antaninandro-Ampandrana", "Ankorondrano Atsinanana", "Soavinandriana", "Avaradoha", "Betongolo", "Ampandrana Atsinanana", "Ampandrana-Besarety", "Andravoahangy Atsinanana",
        "Ankazomanga Andraharo Avaratra", "Besarety", "Mahavoky", "Mandialaza-Ankadifotsy", "Ambodivona-Ankadifotsy", "Ambohitrakely", "Ampandrana", "Ambanin'Ampamarinana", "Ampefiloha Ambodirano", "Ampangabe Anjanakinifolo",
        "Ambodirano-Ampefiloha", "Anosibe-Andrefana I", "Mandrangobato-Anosibe I", "Ambohijanahary III G, III M", "Ambohijanahary III H, III O", "Andrefan'Ankadimbahoaka", "Andrefan'I Mananjara", "Angarangarana", "Ankadilalana", "Ambatobe",
        "Ambatokaranana", "Ambatomainty", "Ambatomaro", "Amboditsiry", "Ambodivoanjo", "Ambohidahy", "Ambohimirary", "Amboniloha", "Ampanotokana", "Analamahintsy cité",
        "Analamahintsy Tanàna", "Andraisoro", "Androhibe", "Anjanahary II A", "Anjanahary II N", "Anjanahary II O", "Anjanahary II S", "Ankadindramamy", "Ivandry", "Manjakaray II B",
        "Manjakaray II C", "Manjakaray II D", "Morarano Ambatomainty", "Nanisana", "Soavimasoandro", "Tsarahonenana", "Ambatolampy", "Amboavahy", "Ambodihady", "Ambodimita",
        "Ambodivona", "Ambodivonakely", "Ambohidroa", "Ambohimanandray", "Andranomena", "Avaratetezana", "Anosibe Zaivola", "Antsararay", "Avaratanana", "Autre quartier"
]
        RULES:
        1. OUTPUT: Return ONLY a valid JSON object. No prose, no explanations, no "Je suppose que...".
        2. FILTERS: Only use "price", "zone", "post_type", "property_type", "surface".
        3. ZONE NORMALIZATION: Map to VALID ZONES or capitalize first letter.
        4. PROPERTY_TYPE: Map to 'apartment', 'house', 'loft', 'land', or 'commercial'.
        5. POST_TYPE: Map to 'sale' or 'rent'.
        6. NUMBERS: Use ChromaDB operators ONLY for specific numbers provided by the user. 
        DO NOT invent values (e.g., no placeholder $lt: 1000000).
        7. SEARCH_TEXT: Always include keywords (e.g., "house", "3 bedrooms").
        8. NB_CONTEXT & SORTING (Priority Rule):
            IF the user asks for "cheapest/most expensive" AND provides NO other filters (no zone, no property type, etc.):
                Set nb_context to -1.
                Set sort_by: {"field": "price", "content": "min"|"max"}.
            IF the user asks for "cheapest/most expensive" BUT includes additional filters (e.g., "at Ivandry", "a house", etc.):
                Set nb_context to 7.
                Set sort_by: {"field": "price", "content": "min"|"max"}.
                set SEARCH_TEXT to the additional filters ONLY
            ELSE IF a specific number of results is mentioned: Set nb_context to that number (Max 7), sort_by to null.
            DEFAULT: Set nb_context to 7, sort_by to null.
        9. STRUCTURE: nb_context must be -1 if sort_by is active. sort_by must be null otherwise.
        10. TYPO RESILIENCE: Be highly forgiving of typos in superlatives.
        Specifically, anything similar to "la mois cher" or "le plus moin cher" or "le mois chers" must always be interpreted as "cheapest" (field: price, content: min).
        Do not assume the user wants the "most expensive" unless they explicitly say "plus cher".

        STRUCTURE:
        {
            "isAbout_real_estate": boolean,
            "nb_context": number,
            "sort_by": { "field": "price"|"surface"|null, "content": "min"|"max"|null },
            "search_text": string,
            "filters": {}
        }

        EXAMPLES:
        User: "hello, i am looking for a house at ivandry"
        {
            "isAbout_real_estate": true,
            "nb_context": 7,
            "sort_by": { "field": null, "content": null },
            "search_text": "house",
            "filters": {
                "property_type": "house",
                "zone": "Ivandry"
            }
        }
        User: "donne moi l'annonce la mois cher"  <-- (Intentional typo)
        {
            "isAbout_real_estate": true,
            "nb_context": -1,
            "sort_by": { "field": "price", "content": "min" },
            "search_text": "moins chère",
            "filters": {}
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


    def from_score_only(self, to_parse, ref_score):
        relevant_data = [
                (id, doc, meta, score)
                for id, doc, meta, score in zip(
                    to_parse['ids'][0],
                    to_parse['documents'][0],
                    to_parse['metadatas'][0],
                    to_parse['distances'][0]
                )
                if score < ref_score
        ]
        new_result = {
                "ids": [[id for id, _, _, _ in relevant_data]],
                "documents": [[doc for _, doc, _, _ in relevant_data]],
                "metadatas": [[meta for _, _, meta, _ in relevant_data]],
                "distances": [[score for _, _, _, score in relevant_data]],
        }

        return new_result

    async def get_query(self, user_mssg, llm_service, sys_prompt, id_ref=None):
        llm_parse_response = await llm_service.generate_bloc_response(user_mssg, sys_prompt)
        print(f"DEBUGGING format send by LLM: {llm_parse_response}")
        datas = self.parse_json(llm_parse_response)
        if not datas:
            datas = {}
        search_text = datas.get("search_text", user_mssg)
        filters = datas.get("filters", None)
        searched = datas.get("isAbout_real_estate", False)
        nb_context = datas.get("nb_context", 0)
        sort_by = datas.get("sort_by", None)
        if not searched:
            return {
                    'ids': [],
                    'distances': [],
                    'metadatas': [],
                    'documents': [],
                    'uris': None,
                    'datas': None
            }
        
        if nb_context < 0:
            tmp = self.collections.get("posts")
            if tmp:
                nb_context = await tmp.count()
            else:
                nb_context = 10

        result = await self.query_in_collection("posts", search_text, nb_context, filters, id_ref)
        print(f"Result of query: {result}")
        if sort_by and sort_by.get("field"):
            get_sorted = datas.get('sort_by')
            sorted_field_value = get_sorted.get("field", "")
            sorted_content_value = get_sorted.get("content", "")
            get_sort_value = sort_obj(result, sorted_field_value, sorted_content_value)
            sorted_result = rewrap_as_chromadb_query_format(get_sort_value)
            return sorted_result
        return result

    async def is_post_in_collection(self, collection_name, specific_ids):
        target_collection = self.collections.get(collection_name)

        if not target_collection:
            return False
        try:
            data = await target_collection.get(ids=specific_ids)
            if len(data['ids']) == 0:
                return False
        except Exception:
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
        except Exception:
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
        result: list[metaData] = []

        if query_result.get('ids') and len(query_result['ids']) > 0:
            for nb in range(len(query_result['ids'][0])):
                curr_obj = metaData(
                        id = query_result['ids'][0][nb],
                        photos = "https://localhost:8443/uploads/" + query_result['metadatas'][0][nb].get("photos", ""),
                        title = query_result['metadatas'][0][nb].get("title", ""),
                        price = query_result['metadatas'][0][nb].get("price", 1.0),
                        propertyType = query_result['metadatas'][0][nb].get("property_type", "house"),
                        type = query_result['metadatas'][0][nb].get("post_type", "sale"),
                        zone = query_result['metadatas'][0][nb].get("zone", "")
                )
                result.append(curr_obj)
        return result

    #================= DEBUG Methods =========================
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
