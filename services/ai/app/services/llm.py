# **************************************************************************** #
#                                                                              #
#                                                         :::      ::::::::    #
#    llm.py                                             :+:      :+:    :+:    #
#                                                     +:+ +:+         +:+      #
#    By: tolrandr <tolrandr@student.42antananari    +#+  +:+       +#+         #
#                                                 +#+#+#+#+#+   +#+            #
#    Created: 2025/12/29 08:30:10 by aelison           #+#    #+#              #
#    Updated: 2026/03/06 21:45:18 by tolrandr         ###   ########.fr        #
#                                                                              #
# **************************************************************************** #

from logging import raiseExceptions
from app.config import config
import httpx
import json

class LLMService:
    def __init__(self):
        self.url = config.LLM_API_URL
        self.key = config.LLM_API_KEY
        self.model = config.LLM_MODEL

    def format_for_llm(self, text):
        if not text or not text.get('ids'):
            return None

        ids = text['ids']
        docs = text['documents']
        metas = text['metadatas']

        if len(ids) > 0 and isinstance(ids[0], list):
            ids = ids[0]
            docs = docs[0]
            metas = metas[0]

        if len(ids) == 0:
            return None

        formatted_context = ""
        for i in range(len(ids)):
            tmp_id = ids[i]
            doc = docs[i]
            meta = metas[i]
            formatted_context += f"---\nPOST {i+1}:\n{doc}\nMetadata: {meta}\nID: {tmp_id}\n"
        
        return formatted_context

    def get_sources(self):
        prompt = """
        You are a precise data extractor.

        1. Extract sources from the provided CONTEXT.
        2. Return ONLY a JSON object.
        3. STRICT SCHEMA: Each object in the "sources" list MUST contain exactly these three keys and NO others:
        - "type" (string)
        - "id" (string)
        - "title" (string)

        CONSTRAINT
        - DO NOT include "metadata", "price", "description", "zone", or any other fields found in the data.
        - If a field is missing in the data, use "null".

        OUTPUT FORMAT
        {
        "sources": [
            {
            "type": "type_here",
            "id": "id_here",
            "title": "title_here"
            }
        ]
        }
        """
        return prompt

    def generate_rules(self):
        rules = """
        ROLE: Warm and professional real estate assistant.
            
            LANGUAGE RULES:
            1. You support: English, French, Spanish, and Malagasy.
            2. ALWAYS reply in the SAME language as the user's message.
            3. If the user mixes languages (e.g., "Find me a house avec 3 chambres"), identify the dominant language and reply ONLY in that language. 
            4. IMPORTANT: Malagasy location names (like "Ambalavao", "Ivandry", "Isotry") are used in all languages and do NOT indicate that the conversation is in Malagasy. If the sentence structure is French or English, stay in that language.
            5. If the user input is in ANY other unsupported language (e.g., German, Italian, Chinese):
            - STOP all processing.
            - Do NOT use the real estate context.
            - Reply ONLY with: "I'm sorry, I only speak English, French, Spanish, and Malagasy."
            
            REAL ESTATE GOAL:
            - Help users understand listings using ONLY the provided CONTEXT.
            - NEVER invent, fabricate, or hallucinate listings, prices, features, or any property details.
            - If the CONTEXT contains NO matching listings:
                - Say so clearly: "I'm sorry, I couldn't find any listings matching all your criteria in my current records."
                - DO NOT claim that no properties exist in a certain zone or price range (e.g., "There are no apartments in Ambalavao"). Only state that NONE from the search results matched ALL criteria.
                - Suggest refining the MOST LIKELY problematic criteria (e.g., "You might want to try searching without the 'pool' filter or adjusting the price range").
            - Only describe properties that are explicitly present in the CONTEXT provided to you.
            
            CONVERSATIONAL STYLE:
            - NO lists, NO bullet points, NO bold headers.
            - Use natural, flowing paragraphs in a warm and professional tone.
            - Always include the price in "Ariary" (The abreviate format is "Ar").
            - Do not ask the user any questions if listings were found.
            - Remember to answer in the same language as the user, even if the CONTEXT is in a different language. For example, if the user asks in French but the CONTEXT is in English, reply in French using the English CONTEXT.
        """
        return rules

    def generate_description(self):
        rules = """
        ROLE: Expert Grammar Editor.
            
            STRICT LANGUAGE RULE:
            - Supported Languages: English, French, Spanish.
            - IF the input is in a supported language: Rewrite it to be professional and natural.
            - IF the input is in an UNSUPPORTED language (or you are unsure): Return the USER INPUT EXACTLY as it is. Do NOT add any notes, do NOT translate, and do NOT correct it.
            
            OUTPUT:
            - Provide ONLY the rewritten text (or the raw input). 
            - No explanations or headers.
        """
        return rules

    def get_matching_listing(self):
        result = """
        You are a strict JSON generator for a real estate search engine.
        Your ONLY job is to filter the provided CHROMA_CONTEXT JSON object based on the user's criteria.

        RULES:
        1. OUTPUT: Return ONLY a valid JSON object. No prose, no explanations, no "Je suppose que...".
        2. DO NOT use Markdown formatting or code blocks (no ```json).
        3. The output must be a valid Python/JSON dictionary string that can be parsed by json.loads().
        4. Maintain the exact same keys: 'ids', 'distances', 'metadatas', 'documents', etc.
        5. DO NOT omit any fields from the dictionaries inside the 'metadatas' array. You MUST return all fields (photos, title, zone, property_type, price, etc) exactly as they are in the CHROMA_CONTEXT.
        6. CRITICAL: NEVER leave the 'ids' array empty if there are matches. You MUST copy the exact string IDs of the matching properties from the CHROMA_CONTEXT into your 'ids' array.

        EXAMPLE: 
        {
            "ids": [
                [
                "56743e23-3068-44d7-98bf-ec76dac9f04c",
                "cf5340e0-d369-44a5-bd0a-5c07917ec960"
                ]
            ],
            "distances": [
                [
                0.6956119903131714,
                0.9098695615577355
                ]
            ],
            "embeddings": null,
            "metadatas": [
                [
                {
                    "f_bedrooms": 5,
                    "f_bathrooms": 1,
                    "f_pool": true,
                    "f_garden_private": true,
                    "f_parking_type": "none",
                    "f_water_access": true,
                    "f_electricity_access": true,
                    "features": "{\"bedrooms\": 5, \"bathrooms\": 1, \"wc\": true, \"wcSeparate\": true, \"parkingType\": \"none\", \"gardenPrivate\": true, \"pool\": true, \"water_access\": true, \"electricityAccess\": true}",
                    "photos": "1771885395551-image.png",
                    "post_type": "sale",
                    "price": 10000000.0,
                    "property_type": "apartment",
                    "surface": 78.49879871981499,
                    "title": "The failure house",
                    "zone": "Ankasina"
                }
                ]
            ],
            "documents": [
                [
                "Title: The failure house. Type: sale. Description: i want to pass that final project, pleaaaase i want to pass that final project, pleaaaase i want to pass that final project, pleaaaase i want to pass that final project, pleaaaase i want to pass that final project, pleaaaase i want to pass that final project, pleaaaase i want to pass that final project, pleaaaase i want to pass that final project, pleaaaase i want to pass that final project, pleaaaase i want to pass that final project, pleaaaase i want to pass that final project, pleaaaase . Zone: Ankasina. Price: 10000000.0. Surface: 78.49879871981499. Features: bedrooms: 5, bathrooms: 1, wc: True, wcSeparate: True, parkingType: none, gardenPrivate: True, pool: True, water_access: True, electricityAccess: True. Photos: 1771885395551-image.png.",
                "Title: The camembert. Type: sale. Description: The camembert smells hard The camembert smells hard The camembert smells hard The camembert smells hard The camembert smells hard The camembert smells hard The camembert smells hard The camembert smells hard The camembert smells hard The camembert smells hard The camembert smells hard The camembert smells hard . Zone: Ambalavao-Isotry. Price: 10000000.0. Surface: 78.49879871981499. Features: bedrooms: 1, bathrooms: 5, wc: True, wcSeparate: True, parkingType: none, gardenPrivate: True, pool: True, water_access: True, electricityAccess: True. Photos: 1771885442974-Screenshot from 2026-02-24 01-23-09.png."
                ]
            ],
            "uris": null,
            "data": null,
            "included": [
                "distances",
                "documents",
                "metadatas"
            ]
        }
        """
        return result

    def generate_header(self):
        headers = {
            "Authorization": "Bearer " + self.key,
            "Content-Type": "application/json"
        }
        return headers

    def generate_json(self, text, streaming, model_to_use, system_prompt=""):
        mssg = []

        if system_prompt:
            mssg.append({"role": "system", "content": system_prompt})
        mssg.append({"role": "user", "content": text})
        data = {
            "model": model_to_use,
            "messages": mssg ,
            "stream": streaming,
            "temperature": 0.2,
            "top_p": 0.7,
            "max_tokens": 2048
        }
        return data

    async def parse_and_send(self, response, metadata):
        async for word in response.aiter_lines():
            if not word:
                continue
            parse_line = word.strip()
            if parse_line == "data: [DONE]":
                break
            if parse_line.startswith("data: "):
                parse_line = parse_line[6:]
            try:
                result = json.loads(parse_line)
                content_exist = result.get("choices", [])

                if not content_exist:
                    continue
                content = result["choices"][0].get("delta", {}).get("content", "")
                if content:
                    yield json.dumps({"type": "content", "reply": content}) + "\n"

            except json.JSONDecodeError:
                continue
        yield json.dumps({"type": "metadata", "metadata": [value.model_dump() for value in metadata]}) + "\n"


    async def generate_stream_response(self, text, metadata, system_prompt=""):
        async with httpx.AsyncClient() as client:
            async with client.stream(
                "POST",
                url = self.url,
                headers = self.generate_header(),
                json = self.generate_json(text, True, self.model, system_prompt),
                timeout = 130.0
            ) as response:
                if response.status_code == 429:
                        error_details = await response.aread() 
                        print(f"Error {response.status_code} on model {model}: {error_details.decode()}")
                response.raise_for_status()
                async for to_send in self.parse_and_send(response, metadata):
                    yield to_send

    async def generate_bloc_response(self, text, system_prompt=""):
        llm_response = ""

        response = httpx.post(
            url = self.url,
            headers = self.generate_header(),
            json = self.generate_json(text, False, self.model, system_prompt),
            timeout = 120.0
        )
        if response.status_code == 429:
            error_details = await response.aread() 
            print(f"Error {response.status_code} on model {model}: {error_details.decode()}")
        response.raise_for_status()
        data = response.json()
        llm_response = data["choices"][0]["message"]["content"]
        return llm_response

