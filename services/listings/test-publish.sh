#!/bin/bash

# Création de fichiers temporaires pour les images
touch photo1.jpg photo2.jpg photo3.jpg

echo "--- Test de publication d'annonce (Sans Auth) ---"

curl -X POST http://localhost:3002/listings/publish \
  -F 'data={
    "type": "sale",
    "propertyType": "house",
    "title": "Belle Villa de Test",
    "description": "Une description très longue pour passer la validation Zod de 50 caractères minimum.",
    "price": 150000000,
    "surface": 200,
    "zone": "Ivandry",
    "features": {
        "bedrooms": 4,
        "bathrooms": 2,
        "wc_separate": true,
        "parking_type": "garage",
        "garden_private": true,
        "pool": false,
        "water_access": true,
        "electricity_access": true
    },
    "tags": ["urgent"]
  }' \
  -F "files=@photo1.jpg" \
  -F "files=@photo2.jpg" \
  -F "files=@photo3.jpg"

# Suppression des fichiers temporaires
rm photo1.jpg photo2.jpg photo3.jpg
echo -e "\n--- Fin du test ---"
