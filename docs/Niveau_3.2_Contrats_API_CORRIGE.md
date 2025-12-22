# 📕 Niveau 3.2 — Contrats API (MVP, mockables) — VERSION CORRIGÉE

## Objectif

Définir des contrats API REST clairs, stables et mockables, permettant :
- au frontend de fonctionner sans backend réel
- à Apidog / Swagger de simuler les réponses

⚠️ Ces contrats décrivent le comportement attendu, pas l'implémentation.

**🆕 Cette version corrige et complète le document initial avec :**
- Workflow téléphone simple (sans OTP)
- Endpoints zones
- Endpoints modérateur
- Gestion erreurs enrichie
- **Organisation par microservice**

---

## 🔧 Architecture Microservices

Ces endpoints sont répartis entre 4 services Fastify derrière un Nginx gateway :

| Service                  | Port | Endpoints                             |
|--------------------------|------|---------------------------------------|
| **auth-service**         | 3001 | `/auth/*`, `/users/*`                 |
| **listings-service**     | 3002 | `/listings/*`, `/zones/*`, `/admin/*` |
| **reservations-service** | 3003 | `/reservations/*`, `/feedback/*`      |
| **credits-service**      | 3004 | `/credits/*`                          |
| **ai-service**           | 3005 | `/ai/*`                               |

> Voir `Niveau_3.5_Architecture_Microservices.md` pour les détails complets.

---

## Conventions générales

**Base URL :** `/api/v1` (routé via Nginx gateway)

**Auth :** Cookies HttpOnly (Standard strict)

| Nom du cookie             | Contenu       | Durée (MVP) | Attributs requis                                      |
|---------------------------|---------------|-------------|-------------------------------------------------------|
| `realestate_access_token` | JWT (String)  | 15 min      | `HttpOnly`, `Secure`, `SameSite=Strict`, `Path=/`     |
| `realestate_refresh_token`| UUID (String) | 7 jours     | `HttpOnly`, `Secure`, `SameSite=Strict`, `Path=/auth` |

> **Note pour les Mocks :** Le serveur de mock DOIT renvoyer ces headers `Set-Cookie` exacts.
> **Note pour les Devs :** Le frontend ne manipule JAMAIS ces cookies directement.


**Réponses standard :**
- `200` succès
- `201` création réussie
- `400` erreur validation
- `401` non authentifié
- `403` action interdite
- `404` non trouvé
- `429` trop de requêtes

---

## 1. Authentification (auth-service)

### 1.1 Inscription

```http
POST /auth/register
```

**Request :**
```json
{
  "email": "user@mail.com",
  "firstName": "Jean",
  "lastName": "Rakoto",
  "phone": "+261340000000",
  "password": "********"
}
```

**Response 201 :**
```json
{
  "userId": "u1",
  "message": "Un email de vérification a été envoyé."
}
```

> **Note :** Pas de token retourné. L'utilisateur doit vérifier son email avant de pouvoir se connecter.

**Response 400 :**
```json
{
  "error": "email_exists",
  "message": "Cet email est déjà utilisé"
}
```

---

### 1.2 Vérification Email (🆕 NOUVEAU)

```http
POST /auth/verify-email
```

**Request :**
```json
{
  "token": "verification-token-from-email"
}
```

**Response 200 :**
- **Headers:**
  - `Set-Cookie: realestate_access_token=jwt...; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=900`
  - `Set-Cookie: realestate_refresh_token=uuid...; HttpOnly; Secure; SameSite=Strict; Path=/auth; Max-Age=604800`

```json
{
  "user": {
    "id": "u1",
    "email": "user@mail.com",
    "emailVerified": true,
    "phone": "+261340000000",
    "firstName": "Jean",
    "lastName": "Rakoto",
    "role": "user",
    "creditBalance": 5,
    "createdAt": "2025-01-15T10:00:00Z"
  },
  "message": "Compte activé avec succès. 5 crédits offerts !"
}
```

**Response 400 :**
```json
{
  "error": "email_exists",
  "message": "Cet email est déjà utilisé"
}
```

---

### 1.3 Login Email

```http
POST /auth/login
```

**Check :** Si `emailVerified = false` → Retourner 403 `email_not_verified`

**Request :**
```json
{
  "email": "user@mail.com",
  "password": "******"
}
```

**Response 200 :**
- **Headers:**
  - `Set-Cookie: realestate_access_token=mock-jwt...; HttpOnly; ...`
  - `Set-Cookie: realestate_refresh_token=mock-refresh...; HttpOnly; ...`

```json
{
  "user": {
    "id": "u1",
    "email": "user@mail.com",
    "emailVerified": true,
    "firstName": "Jean",
    "lastName": "Rakoto",
    "role": "user",
    "sellerStats": {
      "totalListings": 5,
      "averageRating": 4.5
    },
    "creditBalance": 10,
    "createdAt": "2025-01-10T08:00:00Z"
  }
}
```

**Response 403 :**
```json
{
  "error": "email_not_verified",
  "message": "Veuillez vérifier votre email avant de vous connecter."
}
```
```

**Response 400 :**
```json
{
  "error": "invalid_credentials",
  "message": "Email ou mot de passe incorrect"
}
```

---





### 1.3 Login Google OAuth

```http
POST /auth/google
```

**Request :**
```json
{
  "idToken": "google-oauth-token"
}
```

**Response 200 :**
- **Headers:** `Set-Cookie: ...` (Access + Refresh)

```json
{
  "user": {
    "id": "u3",
    "email": "user@gmail.com",
    "emailVerified": true,
    "firstName": "Google",
    "lastName": "User",
    "role": "user",
    "creditBalance": 5,
    "createdAt": "2025-01-15T11:00:00Z"
  },
  "isNewUser": true,
  "message": "Compte créé avec 5 crédits offerts !"
}
```

**Règles mock MVP :**
- Tout token accepté
- Crée utilisateur auto si nouveau

---

### 1.4 Refresh Token

```http
POST /auth/refresh
```

**Request :**
- Pas de body (le `refresh_token` est lu dans le cookie)
```json
{}
```

**Response 200 :**
- **Headers:** `Set-Cookie: access_token=new-jwt...; ...`

```json
{
  "success": true,
  "expiresIn": 900
}
```

**Response 401 :**
```json
{
  "error": "invalid_refresh_token",
  "message": "Token invalide ou expiré"
}
```

---

### 1.5 Logout

```http
POST /auth/logout
```

**Response 200 :**
- **Headers:**
  - `Set-Cookie: realestate_access_token=; Max-Age=0`
  - `Set-Cookie: realestate_refresh_token=; Max-Age=0`

```json
{
  "success": true,
  "message": "Déconnexion réussie"
}
```

---

### 1.6 Mon Profil

```http
GET /users/me
```

**Response 200 :**
```json
{
  "id": "u1",
  "email": "user@mail.com",
  "emailVerified": true,
  "phone": "+261340000000",
  "firstName": "Jean",
  "lastName": "Rakoto",
  "role": "user",
  "sellerStats": {
    "totalListings": 5,
    "activeListings": 2,
    "successfulSales": 3,
    "averageRating": 4.2
  },
  "creditBalance": 10,
  "createdAt": "2025-01-10T08:00:00Z"
}
```

---

### 1.7 Modifier Profil

```http
PUT /users/me
```

**Request :**
```json
{
  "firstName": "Jean",
  "lastName": "Rakoto",
  "phone": "+261340000001"
}
```

**Response 200 :**
```json
{
  "updated": true,
  "user": {
    "id": "u1",
    "firstName": "Jean",
    "lastName": "Rakoto",
    "phone": "+261340000001"
  }
}
```

---

## 2. Annonces (listings-service)


### 2.1 Liste des annonces

```http
GET /listings
```

**Query params :**
- `type` : `sale` | `rent` (optionnel, par défaut : tous)
- `minPrice` : number (optionnel)
- `maxPrice` : number (optionnel)
- `zone` : string (ex: `tana-analakely`, optionnel)
- `page` : number (défaut: 1)
- `limit` : number (défaut: 20, max: 100)

**Exemple :**
```
GET /listings?type=sale&zone=tana-analakely&minPrice=10000000&maxPrice=100000000&page=1&limit=20
```

**Response 200 :**
```json
{
  "data": [
    {
      "id": "l1",
      "title": "Maison T3 Analakely",
      "price": 50000000,
      "type": "sale",
      "zone": "tana-analakely",
      "zoneDisplay": "Antananarivo - Analakely",
      "surface": 120,
      "photos": [
        "https://mock-cdn.com/photo1.jpg"
      ],
      "status": "active",
      "createdAt": "2025-01-10T08:00:00Z",
      "expiresAt": "2025-02-09T08:00:00Z"
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

**Response 200 (aucun résultat) :**
```json
{
  "data": [],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 0,
    "totalPages": 0
  }
}
```

---

### 2.2 Détail annonce

```http
GET /listings/:id
```

**Response 200:**
```json
{
  "id": "l1",
  "title": "Maison T3 Analakely",
  "description": "Maison lumineuse avec jardin...",
  "price": 50000000,
  "type": "sale",
  "surface": 120,
  "zone": "tana-analakely",
  "zoneDisplay": "Antananarivo - Analakely",
  "photos": [
    "https://mock-cdn.com/photo1.jpg",
    "https://mock-cdn.com/photo2.jpg"
  ],
  "features": {
    "bedrooms": 3,
    "bathrooms": 2,
    "parking": true,
    "garden": true
  },
  "status": "active",
  "sellerVisible": false,
  "sellerStats": {
    "totalListings": 5,
    "successfulSales": 3,
    "averageRating": 4.2
  },
  "createdAt": "2025-01-10T08:00:00Z",
  "updatedAt": "2025-01-12T14:30:00Z",
  "expiresAt": "2025-02-09T08:00:00Z"
}
```

**Response 200 (après réservation confirmée) :**
```json
{
  "id": "l1",
  "title": "Maison T3 Analakely",
  "description": "Maison lumineuse avec jardin...",
  "price": 50000000,
  "type": "sale",
  "surface": 120,
  "zone": "tana-analakely",
  "zoneDisplay": "Antananarivo - Analakely",
  "photos": [...],
  "features": {...},
  "status": "active",
  "sellerVisible": true,
  "seller": {
    "id": "u5",
    "name": "Jean Rakoto",
    "phone": "+261XXXXXXXX",
    "email": "jean@mail.com",
    "memberSince": "2024-06-15T00:00:00Z"
  },
  "sellerStats": {
    "totalListings": 5,
    "successfulSales": 3,
    "averageRating": 4.2
  },
  "createdAt": "2025-01-10T08:00:00Z",
  "updatedAt": "2025-01-12T14:30:00Z"
}
```

**Response 404 :**
```json
{
  "error": "listing_not_found",
  "message": "Annonce introuvable"
}
```

---

### 2.3 Créer annonce

```http
POST /listings/publish
```

**Auth :** Cookie HttpOnly (`realestate_access_token`)

**Request :**
```json
{
  "type": "sale",
  "title": "Villa T4 avec piscine",
  "description": "Belle villa moderne...",
  "price": 120000000,
  "surface": 200,
  "zone": "tana-ivandry",
  "photos": [
    "data:image/jpeg;base64,...",
    "data:image/jpeg;base64,..."
  ],
  "features": {
    "bedrooms": 4,
    "bathrooms": 3,
    "parking": true,
    "garden": true,
    "pool": true
  }
}
```

**Response 201 :**
```json
{
  "listingId": "l2",
  "status": "active",
  "creditConsumed": 1,
  "remainingCredits": 4,
  "message": "Annonce publiée avec succès"
}
```

**Response 400 (crédits insuffisants) :**
```json
{
  "error": "insufficient_credits",
  "message": "Crédits insuffisants pour publier",
  "required": 1,
  "balance": 0
}
```

**Response 401 :**
```json
{
  "error": "unauthorized",
  "message": "Authentification requise"
}
```

---

### 2.4 🆕 Modifier annonce

```http
PUT /listings/:id
```

**Auth :** Cookie HttpOnly (`realestate_access_token`)

**Request :**
```json
{
  "title": "Villa T4 avec piscine (Updated)",
  "description": "Belle villa moderne... (Nouvelle description)",
  "price": 115000000,
  "photos": [
    "data:image/jpeg;base64,...",
    "https://existing-image.com/..."
  ],
  "features": {
    "bedrooms": 4,
    "bathrooms": 3,
    "parking": true,
    "garden": true,
    "pool": true
  }
}
```
*Note : Tous les champs sont optionnels. Envoyez uniquement ceux à modifier.*

**Response 200 :**
```json
{
  "listingId": "l2",
  "updated": true
}
```

**Response 403 :**
```json
{
  "error": "forbidden",
  "message": "Vous ne pouvez modifier que vos propres annonces"
}
```

### 3.5 Renouveler Annonce (Prolongation)

```http
POST /listings/:id/renew
```

**Auth :** Cookie HttpOnly (`realestate_access_token`)

**Description :** Prolonge la visibilité de 30 jours. Coût : 0.5 crédit.

**Response 200 :**
```json
{
  "success": true,
  "newExpiresAt": "2025-03-11T08:00:00Z",
  "creditConsumed": 0.5,
  "message": "Annonce renouvelée pour 30 jours."
}
```

**Response 402 :**
```json
{
  "error": "insufficient_credits",
  "message": "Solde insuffisant (0.5 crédit requis)"
}
```

### 3.6 Définir Disponibilités (Seller)

```http
POST /listings/:id/availability
```

**Auth :** Cookie HttpOnly (`realestate_access_token`)

**Request :**
```json
{
  "weeklySchedule": [
    { "dayOfWeek": 1, "startTime": "09:00", "endTime": "12:00" }, // Lundi Matin
    { "dayOfWeek": 1, "startTime": "14:00", "endTime": "18:00" }, // Lundi Après-midi
    { "dayOfWeek": 3, "startTime": "10:00", "endTime": "16:00" }  // Mercredi
  ]
}
```

**Response 200 :**
```json
{
  "success": true,
  "message": "Disponibilités mises à jour."
}
```

### 3.7 Lire Créneaux Disponibles (Buyer)

```http
GET /listings/:id/slots
```

**Query Params :**
- `startDate`: string (ISO date, ex: `2025-01-20`)
- `days`: number (ex: `7` pour la semaine prochaine)

**Response 200 :**
```json
{
  "slots": [
    "2025-01-20T09:00:00Z",
    "2025-01-20T09:30:00Z",
    "2025-01-20T10:00:00Z",
    "2025-01-22T10:00:00Z"
  ]
}
```

**Note :** Le backend génère ces créneaux concrets (30 min par défaut) en croisant le `weeklySchedule` et les réservations existantes.

---

### 3.8 Archiver Annonce (Vendu/Loué)

```http
POST /listings/:id/archive
```

**Request :**
```json
{
  "finalStatus": "sold" | "rented",
  "soldTo": "u7" // optionnel
}
```

**Response 200 :**
```json
{
  "archived": true,
  "finalStatus": "sold",
  "archivedAt": "2025-01-15T16:00:00Z"
}
```

---

### 2.6 🆕 Mes Annonces

```http
GET /listings/mine
```

**Description :** Récupère la liste des annonces créées par l'utilisateur actuellement connecté (via son token).

**Auth :** Cookie HttpOnly (`realestate_access_token`)

**Query params :**
- `status` : `active` (visible) | `archived` (vendu/loué) | `blocked` (modération) | `all` (défaut)
- `page` : number (défaut: 1)
- `limit` : number (défaut: 20)

**Exemple Request :**
```http
GET /listings/mine?status=active&page=1
```

**Response 200 :**
```json
{
  "data": [
    {
      "id": "l1",
      "title": "Maison T3 Analakely",
      "price": 50000000,
      "type": "sale",
      "status": "active",
      "views": 150,
      "reservations": 3,
      "createdAt": "2025-01-10T08:00:00Z"
    }
  ],
  "stats": {
    "total": 5,
    "active": 2,
    "archived": 3
  }
}
```

---

### 2.7 🆕 Signaler une annonce

```http
POST /listings/:id/report
```

**Auth :** Cookie HttpOnly (`realestate_access_token`)

**Request :**
```json
{
  "reason": "fraud" | "spam" | "incorrect_info" | "inappropriate",
  "comment": "Les photos ne correspondent pas à la description..."
}
```

**Response 200 :**
```json
{
  "success": true,
  "message": "Signalement enregistré. Merci de votre vigilance."
}
```

---

### 2.8 🆕 Dashboard Modération (Admin)

#### 2.8.1 Liste des signalements (To Do)

```http
GET /admin/listings/flagged
```

**Description :** Récupère la liste des annonces ayant reçu des signalements utilisateurs et nécessitant une action.

**Auth :** Cookie HttpOnly + Rôle `moderator`

**Response 200 :**
```json
{
  "data": [
    {
      "listingId": "l5",
      "reportCount": 3,
      "latestReportReason": "Photos trompeuses",
      "lastReportedAt": "2025-01-16T09:00:00Z",
      "listingSummary": {
        "title": "Villa suspecte",
        "price": 10000000,
        "sellerId": "u9"
      }
    }
  ],
  "count": 1
}
```

#### 2.8.2 Appliquer une action (Modération)

```http
POST /admin/listings/:id/action
```

**Description :** Applique une décision de modération sur une annonce spécifique.

**Auth :** Cookie HttpOnly + Rôle `moderator`

**Request :**
```json
{
  "action": "block_temporary" | "archive_permanent" | "request_clarification",
  "reason": "Non-respect des CGU (Photos non conformes)",
  "metadata": {
    "messageToSeller": "Veuillez mettre à jour vos photos sous 48h."
  }
}
```

**Response 200 :**
```json
{
  "success": true,
  "actionId": "ma2",
  "newStatus": "blocked",
  "message": "Action appliquée et notifiée au vendeur."
}
```

### 2.9 🆕 Historique Modération (Admin)

```http
GET /admin/actions
```

**Auth :** Cookie HttpOnly (`realestate_access_token`) + Rôle `moderator`

**Query params :**
- `targetId` : string (optionnel)
- `moderatorId` : string (optionnel)
- `page` : number (défaut: 1)
- `limit` : number (défaut: 50)

**Response 200 :**
```json
{
  "data": [
    {
      "id": "ma1",
      "moderatorId": "m1",
      "targetType": "listing",
      "targetId": "l5",
      "action": "block_temporary",
      "reason": "Photos trompeuses confirmées",
      "applied": true,
      "appliedAt": "2025-01-15T14:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "total": 120
  }
}
```

---

### 2.7 🆕 Génération Description IA

```http
POST /listings/generate-description
```

**Request :**
```json
{
  "type": "sale",
  "propertyType": "house",
  "surface": 120,
  "bedrooms": 3,
  "zone": "tana-analakely",
  "features": ["jardin", "parking", "cuisine équipée"],
  "price": 50000000
}
```

**Response 200 :**
```json
{
  "description": "Magnifique maison T3 de 120m² située dans le quartier prisé d'Analakely. Cette propriété dispose de 3 chambres spacieuses, d'un jardin paysagé, d'un parking privatif et d'une cuisine entièrement équipée. Idéale pour une famille, elle offre un cadre de vie agréable au cœur d'Antananarivo. Prix : 50 000 000 Ariary.",
  "suggestions": [
    "Ajoutez des détails sur l'état du bien",
    "Mentionnez la proximité des commodités"
  ]
}
```

**Response 429 :**
```json
{
  "error": "rate_limit",
  "message": "Limite de génération atteinte. Réessayez dans 1 minute."
}
```

---

## 3. Réservations (reservations-service)


### 3.1 Créer réservation

```http
POST /reservations
```

**Auth :** Cookie HttpOnly (`realestate_access_token`)

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
  "slot": "2025-01-20T10:00:00Z",
  "creditConsumed": 1,
  "remainingCredits": 4,
  "sellerContactVisible": false,
  "message": "Réservation envoyée. 1 crédit débité."
}
```

**Response 200 (confirmation auto) :**
```json
{
  "reservationId": "r1",
  "status": "confirmed",
  "slot": "2025-01-20T10:00:00Z",
  "sellerContactVisible": true,
  "seller": {
    "name": "Jean Rakoto",
    "phone": "+261XXXXXXXX"
  },
  "message": "Réservation confirmée"
}
```



**Response 402 (crédits insuffisants) :**
```json
{
  "error": "insufficient_credits",
  "message": "Solde insuffisant pour réserver (Coût: 1 crédit)",
  "required": 1,
  "balance": 0
}
```

**Response 409 :**
```json
{
  "error": "slot_unavailable",
  "message": "Créneau indisponible",
  "availableSlots": [
    "2025-01-20T14:00:00Z",
    "2025-01-21T10:00:00Z"
  ]
}
```

---

### 3.2 🆕 Lister mes réservations

```http
GET /reservations/mine
```

**Query params :**
- `status` : `pending` | `confirmed` | `cancelled` | `done` (optionnel)

**Response 200 :**
```json
{
  "data": [
    {
      "id": "r1",
      "listing": {
        "id": "l1",
        "title": "Maison T3 Analakely",
        "photo": "https://mock-cdn.com/photo1.jpg"
      },
      "slot": "2025-01-20T10:00:00Z",
      "status": "confirmed",
      "feedbackEligible": false,
      "createdAt": "2025-01-15T14:00:00Z"
    }
  ]
}
```

---

### 3.3 🆕 Annuler réservation

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

## 4. Feedback

### 4.1 Créer feedback

---

## 5. Assistant IA (ai-service)

### 5.1 Chat RAG

```http
POST /ai/chat
```

**Request :**
```json
{
  "message": "Est-ce que ce bien est cher ?",
  "context": {
    "listingId": "l1"
  }
}
```

**Response 200 :**
```json
{
  "response": "Ce bien est affiché à 50.000.000 Ar, ce qui est légèrement en dessous de la moyenne du quartier (52M Ar). C'est une bonne opportunité.",
  "sources": ["market_stats_2024"],
  "suggestion": "Voulez-vous réserver une visite ?"
}
```

---

### 5.2 Données Marché

```http
GET /ai/market-data
```

**Query params :** `zone`

**Response 200 :**
```json
{
  "zone": "tana-analakely",
  "stats": {
    "avgPriceSale": 2500000,
    "avgPriceRent": 50000,
    "demandScore": 8.5
  }
}
```

---

**Request :**
```json
{
  "reservationId": "r1",
  "rating": 4,
  "comment": "Visite conforme. Vendeur sérieux."
}
```

**Response 200 :**
```json
{
  "feedbackId": "f1",
  "saved": true
}
```

**Response 400 :**
```json
{
  "error": "feedback_already_exists",
  "message": "Vous avez déjà laissé un feedback pour cette visite"
}
```

**Response 403 :**
```json
{
  "error": "reservation_not_done",
  "message": "Vous ne pouvez laisser un feedback qu'après la visite"
}
```

---

## 5. Crédits

### 5.1 Consulter solde

```http
GET /credits/balance
```

**Response 200 :**
```json
{
  "balance": 10,
  "currency": "credits"
}
```

---

### 5.2 Recharger crédits

```http
POST /credits/recharge
```

**Request :**
```json
{
  "amount": 10,
  "method": "mobile-money",
  "provider": "orange-money" | "mvola"
}
```

**Response 200 :**
```json
{
  "success": true,
  "newBalance": 20,
  "transactionId": "tx123",
  "bonus": 2
}
```

**Response 400 :**
```json
{
  "error": "payment_failed",
  "message": "Paiement échoué. Vérifiez votre solde Mobile Money."
}
```

---

### 5.3 🆕 Historique transactions

```http
GET /credits/history
```

**Query params :**
- `page` : number (défaut: 1)
- `limit` : number (défaut: 20)

**Response 200 :**
```json
{
  "data": [
    {
      "id": "tx1",
      "type": "recharge",
      "amount": +10,
      "reason": "Achat pack Standard",
      "balanceAfter": 15,
      "createdAt": "2025-01-15T10:00:00Z"
    },
    {
      "id": "tx2",
      "type": "consume",
      "amount": -1,
      "reason": "Publication annonce",
      "listingId": "l1",
      "balanceAfter": 14,
      "createdAt": "2025-01-15T11:30:00Z"
    }
  ],
  "pagination": {...}
}
```

---

## 6. 🆕 Zones

### 6.1 Lister zones disponibles

```http
GET /zones
```

**Query params :**
- `level` : `city` | `district` | `neighborhood` (optionnel)
- `parentId` : string (optionnel, pour hiérarchie)

**Response 200 :**
```json
{
  "data": [
    {
      "id": "tana-analakely",
      "displayName": "Antananarivo - Analakely",
      "level": "neighborhood",
      "parentId": "tana-renivohitra"
    },
    {
      "id": "tana-ankorondrano",
      "displayName": "Antananarivo - Ankorondrano",
      "level": "neighborhood",
      "parentId": "tana-renivohitra"
    },
    {
      "id": "tana-ivandry",
      "displayName": "Antananarivo - Ivandry",
      "level": "neighborhood",
      "parentId": "tana"
    }
  ]
}
```

**Données mock MVP (20 zones principales Antananarivo) :**
```json
[
  {"id": "tana-analakely", "displayName": "Antananarivo - Analakely"},
  {"id": "tana-ankorondrano", "displayName": "Antananarivo - Ankorondrano"},
  {"id": "tana-ivandry", "displayName": "Antananarivo - Ivandry"},
  {"id": "tana-ambohimanarina", "displayName": "Antananarivo - Ambohimanarina"},
  {"id": "tana-67ha", "displayName": "Antananarivo - 67 Ha"},
  {"id": "tana-autre", "displayName": "Antananarivo - Autre"}
]
```

---

## 7. 🆕 Modération (Admin)

**⚠️ Tous les endpoints ci-dessous nécessitent `role = 'moderator'`**

### 7.1 Liste annonces signalées

```http
GET /admin/listings/flagged
```

**Query params :**
- `reason` : `user_reported` (en MVP, seul le signalement utilisateur existe)



**Response 200 :**
```json
{
  "data": [
    {
      "listingId": "l5",
      "title": "Terrain 500m²",
      "reason": "user_reported",
      "reportedBy": "u15",
      "reportReason": "Photos suspectes",
      "seller": {
        "id": "u10",
        "name": "Nom Vendeur",
        "email": "vendeur@mail.com"
      },
      "flaggedAt": "2025-01-15T10:00:00Z"
    }
  ]
}
```

**Response 403 :**
```json
{
  "error": "forbidden",
  "message": "Accès réservé aux modérateurs"
}
```

---


```http
POST /admin/listings/:id/archive-permanent
```

**Request :**
```json
{
  "reason": "Fraude avérée. Bien inexistant.",
  "notifySeller": true
}
```

**Response 200 :**
```json
{
  "archived": true,
  "listing": {
    "id": "l5",
    "status": "archived",
    "archivedBy": "moderator",
    "archivedAt": "2025-01-15T14:00:00Z"
  }
}
```

---

---

## 8. 🆕 Intelligence Artificielle (ai-service)

> **🔧 Stack Technique :**
> - **Service :** Python FastAPI (port 3005)
> - **LLM :** Ollama + llama3.2:3b
> - **Embeddings :** Sentence Transformers (all-MiniLM-L6-v2)
> - **Vector Database :** ChromaDB
> 
> Voir [Niveau_3.5_Architecture_Microservices.md](./Niveau_3.5_Architecture_Microservices.md) pour la configuration Docker.

### 8.1 Assistant Chat (RAG)

```http
POST /ai/chat
```

**Request :**
```json
{
  "message": "Quel est le prix moyen à Ivandry ?",
  "context": {
    "listingId": "l1" // Optionnel, si ouvert depuis une annonce
  }
}
```

**Response 200 :**
```json
{
  "reply": "À Ivandry, le prix moyen au m² est d'environ 4.500.000 Ar pour une maison...",
  "sources": ["market_report_2024", "listing_l1"],
  "usage": {
    "dailyCount": 5,
    "limit": 20
  }
}
```

**Response 429 :**
```json
{
  "error": "limit_reached",
  "message": "Vous avez atteint votre limite de 20 questions par jour."
}
```

### 8.2 Données Marché (RAG source)

```http
GET /ai/market-data
```

**Query params :**
- `zone`: string
- `type`: `sale` | `rent`

**Response 200 :**
```json
{
  "averagePrice": 4500000,
  "trend": "up",
  "demandLevel": "high"
}
```

---

### 8.3 Indexation & Synchronisation

Ces endpoints sont utilisés pour synchroniser la base SQL principale avec le moteur de recherche vectoriel (ChromaDB).

#### Indexer une annonce

**Utilisation :** Appelé par le `listings-service` après la création ou modification d'une annonce pour synchroniser les données avec le moteur vectoriel.

```http
POST /ai/index
```

**Body :**
```json
{
  "listingId": "l123"
}
```

**Response 200 :**
```json
{
  "status": "queued",
  "jobId": "job_999"
}
```

#### Vérifier le statut d'indexation

**Utilisation :** Utilisé par le Frontend pour valider si le chat contextuel peut être activé (évite les réponses "Je ne connais pas ce bien").

```http
GET /ai/index-status/:listingId
```

**Response 200 :**
```json
{
  "listingId": "l123",
  "isIndexed": true,
  "lastIndexedAt": "2024-03-20T10:00:00Z"
}
```

#### Supprimer de l'index

**Utilisation :** Appelé par le `listings-service` lors de la suppression d'une annonce pour nettoyer ChromaDB.

```http
DELETE /ai/index/:listingId
```

**Response 200 :**
```json
{
  "success": true
}
```

---

## 9. Notes MVP

**Toutes les données sont mockées :**
- ✅ Aucune persistance réelle
- ✅ Données statiques ou simulées
- ✅ Tous les paiements simulés (succès automatique)
- ✅ Tous les SMS simulés (jamais envoyés réellement)
- ✅ Validation IA simulée (règles simples)

**Objectif :** Tester les flows UX, pas la logique serveur.

**Outils recommandés pour le mock :**
- Apidog
- MSW (Mock Service Worker)
- JSON Server
- Mirage JS


## Récapitulatif des Endpoints MVP

| Catégorie            | Méthode  | Endpoint                                    |
| :------------------- | :------  | :------------------                         | 
| **Authentification** | `POST`   | `/auth/register`                            |
|                      | `POST`   | `/auth/verify-email`                        |
|                      | `POST`   | `/auth/login`                               |
|                      | `POST`   | `/auth/google`                              |
|                      | `POST`   | `/auth/refresh`                             |
|                      | `POST`   | `/auth/logout`                              |
| **Profil**           | `GET`    | `/users/me`                                 |
|                      | `PUT`    | `/users/me`                                 |
| **Annonces**         | `GET`    | `/listings`                                 |
|                      | `GET`    | `/listings/:id`                             |
|                      | `POST`   | `/listings/publish`                         |
|                      | `PUT`    | `/listings/:id`                             |
|                      | `POST`   | `/listings/:id/renew`                       |
|                      | `POST`   | `/listings/:id/archive`                     |
|                      | `POST`   | `/listings/:id/availability`                |
|                      | `GET`    | `/listings/:id/slots`                       |
|                      | `POST`   | `/listings/:id/report`                      |
|                      | `GET`    | `/listings/mine`                            |
|                      | `POST`   | `/listings/generate-description`            |
| **Réservations**     | `GET`    | `/reservations/mine`                        |
|                      | `POST`   | `/reservations`                             |
|                      | `DELETE` | `/reservations/:id`                         |
| **Feedback**         | `POST`   | `/feedback`                                 |
| **Crédits**          | `GET`    | `/credits/balance`                          |
|                      | `POST`   | `/credits/recharge`                         |
|                      | `GET`    | `/credits/history`                          |
| **Zones**            | `GET`    | `/zones`                                    |
| **Modération**       | `GET`    | `/admin/listings/flagged`                   |
|                      | `GET`    | `/admin/listings/:id`                       |
|                      | `POST`   | `/admin/listings/:id/action`                |
| **AI (Assistant)**   | `POST`   | `/ai/chat`                                  |
|                      | `GET`    | `/ai/market-data`                           |
|                      | `POST`   | `/ai/index`                                 |
|                      | `GET`    | `/ai/index-status/:listingId`               |
|                      | `DELETE` | `/ai/index/:listingId`                      |
| **TOTAL**            |          | **35 Endpoints**                            |

---

## 10. Changelog (Version Corrigée)

**🆕 Ajouts :**
- Inscription utilisateur (POST /auth/register)
- Refresh token et logout
- Endpoints zones (GET /zones)
- Endpoints modérateur (6 endpoints admin)
- Historique crédits (GET /credits/history)
- Modification annonce (PUT /listings/:id)
- Archivage annonce (POST /listings/:id/archive)
- Annulation réservation (DELETE /reservations/:id)
- Mes réservations (GET /reservations/mine)
- Mes annonces (GET /listings/mine)
- Génération description IA
- Profil utilisateur (GET/PUT /users/me)


**🔧 Améliorations :**
- Gestion erreurs enrichie (400, 403, 409, 410, 429)
- Réponses IA validation détaillées
- Pagination sur toutes les listes
- Query params exhaustifs

**✅ Cohérence :**
- Aligné avec Niveau 2.4 (Décisions Produit)
- Workflow téléphone complet
- Rôle IA clarifié (suggère, pas bloque)
- Zones structurées


---
