# **************************************************************************** #
#                                                                              #
#                                                         :::      ::::::::    #
#    models.py                                          :+:      :+:    :+:    #
#                                                     +:+ +:+         +:+      #
#    By: aelison <aelison@student.42antananarivo.m  +#+  +:+       +#+         #
#                                                 +#+#+#+#+#+   +#+            #
#    Created: 2025/12/29 08:30:23 by aelison           #+#    #+#              #
#    Updated: 2026/02/04 09:21:04 by aelison          ###   ########.fr        #
#                                                                              #
# **************************************************************************** #

from typing import Literal, Optional, Any
from pydantic import BaseModel, Field

#============== Discussion with AI ===============
class RequestChat(BaseModel):
    message: str = "Hello world"
    context: Optional[str] = None

#=========== Collection models ============
class Description(BaseModel):
    description: str = "I have a beautiful house to sell, please buy it"

class metaData(BaseModel):
    id: str = "Failed"
    photos: str = "Failed"
    title: str = "Failed"
    price: float = 1.0
    propertyType: Literal['apartment', 'house', 'loft', 'land', 'commercial'] = "apartment"
    type: Literal["sale", "rent"] = "sale"
    zone: str = "Failed"

class PostModel(BaseModel):
    id: str
    title: str = "Hello world"
    photos: list[str] = []
    description: str = "Beautiful property"
    price: float = Field(default=100000, gt=0)
    type: Literal["sale", "rent"] = "sale"
    propertyType: Literal['apartment', 'house', 'loft', 'land', 'commercial'] = "apartment"
    surface: Optional[float] = Field(default=45, gt=0)
    zone: str = "Ivandry"
    features: Optional[dict[str, Any]] = None
    tags: Optional[list[Literal["urgent", "exclusive", "discount"]]] = None

    def get_embedding_format(self):
        values = [
            f"Title: {self.title}",
            f"Type: {self.type}",
            f"Description: {self.description}",
            f"Property type: {self.propertyType}"
            f"Location: {self.zone}"
        ]
        return ". ".join(values) + " ."
        
    def get_text_format(self):
        values = [
            f"Title: {self.title}",
            f"Type: {self.type}",
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
            features_to_list = [f"{k}: {v}" for k, v in self.features.items()] 
            all_features = ", ".join(features_to_list)
            values.append(f"Features: {all_features}")
        if len(self.photos) > 0:
            values.append(f"Photos: {self.photos[0]}")

        data = ". ".join(values) + "."

        return data
