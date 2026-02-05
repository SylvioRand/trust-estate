# **************************************************************************** #
#                                                                              #
#                                                         :::      ::::::::    #
#    llm.py                                             :+:      :+:    :+:    #
#                                                     +:+ +:+         +:+      #
#    By: aelison <aelison@student.42antananarivo.m  +#+  +:+       +#+         #
#                                                 +#+#+#+#+#+   +#+            #
#    Created: 2025/12/29 08:30:10 by aelison           #+#    #+#              #
#    Updated: 2026/02/05 13:22:52 by aelison          ###   ########.fr        #
#                                                                              #
# **************************************************************************** #

from app.config import config
import httpx
import json

class LLMService:
    def __init__(self):
        self.url = config.LLM_API_URL
        self.key = config.LLM_API_KEY
        self.all_model = config.LLM_MODEL

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
            
            LANGUAGE GATEKEEPER:
            1. You ONLY support: English, French, and Spanish.
            2. If the user input is in ANY other language (e.g., German, Italian, Malagasy):
            - STOP all processing.
            - Do NOT use the real estate context.
            - Reply ONLY with this exact phrase: "I'm sorry, I only speak English, French, and Spanish."
            
            REAL ESTATE GOAL:
            - Help users understand listings using ONLY provided context.
            - If no matches, ask for more details.
            
            CONVERSATIONAL STYLE:
            - NO lists, NO bullet points, NO bold headers.
            - Use natural, flowing paragraphs as if talking to a friend.
            - Always include the price in "Ariary" (The abreviate format is "Ar").
            - Do not ask the user any questions if listings were found.
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
            "stream": streaming
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
        for model in self.all_model:
            async with httpx.AsyncClient() as client:
                async with client.stream(
                    "POST",
                    url = self.url,
                    headers = self.generate_header(),
                    json = self.generate_json(text, True, model, system_prompt),
                    timeout = 130.0
                ) as response:
                    if response.status_code != 200:
                            error_details = await response.aread() 
                            print(f"Error {response.status_code} on model {model}: {error_details.decode()}")
                            continue
                    response.raise_for_status()
                    async for to_send in self.parse_and_send(response, metadata):
                        yield to_send
                    break

    async def generate_bloc_response(self, text, system_prompt=""):
        llm_response = ""

        for model in self.all_model:
            response = httpx.post(
                url = self.url,
                headers = self.generate_header(),
                json = self.generate_json(text, False, model, system_prompt),
                timeout = 120.0
            )
            if response.status_code != 200:
                error_details = await response.aread() 
                print(f"Error {response.status_code} on model {model}: {error_details.decode()}")
                continue
            response.raise_for_status()
            data = response.json()
            llm_response = data["choices"][0]["message"]["content"]
        return llm_response

