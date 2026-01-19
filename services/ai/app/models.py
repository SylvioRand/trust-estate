#******************************************************************************#
#                                                                              #
#                                                         :::      ::::::::    #
#    models.py                                          :+:      :+:    :+:    #
#                                                     +:+ +:+         +:+      #
#    By: aelison <aelison@student.42antananarivo    +#+  +:+       +#+         #
#                                                 +#+#+#+#+#+   +#+            #
#    Created: 2025/12/29 08:30:23 by aelison           #+#    #+#              #
#    Updated: 2026/01/05 07:27:37 by aelison          ###   ########.fr        #
#                                                                              #
#******************************************************************************#

from typing import Literal, Optional
from pydantic import BaseModel, Field

#============== Discussion with AI ===============
class RequestChat(BaseModel):
    message: str = "Hello world"
    context: Optional[str] = None

class ResponseSource(BaseModel):
    type: str = "sale"
    id: str = "default"
    title: str = "Title list"

class ResponseChat(BaseModel):
    reply: str = "Sorry something went wrong"
    links: Optional[list[str]] = None

#=========== Collection models ============
class Description(BaseModel):
    description: str = "Beautiful description"

class PostModel(BaseModel):
    id: str
    title: str = "Hello world"
    post_type: Literal["sale", "rent"] = "sale"
    property_type: Literal['apartment', 'house', 'loft', 'land', 'commercial'] = "apartment"
    description: str = "Beautiful property"
    price: float = Field(default=100000, ge=100000)
    zone: str = "Madagascar"
    surface: Optional[float] = Field(default=45, gt=0)
    photos: list[str] = []
    features: Optional[list[str]] = None
    tags: Optional[list[str]] = None

    def get_embedding_format(self):
        values = [
            f"Title: {self.title}",
            f"Type: {self.post_type}",
            f"Description: {self.description}",
            f"Property type: {self.property_type}"
        ]
        return ". ".join(values) + " ."
        
    def get_text_format(self):
        values = [
            f"Title: {self.title}",
            f"Type: {self.post_type}",
            f"Description: {self.description}",
            f"Zone: {self.zone}",
            f"Price: {self.price}",
        ]
        if self.surface:
            values.append(f"Surface: {self.surface}")
        if self.tags:
            all_tags = ", ".join(self.tags)
            values.append(f"Tags: {all_tags}")
        if self.features:
            all_features = ", ".join(self.features)
            values.append(f"Features: {all_features}")
        data = ". ".join(values) + "."

        return data
