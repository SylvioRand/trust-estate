# 📘 Spécification API Complète — Plateforme Immobilière MVP

**Compatible Apidog / OpenAPI 3.0**  
**Date :** 18 Décembre 2024  
**Version :** 2.0 (Corrigée - MVP Strict)

---

## Configuration Générale

```yaml
Base URL: /api/v1
Auth: Bearer Token (JWT)
Format: JSON
Encoding: UTF-8
Gateway: Nginx (reverse proxy)
Backend: Fastify (microservices)
```

---

## 🔧 Architecture Microservices

Cette API est déployée sur 5 microservices Fastify derrière un gateway Nginx :

| Service                  | Port | Responsabilité                 | URL             |
|--------------------------|------|--------------------------------|-----------------|
| **auth-service**         | 3001 | Authentification, utilisateurs | /auth           |
| **listings-service**     | 3002 | Annonces, zones, modération    | /listings       |
| **reservations-service** | 3003 | Réservations, feedbacks        | /reservations   |
| **credits-service**      | 3004 | Crédits, transactions          | /credits        |
| **ai-service**           | 3005 | Assistant Chat & RAG           | /ai             |

> Détails complets : `Niveau_3.5_Architecture_Microservices.md`

---

## 1. Authentification

### 1.1 Inscription (🆕 NOUVEAU)

```http
POST /auth/register
```

**Request :**
```json
{
  "email": "user@mail.com",     // ✅ OBLIGATOIRE
  "phone": "+261340000000",     // ✅ OBLIGATOIRE
  "password": "********",       // ✅ OBLIGATOIRE
  "name": "Nom Utilisateur"     // ✅ OBLIGATOIRE
}
```

**Response 201 :**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "expiresIn": 86400,
  "user": {
    "id": "u1",
    "email": "user@mail.com",
    "phone": "+261340000000",
    "name": "Nom Utilisateur",
    "phoneVerified": false,
    "role": "user",
    "trustScore": 50,
    "createdAt": "2025-01-15T10:00:00Z"
  },
  "initialCredits": 5,
  "message": "Compte créé avec succès. 5 crédits offerts !"
}
```

**Response 400 :**
```json
{
  "error": "validation_error",
  "message": "Erreur de validation"
}
```

---

### 1.2 Connexion Email

```http
POST /auth/login
```

**Request :**
```json
{
  "email": "user@mail.com",
  "password": "********"
}
```

**Response 200 :**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "expiresIn": 86400,
  "refreshToken": "refresh-token-xxx",
  "user": {
    "id": "u1",
    "email": "user@mail.com",
    "phone": "+261340000000",
    "role": "user",
    "trustScore": 75
  }
}
```

---

### 1.3 Connexion Google OAuth

```http
POST /auth/google
```

**Request :**
```json
{
  "idToken": "google-oauth-id-token"
}
```

**Response 200 :**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "expiresIn": 86400,
  "user": {
    "id": "u3",
    "email": "user@gmail.com",
    "role": "user",
    "trustScore": 50
  },
  "isNewUser": true,
  "initialCredits": 5
}
```

---

### 1.4 Rafraîchissement Token (🆕 NOUVEAU)

```http
POST /auth/refresh
```

**Request :**
```json
{
  "refreshToken": "refresh-token-xxx"
}
```

**Response 200 :**
```json
{
  "token": "new-jwt-token",
  "expiresIn": 86400,
  "refreshToken": "new-refresh-token"
}
```

---

### 1.5 Déconnexion (🆕 NOUVEAU)

```http
POST /auth/logout
```

**Headers :**
```
Authorization: Bearer {token}
```

**Response 200 :**
```json
{
  "success": true,
  "message": "Déconnexion réussie"
}
```

---

## 2. Profil Utilisateur

### 2.1 Mon Profil

```http
GET /users/me
```

**Headers :**
```
Authorization: Bearer {token}
```

**Response 200 :**
```json
{
  "id": "u1",
  "email": "user@mail.com",
  "phone": "+261340000000",
  "name": "Jean Rakoto",
  "role": "user",
  "trustScore": 85,
  "sellerStats": {
    "totalListings": 8,
    "activeListings": 2,
    "successfulSales": 5,
    "averageRating": 4.3
  },
  "credits": {
    "balance": 12
  }
}
```

---

### 2.2 Modifier Mon Profil

```http
PUT /users/me
```

**Request :**
```json
{
  "name": "Jean-Pierre Rakoto",
  "email": "nouveau@mail.com"
}
```

**Response 200 :**
```json
{
  "updated": true,
  "user": {
    "id": "u1",
    "name": "Jean-Pierre Rakoto",
    "email": "nouveau@mail.com"
  }
}
```

---

## 3. Annonces

### 3.1 Liste des Annonces

```http
GET /listings
```

**Query Params :**
- `type`: `sale` | `rent`
- `minPrice`, `maxPrice`
- `zone`
- `page`, `limit`

**Response 200 :**
```json
{
  "data": [
    {
      "id": "l1",
      "title": "Maison T3 Analakely",
      "price": 50000000,
      "type": "sale",
      "zoneDisplay": "Antananarivo - Analakely",
      "photos": ["https://mock-cdn.com/photo1.jpg"],
      "trustScore": 82
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 45,
    "totalPages": 3
  }
}
```

---

### 3.2 Détail Annonce

```http
GET /listings/:id
```

**Response 200 :**
```json
{
  "id": "l1",
  "title": "Maison T3 Analakely",
  "description": "Maison lumineuse...",
  "price": 50000000,
  "type": "sale",
  "features": {
    "bedrooms": 3,
    "parking": true
  },
  "seller": {
    "id": "u5",
    "name": "Jean Rakoto",
    "trustScore": 88
  }
}
```

---

### 3.3 Créer Annonce

```http
POST /listings
```

**Headers :**
```
Authorization: Bearer {token}
```

**Request :**
```json
{
  "type": "sale",
  "title": "Villa T4",
  "description": "Belle villa...",
  "price": 120000000,
  "surface": 200,
  "zone": "tana-ivandry",
  "photos": ["data:image/jpeg;base64,..."]
}
```

**Response 201 :**
```json
{
  "listingId": "l2",
  "status": "active",
  "iaValidation": {
    "status": "accepted",
    "trustScore": 75
  },
  "creditConsumed": 1
}
```

---

### 3.4 Modifier Annonce

```http
PUT /listings/:id
```

**Request :**
```json
{
  "title": "Villa T4 Rénovée",
  "price": 130000000
}
```

**Response 200 :**
```json
{
  "updated": true,
  "listingId": "l2"
}
```

---

### 3.5 Archiver Annonce

```http
POST /listings/:id/archive
```

**Request :**
```json
{
  "finalStatus": "sold"
}
```

**Response 200 :**
```json
{
  "archived": true,
  "finalStatus": "sold"
}
```

---

### 3.6 Mes Annonces (🆕 NOUVEAU)

```http
GET /listings/mine
```

**Response 200 :**
```json
{
  "data": [
    {
      "id": "l10",
      "title": "Villa T4",
      "status": "active",
      "stats": { "views": 12, "reservations": 0 }
    }
  ],
  "summary": { "active": 1, "sold": 0 }
}
```

---

### 3.7 Générer Description IA (🆕 NOUVEAU)

```http
POST /listings/generate-description
```

**Request :**
```json
{
  "type": "sale",
  "propertyType": "house",
  "zone": "tana-analakely",
  "surface": 120,
  "rooms": 4,
  "price": 150000000,
  "features": { "parking": true }
}
```

**Response 200 :**
```json
{
  "generatedDescription": "Belle maison spacieuse de 4 pièces située à Analakely...",
  "regenerationsRemaining": 2
}
```

---

## 4. Réservations

### 4.1 Créer Réservation

```http
POST /reservations
```

**Request :**
```json
{
  "listingId": "l1",
  "slot": "2025-01-20T10:00:00Z"
}
```

**Response 200 :**
```json
{
  "reservationId": "r1",
  "status": "pending",
  "message": "Réservation en attente"
}
```

---

### 4.2 Mes Réservations

```http
GET /reservations/mine
```

**Response 200 :**
```json
{
  "data": [
    {
      "id": "r1",
      "listing": { "title": "Maison T3" },
      "slot": "2025-01-20T10:00:00Z",
      "status": "confirmed"
    }
  ]
}
```

---

### 4.3 Annuler Réservation

```http
DELETE /reservations/:id
```

**Response 200 :**
```json
{
  "cancelled": true,
  "refund": 0
}
```

---

## 5. Feedback

### 5.1 Créer Feedback

```http
POST /feedback
```

**Request :**
```json
{
  "reservationId": "r1",
  "rating": 4,
  "comment": "Visite conforme."
}
```

**Response 200 :**
```json
{
  "feedbackId": "f1",
  "saved": true,
  "impactOnListing": { "oldTrust": 80, "newTrust": 84 }
}
```

---

## 6. Crédits

### 6.1 Consulter Solde

```http
GET /credits/balance
```

**Response 200 :**
```json
{
  "balance": 12,
  "history": "/credits/history"
}
```

---

### 6.2 Recharger Crédits

```http
POST /credits/recharge
```

**Request :**
```json
{
  "packId": "standard",
  "provider": "orange-money",
  "phoneNumber": "+261340000000"
}
```

**Response 200 :**
```json
{
  "success": true,
  "newBalance": 20
}
```

---

### 6.3 Historique Transactions

```http
GET /credits/history
```

**Response 200 :**
```json
{
  "data": [
    {
      "id": "tx1",
      "type": "recharge",
      "amount": 12,
      "balanceAfter": 17,
      "date": "2025-01-15T10:00:00Z"
    }
  ]
}
```

---

## 7. Zones

### 7.1 Lister Zones

```http
GET /zones
```

**Response 200 :**
```json
{
  "data": [
    { "id": "tana-analakely", "name": "Analakely", "level": "neighborhood" },
    { "id": "tana-ivandry", "name": "Ivandry", "level": "neighborhood" }
  ]
}
```

---

## 8. Administration (Modérateur)

### 8.1 Annonces Signalées

```http
GET /admin/listings/flagged
```

### 8.2 Demander Clarifications

```http
POST /admin/listings/:id/request-clarification
```

### 8.3 Ajuster Visibilité

```http
POST /admin/listings/:id/adjust-visibility
```

### 8.4 Bloquer Temporairement

```http
POST /admin/listings/:id/block-temporary
```

### 8.5 Archiver Définitivement

```http
POST /admin/listings/:id/archive-permanent
```

### 8.6 Historique Actions

```http
GET /admin/actions/history
```

---

## 9. Assistant IA

### 9.1 Chat RAG

```http
POST /ai/chat
```

**Request :**
```json
{
  "message": "Quel est le prix moyen à Analakely ?",
  "context": {
    "listingId": "l1" // Optionnel, pour poser une question sur un bien précis
  }
}
```

**Response 200 :**
```json
{
  "response": "Le prix moyen au m² à Analakely est actuellement de 2.500.000 Ar. Pour ce bien spécifique (Maison T3), le prix est cohérent avec le marché.",
  "sources": [
    { "type": "market_data", "ref": "analakely_stats_2024" }
  ],
  "creditsUsed": 0
}
```

---

### 9.2 Données Marché

```http
GET /ai/market-data
```

**Query Params :**
- `zone`: string (ex: `tana-analakely`)

**Response 200 :**
```json
{
  "zone": "Analakely",
  "averagePriceM2": 2500000,
  "trend": "up",
  "demandLevel": "high"
}
```

---

## 📋 Récapitulatif des Endpoints MVP

> ⚠️ Ce tableau liste uniquement les endpoints **inclus dans le MVP**.

| Catégorie                              | Endpoint                                   | Méthode | Auth       |
|----------------------------------------|--------------------------------------------|---------|------------|
| **Auth**                               | /auth/register                             | POST    | Non        |
|                                        | /auth/login                                | POST    | Non        |
|                                        | /auth/google                               | POST    | Non        |
|                                        | /auth/refresh                              | POST    | Non        |
|                                        | /auth/logout                               | POST    | Oui        |
| **Users**                              | /users/me                                  | GET     | Oui        |
|                                        | /users/me                                  | PUT     | Oui        |
| **Listings**                           | /listings                                  | GET     | Non        |
|                                        | /listings/:id                              | GET     | Non        |
|                                        | /listings                                  | POST    | Oui        |
|                                        | /listings/:id                              | PUT     | Oui        |
|                                        | /listings/:id/archive                      | POST    | Oui        |
|                                        | /listings/mine                             | GET     | Oui        |
|                                        | /listings/generate-description             | POST    | Oui        |
| **Reservations**                       | /reservations                              | POST    | Oui        |
|                                        | /reservations/mine                         | GET     | Oui        |
|                                        | /reservations/:id                          | DELETE  | Oui        |
| **Feedback**                           | /feedback                                  | POST    | Oui        |
| **Credits**                            | /credits/balance                           | GET     | Oui        |
|                                        | /credits/recharge                          | POST    | Oui        |
|                                        | /credits/history                           | GET     | Oui        |
| **Zones**                              | /zones                                     | GET     | Non        |
| **Admin**                              | /admin/listings/flagged                    | GET     | Oui (mod)  |
|                                        | /admin/listings/:id/request-clarification  | POST    | Oui (mod)  |
|                                        | /admin/listings/:id/adjust-visibility      | POST    | Oui (mod)  |
|                                        | /admin/listings/:id/block-temporary        | POST    | Oui (mod)  |
|                                        | /admin/listings/:id/archive-permanent      | POST    | Oui (mod)  |
|                                        | /admin/actions/history                     | GET     | Oui (mod)  |
| **AI**                                 | /ai/chat                                   | POST    | Non        |
|                                        | /ai/market-data                            | GET     | Non        |

**Total : 30 endpoints MVP**

---

## ❌ Endpoints HORS MVP (Phase 2+)

Les endpoints suivants sont documentés mais **exclus du MVP** :

| Endpoint                          | Raison exclusion                   |
|-----------------------------------|------------------------------------|
| /auth/login-phone                 | OTP SMS payant                     |
| /auth/verify-otp                  | OTP SMS payant                     |
| /auth/resend-otp                  | OTP SMS payant                     |
| /users/me/change-password         | Fonctionnalité secondaire          |
| /listings/:id/availability        | Complexité non requise MVP         |
| /listings/:id/availability/manage | Complexité non requise MVP         |
| /reservations/:id/respond         | Confirmation auto en MVP           |
| /credits/providers                | Liste statique en MVP              |
| /upload/image                     | Upload intégré dans POST /listings |

> Ces endpoints pourront être ajoutés en Phase 2.

---

## 📌 Décisions Produit Confirmées

| Question                   | Décision                                               |
|----------------------------|--------------------------------------------------------|
| **Inscription**            | Email + Téléphone + Nom = **OBLIGATOIRES**             |
| **Vérification téléphone** | **Cruciale** mais implémentation **différée post-MVP** |
| **Refresh Token**          | **OUI**, implémenté pour MVP                           |
| **Créneaux visite**        | **Définis par le vendeur** (logique simplifiée)        |
| **Status draft**           | **Supprimé** pour MVP (publication directe)            |

---

**Document créé pour intégration Apidog**  
**Version :** 2.0 (Corrigée - MVP)
