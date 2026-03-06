# **************************************************************************** #
#                                                                              #
#                                                         :::      ::::::::    #
#    chromadb.py                                        :+:      :+:    :+:    #
#                                                     +:+ +:+         +:+      #
#    By: aelison <aelison@student.42antananarivo.m  +#+  +:+       +#+         #
#                                                 +#+#+#+#+#+   +#+            #
#    Created: 2025/12/29 08:29:41 by aelison           #+#    #+#              #
#    Updated: 2026/02/23 11:13:02 by aelison          ###   ########.fr        #
#                                                                              #
# **************************************************************************** #

from typing import Collection
import chromadb
import json
import re

from app.models import PostModel, metaData
from app.services.embedding import embeddingService

def sort_obj(obj, field, is_minimum):
    if not obj or not obj.get('ids') or len(obj['ids'][0]) == 0:
        return None
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

def refine_for_llm(user_mssg, chroma_result):
    chroma_string = json.dumps(chroma_result, indent = 2)

    prompt = f"""
    TASK: Filter the CHROMA_CONTEXT to keep ONLY listings that match the USER_INPUT.

    INTERNAL STEPS (do NOT output these):
    1. TRANSLATE the USER_INPUT to English.
    2. EXTRACT all criteria: property_type, post_type, zone, price range, bedrooms, bathrooms, pool, garden, parking, water, electricity, surface, etc.
    3. For each listing in CHROMA_CONTEXT, check if it satisfies ALL extracted criteria.
    4. KEEP only listings that match ALL criteria. If a criterion is not mentioned by the user, it is not a filter (ignore it).
    5. Return the filtered CHROMA_CONTEXT in the EXACT same JSON structure.

    RULES:
    - If NO listings match ALL criteria, return empty arrays: {{"ids":[[]], "distances":[[]], "metadatas":[[]], "documents":[[]]}}
    - NEVER invent or modify data. Copy matching entries exactly as they are.
    - Price matching: if user says "budget X" or "moins de X", keep listings with price <= X.
    - Zone matching: partial match is OK (e.g., "Ivandry" matches "Ivandry").
    - Return ONLY valid JSON. No prose, no markdown, no code blocks.

    USER_INPUT: {user_mssg}

    CHROMA_CONTEXT:
    {chroma_string}
    """
    return prompt

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
        if id_ref:
            target_ref = await self.collections[collection_name].get(
                    ids=[id_ref],
                    include=['embeddings']
            )
            embedding_format = target_ref['embeddings'][0]
            parse_filters = { "id": {"$ne": id_ref}}
        else:
            embedding_format = embeddingService.generate_embedding(text)
        if nb_result <= 0:
            nb_result = 10
        result = await self.collections[collection_name].query(
        query_embeddings=[embedding_format],
        n_results=nb_result,
        where=parse_filters
        )
        return result

    def get_parse_prompt(self):
        parse_prompt = """
        ROLE: You are a strict JSON generator for a real estate search engine. 
        The user may write in ANY language (French, English, Spanish, Malagasy, etc.).

        INTERNAL STEPS (never output these, they are for your reasoning only):
        STEP 1 - CORRECT: Fix any spelling or grammar mistakes in the user input.
        STEP 2 - TRANSLATE: Translate the corrected input to English.
        STEP 3 - PARSE: Extract filters from the corrected English and produce the JSON output.
        Output ONLY the final JSON from STEP 3.

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
        1. OUTPUT: Return ONLY a valid JSON object. No prose, no explanations.
        2. FILTERS: 
            - Use ONLY these keys: "price", "zone", "post_type", "property_type", "surface".
            - Do NOT add feature-level filters (bedrooms, pool, etc.) to the filters object. Features are handled separately via semantic search.
        3. ZONE NORMALIZATION: 
            - MANDATORY: Search the user's location in the VALID ZONES list.
            - If a partial match exists (e.g., "Ambalavao"), use the FULL VALID ZONE name (e.g., "Ambalavao-Isotry").
            - NEVER invent a zone name. If NO match is found in VALID ZONES, use "Autre quartier".
        4. PROPERTY_TYPE: Map to 'apartment', 'house', 'loft', 'land', or 'commercial'.
        5. POST_TYPE: Map to 'sale' or 'rent'.
        6. PRICE FILTER RULES:
            - If user mentions a price ("for X", "budget of X", "less than X"): ALWAYS use {"price": {"$lte": X}}.
            - If user implies a minimum ("at least X", "more than X"): use {"price": {"$gte": X}}.
            - NEVER use exact price match.
            - NUMBER NORMALIZATION: "3 milliards" / "3 billion" → 3000000000.
        7. SEARCH_TEXT: Always write keywords in English (e.g., "apartment for rent").
        8. NB_CONTEXT & SORTING:
            - Cheapest/most expensive, NO other filters → nb_context: -1, sort_by active.
            - Cheapest/most expensive WITH other filters → nb_context: 7, sort_by active, search_text = other filters only.
            - Specific number of results mentioned → nb_context: that number (max 7), sort_by: null.
            - Default → nb_context: 7, sort_by: null.
        9. STRUCTURE CONSTRAINT: nb_context must be -1 ONLY when sort_by is active. sort_by fields must be null when not sorting.

        OUTPUT STRUCTURE:
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
            "search_text": "cheapest listing",
            "filters": {}
        }
        """
        return parse_prompt

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
    
    async def get_ids_from_query(self, query_result, llm_service, user_mssg):
        llm_refine = refine_for_llm(user_mssg, query_result)
        llm_response = await llm_service.generate_bloc_response(llm_refine, llm_service.get_matching_listing())
        filtered_result = self.parse_json(llm_response)
        if not filtered_result:
            filtered_result = {'ids': [], 'metadatas': [], 'documents': []}
        result: list[metaData] = []

        if filtered_result.get('ids') and len(filtered_result['ids']) > 0:
            for returned_id in filtered_result['ids'][0]:
                try:
                    original_idx = query_result['ids'][0].index(returned_id)
                    original_meta = query_result['metadatas'][0][original_idx]
                    
                    photos_url = ("/uploads/" + original_meta.get("photos")) if original_meta.get("photos") else ""
                    
                    curr_obj = metaData(
                            id = returned_id,
                            photos = photos_url,
                            title = original_meta.get("title", ""),
                            price = original_meta.get("price", 1.0),
                            propertyType = original_meta.get("property_type", "house"),
                            type = original_meta.get("post_type", "sale"),
                            zone = original_meta.get("zone", "")
                    )
                    result.append(curr_obj)
                except ValueError:
                    continue
        return result

chromadb_service = ChromadbService()
