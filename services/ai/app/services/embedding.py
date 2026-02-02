# **************************************************************************** #
#                                                                              #
#                                                         :::      ::::::::    #
#    embedding.py                                       :+:      :+:    :+:    #
#                                                     +:+ +:+         +:+      #
#    By: aelison <aelison@student.42antananarivo.m  +#+  +:+       +#+         #
#                                                 +#+#+#+#+#+   +#+            #
#    Created: 2025/12/29 08:30:00 by aelison           #+#    #+#              #
#    Updated: 2026/02/02 09:19:02 by aelison          ###   ########.fr        #
#                                                                              #
# **************************************************************************** #

from app.config import config
from sentence_transformers import SentenceTransformer

class EmbeddingService:
    def __init__(self):
        self.model = SentenceTransformer(config.EMBEDDING_MODEL)

    def generate_embedding(self, text):
        embedding = self.model.encode(text)
        return (embedding.tolist())

embeddingService = EmbeddingService()
