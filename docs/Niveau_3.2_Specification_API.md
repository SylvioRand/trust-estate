# 📕 Niveau 3.2 — Spécification API Complète (MVP)

**Compatible Apidog / OpenAPI 3.0**

---

## Configuration Générale

```yaml
Base URL: /api/v1
Auth: Bearer Token (JWT)
Format: JSON
Encoding: UTF-8
```

### Gestion des erreurs d'authentification

**Tous les endpoints nécessitant `Authorization: Bearer {token}` peuvent retourner :**

**Response 401 (Non authentifié) :**
```json
{
  "error": "unauthorized",
  "message": "Token manquant, invalide ou expiré",
  "code": "TOKEN_INVALID"
}
```

**Cas d'usage :**
- Token absent dans le header
- Token invalide (format incorrect, signature invalide)
- Token expiré (après 24h)

**Action frontend recommandée :**
- Rediriger vers la page de connexion
- Ou utiliser `POST /auth/refresh` pour obtenir un nouveau token

---

**Response 403 (Action interdite) :**
```json
{
  "error": "forbidden",
  "message": "Vous n'avez pas la permission d'effectuer cette action"
}
```

**Cas d'usage :**
- Token valide mais rôle insuffisant (ex: utilisateur essaie d'accéder à `/admin/*`)
- Token valide mais pas le propriétaire de la ressource (ex: modifier l'annonce d'un autre)

> **Note :** Pour éviter la redondance, les erreurs 401 ne sont pas répétées pour chaque endpoint.
> Considérez qu'elles s'appliquent à tous les endpoints protégés.

---

## 1. Authentification

### 1.1 Inscription

```http
POST /auth/register
```

**Request :**
```json
{
  "email": "user@mail.com",     // ✅ Obligatoire (pour ce mode d'inscription)
  "phone": "+261340000000",     // ✅ Obligatoire (pour ce mode d'inscription)
  "password": "********",       // ✅ Obligatoire
  "name": "Nom Utilisateur"     // ✅ Obligatoire
}
```

> **Note DB :** Le champ `email` doit être **NULLABLE** en base de données.
> Les utilisateurs créés via **Login Téléphone** n'auront pas d'email.
> L'email est obligatoire uniquement pour ce endpoint `/register`.

> **Note MVP :** La vérification du téléphone est **différée post-MVP**. 
> En MVP, `phoneVerified` est **automatiquement `true`** pour tous les utilisateurs.
> Aucun workflow OTP n'est implémenté en MVP. Tous les utilisateurs peuvent réserver des visites.

**Response 201 :**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "expiresIn": 86400,
  "refreshToken": "refresh-token-xxx",  // ✅ Ajouté pour cohérence
  "user": {
    "id": "u1",
    "email": "user@mail.com",
    "phone": "+261340000000",
    "name": "Nom Utilisateur",
    "phoneVerified": true,  // MVP : toujours true
    "role": "user",
    "trustScore": 50,
    "createdAt": "2025-01-15T10:00:00Z"
  },
  "isNewUser": true,
  "initialCredits": 5,
  "message": "Compte créé avec succès. 5 crédits offerts !"
}
```

**Response 400 :**
```json
{
  "error": "validation_error",
  "message": "Erreur de validation",
  "details": {
    "email": "Email déjà utilisé",
    "password": "Minimum 8 caractères requis"
  }
}
```

**Response 409 :**
```json
{
  "error": "account_exists",
  "message": "Un compte existe déjà avec cet email/téléphone"
}
```

**Règles Mock :**
- Tout email/phone accepté sauf `existing@test.com`
- Mot de passe minimum 8 caractères
- Nom minimum 2 caractères
- Email et phone tous deux obligatoires
- 5 crédits automatiquement attribués
- `phoneVerified: true` par défaut (MVP simplifié, pas d'OTP)

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
    "phoneVerified": true,
    "role": "user",
    "trustScore": 75,
    "sellerStats": {
      "totalListings": 5,
      "activeListings": 2,
      "successfulSales": 3,
      "successfulRents": 0,
      "averageRating": 4.2,
      "responseRate": 92
    },
    "createdAt": "2025-01-10T08:00:00Z"
  }
}
```

**Response 400 :**
```json
{
  "error": "invalid_credentials",
  "message": "Email ou mot de passe incorrect"
}
```

---

### 1.3 Connexion Téléphone (Direct MVP)

```http
POST /auth/login-phone
```

**Request :**
```json
{
  "phone": "+261340000000"
}
```

**Response 200 :**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "expiresIn": 86400,
  "refreshToken": "refresh-token-xxx",
  "user": {
    "id": "u2",
    "phone": "+261340000000",
    "phoneVerified": true,
    "role": "user",
    "trustScore": 50,
    "createdAt": "2025-01-15T10:30:00Z"
  },
  "isNewUser": false,  // true si compte créé, false si connexion
  "initialCredits": 0,  // 5 si isNewUser=true
  "message": "Connexion réussie"
}
```

> **Note MVP :** Si le numéro n'existe pas, un nouveau compte est créé automatiquement
> avec `isNewUser: true` et `initialCredits: 5`.

**Response 404 :**
```json
{
  "error": "phone_not_found",
  "message": "Aucun compte associé à ce numéro",
  "suggestion": "Veuillez créer un compte"
}
```

**Response 429 :**
```json
{
  "error": "too_many_requests",
  "message": "Trop de demandes. Réessayez dans 10 minutes.",
  "retryAfter": 600
}
```

---

### 1.4 Connexion Google OAuth

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
  "refreshToken": "refresh-token-xxx",  // ✅ Ajouté pour cohérence
  "user": {
    "id": "u3",
    "email": "user@gmail.com",
    "name": "User Name",
    "phone": null,  // Google OAuth ne fournit pas le téléphone
    "role": "user",
    "phoneVerified": true,  // MVP : toujours true
    "trustScore": 50,
    "createdAt": "2025-01-15T11:00:00Z"
  },
  "isNewUser": true,
  "initialCredits": 5
}
```

**Règles Mock :**
- Tout token accepté
- Crée utilisateur si nouvel email
- `isNewUser: true` si création

> **Note MVP :** Même pour Google OAuth, `phoneVerified` est `true` par défaut.
> Le téléphone n'est pas fourni par Google (champ `phone` sera `null`), mais la vérification
> est différée post-MVP. L'utilisateur pourra réserver normalement.

---

### 1.5 Rafraîchissement Token

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

**Response 401 :**
```json
{
  "error": "invalid_refresh_token",
  "message": "Session expirée. Veuillez vous reconnecter."
}
```

---

### 1.6 Déconnexion

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
  "phoneVerified": true,
  "role": "user",
  "trustScore": 85,
  "sellerStats": {
    "totalListings": 8,
    "activeListings": 2,
    "successfulSales": 5,
    "successfulRents": 1,
    "averageRating": 4.3,
    "responseRate": 92
  },
  "credits": {
    "balance": 12,
    "totalEarned": 25,
    "totalSpent": 13
  },
  "createdAt": "2024-06-15T10:00:00Z",
  "updatedAt": "2025-01-15T14:00:00Z"
}
```

---

### 2.2 Modifier Mon Profil

```http
PUT /users/me
```

**Headers :**
```
Authorization: Bearer {token}
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
    "email": "nouveau@mail.com",
    "phone": "+261340000000",
    "phoneVerified": true,
    "updatedAt": "2025-01-15T16:00:00Z"
  }
}
```

---

### 2.3 Changer Mot de Passe

```http
POST /users/me/change-password
```

**Request :**
```json
{
  "currentPassword": "ancienMdp",
  "newPassword": "nouveauMdp"
}
```

**Response 200 :**
```json
{
  "success": true,
  "message": "Mot de passe modifié avec succès"
}
```

**Response 400 :**
```json
{
  "error": "invalid_password",
  "message": "Mot de passe actuel incorrect"
}
```

---

## 3. Annonces

### 3.1 Liste des Annonces

```http
GET /listings
```

**Query Params :**
| Param      | Type    | Description                                                    |
|------------|---------|----------------------------------------------------------------|
| type       | string  | `sale` ou `rent` (défaut: tous)                                |
| minPrice   | number  | Prix minimum                                                   |
| maxPrice   | number  | Prix maximum                                                   |
| zone       | string  | Code zone (ex: `tana-analakely`)                               |
| minSurface | number  | Surface minimum m²                                             |
| maxSurface | number  | Surface maximum m²                                             |
| bedrooms   | number  | Nombre chambres minimum                                        |
| features   | string  | Features séparées par virgule                                  |
| sort       | string  | `price_asc`, `price_desc`, `date_desc` (défaut: `date_desc`)   |
| page       | number  | Page (défaut: 1)                                               |
| limit      | number  | Résultats par page (défaut: 20)                                |

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
      "features": {
        "bedrooms": 3,
        "bathrooms": 2,
        "parking": true,
        "garden": true
      },
      "photos": ["https://mock-cdn.com/photo1.jpg"],
      "trustScore": 82,
      "status": "active",
      "createdAt": "2025-01-10T08:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 45,
    "totalPages": 3,
    "hasNext": true,
    "hasPrev": false
  }
}
```

---

### 3.2 Détail Annonce

```http
GET /listings/:id
```

**Response 200 (non connecté ou pas de réservation) :**
```json
{
  "id": "l1",
  "title": "Maison T3 Analakely",
  "description": "Maison lumineuse avec jardin arboré. Proche des commodités...",
  "price": 50000000,
  "type": "sale",
  "surface": 120,
  "zone": "tana-analakely",
  "zoneDisplay": "Antananarivo - Analakely",
  "photos": [
    "https://mock-cdn.com/photo1.jpg",
    "https://mock-cdn.com/photo2.jpg",
    "https://mock-cdn.com/photo3.jpg"
  ],
  "features": {
    "bedrooms": 3,
    "bathrooms": 2,
    "parking": true,
    "garden": true,
    "pool": false,
    "furnished": false
  },
  "trustScore": 82,
  "status": "active",
  "sellerVisible": false,
  "sellerHistory": {
    "totalListings": 5,
    "successfulSales": 3,
    "averageRating": 4.2
  },
  "stats": {
    "views": 245,
    "reservations": 3
  },
  "createdAt": "2025-01-10T08:00:00Z",
  "updatedAt": "2025-01-12T14:30:00Z"
}
```

**Response 200 (après réservation confirmée) :**
```json
{
  "id": "l1",
  "title": "Maison T3 Analakely",
  "...": "...",
  "sellerVisible": true,
  "seller": {
    "id": "u5",
    "name": "Jean Rakoto",
    "phone": "+261340000001",
    "email": "jean@mail.com",
    "trustScore": 88,
    "memberSince": "2024-06-15T00:00:00Z"
  },
  "sellerHistory": {
    "totalListings": 5,
    "successfulSales": 3,
    "averageRating": 4.2
  }
}
```

---

### 3.3 Créneaux Disponibles

```http
GET /listings/:id/availability
```

**Query Params :**
| Param     | Type   | Description                                 |
|-----------|--------|---------------------------------------------|
| startDate | string | Date début (ISO 8601) (défaut: aujourd'hui) |
| endDate   | string | Date fin (ISO 8601) (défaut: +14 jours)     |

**Response 200 :**
```json
{
  "listingId": "l1",
  "timezone": "Indian/Antananarivo",
  "slotDuration": 60,
  "availability": [
    {
      "date": "2025-01-20",
      "slots": [
        { "time": "09:00", "available": true },
        { "time": "10:00", "available": true },
        { "time": "11:00", "available": false },
        { "time": "14:00", "available": true },
        { "time": "15:00", "available": true },
        { "time": "16:00", "available": true }
      ]
    },
    {
      "date": "2025-01-21",
      "slots": [
        { "time": "09:00", "available": true },
        { "time": "10:00", "available": false },
        { "time": "14:00", "available": true }
      ]
    }
  ]
}
```

**Règles :**
- **Les créneaux sont définis par le vendeur** (voir section 3.8)
- Si le vendeur n'a pas défini de disponibilités, retourne une liste vide
- Les créneaux déjà réservés sont marqués `available: false`

> **Note :** Pour définir ses disponibilités, le vendeur utilise `PUT /listings/:id/availability` (voir section 3.8)

---

### 3.3.1 Générer Description IA

```http
POST /listings/generate-description
```

**Headers :**
```
Authorization: Bearer {token}
```

**Request :**
```json
{
  "type": "sale",                    // "sale" ou "rent"
  "propertyType": "house",           // "house", "apartment", "land", "commercial"
  "zone": "tana-analakely",          // Zone prédéfinie
  "surface": 120,                    // m²
  "rooms": 4,                        // Nombre de pièces
  "price": 150000000,                // Prix en Ariary
  "features": {
    "parking": true,
    "garden": true,
    "pool": false,
    "furnished": false
  },
  "additionalInfo": "Vue sur lac, proche école internationale"  // Optionnel
}
```

**Response 200 :**
```json
{
  "generatedDescription": "Belle maison spacieuse de 4 pièces située à Analakely. Cette propriété de 120 m² offre un cadre de vie idéal avec parking et jardin. Profitez d'une vue imprenable sur le lac et de la proximité des écoles internationales. Un bien rare à ne pas manquer !",
  "tokens": {
    "input": 85,
    "output": 62
  },
  "model": "gpt-4o-mini",             // ou autre LLM choisi
  "regenerationsRemaining": 2         // Limite par annonce
}
```

**Response 429 (limite atteinte) :**
```json
{
  "error": "generation_limit_reached",
  "message": "Limite de régénérations atteinte pour cette annonce",
  "limit": 3
}
```

**Response 503 (service IA indisponible) :**
```json
{
  "error": "ai_service_unavailable",
  "message": "Le service de génération est temporairement indisponible. Veuillez réessayer ou écrire votre description manuellement."
}
```

**Règles :**
```yaml
Limite: 3 générations par annonce (évite les abus)
LLM: À définir (OpenAI, Claude, Mistral, etc.)
Fallback: Si IA indisponible → utilisateur écrit manuellement
Langue: Français (Madagascar)
Longueur: 100-300 caractères recommandés
```

**Flow Frontend :**
1. Vendeur remplit les infos du bien
2. Clic sur "Générer description avec IA"
3. Affichage de la description générée dans le champ
4. Vendeur peut modifier, régénérer (jusqu'à 3x), ou écrire lui-même

---

### 3.4 Créer Annonce

```http
POST /listings
```

**Headers :**
```
Authorization: Bearer {token}
Content-Type: application/json
```

**Request :**
```json
{
  "type": "sale",
  "title": "Villa T4 avec piscine",
  "description": "Belle villa moderne avec piscine et jardin paysager...",
  "price": 120000000,
  "surface": 200,
  "zone": "tana-ivandry",
  "photos": [
    "data:image/jpeg;base64,/9j/4AAQ...",
    "data:image/jpeg;base64,/9j/4AAQ..."
  ],
  "features": {
    "bedrooms": 4,
    "bathrooms": 3,
    "parking": true,
    "garden": true,
    "pool": true,
    "furnished": false
  }
}
```

**Response 201 :**
```json
{
  "listingId": "l10",
  "status": "active",
  "creditConsumed": 1,
  "remainingCredits": 4,
  "visibilityBonus": 0,
  "url": "/listings/l10"
}
```

> **🔔 MVP :** Aucune validation IA n'est effectuée en MVP. L'annonce est publiée **immédiatement** après paiement.
> Le champ `iaValidation` n'est pas retourné en MVP.
> 
> **Post-MVP (Phase 2) :** La validation IA sera ajoutée avec détection d'incohérences automatique
> et ajustement de visibilité selon le niveau de confiance.

**Response 400 (crédits insuffisants) :**
```json
{
  "error": "insufficient_credits",
  "message": "Crédits insuffisants pour publier",
  "required": 1,
  "balance": 0
}
```



---

### 3.5 Modifier Annonce

```http
PUT /listings/:id
```

**Headers :**
```
Authorization: Bearer {token}
```

**Request :** (mêmes champs que création)

**Response 200 :**
```json
{
  "listingId": "l10",
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

---

### 3.6 Archiver Annonce (Vendu/Loué)

```http
POST /listings/:id/archive
```

**Request :**
```json
{
  "finalStatus": "sold" | "rented",
  "soldTo": "u7"  // Optionnel : ID acheteur (si sold) ou locataire (si rented)
}
```

**Exemple 1 : Vente**
```json
{
  "finalStatus": "sold",
  "soldTo": "u7"
}
```

**Exemple 2 : Location**
```json
{
  "finalStatus": "rented",
  "soldTo": "u12"  // ID du locataire
}
```

**Exemple 3 : Sans acheteur/locataire**
```json
{
  "finalStatus": "sold"
  // soldTo omis si transaction hors plateforme
}
```

**Response 200 :**
```json
{
  "archived": true,
  "finalStatus": "sold",
  "archivedAt": "2025-01-15T16:00:00Z",
  "trustScoreBonus": 5
}
```

> **Note :** Le champ `soldTo` est optionnel. Il permet de lier l'annonce à l'acheteur/locataire
> si la transaction s'est faite via la plateforme. Sinon, il peut être omis.

---

### 3.7 Mes Annonces

```http
GET /listings/mine
```

**Query Params :**
| Param  | Type    | Description                                          | Défaut       |
|--------|---------|------------------------------------------------------|--------------|
| status | string  | `active`, `reserved`, `sold`, `rented`, `archived`   | tous         |

**Response 200 :**
```json
{
  "data": [
    {
      "id": "l10",
      "title": "Villa T4",
      "price": 120000000,
      "status": "active",
      "trustScore": 75,
      "stats": {
        "views": 12,
        "reservations": 0
      },
      "createdAt": "2025-01-15T10:00:00Z"
    }
  ],
  "summary": {
    "active": 2,
    "reserved": 1,
    "sold": 3,
    "rented": 1,
    "archived": 1
  }
}
```

---

### 3.8 Gérer Disponibilités Vendeur

> **Les créneaux de visite sont définis par le vendeur.**
> 
> **MVP : Modèle simplifié avec liste de créneaux explicites**

#### Consulter mes disponibilités

```http
GET /listings/:id/availability/manage
```

**Headers :**
```
Authorization: Bearer {token}
```

**Response 200 :**
```json
{
  "listingId": "l10",
  "slots": [
    "2025-01-20T10:00:00Z",
    "2025-01-21T14:00:00Z",
    "2025-01-22T09:00:00Z",
    "2025-01-23T15:00:00Z"
  ]
}
```

---

#### Définir mes disponibilités

```http
PUT /listings/:id/availability/manage
```

**Headers :**
```
Authorization: Bearer {token}
```

**Request :**
```json
{
  "slots": [
    "2025-01-20T10:00:00Z",
    "2025-01-21T14:00:00Z",
    "2025-01-22T09:00:00Z"
  ]
}
```

**Response 200 :**
```json
{
  "updated": true,
  "count": 3
}
```

> **Note MVP :** Le modèle simplifié permet une implémentation rapide.
> 
> **Post-MVP (Phase 2) :** Migration vers récurrence hebdomadaire + exceptions si besoin.

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

**Response 200 (confirmation auto) :**
```json
{
  "reservationId": "r1",
  "status": "confirmed",
  "slot": "2025-01-20T10:00:00Z",
  "slotDisplay": "20 janvier 2025 à 10h00",
  "sellerContactVisible": true,
  "seller": {
    "name": "Jean Rakoto",
    "phone": "+261340000001"
  },
  "message": "Réservation confirmée"
}
```

<!-- ❌ SUPPRIMÉ EN MVP - Cette erreur n'existe pas en MVP car phoneVerified est toujours true
**Response 400 (téléphone non vérifié) :** (Post-MVP uniquement)
```json
{
  "error": "phone_not_verified",
  "message": "Veuillez vérifier votre numéro de téléphone avant de réserver."
}
```
-->

> **Note MVP :** Tous les utilisateurs peuvent réserver (phoneVerified = true par défaut).
> Cette validation sera activée en Post-MVP après implémentation du workflow OTP.

**Response 409 (créneau indisponible) :**
```json
{
  "error": "slot_unavailable",
  "message": "Ce créneau n'est plus disponible",
  "availableSlots": [
    "2025-01-20T14:00:00Z",
    "2025-01-21T10:00:00Z"
  ]
}
```

---

### 4.2 Mes Réservations

```http
GET /reservations/mine
```

**Query Params :**
| Param  | Type   | Description                                               |
|--------|--------|-----------------------------------------------------------|
| status | string | `pending`, `confirmed`, `cancelled`, `done`               |
| role   | string | `buyer` (mes réservations) ou `seller` (sur mes annonces) |

**Response 200 :**
```json
{
  "data": [
    {
      "id": "r1",
      "listing": {
        "id": "l1",
        "title": "Maison T3 Analakely",
        "photo": "https://mock-cdn.com/photo1.jpg",
        "price": 50000000
      },
      "slot": "2025-01-20T10:00:00Z",
      "slotDisplay": "20 janvier 2025 à 10h00",
      "status": "confirmed",
      "seller": {
        "name": "Jean Rakoto",
        "phone": "+261340000001"
      },
      "canLeaveFeedback": false,
      "createdAt": "2025-01-15T14:00:00Z"
    }
  ],
  "summary": {
    "pending": 0,
    "confirmed": 1,
    "done": 2,
    "cancelled": 0
  }
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
  "refund": 0,
  "message": "Réservation annulée"
}
```

**Response 400 :**
```json
{
  "error": "cancellation_too_late",
  "message": "Annulation impossible moins de 2 heures avant le créneau"
}
```

---

### 4.4 Confirmer/Refuser Réservation (Vendeur)

```http
POST /reservations/:id/respond
```

**Request :**
```json
{
  "action": "confirm",
  "alternativeSlots": []
}
```

**OU pour refus avec alternatives :**
```json
{
  "action": "reject",
  "alternativeSlots": [
    "2025-01-21T10:00:00Z",
    "2025-01-21T14:00:00Z"
  ],
  "message": "Je ne suis pas disponible ce jour, voici des alternatives."
}
```

**Response 200 :**
```json
{
  "updated": true,
  "status": "confirmed",
  "notificationSent": true
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
  "comment": "Visite conforme. Vendeur sérieux et réactif.",
  "categories": {
    "propertyAccurate": true,
    "sellerReactive": true,
    "visitUseful": true
  }
}
```

> **Note :** Le champ `categories` est **optionnel**. L'utilisateur peut laisser un feedback
> simple avec uniquement `rating` et `comment`. Les catégories permettent un feedback plus détaillé.

**Exemple minimal :**
```json
{
  "reservationId": "r1",
  "rating": 4,
  "comment": "Bonne visite"
  // categories omis
}
```

**Exemple détaillé (avec catégories) :**
```json
{
  "reservationId": "r1",
  "rating": 5,
  "comment": "Excellente visite, bien conforme à l'annonce",
  "categories": {
    "propertyAccurate": true,
    "sellerReactive": true,
    "visitUseful": true
  }
}
```

**Response 200 :**
```json
{
  "feedbackId": "f1",
  "saved": true,
  "impactOnListing": {
    "previousTrustScore": 80,
    "newTrustScore": 84,
    "visibilityChange": "+5%"
  },
  "message": "Merci pour votre retour !"
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

## 6. Crédits

### 6.1 Consulter Solde

```http
GET /credits/balance
```

**Response 200 :**
```json
{
  "balance": 12,
  "totalEarned": 25,
  "totalSpent": 13,
  "lastRechargeAt": "2025-01-15T10:00:00Z"
}
```

---

### 6.2 Providers Disponibles

```http
GET /credits/providers
```

**Response 200 :**
```json
{
  "providers": [
    {
      "id": "orange-money",
      "name": "Orange Money",
      "logo": "https://cdn.platform.mg/logos/orange-money.png",
      "available": true
    },
    {
      "id": "mvola",
      "name": "MVola",
      "logo": "https://cdn.platform.mg/logos/mvola.png",
      "available": true
    }
  ],
  "packs": [
    { "id": "starter", "credits": 5, "price": 5000, "bonus": 0 },
    { "id": "standard", "credits": 12, "price": 10000, "bonus": 2 },
    { "id": "premium", "credits": 30, "price": 20000, "bonus": 5 },
    { "id": "pro", "credits": 100, "price": 50000, "bonus": 20 }
  ]
}
```

---

### 6.3 Recharger Crédits

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
  "transactionId": "tx123",
  "pack": {
    "id": "standard",
    "credits": 12,
    "price": 10000,
    "bonus": 2
  },
  "totalCredits": 14,
  "previousBalance": 6,
  "newBalance": 20
}
```

**Response 400 :**
```json
{
  "error": "payment_failed",
  "message": "Paiement échoué. Vérifiez votre solde Mobile Money.",
  "details": "Solde insuffisant"
}
```

---

### 6.4 Historique Transactions

```http
GET /credits/history
```

**Query Params :**
| Param  | Type   | Description                      |
|--------|--------|----------------------------------|
| type   | string | `recharge`, `consume`, `bonus`   |
| page   | number | Page (défaut: 1)                 |
| limit  | number | Résultats par page (défaut: 20)  |

**Response 200 :**
```json
{
  "data": [
    {
      "id": "tx1",
      "type": "bonus",
      "amount": 5,
      "reason": "initial_bonus",
      "reasonDisplay": "Bonus de bienvenue",
      "balanceAfter": 5,
      "createdAt": "2024-06-15T10:00:00Z"
    },
    {
      "id": "tx2",
      "type": "recharge",
      "amount": 12,
      "reason": "recharge_pack",
      "reasonDisplay": "Achat pack Standard",
      "metadata": { "pack": "standard", "price": 10000 },
      "balanceAfter": 17,
      "createdAt": "2025-01-15T10:00:00Z"
    },
    {
      "id": "tx3",
      "type": "consume",
      "amount": -1,
      "reason": "publish_listing",
      "reasonDisplay": "Publication annonce",
      "listingId": "l10",
      "balanceAfter": 16,
      "createdAt": "2025-01-15T11:30:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 3,
    "totalPages": 1
  }
}
```

---

## 7. Zones

### 7.1 Lister Zones

```http
GET /zones
```

**Query Params :**
| Param    | Type   | Description                         |
|----------|--------|-------------------------------------|
| level    | string | `city`, `district`, `neighborhood`  |
| parentId | string | ID zone parent                      |
| search   | string | Recherche texte                     |

**Response 200 :**
```json
{
  "data": [
    {
      "id": "tana-analakely",
      "name": "Analakely",
      "displayName": "Antananarivo - Analakely",
      "level": "neighborhood",
      "parentId": "tana-renivohitra",
      "stats": {
        "activeListings": 23,
        "averagePrice": 45000000
      }
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

---

## 8. Upload

### 8.1 Upload Image

```http
POST /upload/image
Content-Type: multipart/form-data
```

**Request :**
```
image: [fichier binaire]
```

**Response 200 :**
```json
{
  "url": "https://cdn.platform.mg/images/abc123.jpg",
  "hash": "a3f5d9c2e1b4",
  "size": 245000,
  "dimensions": {
    "width": 1200,
    "height": 800
  }
}
```

**Response 400 :**
```json
{
  "error": "invalid_image",
  "message": "Format non supporté. Utilisez JPEG, PNG ou WebP.",
  "acceptedFormats": ["image/jpeg", "image/png", "image/webp"],
  "maxSize": "5MB"
}
```

**Limites :**
```yaml
formats: [JPEG, PNG, WebP]
taille_max: 5MB
dimensions_min: 800x600
```

---

## 9. Administration (Modérateur)

### 9.0 Configuration Compte Modérateur (MVP)

#### Création manuelle

Le compte modérateur est créé **manuellement en base de données** avant le déploiement MVP.

**Requête SQL exemple :**
```sql
INSERT INTO users (id, email, password_hash, role, phone, phone_verified, trust_score, created_at)
VALUES (
  'moderator-1',
  'moderator@plateforme.mg',
  '$2b$10$...', -- Hash de 'ModeratorPass2024!' (à changer en production)
  'moderator',
  '+261340000000',
  true,
  100,
  NOW()
);
```

#### Différences avec un compte utilisateur

| Élément          | Utilisateur      | Modérateur             |
|------------------|------------------|------------------------|
| `role`           | `user`           | `moderator`            |
| Accès `/admin/*` | ❌ 403 Forbidden | ✅ Autorisé            |
| Publier annonces | ✅               | ❌ Non prévu           |
| Crédits          | ✅ 5 initiaux    | ❌ Aucun (pas vendeur) |
| Réserver visites | ✅               | ❌ Non prévu           |

#### Connexion

Le modérateur se connecte via **`POST /auth/login`** avec :
- **Email :** `moderator@plateforme.mg`
- **Password :** (défini lors de la création)

**Response identique à un utilisateur normal, mais avec `role: "moderator"`**

```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "moderator-1",
    "email": "moderator@plateforme.mg",
    "role": "moderator",  // ← Différence clé
    "phoneVerified": true,
    "trustScore": 100
  }
}
```

#### Nombre de modérateurs

- **MVP :** 1 seul modérateur
- **Post-MVP (Phase 3) :** Multi-modérateurs avec permissions granulaires

---

### 9.1 Annonces Signalées

```http
GET /admin/listings/flagged
```

**Query params :**
- `reason` : `user_reported` (en MVP, seul le signalement utilisateur existe)

> **Post-MVP :** Ajout de `reason: ai_detected`

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

### 9.2 Demander Clarifications

```http
POST /admin/listings/:id/request-clarification
```

**Headers :**
```
Authorization: Bearer {token}
```

**Request :**
```json
{
  "message": "Vos photos semblent recyclées. Merci de fournir des photos récentes avec un objet daté visible.",
  "issues": [
    "photos_suspicious",
    "price_incoherent"
  ]
}
```

**Response 200 :**
```json
{
  "notificationSent": true,
  "listing": {
    "id": "l5",
    "status": "active",
    "clarificationRequested": true
  }
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

### 9.3 Ajuster Visibilité

```http
POST /admin/listings/:id/adjust-visibility
```

**Headers :**
```
Authorization: Bearer {token}
```

**Request :**
```json
{
  "visibilityPenalty": 50,  // Réduction en % (0-100)
  "reason": "Incohérences confirmées après examen",
  "duration": 48  // Heures (optionnel, permanent si omis)
}
```

**Response 200 :**
```json
{
  "applied": true,
  "listing": {
    "id": "l5",
    "trustScore": 40,
    "visibilityPenalty": 50,
    "penaltyUntil": "2025-01-17T10:00:00Z"
  }
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

### 9.4 Bloquer Temporairement

```http
POST /admin/listings/:id/block-temporary
```

**Headers :**
```
Authorization: Bearer {token}
```

**Request :**
```json
{
  "duration": 48,  // Heures (max 72h en MVP)
  "reason": "Photos trompeuses confirmées. Correction obligatoire."
}
```

**Response 200 :**
```json
{
  "blocked": true,
  "listing": {
    "id": "l5",
    "status": "blocked",
    "blockedUntil": "2025-01-17T10:00:00Z",
    "reason": "Photos trompeuses confirmées"
  }
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

### 9.5 Archiver Définitivement

```http
POST /admin/listings/:id/archive-permanent
```

**Headers :**
```
Authorization: Bearer {token}
```

**Request :**
```json
{
  "reason": "Fraude avérée : bien inexistant",
  "banUser": false  // Optionnel : bannir aussi le vendeur
}
```

**Response 200 :**
```json
{
  "archived": true,
  "listing": {
    "id": "l5",
    "status": "archived",
    "archivedAt": "2025-01-15T16:00:00Z",
    "reason": "Fraude avérée"
  }
}
```

**Response 403 :**
```json
{
  "error": "forbidden",
  "message": "Accès réservé aux modérateurs"
}
```

> **⚠️ Attention :** Cette action est **irréversible**. À utiliser uniquement en cas de fraude manifeste.

---

### 9.6 Historique Actions

```http
GET /admin/actions/history
```

**Headers :**
```
Authorization: Bearer {token}
```

**Query Params :**
| Param | Type | Description |
|-------|------|-------------|
| moderatorId | string | Filtrer par modérateur (optionnel) |
| targetType | string | `listing`, `user`, `feedback` (optionnel) |
| action | string | Type d'action (optionnel) |
| page | number | Page (défaut: 1) |
| limit | number | Résultats par page (défaut: 50) |

**Response 200 :**
```json
{
  "data": [
    {
      "id": "ma1",
      "moderatorId": "moderator-1",
      "moderatorName": "Modérateur Principal",
      "targetType": "listing",
      "targetId": "l5",
      "action": "block_temporary",
      "reason": "Photos trompeuses confirmées",
      "metadata": {
        "duration": 48,
        "blockedUntil": "2025-01-17T10:00:00Z"
      },
      "applied": true,
      "createdAt": "2025-01-15T14:00:00Z"
    },
    {
      "id": "ma2",
      "moderatorId": "moderator-1",
      "moderatorName": "Modérateur Principal",
      "targetType": "listing",
      "targetId": "l8",
      "action": "request_clarification",
      "reason": "Prix incohérent avec la zone",
      "metadata": {
        "message": "Le prix semble trop élevé pour cette zone..."
      },
      "applied": true,
      "createdAt": "2025-01-15T12:30:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 50,
    "total": 127,
    "totalPages": 3
  }
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

## 📋 Récapitulatif des Endpoints

| Catégorie        | Endpoint                           | Méthode | Auth      |
|------------------|------------------------------------|---------|-----------|
| **Auth**         | /auth/register                     | POST    | Non       |
|                  | /auth/login                        | POST    | Non       |
|                  | /auth/login-phone                  | POST    | Non       |
|                  | /auth/google                       | POST    | Non       |
|                  | /auth/refresh                      | POST    | Non       |
|                  | /auth/logout                       | POST    | Oui       |
| **Users**        | /users/me                          | GET     | Oui       |
|                  | /users/me                          | PUT     | Oui       |
|                  | /users/me/change-password          | POST    | Oui       |
| **Listings**     | /listings                          | GET     | Non       |
|                  | /listings/:id                      | GET     | Non       |
|                  | /listings/:id/availability         | GET     | Non       |
|                  | /listings/:id/availability/manage  | GET     | Oui       |
|                  | /listings/:id/availability/manage  | PUT     | Oui       |
|                  | /listings/generate-description     | POST    | Oui       |
|                  | /listings                          | POST    | Oui       |
|                  | /listings/:id                      | PUT     | Oui       |
|                  | /listings/:id/archive              | POST    | Oui       |
|                  | /listings/mine                     | GET     | Oui       |
| **Reservations** | /reservations                      | POST    | Oui       |
|                  | /reservations/mine                 | GET     | Oui       |
|                  | /reservations/:id                  | DELETE  | Oui       |
|                  | /reservations/:id/respond          | POST    | Oui       |
| **Feedback**     | /feedback                          | POST    | Oui       |
| **Credits**      | /credits/balance                   | GET     | Oui       |
|                  | /credits/providers                 | GET     | Non       |
|                  | /credits/recharge                  | POST    | Oui       |
|                  | /credits/history                   | GET     | Oui       |
| **Zones**        | /zones                             | GET     | Non       |
| **Upload**       | /upload/image                      | POST    | Oui       |
| **Admin**        | /admin/*                           | *       | Oui (mod) |

**Total : 33 endpoints**

---

## 📌 Décisions Produit Confirmées

| Question            | Décision                                                    |
|---------------------|-------------------------------------------------------------|
| **Inscription**     | Email + Téléphone + Nom = **OBLIGATOIRES**                  |
| **Vérification téléphone** | **Différée post-MVP** (tous peuvent réserver en MVP) |
| **Refresh Token**   | **OUI**, implémenté pour MVP                                |
| **Créneaux visite** | **Définis par le vendeur**                                  |
| **Status draft**    | **Supprimé** pour MVP (publication directe)                 |
