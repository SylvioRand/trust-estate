#******************************************************************************#
#                                                                              #
#                                                         :::      ::::::::    #
#    llm.py                                             :+:      :+:    :+:    #
#                                                     +:+ +:+         +:+      #
#    By: aelison <aelison@student.42antananarivo    +#+  +:+       +#+         #
#                                                 +#+#+#+#+#+   +#+            #
#    Created: 2025/12/29 08:30:10 by aelison           #+#    #+#              #
#    Updated: 2026/01/05 16:02:08 by aelison          ###   ########.fr        #
#                                                                              #
#******************************************************************************#

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

        ### CONSTRAINT
        - DO NOT include "metadata", "price", "description", "zone", or any other fields found in the data.
        - If a field is missing in the data, use "null".

        ### OUTPUT FORMAT
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

    # 1. Use only the provided context.
    #     2. Always include the price in the summary.
    #     3. The unit of the price is "Ariary".
    #     3. If there is a lot of POST inside the context, always give a detailed comparaison.
    #     4. Make space in the answer, make the answer easy to read.
    def generate_rules(self):
        rules = """
        You are a real estate assistant.
        STRUCTURE:
        1. Start your response by stating each listing you got in your context.
        2. Provided details answer after the count

        RULES:
        1. Use only the provided context when answering questions about listings.
        2. If no context is provided and the user’s question is about listings, explicitly state that there are currently no listings available in the database.
        3. If the user’s question is not related to real estate, answer normally without requiring context.
        4. Always include the price in the summary when listings are available.
        5. The unit of the price is "Ariary".
        6. If there are many posts inside the context, always give a detailed comparison.
        7. Format the answer with spacing and clarity to make it easy to read.
        8. Use the "USER HISTORY" to maintain continuity of the conversation.
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
            "Content-Type": "application/json"
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

    def generate_stream_response(self, text, links, system_prompt=""):


        try:
            with httpx.stream(
                    "POST",
                    url = self.url,
                    headers = self.generate_header(),
                    json = self.generate_json(text, True, system_prompt),
                    timeout = 130.0
            ) as response:
                for word in response.iter_lines():
                    if not word:
                        continue
                    parse_line = word.strip()

                    if parse_line == "data: [DONE]":
                        break
                    if parse_line.startswith("data: "):
                        parse_line = parse_line[6:]

                    try:
                        result = json.loads(parse_line)
                        content = result["choices"][0].get("delta", {}).get("content", "")

                        yield content

                        # if content:
                        #     yield json.dumps({"type": "content", "reply": content})

                    except json.JSONDecodeError:
                        continue

        except Exception:
            yield "Error: sorry i couldn't process your question"
            # yield json.dumps({"type": "metadata", "links": links})

    def generate_bloc_response(self, text, system_prompt=""):
        try:
            response = httpx.post(
                url = self.url,
                headers = self.generate_header(),
                json = self.generate_json(text, False, system_prompt),
                timeout = 120.0
            )
            data = response.json()
            llm_response = data["choices"][0]["message"]["content"]
            return llm_response
        except Exception as e:
            print(f"Error: {e}")
            return "Error: sorry i couldn't process your question"
