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

class LLMService:
    def __init__(self):
        self.url = config.LLM_API_URL
        self.key = config.LLM_API_KEY
        self.model = config.LLM_MODEL

    def format_for_llm(self, text):
        if not text or not text['ids'] or len(text['ids'][0]) == 0:
            return None

        formatted_context = ""
        for i in range(len(text['ids'][0])):
            doc = text['documents'][0][i]
            meta = text['metadatas'][0][i]
            formatted_context += f"---\nPOST {i+1}:\n{doc}\nMetadata: {meta}\n"
        
        return formatted_context

    def generate_rules(self):
        rules = """
        You are a real estate assistant.
        RULES:
        1. Use only the provided context.
        2. Use the language the user used to answer
        3. If context is not related to real estate, before asnwering the question add "The RAG system is active only on real estate, please be aware of my answer, always check if it's correct".
        4. If context is none, answer with "For now, there is no posts related to your question on the site".
        5. Always include the price in the summary.
        6. If there is a lot of POST inside the context, always give a comparaison.
        """
        return rules

    def generate_header(self):
        headers = {
            "Authorization": "Bearer " + self.key,
            "Content-Type": "application/json"
        }
        return headers

    def generate_json(self, text, system_prompt=""):
        mssg = []

        if system_prompt:
            mssg.append({"role": "system", "content": system_prompt})
        mssg.append({"role": "user", "content": text})
        data = {
            "model": self.model,
            "messages": mssg 
        }
        return data

    def generate_response(self, text, system_prompt=""):
        try:
            response = httpx.post(
                url = self.url,
                headers = self.generate_header(),
                json = self.generate_json(text, system_prompt),
                timeout = 120.0
            )
            data = response.json()
            llm_response = data["choices"][0]["message"]["content"]
            return llm_response
        except Exception as e:
            print(f"Error: {e}")
            return "Error: sorry i couldn't process your question"
