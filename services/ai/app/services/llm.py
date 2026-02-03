# **************************************************************************** #
#                                                                              #
#                                                         :::      ::::::::    #
#    llm.py                                             :+:      :+:    :+:    #
#                                                     +:+ +:+         +:+      #
#    By: aelison <aelison@student.42antananarivo.m  +#+  +:+       +#+         #
#                                                 +#+#+#+#+#+   +#+            #
#    Created: 2025/12/29 08:30:10 by aelison           #+#    #+#              #
#    Updated: 2026/02/02 09:20:09 by aelison          ###   ########.fr        #
#                                                                              #
# **************************************************************************** #

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
        You are a warm and professional real estate assistant. 

        GOAL: 
        Help users understand available property listings using ONLY the provided context.
        If no listings match their specific filters, tell them clearly and ask for more details about what they are looking for.
        If the conversation is not about real estate, chat naturally.

        CONVERSATIONAL RULES (To avoid repetition and lists):
        1. INTEGRATED FLOW: When listings are available, start your response by introducing them naturally within your sentences. 
        2. NO LISTS OR HEADERS: Strictly avoid bullet points, bold headers, or 'Key: Value' formats (e.g., avoid "Price: 100 Ariary"). Do not use colons to define attributes.
        3. NATURAL COMPARISON: If multiple listings exist, weave a detailed comparison into your paragraphs as if you are describing them to a friend. 
        4. PRICING: Always include the price for every property mentioned. The unit of the price is "Ariary".
        5. TONE: Use a human, flowing, and conversational style. Use full sentences and smooth transitions between ideas rather than a clinical or structural breakdown.
        6. Do not try to ask user questions.
        """
        return rules

    def generate_description(self):
        rules = """
        You are an expert editor. Your goal is to correct grammatical errors and
        rewrites input to sound natural, professional. Provide only the correct version.
        Do not include anything else that the rewrites text.
        Always use the user input language.
        """

        return rules
    def generate_header(self):
        headers = {
            "Authorization": "Bearer " + self.key,
            "Content-Type": "application/json",
            "User-Agent": "ft_transcendence_ai/1.0"
        }
        return headers

    def generate_json(self, text, streaming, system_prompt=""):
        mssg = []

        if system_prompt:
            mssg.append({"role": "system", "content": system_prompt})
        mssg.append({"role": "user", "content": text})
        data = {
            "model": self.model,
            "messages": mssg ,
            "stream": streaming
        }
        return data

    async def generate_stream_response(self, text, links, system_prompt=""):
        async with httpx.AsyncClient() as client:
            async with client.stream(
                "POST",
                url = self.url,
                headers = self.generate_header(),
                json = self.generate_json(text, True, system_prompt),
                timeout = 130.0
            ) as response:
                response.raise_for_status()
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
                yield json.dumps({"type": "metadata", "links": links}) + "\n"
        

    def generate_bloc_response(self, text, system_prompt=""):
        response = httpx.post(
            url = self.url,
            headers = self.generate_header(),
            json = self.generate_json(text, False, system_prompt),
            timeout = 120.0
        )

        response.raise_for_status()
        data = response.json()
        llm_response = data["choices"][0]["message"]["content"]
        return llm_response

