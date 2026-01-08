# 📕 Niveau 3.2 — Contrats API (MVP, mockables) — VERSION CORRIGÉE

## Objectif

Définir des contrats API REST clairs, stables et mockables, permettant :
- au frontend de fonctionner sans backend réel
- à Apidog / Swagger de simuler les réponses

⚠️ Ces contrats décrivent le comportement attendu, pas l'implémentation.

**Cette version corrige et complète le document initial avec :**
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
| **listings-service**     | 3002 | `/listings/*`, `/admin/*` |
| **reservations-service** | 3003 | `/reservations/*`, `/feedback/*`      |
| **credits-service**      | 3004 | `/credits/*`                          |
| **ai-service**           | 3005 | `/ai/*`                               |

> Voir `Niveau_3.5_Architecture_Microservices.md` pour les détails complets.

---

## Conventions générales

**Base URL :** `/api/v1` (routé via Nginx gateway)

**Auth :** Cookies HttpOnly (Standard strict)

| Nom du cookie             | Contenu       | Durée       | Attributs requis                                      |
|---------------------------|---------------|-------------|-------------------------------------------------------|
| `realestate_access_token` | JWT (String)  | 15 min      | `HttpOnly`, `Secure`, `SameSite=Strict`, `Path=/`     |
| `realestate_refresh_token`| UUID (String) | 7 jours     | `HttpOnly`, `Secure`, `SameSite=Strict`, `Path=/auth` |


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

## 🔒 Règles de Validation (Frontend & Backend)

### Principe de Défense en Profondeur

Toutes les validations frontend **DOIVENT** être répliquées au backend. Le frontend améliore l'UX, le backend garantit la sécurité.

```
┌────────────────────┐     ┌────────────────────┐
│  FRONTEND (UX)     │     │  BACKEND (Sécurité)│
│  ─────────────     │     │  ──────────────    │
│  • Feedback rapide │ ──► │  • Validation data │
│  • Désactive submit│     │  • Sanitization XSS│
│  • Erreurs inline  │     │  • Rate limiting   │
│  • Format hints    │     │  • Auth/Permissions│
└────────────────────┘     └────────────────────┘
```

### Validation Frontend (React)

- **Outils :** `react-hook-form` + `zod` pour la validation
- **UX :** Afficher erreurs en temps réel (onChange/onBlur)
- **Submit :** Désactiver bouton si formulaire invalide
- **Feedback :** Messages d'erreur localisés sous chaque champ

### Validation Backend (Fastify)

- **Outils :** `@fastify/schema` (JSON Schema) ou `zod` avec `fastify-type-provider-zod`
- **Ordre :** Valider **AVANT** toute opération en base de données
- **Réponses :** Retourner erreurs détaillées (400 avec `details`)
- **Sécurité :** Sanitization XSS sur tous les champs texte

### Codes HTTP Standardisés (Validation)

| Code  | Signification             | Exemple                             |
|-------|---------------------------|-------------------------------------|
| `400` | Validation échouée        | Champs invalides (format, longueur) |
| `401` | Token manquant/invalide   | Cookie absent ou JWT expiré         |
| `402` | Paiement requis           | Crédits insuffisants                |
| `403` | Action interdite          | Pas propriétaire / mauvais rôle     |
| `409` | Conflit                   | Slot déjà réservé, email existe     |
| `413` | Fichier trop volumineux   | Image > 5MB                         |
| `422` | Entité non traitable      | Format image invalide               |
| `429` | Rate limit dépassé        | Trop de tentatives                  |

### Format de réponse standard (Erreur & i18n)

Toutes les erreurs (4xx, 5xx) suivent ce format JSON.
**IMPORTANT (i18n) :** Le champ `message` contient une **clé de traduction** (ex: `auth.user_not_found`) et non un texte brut. Le frontend doit utiliser cette clé pour afficher le message dans la langue de l'utilisateur.

```json
{
  "error": "code_erreur_machine",
  "message": "namespace.error_key",
  "details": { // Optionnel (pour 400 validation)
    "field_name": ["validation.rule_key"]
  }
}
```

#### Exemple Validation (400)
```json
{
  "error": "validation_failed",
  "message": "common.validation_failed",
  "details": {
    "password": [
      "validation.password.too_short",
      "validation.password.missing_caps"
    ]
  }
}
```

### Structure Erreur de Permission (403)

```json
{
  "error": "forbidden",
  "message": "Vous ne pouvez modifier que vos propres annonces",
  "requiredRole": null,
  "requiredOwnership": true
}
```

### Sanitization Anti-XSS

Tous les champs texte (`title`, `description`, `comment`, `firstName`, etc.) doivent être nettoyés :

```javascript
// Backend (Node.js)
import xss from 'xss';
const cleanTitle = xss(req.body.title);
```

### Rate Limiting par Endpoint

| Endpoint                    | Limite       | Période   | Blocage après                |
|-----------------------------|--------------|-----------|------------------------------|
| `/auth/login`               | 5 tentatives | 15 min    | 10 échecs → compte bloqué 1h |
| `/auth/register`            | 3 comptes    | 1 heure   | Par IP                       |
| `/auth/resend-verification` | 3 demandes   | 1 heure   | Par email                    |
| `/listings/publish`         | 10 annonces  | 24 heures | Par utilisateur              |
| `/credits/recharge`         | 3 recharges  | 1 heure   | Par utilisateur              |
| `/ai/generate`              | 10 requêtes  | 1 minute  | Par utilisateur              |

### Upload de Fichiers (Images)

| Règle                | Valeur                                  |
|----------------------|-----------------------------------------|
| Formats acceptés     | `image/jpeg`, `image/png`, `image/webp` |
| Taille max par image | 5 MB                                    |
| Taille max total     | 50 MB                                   |
| Nombre min           | 3 images                                |
| Nombre max           | 10 images                               |
| Vérification         | MIME type réel (pas juste extension)    |

### 🛡️ Règles de Sécurité Strictes

#### Rejet des Champs Non Définis

Le backend **DOIT** rejeter tout champ non prévu dans le schéma pour éviter l'injection de données parasites :

```json
// JSON Schema (Fastify)
{
  "type": "object",
  "properties": { ... },
  "additionalProperties": false,  // ⚠️ OBLIGATOIRE
  "required": ["email", "password"]
}
```

```typescript
// Zod (Frontend & Backend)
const schema = z.object({
  email: z.string().email(),
  password: z.string().min(8)
}).strict();  // ⚠️ Équivalent à additionalProperties: false
```

#### Limites de Taille Synchronisées (Anti-DoS)

Les limites de longueur **DOIVENT** être identiques frontend ET backend :

| Champ                 | Min | Max  | Raison                  |
|-----------------------|-----|------|-------------------------|
| `email`               | 5   | 255  | Standard RFC            |
| `firstName`           | 2   | 50   | Évite les abus          |
| `lastName`            | 2   | 50   | Évite les abus          |
| `password`            | 8   | 128  | Sécurité + bcrypt limit |
| `title`               | 10  | 100  | Lisibilité annonces     |
| `description`         | 50  | 2000 | Balance UX/stockage     |
| `comment`             | 10  | 500  | Feedback raisonnable    |
| `reason` (modération) | 10  | 500  | Justification claire    |

> ⚠️ **Protection DoS** : Si le frontend limite à 2000 caractères, le backend DOIT avoir la même limite pour éviter les attaques sur la base de données.

### 📱 Validation Téléphone Madagascar

Le format téléphone doit être validé avec les préfixes opérateurs malgaches :

```regex
^\\+261(32|33|34|38)\\d{7}$
```

| Opérateur      | Préfixe | Exemple valide    |
|----------------|---------|-------------------|
| Telma          | +261 34 | +261341234567     |
| Telma          | +261 38 | +261381234567     |
| Orange         | +261 32 | +261321234567     |
| Airtel         | +261 33 | +261331234567     |

**Implémentation partagée :**

<!-- Note : La validation regex doit être strictement identique sur toutes les couches de l'application pour garantir l'intégrité des données -->


```typescript
// shared/validation/phone.ts (utilisable front & back)
export const MADAGASCAR_PHONE_REGEX = /^\+261(32|33|34|38)\d{7}$/;

export const phoneSchema = z.string()
  .regex(MADAGASCAR_PHONE_REGEX, "Format: +261 32/33/34/38 + 7 chiffres");
```

### 📋 Enums Partagés (Source Unique de Vérité)

Les valeurs autorisées **DOIVENT** être strictement identiques entre le frontend (Zod) et le backend (JSON Schema) :

```typescript
// shared/constants/enums.ts
export const LISTING_TYPE = ['sale', 'rent'] as const;
export const LISTING_STATUS = ['active', 'reserved', 'sold', 'rented', 'blocked', 'archived'] as const;
export const PARKING_TYPE = ['none', 'garage', 'box', 'parking'] as const;
export const RESERVATION_STATUS = ['pending', 'confirmed', 'rejected', 'cancelled', 'done'] as const;
export const REPORT_REASON = ['fraud', 'spam', 'incorrect_info', 'inappropriate'] as const;
export const MOD_ACTION = ['block_temporary', 'archive_permanent', 'request_clarification'] as const;
export const CREDIT_PROVIDER = ['orange-money', 'mvola'] as const;
export const FEEDBACK_RATING = [1, 2, 3, 4, 5] as const;
```

**Utilisation dans les schémas :**

```typescript
// Frontend (Zod)
import { LISTING_TYPE } from '@/shared/constants/enums';
const listingSchema = z.object({
  type: z.enum(LISTING_TYPE)
});

// Backend (Fastify JSON Schema)
const listingSchema = {
  type: { enum: ['sale', 'rent'] }  // Doit correspondre exactement
};
```

| Enum                 | Valeurs autorisées                                              |
|----------------------|-----------------------------------------------------------------|
| `type` (listing)     | `sale`, `rent`                                                  |
| `status` (listing)   | `active`, `reserved`, `sold`, `rented`, `blocked`, `archived` |
| `parking_type`       | `none`, `garage`, `box`, `parking`                              |
| `reservation.status` | `pending`, `confirmed`, `rejected`, `cancelled`, `done`         |
| `report.reason`      | `fraud`, `spam`, `incorrect_info`, `inappropriate`              |
| `mod.action`         | `block_temporary`, `archive_permanent`, `request_clarification` |
| `credit.provider`    | `orange-money`, `mvola`                                         |
| `feedback.rating`    | `1`, `2`, `3`, `4`, `5`                                         |



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
  "message": "auth.verification_email_sent"
}
```

> **Note :** Pas de token retourné. L'utilisateur doit vérifier son email avant de pouvoir se connecter.

**Response 400 (email existant) :**
```json
{
  "error": "email_exists",
  "message": "auth.email_already_exists"
}
```

**Response 400 (téléphone existant) :**
```json
{
  "error": "phone_exists",
  "message": "auth.phone_already_exists"
}
```

**Response 400 (validation) :**
```json
{
  "error": "validation_failed",
  "message": "common.validation_failed",
  "details": {
    "email": ["validation.email.invalid_format", "validation.email.too_long"],
    "firstName": ["validation.firstname.too_short", "validation.firstname.too_long", "validation.firstname.invalid_chars"],
    "lastName": ["validation.lastname.too_short", "validation.lastname.too_long", "validation.lastname.invalid_chars"],
    "phone": "validation.phone.invalid_format",
    "password": [
      "validation.password.too_short",
      "validation.password.too_long",
      "validation.password.missing_uppercase",
      "validation.password.missing_lowercase",
      "validation.password.missing_digit"
    ]
  }
}
```

**Response 429 (rate limiting) :**
```json
{
  "error": "rate_limited",
  "message": "common.rate_limited",
  "retryAfter": 3600
}
```

#### Règles de Validation

**Frontend :**

| Champ       | Règles                                                    |
|-------------|-----------------------------------------------------------|
| `email`     | Format email valide (regex), max 255 caractères           |
| `firstName` | 2-50 caractères, lettres et espaces uniquement            |
| `lastName`  | 2-50 caractères, lettres et espaces uniquement            |
| `phone`     | Format international (+261...), exactement 13 caractères  |
| `password`  | Min 8 caractères, 1 majuscule, 1 minuscule, 1 chiffre     |

**Backend (CRITIQUE) :**
- ✅ Toutes les règles frontend PLUS :
- ✅ Vérifier unicité email en base de données
- ✅ Vérifier unicité téléphone
- ✅ Hash du mot de passe (bcrypt, 12 rounds)
- ✅ Sanitization anti-XSS sur tous les champs texte
- ✅ Rate limiting : 3 comptes/heure par IP

---

### 1.2 Vérification Email

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
    "id": "235afa03-4130-44d5-8002-522a58ab164d",
    "email": "Icie64@hotmail.com",
    "emailVerified": true,
    "phone": "+261340000000",
    "firstName": "Sydni",
    "lastName": "Ziemann",
    "role": "user", // Enum: "user", "moderator"
    "sellerStats": {
      "totalListings": 5,
      "activeListings": 4,
      "successfulSales": 1,
      "successfulRents": 0,
      "averageRating": 4.5,
      "responseRate": 85
    },
    "creditBalance": 45,
    "createdAt": "2025-12-26T08:55:19.215Z"
  },
  "message": "auth.account_activated_bonus"
}
```

**Response 400 :**
```json
{
  "error": "invalid_or_expired_token",
  "message": "auth.verification_token_invalid"
}
```

---

### 1.3 Renvoyer Email de Vérification

```http
POST /auth/resend-verification
```

**Request :**
```json
{
  "email": "user@mail.com",
  "lastName": "Rakoto"
}
```

**Response 201 :**
```json
{
  "userId": "u1",
  "message": "auth.verification_email_sent_if_exists"
}
```

**Response 429 :**
```json
{
  "error": "rate_limited",
  "message": "common.rate_limited",
  "retryAfter": 3600
}
```

**Response 500 :**
```json
{
  "error": "internal_server_error",
  "message": "common.internal_server_error"
}
```

---

### 1.4 Mot de passe oublié (NOUVEAU)

```http
POST /auth/forgot-password
```

**Request :**
```json
{
  "email": "user@mail.com"
}
```

**Response 200 :**
```json
{
  "message": "auth.reset_password_email_sent"
}
```
> **Securité :** Message générique pour éviter l'énumération des utilisateurs.

**Response 429 :**
```json
{
  "error": "rate_limited",
  "message": "common.rate_limited",
  "retryAfter": 3600
}
```

---

### 1.5 Réinitialiser Mot de passe (NOUVEAU)

```http
POST /auth/reset-password
```

**Request :**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsIn...", // Token récupéré depuis l'URL (Magic Link)
  "newPassword": "newSecurePassword123!"
}
```

**Response 200 :**
```json
{
  "success": true,
  "message": "auth.password_reset_success"
}
```
> **Securité :** Cette action révoque/déconnecte immédiatement toutes les sessions actives de l'utilisateur.

**Response 400 :**
```json
{
  "error": "invalid_token",
  "message": "auth.reset_token_invalid"
}
```

---

### 1.6 Login Email

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
    "id": "b016c7e2-9a78-4c86-a5ab-5f4166e6deaa",
    "email": "Destiny_Dickinson25@gmail.com",
    "emailVerified": true,
    "phone": "+261340000000",
    "firstName": "Sonya",
    "lastName": "Leuschke",
    "role": "user", // Enum: "user", "moderator"
    "sellerStats": {
      "totalListings": 5,
      "activeListings": 4,
      "successfulSales": 1,
      "successfulRents": 0,
      "averageRating": 4.5,
      "responseRate": 85
    },
    "creditBalance": 45,
    "createdAt": "2025-12-26T08:49:13.639Z"
  }
}
```

**Response 403 :**
```json
{
  "error": "email_not_verified",
  "message": "auth.email_verification_required"
}
```

**Response 400 :**
```json
{
  "error": "invalid_credentials",
  "message": "auth.invalid_credentials"
}
```

**Response 429 (rate limiting) :**
```json
{
  "error": "rate_limited",
  "message": "auth.login_max_attempts_exceeded",
  "retryAfter": 3600
}
```

#### Règles de Validation

**Frontend :**

| Champ | Règles |
|-------|--------|
| `email` | Format email valide |
| `password` | Non vide, min 8 caractères |

**Backend :**
- ✅ Vérifier si email existe en base
- ✅ Comparer hash du mot de passe (bcrypt)
- ✅ Vérifier que `emailVerified = true`
- ✅ Rate limiting : 5 tentatives / 15 min par IP
- ✅ Bloquer compte après 10 échecs successifs (1h)

---





### 1.7 Login Google OAuth

```http
POST /auth/google
```

**Request :**
```json
{
  "idToken": "google-oauth-token" // token retourne par Google OAuth
}
```

**Response 200 :**
- **Headers:** `Set-Cookie: ...` (Access + Refresh)

```json
{
  "user": {
    "id": "8757f505-eb47-4078-8c64-b33239e264e6",
    "email": "Monty_Rempel@gmail.com",
    "emailVerified": true,
    "phone": "+261340000000",
    "firstName": "Edwin",
    "lastName": "Bernier",
    "role": "moderator", // Enum: "user", "moderator"
    "sellerStats": {
      "totalListings": 5,
      "activeListings": 4,
      "successfulSales": 1,
      "successfulRents": 0,
      "averageRating": 4.5,
      "responseRate": 90
    },
    "creditBalance": 45,
    "createdAt": "2025-12-26T08:51:13.893Z"
  }
}
```

**Response 400 :**
```json
{
  "error": "invalid_google_token",
  "message": "auth.google_token_invalid"
}
```


- Tout token accepté
- Crée utilisateur auto si nouveau

---

### 1.8 Logout

```http
GET /auth/logout
```

**Response 200 :**
- **Headers:**
  - `Set-Cookie: realestate_access_token=; Max-Age=0`
  - `Set-Cookie: realestate_refresh_token=; Max-Age=0`

```json
{
  "success": true,
  "message": "auth.logout_success"
}
```

---

### 1.9 Mon Profil

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
  "role": "user", // Enum: "user", "moderator"
  "sellerStats": {
    "totalListings": 5,
    "activeListings": 2,
    "successfulSales": 3,
    "successfulRents": 1,
    "averageRating": 4.2,
    "responseRate": 92
  },
  "creditBalance": 10,
  "createdAt": "2025-01-10T08:00:00Z"
}
```

**Response 401 :**
```json
{
  "error": "unauthorized",
  "message": "common.unauthorized"
}
```

---

### 1.10 Modifier Profil

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

**Response 400 (validation) :**
```json
{
  "error": "validation_failed",
  "message": "common.validation_failed",
  "details": {
    "firstName": ["validation.firstname.too_short", "validation.firstname.too_long", "validation.firstname.invalid_chars"],
    "lastName": ["validation.lastname.too_short", "validation.lastname.too_long", "validation.lastname.invalid_chars"],
    "phone": "validation.phone.invalid_format"
  }
}
```

**Response 400 (téléphone existant) :**
```json
{
  "error": "phone_exists",
  "message": "auth.phone_already_exists"
}
```

**Response 401 :**
```json
{
  "error": "unauthorized",
  "message": "common.unauthorized"
}
```

---

### 1.11 Ajouter/Modifier Téléphone (NOUVEAU)

```http
PUT /users/me/phone
```

**Request :**
```json
{
  "phone": "+261340000002"
}
```

**Response 200 :**
```json
{
  "updated": true,
  "user": {
    "id": "u1",
    "phone": "+261340000002"
  },
  "message": "auth.phone_update_success"
}
```

**Response 400 (format invalide) :**
```json
{
  "error": "invalid_phone_format",
  "message": "validation.phone.invalid_format"
}
```

**Response 400 (téléphone existant) :**
```json
{
  "error": "phone_exists",
  "message": "auth.phone_already_exists"
}
```

**Response 401 :**
```json
{
  "error": "unauthorized",
  "message": "common.unauthorized"
}
```

---

### 1.12 Vérifier Disponibilité Email (UX)

```http
GET /auth/check-email?email=user@mail.com
```

**Description :** Endpoint de confort UX pour vérifier en temps réel si un email existe déjà (avant soumission du formulaire d'inscription).

**Auth :** Aucune

**Response 200 :**
```json
{
  "available": true
}
```

**Response 200 (email déjà utilisé) :**
```json
{
  "available": false
}
```

**Response 429 :**
```json
{
  "error": "rate_limited",
  "message": "common.rate_limited",
  "retryAfter": 60
}
```

> **Sécurité :** Rate limiting strict (10 requêtes/minute par IP) pour éviter l'énumération des utilisateurs.

---

### 1.13 Vérifier Disponibilité Téléphone (UX)

```http
GET /auth/check-phone?phone=+261340000000
```

**Description :** Vérifie si un numéro de téléphone est déjà associé à un compte.

**Auth :** Aucune

**Response 200 :**
```json
{
  "available": true
}
```

**Response 200 (téléphone déjà utilisé) :**
```json
{
  "available": false
}
```

**Response 429 :**
```json
{
  "error": "rate_limited",
  "message": "common.rate_limited",
  "retryAfter": 60
}
```

> **Sécurité :** Rate limiting strict (10 requêtes/minute par IP) pour éviter l'énumération des numéros de téléphone.

---

### 1.14 Vérification Token (Interne - Service-to-Service)

**Description :** Endpoint **interne** permettant aux autres microservices (listings-service, reservations-service, etc.) de valider un token JWT et d'obtenir les informations utilisateur essentielles.

**Cas d'usage :**
- Le `listings-service` reçoit une requête de publication → appelle `auth-service` pour valider le token
- Le `reservations-service` vérifie que l'utilisateur a le droit de réserver
- Tout service ayant besoin de connaître l'identité de l'utilisateur

**Auth :** Header `x-internal-key` (clé API interne partagée entre services)

```http
POST /auth/verify-token
```

**Headers requis :**
```
x-internal-key: ${INTERNAL_API_KEY}
Content-Type: application/json
```

**Request :**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response 200 (token valide) :**
```json
{
  "valid": true,
  "user": {
    "id": "u123",
    "role": "user",
    "emailVerified": true
  },
  "expiresAt": "2025-01-07T12:00:00Z"
}
```

**Response 401 (token invalide) :**
```json
{
  "valid": false,
  "reason": "token_invalid",
  "message": "auth.token_invalid"
}
```

**Response 401 (token expiré) :**
```json
{
  "valid": false,
  "reason": "token_expired",
  "message": "auth.token_expired"
}
```

**Response 401 (token révoqué) :**
```json
{
  "valid": false,
  "reason": "token_revoked",
  "message": "auth.token_revoked"
}
```

**Response 403 (clé interne invalide) :**
```json
{
  "error": "forbidden",
  "message": "auth.invalid_internal_key"
}
```

> [!IMPORTANT]
> **Sécurité :**
> - Cet endpoint ne doit **jamais** être exposé via l'API Gateway public
> - La clé `INTERNAL_API_KEY` doit être générée avec au moins 32 caractères aléatoires
> - Communication interne en HTTPS ou via réseau Docker isolé

**Exemple d'appel depuis un autre service (Node.js) :**
```javascript
const response = await fetch('http://auth-service:3001/auth/verify-token', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-internal-key': process.env.INTERNAL_API_KEY
  },
  body: JSON.stringify({ token: accessToken })
});

const { valid, user } = await response.json();
if (!valid) throw new UnauthorizedException();
```

---

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
```
GET /listings?type=sale&zone=tana-analakely&minPrice=10000000&maxPrice=100000000&page=1&limit=20

**Response 200 :**
```json
{
  "data": [
    {
      "id": "l1",
      "title": "Maison T3 Analakely",
      "price": 50000000,
      "type": "sale", // Enum: "sale", "rent"
      "propertyType": "house", // Enum: "apartment", "house", "loft", "land", "commercial"
      "mine": true,
      "zone": "tana-analakely",
      "surface": 120,
      "photos": [
        "https://mock-cdn.com/photo1.jpg"
      ],
      "status": "active", // Enum: "active", "blocked", "archived"
      "isAvailable": true, // Visibilité marché
      "tags": ["urgent"], // Enum: "urgent", "exclusive", "discount"
      "createdAt": "2025-01-10T08:00:00Z"
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
  "type": "sale", // Enum: "sale", "rent"
  "propertyType": "house", // Enum: "apartment", "house", "loft", "land", "commercial"
  "mine": true,
  "surface": 120,
  "zone": "tana-analakely",
  "photos": [
    "https://mock-cdn.com/photo1.jpg",
    "https://mock-cdn.com/photo2.jpg"
  ],
  "features": {
    "bedrooms": 3,
    "bathrooms": 2,
    "wc_separate": true,
    "parking_type": "garage", // Enum: "garage", "box", "parking", "none"
    "garden_private": true,
    "water_access": true,
    "electricity_access": true
  },
  "status": "active", // Enum: "active", "blocked", "archived"
  "isAvailable": true,
  "sellerVisible": false,
  "sellerStats": {
    "totalListings": 5,
    "activeListings": 2,
    "successfulSales": 3,
    "successfulRents": 1,
    "averageRating": 4.2,
    "responseRate": 92
  },
  "stats": {                    // Visible uniquement si mine=true
    "views": 245,
    "reservations": 3,
    "feedbacks": 2
  },
  "tags": ["urgent"], // Enum: "urgent", "exclusive", "discount"
  "createdAt": "2025-01-10T08:00:00Z",
  "updatedAt": "2025-01-12T14:30:00Z"
}
```

**Response 200 (après réservation confirmée) :**
```json
{
  "id": "l1",
  "title": "Maison T3 Analakely",
  "description": "Maison lumineuse avec jardin...",
  "price": 50000000,
  "type": "sale", // Enum: "sale", "rent"
  "propertyType": "house", // Enum: "apartment", "house", "loft", "land", "commercial"
  "mine": false,
  "surface": 120,
  "zone": "tana-analakely",
  "photos": [...],
  "features": {...},
  "status": "active", // Enum: "active", "blocked", "archived"
  "isAvailable": true,
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
    "activeListings": 2,
    "successfulSales": 3,
    "successfulRents": 1,
    "averageRating": 4.2,
    "responseRate": 92
  },
  "tags": ["urgent"], // Enum: "urgent", "exclusive", "discount"
  "createdAt": "2025-01-10T08:00:00Z",
  "updatedAt": "2025-01-12T14:30:00Z"
}
```

**Response 404 :**
```json
{
  "error": "listing_not_found",
  "message": "listing.not_found"
}
```

> [!NOTE]
> **Choix de design (Privacy) :**
> `sellerId` n'est **pas exposé directement** — le vendeur est révélé via l'objet `seller` uniquement après réservation confirmée (`sellerVisible: true`)

---

### 2.3 Créer annonce

```http
POST /listings/publish
```

**Auth :** Cookie HttpOnly (`realestate_access_token`)

**Request :**
```json
{
  "type": "sale", // Enum: "sale", "rent" (Requis)
  "propertyType": "house", // Enum: "apartment", "house", "loft", "land", "commercial" (Requis)
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
    "wc_separate": true,
    "parking_type": "garage", // Enum: "garage", "box", "parking", "none"
    "garden_private": true,
    "pool": true,
    "water_access": true,
    "electricity_access": true
  },
  "tags": ["urgent"] // Enum: "urgent", "exclusive", "discount"
}
```



**Response 201 :**
```json
{
  "listingId": "l2",
  "status": "active", // Enum: "active", "blocked", "archived"
  "isAvailable": true,
  "creditConsumed": 1,
  "remainingCredits": 4,
  "message": "listing.publish_success"
}
```

**Response 402 (crédits insuffisants) :**
```json
{
  "error": "insufficient_credits",
  "message": "payment.insufficient_credits_publish",
  "required": 1,
  "balance": 0
}
```

**Response 401 :**
```json
{
  "error": "unauthorized",
  "message": "common.unauthorized"
}
```

**Response 400 (validation) :**
```json
{
  "details": {
    "photos": ["validation.listing.photos.max_count"],
    "price": ["validation.listing.price.positive"]
  }
}
```

**Response 413 :**
```json
{
  "error": "file_too_large",
  "message": "validation.file.too_large"
}
```

**Response 422 (format invalide) :**
```json
{
  "error": "invalid_mime_type",
  "message": "validation.file.invalid_format",
  "invalidFiles": ["photo_3.gif"]
}
```

**Response 429 (limite atteinte) :**
```json
{
  "error": "listing_limit_reached",
  "message": "listing.limit_reached"
}
```

#### Règles de Validation

**Frontend :**

| Champ                | Règles                                               |
|----------------------|------------------------------------------------------|
| `title`              | 10-100 caractères                                    |
| `description`        | 50-2000 caractères                                   |
| `price`              | Nombre positif, max 999 999 999 999                  |
| `surface`            | Nombre positif, max 10 000 m²                        |
| `zone`               | Doit être une zone valide (voir `shared/zones.json`) |
| `photos`             | 3-10 images, max 5MB chacune, formats JPG/PNG/WebP   |
| `features.bedrooms`  | 0-20                                                 |
| `features.bathrooms` | 0-10                                                 |

**Backend (CRITIQUE) :**
- ✅ Toutes les règles frontend PLUS :
- ✅ Vérifier que l'utilisateur a ≥1 crédit
- ✅ Vérifier que `zone` existe réellement en BDD
- ✅ Analyser images (vérification MIME type réel)
- ✅ Sanitization anti-XSS sur `title` et `description`
- ✅ Limiter : 10 annonces actives max par utilisateur
- ✅ Vérifier JWT valide et non expiré
- ✅ Transaction atomique : débit crédit + création annonce

---

### 2.4 Modifier annonce

```http
PUT /listings/:id
```

**Auth :** Cookie HttpOnly (`realestate_access_token`)

**Request :**
```json
{
  "type": "sale", // Enum: "sale", "rent"
  "propertyType": "house", // Enum: "apartment", "house", "loft", "land", "commercial"
  "title": "Villa T4 avec piscine (Updated)",
  "description": "Belle villa moderne... (Nouvelle description)",
  "price": 115000000,
  "surface": 120,
  "zone": "tana-analakely",
  "photos": [
    "data:image/jpeg;base64,...",
    "https://existing-image.com/..."
  ],
  "features": {
    "bedrooms": 4,
    "bathrooms": 3,
    "wc_separate": true,
    "parking_type": "garage", // Enum: "garage", "box", "parking", "none"
    "garden_private": true,
    "pool": true,
    "water_access": true,
    "electricity_access": true
  },
  "tags": ["exclusive"] // Enum: "urgent", "exclusive", "discount"
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

**Response 400 (validation) :**
```json
{
  "error": "validation_failed",
  "message": "common.validation_failed",
  "details": {
    "title": ["validation.listing.title.too_long"],
    "description": ["validation.listing.description.too_long"]
  }
}
```

**Response 401 :**
```json
{
  "error": "unauthorized",
  "message": "common.unauthorized"
}
```

**Response 403 :**
```json
{
  "error": "forbidden",
  "message": "listing.permission_denied"
}
```

**Response 404 :**
```json
{
  "error": "listing_not_found",
  "message": "listing.not_found"
}
```

---

### 2.5 Définir Disponibilités (Seller)

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
  "message": "listing.availability_updated"
}
```

**Response 400 (validation) :**
```json
{
  "error": "validation_failed",
  "message": "common.validation_failed",
  "details": {
    "weeklySchedule": ["validation.listing.schedule.invalid_day", "validation.listing.schedule.invalid_time"]
  }
}
```

**Response 401 :**
```json
{
  "error": "unauthorized",
  "message": "common.unauthorized"
}
```

**Response 403 :**
```json
{
  "error": "forbidden",
  "message": "listing.permission_denied"
}
```

**Response 404 :**
```json
{
  "error": "listing_not_found",
  "message": "listing.not_found"
}
```

---

### 2.6 Récupérer créneaux disponibles
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

### 2.7 Clôturer/Archiver Annonce
 
 ```http
 POST /listings/:id/archive
 ```
 
 **Request :**
 ```json
 {
   "sold": true       // Si vendu/loué
 }
 ```
 
 **Response 200 :**
 ```json
 {
   "archived": true,
   "status": "archived", // Enum: "active", "blocked", "archived"
   "isAvailable": false,
   "soldAt": "2025-01-15T16:00:00Z"
 }
 ```
 
 **Response 400 (validation) :**
 ```json
 {
   "error": "validation_failed",
   "message": "common.validation_failed",
   "details": {
     "sold": ["validation.type_invalid"]
   }
 }
```

**Response 401 :**
```json
{
  "error": "unauthorized",
  "message": "common.unauthorized"
}
```

**Response 403 :**
```json
{
  "error": "forbidden",
  "message": "listing.permission_denied"
}
```

**Response 404 :**
```json
{
  "error": "listing_not_found",
  "message": "listing.not_found"
}
```

---

### 2.8 Mes Annonces

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
      "type": "sale", // Enum: "sale", "rent"
      "status": "active", // Enum: "active", "blocked", "archived"
      "isAvailable": true,
      "tags": ["discount"], // Enum: "urgent", "exclusive", "discount"
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

**Response 401 :**
```json
{
  "error": "unauthorized",
  "message": "common.unauthorized"
}
```

---

### 2.9 Signaler une annonce

```http
POST /listings/:id/report
```

**Auth :** Cookie HttpOnly (`realestate_access_token`)

**Request :**
```json
{
  "reason": "fraud", // Enum: "fraud", "spam", "incorrect_info", "inappropriate"
  "comment": "Les photos ne correspondent pas à la description..."
}
```

**Response 200 :**
```json
{
  "success": true,
  "message": "listing.report_success"
}
```

**Response 400 (validation) :**
```json
{
  "error": "validation_failed",
  "message": "common.validation_failed",
  "details": {
    "reason": ["validation.listing.report_reason.invalid"],
    "comment": ["validation.listing.report_comment.too_short", "validation.listing.report_comment.too_long"]
  }
}
```

**Response 401 :**
```json
{
  "error": "unauthorized",
  "message": "common.unauthorized"
}
```

**Response 404 :**
```json
{
  "error": "listing_not_found",
  "message": "listing.not_found"
}
```

**Response 409 :**
```json
{
  "error": "already_reported",
  "message": "listing.already_reported"
}
```

---

---

### 2.10 Génération Description IA

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
  "error": "rate_limited",
  "message": "common.rate_limited",
  "retryAfter": 60
}
```

---

## 3. Réservations (reservations-service)

### 3.1 Vérifier Disponibilité Slot (UX)

```http
GET /reservations/check-slot?listingId=l1&slot=2025-01-20T10:00:00Z
```

**Description :** Vérifie si un créneau est toujours disponible avant de consommer un crédit. Retourne une "réservation temporaire" de 5 minutes.

**Auth :** Cookie HttpOnly (`realestate_access_token`)

**Response 200 :**
```json
{
  "available": true,
  "expiresIn": 300
}
```

**Response 409 :**
```json
{
  "available": false,
  "message": "reservation.slot_already_reserved",
  "nextAvailable": "2025-01-20T14:00:00Z"
}
```

> **Utilité :** Évite à l'utilisateur de perdre 1 crédit si le slot vient d'être pris par quelqu'un d'autre.

**Response 401 :**
```json
{
  "error": "unauthorized",
  "message": "common.unauthorized"
}
```

---

### 3.2 Créer réservation

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
  "status": "pending", // Enum: "pending", "confirmed", "rejected", "cancelled", "done"
  "slot": "2025-01-20T10:00:00Z",
  "creditConsumed": 1,
  "remainingCredits": 4,
  "sellerContactVisible": false,
  "message": "reservation.created_success"
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
  "message": "reservation.confirmed_success"
}
```



**Response 400 (validation) :**
```json
{
  "error": "validation_failed",
  "message": "common.validation_failed",
  "details": {
    "listingId": ["validation.uuid.invalid"],
    "slot": ["validation.reservation.slot.invalid_format", "validation.reservation.slot.past_or_too_soon"]
  }
}
```

**Response 401 :**
```json
{
  "error": "unauthorized",
  "message": "common.unauthorized"
}
```

**Response 402 (crédits insuffisants) :**
```json
{
  "error": "insufficient_credits",
  "message": "payment.insufficient_credits_reservation",
  "required": 1,
  "balance": 0
}
```

**Response 403 :**
```json
{
  "error": "cannot_reserve_own_listing",
  "message": "reservation.cannot_reserve_own"
}
```

**Response 404 :**
```json
{
  "error": "listing_not_found",
  "message": "listing.not_found"
}
```

**Response 409 :**
```json
{
  "error": "slot_unavailable",
  "message": "reservation.slot_unavailable",
  "availableSlots": [
    "2025-01-20T14:00:00Z",
    "2025-01-21T10:00:00Z"
  ]
}
```

#### Règles de Validation

**Frontend :**

| Champ       | Règles                                           |
|-------------|--------------------------------------------------|
| `listingId` | UUID valide (format v4)                          |
| `slot`      | ISO 8601, doit être dans le futur (>2h minimum)  |

**Backend (CRITIQUE) :**
- ✅ Vérifier que l'utilisateur a ≥1 crédit
- ✅ Vérifier que le `slot` existe dans `/listings/:id/slots`
- ✅ Vérifier que le slot n'est pas déjà réservé (protection race condition avec lock)
- ✅ **Transaction atomique** : débit crédit + création réservation
- ✅ Empêcher l'utilisateur de réserver sa propre annonce
- ✅ Vérifier que l'annonce est `active` (pas `blocked` ou `archived`)

---

### 3.3 Lister mes réservations

```http
GET /reservations/mine
```

**Query params :**
- `status` : `pending` | `confirmed` | `rejected` | `cancelled` | `done` (optionnel)

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
      "status": "confirmed", // Enum: "pending", "confirmed", "rejected", "cancelled", "done"
      "feedbackEligible": false,
      "createdAt": "2025-01-15T14:00:00Z"
    }
  ]
}
```

**Response 401 :**
```json
{
  "error": "unauthorized",
  "message": "common.unauthorized"
}
```

---

### 3.4 Annuler réservation

#### `DELETE /reservations/:id`
**Rôle :** Annulation d'une réservation (autorisé jusqu'à 2h avant le slot).

**Request :**
(Aucun corps requis)

**Response 200 :**
```json
{
  "cancelled": true,
  "refund": 0
}
```

**Response 400 :**
```json
{
  "error": "cancellation_too_late",
  "message": "reservation.cancellation_too_late"
}
```

**Response 401 :**
```json
{
  "error": "unauthorized",
  "message": "common.unauthorized"
}
```

**Response 403 :**
```json
{
  "error": "forbidden",
  "message": "reservation.permission_denied"
}
```

**Response 404 :**
```json
{
  "error": "reservation_not_found",
  "message": "reservation.not_found"
}
```

### 3.5 Confirmer réservation (Vendeur)

**Rôle :** Le vendeur accepte la demande de visite.
**Action :** Le statut passe à `confirmed`. L'acheteur est notifié.

```http
POST /reservations/:id/confirm
```

**Request :**
(Aucun corps requis)

**Response 200 :**
```json
{
  "status": "confirmed", // Enum: "pending", "confirmed", "rejected", "cancelled", "done"
  "confirmedAt": "2025-01-16T10:00:00Z"
}
```

**Response 401 :**
```json
{
  "error": "unauthorized",
  "message": "common.unauthorized"
}
```

**Response 403 :**
```json
{
  "error": "forbidden",
  "message": "reservation.permission_denied_confirmation"
}
```

**Response 404 :**
```json
{
  "error": "reservation_not_found",
  "message": "reservation.not_found"
}
```

**Response 409 :**
```json
{
  "error": "reservation_already_processed",
  "message": "reservation.already_processed"
}
```

---

### 3.6 Refuser réservation (Vendeur)

**Rôle :** Le vendeur refuse la demande de visite.
**Action :** Le statut passe à `rejected`. L'acheteur est notifié.

```http
POST /reservations/:id/reject
```

**Request :**
(Aucun corps requis)

**Response 200 :**
```json
{
  "status": "rejected" // Enum: "pending", "confirmed", "rejected", "cancelled", "done"
}
```

**Response 401 :**
```json
{
  "error": "unauthorized",
  "message": "common.unauthorized"
}
```

**Response 403 :**
```json
{
  "error": "forbidden",
  "message": "reservation.permission_denied_rejection"
}
```

**Response 404 :**
```json
{
  "error": "reservation_not_found",
  "message": "reservation.not_found"
}
```

**Response 409 :**
```json
{
  "error": "reservation_already_processed",
  "message": "reservation.already_processed"
}
```

---

## 4. Feedback

### 4.1 Créer feedback

**Description :** Permet à l'acheteur de laisser une évaluation après une visite terminée (`status: done`).

```http
POST /feedback
```

**Request :**
```json
{
  "reservationId": "r1",
  "rating": 4, // Enum: 1, 2, 3, 4, 5
  "comment": "Visite conforme. Vendeur sérieux.",
  "categories": {
    "listingAccurate": true,
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
  "message": "feedback.created_success"
}
```

**Response 400 (validation) :**
```json
{
  "error": "validation_failed",
  "message": "common.validation_failed",
  "details": {
    "rating": ["validation.feedback.rating.range"],
    "comment": ["validation.feedback.comment.too_short", "validation.feedback.comment.too_long"]
  }
}
```

**Response 400 (déjà exist) :**
```json
{
  "error": "feedback_already_exists",
  "message": "feedback.already_exists"
}
```

**Response 401 :**
```json
{
  "error": "unauthorized",
  "message": "common.unauthorized"
}
```

**Response 403 :**
```json
{
  "error": "reservation_not_done",
  "message": "feedback.reservation_not_done"
}
```

**Response 404 :**
```json
{
  "error": "reservation_not_found",
  "message": "reservation.not_found"
}
```

---


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

**Response 401 :**
```json
{
  "error": "unauthorized",
  "message": "common.unauthorized"
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
  "provider": "orange-money" // Enum: "orange-money", "mvola"
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

**Response 400 (validation) :**
```json
{
  "error": "validation_failed",
  "message": "common.validation_failed",
  "details": {
    "amount": ["validation.payment.amount.positive", "validation.payment.amount.min"],
    "provider": ["validation.payment.provider.invalid"]
  }
}
```

**Response 400 (paiement) :**
```json
{
  "error": "payment_failed",
  "message": "payment.transaction_failed"
}
```

**Response 401 :**
```json
{
  "error": "unauthorized",
  "message": "common.unauthorized"
}
```

**Response 429 (rate limiting) :**
```json
{
  "error": "rate_limited",
  "message": "payment.rate_limited_recharge",
  "retryAfter": 3600
}
```

### 5.3 Historique transactions

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
      "type": "recharge", // Enum: "recharge", "consume", "bonus", "refund"
      "amount": +10,
      "reason": "recharge_pack", // Enum: "initial_bonus", "recharge_pack", "recharge_bonus", "publish_listing", "reserve_visit", "refund_cancelled"
      "balanceAfter": 15,
      "createdAt": "2025-01-15T10:00:00Z"
    },
    {
      "id": "tx2",
      "type": "consume",
      "amount": -1,
      "reason": "publish_listing",
      "listingId": "l1",
      "balanceAfter": 14,
      "createdAt": "2025-01-15T11:30:00Z"
    }
  ],
  "pagination": {...}
}
```

**Response 401 :**
```json
{
  "error": "unauthorized",
  "message": "common.unauthorized"
}
```

---



## 6. Modération (Admin)

**⚠️ Tous les endpoints ci-dessous nécessitent `role = 'moderator'`**

### 6.1 Liste annonces signalées

```http
GET /admin/listings/flagged
```

**Query params :**
- `reason` : `user_reported`



**Response 200 :**
```json
{
  "data": [
    {
      "listingId": "l5",
      "title": "Terrain 500m²",
      "reason": "user_reported", // Enum: "user_reported"
      "reportedBy": "u15",
      "reportReason": "Photos suspectes", // Enum: "fraud", "spam", "incorrect_info", "inappropriate"
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
  "message": "admin.forbidden.moderator_only"
}
```

---

### 6.2 Appliquer une action (Modération)

```http
POST /admin/listings/:id/action
```

**Description :** Applique une décision de modération sur une annonce spécifique.

**Auth :** Cookie HttpOnly + Rôle `moderator`

**Request :**
```json
{
  "action": "block_temporary", // Enum: "block_temporary", "archive_permanent", "request_clarification"
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
  "newStatus": "blocked", // Enum: "active", "blocked", "archived"
  "message": "admin.action_applied_successfully"
}
```

**Response 400 (validation) :**
```json
{
  "error": "validation_failed",
  "message": "Données invalides",
  "details": {
    "action": ["validation.admin.action.invalid"],
    "reason": ["validation.admin.reason.too_short", "validation.admin.reason.too_long"]
  }
}
```

**Response 401 :**
```json
{
  "error": "unauthorized",
  "message": "common.unauthorized"
}
```

**Response 403 :**
```json
{
  "error": "forbidden",
  "message": "admin.forbidden.moderator_only"
}
```

**Response 404 :**
```json
{
  "error": "listing_not_found",
  "message": "listing.not_found"
}
```

---

### 6.3 Historique Modération (Admin)

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
      "targetType": "listing", // Enum: "listing", "user", "feedback"
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

### 6.4 Archivage Permanent (Sécurité)

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
    "status": "archived", // Enum: "active", "blocked", "archived"
    "archivedBy": "moderator",
    "archivedAt": "2025-01-15T14:00:00Z"
  }
}
```

---

---

## 7. Intelligence Artificielle (ai-service)

> **🔧 Stack Technique :**
> - **Service :** Python FastAPI (port 3005)
> - **LLM :** OpenRouter + DeepSeek V3 (Cloud gratuit)
> - **Embeddings :** Sentence Transformers (all-MiniLM-L6-v2)
> - **Vector Database :** ChromaDB (Local)
> 
> Voir [Niveau_3.5_Architecture_Microservices.md](./Niveau_3.5_Architecture_Microservices.md) pour la configuration Docker.

> [!NOTE]
> **Composants du système RAG (Retrieval-Augmented Generation) :**
> - **ChromaDB** : Stocke les embeddings vectoriels des annonces et données marché
> - **Sentence Transformers** : Convertit le texte en vecteurs pour la recherche sémantique
> - **LLM (DeepSeek V3)** : Génère les réponses contextualisées à partir des documents récupérés

---

### 7.1 Assistant Chat (RAG)

**Description :** Chatbot intelligent permettant aux utilisateurs de poser des questions sur le marché immobilier malgache ou sur une annonce spécifique. Utilise la technologie RAG pour fournir des réponses précises basées sur les vraies données.

**Workflow RAG :**
1. L'utilisateur envoie une question
2. Le système recherche les documents pertinents dans ChromaDB (annonces, rapports marché)
3. Les documents trouvés sont injectés comme contexte au LLM
4. Le LLM génère une réponse enrichie et sourcée

**Auth :** Cookie HttpOnly (optionnel pour personnalisation)

```http
POST /ai/chat
```

**Request :**
```json
{
  "message": "Quel est le prix moyen à Ivandry pour une villa T4 ?",
  "context": {
    "listingId": "l1",         // Optionnel - pour chat contextuel sur une annonce
    "conversationId": "conv1"  // Optionnel - pour maintenir l'historique
  },
  "language": "fr"             // Enum: "fr", "mg"
}
```

**Règles de validation :**
| Champ | Règle |
|-------|-------|
| `message` | Requis, 2-1000 caractères |
| `context.listingId` | Optionnel, format UUID valide |
| `context.conversationId` | Optionnel, format UUID valide |
| `language` | Optionnel, défaut: "fr" |

**Response 200 :**
```json
{
  "reply": "À Ivandry, le prix moyen pour une villa T4 est d'environ 850.000.000 Ar à 1.200.000.000 Ar selon l'état et les équipements. Les biens avec piscine se situent généralement dans la fourchette haute.",
  "sources": [
    {
      "type": "market_report",
      "id": "market_2024_q4",
      "title": "Rapport marché Ivandry Q4 2024"
    },
    {
      "type": "listing",
      "id": "l1",
      "title": "Villa T4 Ivandry avec piscine"
    }
  ],
  "conversationId": "conv1",
  "confidence": 0.89
}
```

**Response 400 (validation) :**
```json
{
  "error": "validation_failed",
  "message": "common.validation_failed",
  "details": {
    "message": ["validation.ai.message.too_short", "validation.ai.message.too_long"]
  }
}
```

**Response 429 (rate limiting) :**
```json
{
  "error": "rate_limited",
  "message": "ai.rate_limited_chat",
  "retryAfter": 60
}
```

**Response 503 (LLM indisponible) :**
```json
{
  "error": "llm_unavailable",
  "message": "ai.llm_service_unavailable"
}
```

---

### 7.2 Génération Description Annonce

**Description :** Génère automatiquement une description professionnelle pour une annonce immobilière à partir des caractéristiques saisies par le vendeur. Utilisé lors de la **création** ou **modification** d'une annonce.

**Workflow d'utilisation :**
1. Le vendeur remplit le formulaire de création/modification d'annonce
2. Il clique sur le bouton **"Générer description IA"**
3. Toutes les caractéristiques déjà saisies sont envoyées à l'API
4. L'IA génère une description professionnelle
5. Le vendeur peut modifier le texte avant publication

**Auth :** Cookie HttpOnly (requis - vendeur authentifié)

```http
POST /ai/generate
```

**Request :**
```json
{
  "listingData": {
    "propertyType": "villa",           // Enum: "apartment", "house", "loft", "land", "commercial"
    "transactionType": "sale",         // Enum: "sale", "rent"
    "title": "Villa T4 avec piscine",  // Optionnel - titre saisi par l'utilisateur
    "bedrooms": 4,
    "bathrooms": 2,
    "area": 250,                       // en m²
    "landArea": 500,                   // en m² (optionnel, pour terrain/villa)
    "price": 850000000,                // en Ariary
    "zone": "tana-ivandry",
    "address": "Lot II B 45 Ivandry",  // Optionnel
    "features": [                      // Liste des équipements
      "piscine",
      "jardin",
      "garage",
      "gardien",
      "cuisine_equipee",
      "climatisation"
    ],
    "condition": "excellent",          // Enum: "new", "excellent", "good", "to_renovate"
    "yearBuilt": 2020,                 // Optionnel
    "floors": 2,                       // Optionnel
    "furnished": true,                 // Optionnel
    "parking": 2                       // Optionnel - nombre de places
  },
  "options": {
    "style": "professional",           // Enum: "professional", "casual", "luxury", "concise"
    "length": "medium",                // Enum: "short", "medium", "long"
    "highlights": ["piscine", "vue"],  // Optionnel - points à mettre en avant
    "language": "fr"                   // Enum: "fr", "mg"
  }
}
```

**Règles de validation :**
| Champ                         | Règle                                                   |
|-------------------------------|---------------------------------------------------------|
| `listingData.propertyType`    | Requis, enum: villa, apartment, house, land, commercial |
| `listingData.transactionType` | Requis, enum: sale, rent                                |
| `listingData.bedrooms`        | Optionnel, 0-20                                         |
| `listingData.bathrooms`       | Optionnel, 0-10                                         |
| `listingData.area`            | Requis, 1-100000 m²                                     |
| `listingData.price`           | Requis, > 0                                             |
| `listingData.zone`            | Requis, zone valide                                     |
| `listingData.features`        | Optionnel, tableau de strings                           |
| `options.style`               | Optionnel, défaut: "professional"                       |
| `options.length`              | Optionnel, défaut: "medium"                             |

**Response 200 :**
```json
{
  "description": "Magnifique villa T4 de 250m² nichée dans le quartier prisé d'Ivandry. Ce bien d'exception, construit en 2020, vous séduira par ses prestations haut de gamme : 4 chambres spacieuses, 2 salles de bain modernes, une cuisine entièrement équipée et climatisée. Profitez d'une piscine privée au cœur d'un jardin arboré de 500m². Garage double et gardiennage 24h/24 pour votre sérénité. Une opportunité rare pour les familles recherchant confort et sécurité.",
  "wordCount": 78,
  "alternatives": [
    {
      "style": "concise",
      "text": "Villa T4 250m² Ivandry - 4 ch, 2 sdb, piscine, jardin 500m², garage, gardien. État impeccable, construction 2020."
    },
    {
      "style": "luxury",
      "text": "Résidence d'exception au cœur d'Ivandry. Cette villa contemporaine de 250m² redéfinit l'art de vivre à Madagascar..."
    }
  ],
  "suggestedTitle": "Villa T4 de standing avec piscine - Ivandry",
  "keywords": ["villa", "piscine", "ivandry", "T4", "jardin", "sécurisé"]
}
```

**Response 400 (validation) :**
```json
{
  "error": "validation_failed",
  "message": "common.validation_failed",
  "details": {
    "listingData.propertyType": ["validation.ai.property_type.required"],
    "listingData.area": ["validation.ai.area.required", "validation.ai.area.positive"],
    "listingData.zone": ["validation.ai.zone.invalid"]
  }
}
```

**Response 401 :**
```json
{
  "error": "unauthorized",
  "message": "common.unauthorized"
}
```

**Response 429 (rate limiting) :**
```json
{
  "error": "rate_limited",
  "message": "ai.rate_limited_generate",
  "retryAfter": 60
}
```

> [!TIP]
> **Rate Limiting :** 10 générations par minute par utilisateur. Encouragez les vendeurs à bien remplir les caractéristiques avant de générer pour obtenir un meilleur résultat dès la première tentative.

**Response 503 (LLM indisponible) :**
```json
{
  "error": "llm_unavailable",
  "message": "ai.llm_service_unavailable"
}
```

---

### 7.3 Données Marché

**Description :** Fournit les statistiques du marché immobilier pour une zone donnée. Utilisé comme source de données pour le système RAG et peut être affiché directement dans l'interface utilisateur.

**Cas d'usage :**
- Enrichir les réponses du chatbot avec des données marché actuelles
- Afficher un widget "Prix du marché" sur la page d'une annonce
- Aider les vendeurs à fixer un prix compétitif

**Auth :** Aucune (endpoint public)

```http
GET /ai/market-data
```

**Query params :**
| Paramètre | Type | Requis | Description |
|-----------|------|--------|-------------|
| `zone` | string | Oui | ID de la zone (ex: "tana-ivandry") |
| `type` | string | Non | Enum: "sale", "rent" (défaut: "sale") |
| `propertyType` | string | Non | Enum: "apartment", "house", "loft", "land", "commercial" |
| `period` | string | Non | Enum: "3m", "6m", "1y" (défaut: "6m") |

**Exemple :**
```
GET /ai/market-data?zone=tana-ivandry&type=sale&propertyType=villa&period=6m
```

**Response 200 :**
```json
{
  "zone": {
    "id": "tana-ivandry",
    "displayName": "Antananarivo - Ivandry"
  },
  "transactionType": "sale",
  "propertyType": "villa",
  "period": "6m",
  "statistics": {
    "averagePricePerSqm": 4500000,
    "medianPrice": 750000000,
    "minPrice": 350000000,
    "maxPrice": 2500000000,
    "totalListings": 45,
    "averageDaysOnMarket": 62
  },
  "trends": {
    "priceChange": "+5.2%",
    "direction": "up",
    "demandLevel": "high",
    "supplyLevel": "medium"
  },
  "comparison": {
    "vsCity": "+15%",
    "vsLastPeriod": "+3.5%"
  },
  "generatedAt": "2025-01-07T08:00:00Z",
  "disclaimer": "Données indicatives basées sur les annonces publiées sur la plateforme."
}
```

**Response 400 :**
```json
{
  "error": "validation_failed",
  "message": "common.validation_failed",
  "details": {
    "zone": ["validation.ai.zone.required", "validation.ai.zone.invalid"]
  }
}
```

**Response 404 :**
```json
{
  "error": "zone_not_found",
  "message": "ai.zone_not_found"
}
```

---

### 7.4 Indexer une annonce

> [!IMPORTANT]
> Les endpoints 7.4, 7.5 et 7.6 sont **internes** et appelés automatiquement par le `listings-service`. Ils ne doivent pas être exposés publiquement via l'API Gateway.

Ces endpoints synchronisent la base SQL principale avec le moteur de recherche vectoriel (ChromaDB) pour permettre la recherche sémantique et le RAG.

**Description :** Crée ou met à jour les embeddings vectoriels d'une annonce dans ChromaDB.

**Workflow automatique :**
1. `listings-service` publie ou modifie une annonce
2. Appel automatique à `POST /ai/index`
3. Le service AI récupère les données complètes de l'annonce
4. Génération des embeddings via Sentence Transformers
5. Stockage dans ChromaDB

**Auth :** Service-to-service (API Key interne)

```http
POST /ai/index
```

**Request :**
```json
{
  "listingId": "l123",
  "action": "upsert",        // Enum: "upsert", "update", "delete"
  "priority": "normal"       // Enum: "high", "normal", "low"
}
```

**Response 200 (mode asynchrone) :**
```json
{
  "status": "queued", // Enum: "queued", "completed", "failed"
  "jobId": "job_999",
  "estimatedTime": "5s",
  "message": "ai.indexing_queued"
}
```

**Response 200 (mode synchrone - priority: high) :**
```json
{
  "status": "completed", // Enum: "queued", "completed", "failed"
  "listingId": "l123",
  "vectorId": "vec_abc123",
  "indexedAt": "2025-01-07T08:53:00Z",
  "message": "ai.indexing_completed"
}
```

**Response 400 :**
```json
{
  "error": "validation_failed",
  "message": "common.validation_failed",
  "details": {
    "listingId": ["validation.ai.listing_id.required", "validation.ai.listing_id.invalid_format"]
  }
}
```

**Response 404 :**
```json
{
  "error": "listing_not_found",
  "message": "listing.not_found"
}
```

**Response 503 :**
```json
{
  "error": "vector_db_unavailable",
  "message": "ai.vector_db_unavailable"
}
```

---

### 7.5 Vérifier le statut d'indexation

**Description :** Vérifie si une annonce est correctement indexée dans ChromaDB.

**Cas d'usage Frontend :**
- Avant d'activer le bouton "Poser une question sur ce bien"
- Évite les réponses "Je ne connais pas cette annonce"
- Affiche un indicateur de chargement si l'indexation est en cours

**Auth :** Aucune (endpoint public)

```http
GET /ai/index-status/:listingId
```

**Response 200 (indexé) :**
```json
{
  "listingId": "l123",
  "isIndexed": true,
  "status": "ready", // Enum: "ready", "processing", "not_found"
  "lastIndexedAt": "2025-01-07T08:00:00Z",
  "vectorId": "vec_abc123",
  "version": 3
}
```

**Response 200 (en cours) :**
```json
{
  "listingId": "l123",
  "isIndexed": false,
  "status": "processing", // Enum: "ready", "processing", "not_found"
  "queuePosition": 5,
  "estimatedTime": "30s"
}
```

**Response 200 (non indexé) :**
```json
{
  "listingId": "l123",
  "isIndexed": false,
  "status": "not_found", // Enum: "ready", "processing", "not_found"
  "message": "ai.listing_not_indexed"
}
```

**Response 400 :**
```json
{
  "error": "validation_failed",
  "message": "common.validation_failed",
  "details": {
    "listingId": ["validation.ai.listing_id.invalid_format"]
  }
}
```

---

### 7.6 Supprimer de l'index

**Description :** Supprime les embeddings vectoriels d'une annonce de ChromaDB.

**Workflow automatique :**
1. `listings-service` archive ou supprime une annonce
2. Appel automatique à `DELETE /ai/index/:listingId`
3. Nettoyage des vecteurs dans ChromaDB

**Auth :** Service-to-service (API Key interne)

```http
DELETE /ai/index/:listingId
```

**Response 200 :**
```json
{
  "success": true,
  "listingId": "l123",
  "deletedAt": "2025-01-07T09:00:00Z",
  "message": "ai.index_deleted"
}
```

**Response 404 :**
```json
{
  "error": "index_not_found",
  "message": "ai.listing_not_indexed"
}
```

---

### 7.7 Health Check

**Description :** Vérifie l'état de santé du service AI et de ses dépendances.

**Utilisé par :**
- Kubernetes/Docker pour les health probes
- Dashboard de monitoring
- Alerting automatique

**Auth :** Aucune (endpoint public)

```http
GET /ai/health
```

**Response 200 (healthy) :**
```json
{
  "status": "healthy", // Enum: "healthy", "degraded", "down"
  "uptime": "3d 5h 23m",
  "version": "1.2.0",
  "providers": {
    "llm": {
      "status": "online",
      "provider": "openrouter",
      "model": "deepseek/deepseek-chat",
      "latency": "245ms"
    },
    "vector_db": {
      "status": "connected",
      "provider": "chromadb",
      "collections": 3,
      "totalVectors": 1250
    },
    "embeddings": {
      "status": "loaded",
      "model": "all-MiniLM-L6-v2"
    }
  },
  "metrics": {
    "requestsLast24h": 1523,
    "averageResponseTime": "1.2s",
    "errorRate": "0.5%"
  }
}
```

**Response 503 (degraded) :**
```json
{
  "status": "degraded", // Enum: "healthy", "degraded", "down"
  "uptime": "3d 5h 23m",
  "version": "1.2.0",
  "providers": {
    "llm": {
      "status": "offline",
      "error": "Connection timeout to OpenRouter",
      "lastCheck": "2025-01-07T08:50:00Z"
    },
    "vector_db": {
      "status": "connected",
      "provider": "chromadb"
    },
    "embeddings": {
      "status": "loaded",
      "model": "all-MiniLM-L6-v2"
    }
  },
  "message": "ai.service_degraded"
}
```

---

### 7.8 Récapitulatif Endpoints AI

| Endpoint | Méthode | Auth | Description |
|----------|---------|------|-------------|
| `/ai/chat` | POST | Optionnel | Chat RAG avec contexte annonces et marché |
| `/ai/generate` | POST | Requise | Génération de description d'annonce |
| `/ai/market-data` | GET | Public | Statistiques du marché par zone |
| `/ai/index` | POST | Interne | Indexer une annonce dans ChromaDB |
| `/ai/index-status/:id` | GET | Public | Vérifier statut d'indexation |
| `/ai/index/:id` | DELETE | Interne | Supprimer de l'index |
| `/ai/health` | GET | Public | Health check du service |

### 7.9 Rate Limiting AI

| Endpoint | Limite | Fenêtre | Scope |
|----------|--------|---------|-------|
| `/ai/chat` | 30 requêtes | 1 minute | Par utilisateur |
| `/ai/generate` | 10 requêtes | 1 minute | Par utilisateur |
| `/ai/market-data` | 60 requêtes | 1 minute | Par IP |
| `/ai/index` | 100 requêtes | 1 minute | Par service |

---




## Récapitulatif des Endpoints MVP

| Catégorie            | Méthode  | Endpoint                                    |
| :------------------- | :------  | :------------------                         | 
| **Authentification** | `POST`   | `/auth/register`                            |
|                      | `POST`   | `/auth/verify-email`                        |
|                      | `POST`   | `/auth/resend-verification`                 |
|                      | `POST`   | `/auth/forgot-password`                     |
|                      | `POST`   | `/auth/reset-password`                      |
|                      | `POST`   | `/auth/login`                               |
|                      | `POST`   | `/auth/google`                              |
|                      | `POST`   | `/auth/refresh`                             |
|                      | `GET`    | `/auth/logout`                              |
|                      | `GET`    | `/auth/check-email`                         |
|                      | `GET`    | `/auth/check-phone`                         |
|                      | `POST`   | `/auth/verify-token` (INTERNE)              |
| **Profil**           | `GET`    | `/users/me`                                 |
|                      | `PUT`    | `/users/me`                                 |
|                      | `PUT`    | `/users/me/phone`                           |
| **Annonces**         | `GET`    | `/listings`                                 |
|                      | `GET`    | `/listings/:id`                             |
|                      | `POST`   | `/listings/publish`                         |
|                      | `PUT`    | `/listings/:id`                             |
|                      | `POST`   | `/listings/:id/archive`                     |
|                      | `POST`   | `/listings/:id/availability`                |
|                      | `GET`    | `/listings/:id/slots`                       |
|                      | `POST`   | `/listings/:id/report`                      |
|                      | `GET`    | `/listings/mine`                            |
|                      | `POST`   | `/listings/generate-description`            |
| **Réservations**     | `GET`    | `/reservations/mine`                        |
|                      | `POST`   | `/reservations`                             |
|                      | `GET`    | `/reservations/check-slot`                  |
|                      | `POST`   | `/reservations/:id/confirm`                 |
|                      | `POST`   | `/reservations/:id/reject`                  |
|                      | `DELETE` | `/reservations/:id`                         |
| **Feedback**         | `POST`   | `/feedback`                                 |
| **Crédits**          | `GET`    | `/credits/balance`                          |
|                      | `POST`   | `/credits/recharge`                         |
|                      | `GET`    | `/credits/history`                          |
| **Modération**       | `GET`    | `/admin/listings/flagged`                   |
|                      | `GET`    | `/admin/listings/:id`                       |
|                      | `POST`   | `/admin/listings/:id/action`                |
|                      | `GET`    | `/admin/actions`                            |
| **AI (Assistant)**   | `POST`   | `/ai/chat`                                  |
|                      | `POST`   | `/ai/generate`                              |
|                      | `GET`    | `/ai/market-data`                           |
|                      | `POST`   | `/ai/index` (INTERNE)                       |
|                      | `GET`    | `/ai/index-status/:listingId`               |
|                      | `DELETE` | `/ai/index/:listingId` (INTERNE)            |
|                      | `GET`    | `/ai/health`                                |
| **TOTAL**            |          | **46 Endpoints**                            |


---


