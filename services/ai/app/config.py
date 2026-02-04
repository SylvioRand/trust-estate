# **************************************************************************** #
#                                                                              #
#                                                         :::      ::::::::    #
#    config.py                                          :+:      :+:    :+:    #
#                                                     +:+ +:+         +:+      #
#    By: aelison <aelison@student.42antananarivo.m  +#+  +:+       +#+         #
#                                                 +#+#+#+#+#+   +#+            #
#    Created: 2025/12/29 08:30:17 by aelison           #+#    #+#              #
#    Updated: 2026/02/04 10:06:00 by aelison          ###   ########.fr        #
#                                                                              #
# **************************************************************************** #

import os
from dotenv import load_dotenv

load_dotenv()

class ft_config:
    #API key for all routes
    INTERNAL_KEY = os.getenv("INTERNAL_KEY_SECRET", "")
    #LLM config
    LLM_API_URL = os.getenv("LLM_API_URL", "https://api.groq.com/openai/v1/chat/completions")
    LLM_API_KEY = os.getenv("LLM_API_KEY", "")

    all_models = os.getenv("LLM_MODEL", "llama-3.3-70b-versatile")
    LLM_MODEL = [model.strip() for model in all_models.split(",")]

    #Embedding
    EMBEDDING_MODEL=os.getenv("EMBEDDING_MODEL", "paraphrase-multilingual-MiniLM-L12-v2")

config = ft_config()
