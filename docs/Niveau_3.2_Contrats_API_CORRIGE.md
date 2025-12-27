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

### Structure Standard des Erreurs de Validation (400)

```json
{
  "error": "validation_failed",
  "message": "Données invalides",
  "details": {
    "password": [
      "Minimum 8 caractères requis",
      "Maximum 128 caractères autorisé",
      "Doit contenir au moins une majuscule",
      "Doit contenir au moins une minuscule",
      "Doit contenir au moins un chiffre"
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
export const LISTING_STATUS = ['active', 'blocked', 'archived'] as const;
export const PARKING_TYPE = ['none', 'street', 'garage', 'covered'] as const;
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
| `status` (listing)   | `active`, `blocked`, `archived`                                 |
| `parking_type`       | `none`, `street`, `garage`, `covered`                           |
| `reservation.status` | `pending`, `confirmed`, `rejected`, `cancelled`, `done`         |
| `report.reason`      | `fraud`, `spam`, `incorrect_info`, `inappropriate`              |
| `mod.action`         | `block_temporary`, `archive_permanent`, `request_clarification` |
| `credit.provider`    | `orange-money`, `mvola`                                         |
| `feedback.rating`    | `1`, `2`, `3`, `4`, `5`                                         |

### ✅ Checklist Validation Complète

Avant chaque endpoint POST/PUT, vérifier :

- [ ] Schema JSON avec `additionalProperties: false`
- [ ] Limites de taille identiques frontend/backend
- [ ] Enums stricts avec valeurs partagées
- [ ] Regex téléphone Madagascar appliquée
- [ ] Sanitization XSS sur champs texte
- [ ] Rate limiting configuré
- [ ] Vérification crédits avant opération (402)
- [ ] Transaction atomique si multi-opérations

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

**Response 400 (email existant) :**
```json
{
  "error": "email_exists",
  "message": "Cet email est déjà utilisé"
}
```

**Response 400 (téléphone existant) :**
```json
{
  "error": "phone_exists",
  "message": "Ce numéro de téléphone est déjà utilisé"
}
```

**Response 400 (validation) :**
```json
{
  "error": "validation_failed",
  "message": "Données invalides",
  "details": {
    "email": ["Format email invalide", "Maximum 255 caractères"],
    "firstName": ["Minimum 2 caractères requis", "Maximum 50 caractères", "Lettres et espaces uniquement"],
    "lastName": ["Minimum 2 caractères requis", "Maximum 50 caractères", "Lettres et espaces uniquement"],
    "phone": ["Format invalide (+261 32/33/34/38 + 7 chiffres)"],
    "password": [
      "Minimum 8 caractères requis",
      "Maximum 128 caractères autorisé",
      "Doit contenir au moins une majuscule",
      "Doit contenir au moins une minuscule",
      "Doit contenir au moins un chiffre"
    ]
  }
}
```

**Response 429 (rate limiting) :**
```json
{
  "error": "rate_limited",
  "message": "Trop de comptes créés depuis cette adresse IP. Réessayez dans 1 heure.",
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
    "emailVerified": "true",
    "phone": "+261340000000",
    "firstName": "Sydni",
    "lastName": "Ziemann",
    "role": "user",
    "sellerStats": {
      "totalListings": 5,
      "activeListings": 4,
      "successfulSales": 1,
      "averageRating": 8.5
    },
    "creditBalance": 45,
    "createdAt": "2025-12-26T08:55:19.215Z"
  },
  "message": "Compte activé avec succès. 5 crédits offerts !"
}
```

**Response 400 :**
```json
{
  "error": "invalid_or_expired_token",
  "message": "Le lien de vérification est invalide ou expiré"
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
  "message": "Un email de vérification a été envoyé si le compte existe."
}
```

**Response 429 :**
```json
{
  "error": "rate_limited",
  "message": "Trop de requêtes. Veuillez réessayer plus tard."
}
```

**Response 500 :**
```json
{
  "error": "Internal server error",
  "message": "Internal server error"
}
```

---

### 1.4 Mot de passe oublié (🆕 NOUVEAU)

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
  "message": "Si cet email existe, un lien de réinitialisation a été envoyé."
}
```
> **Securité :** Message générique pour éviter l'énumération des utilisateurs.

**Response 429 :**
```json
{
  "error": "rate_limited",
  "message": "Trop de demandes. Veuillez patienter."
}
```

---

### 1.5 Réinitialiser Mot de passe (🆕 NOUVEAU)

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
  "message": "Mot de passe modifié avec succès."
}
```
> **Securité :** Cette action révoque/déconnecte immédiatement toutes les sessions actives de l'utilisateur.

**Response 400 :**
```json
{
  "error": "invalid_token",
  "message": "Le lien est invalide ou expiré."
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
{
  "user": {
    "id": "b016c7e2-9a78-4c86-a5ab-5f4166e6deaa",
    "email": "Destiny_Dickinson25@gmail.com",
    "emailVerified": false,
    "phone": "+261340000000",
    "firstName": "Sonya",
    "lastName": "Leuschke",
    "role": "user",
    "sellerStats": {
      "totalListings": 5,
      "activeListings": 4,
      "successfulSales": 1,
      "averageRating": 8.5
    },
    "creditBalance": 45,
    "createdAt": "2025-12-26T08:49:13.639Z"
  }
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

**Response 400 :**
```json
{
  "error": "invalid_credentials",
  "message": "Email ou mot de passe incorrect"
}
```

**Response 429 (rate limiting) :**
```json
{
  "error": "rate_limited",
  "message": "Trop de tentatives de connexion. Compte temporairement bloqué.",
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
  "idToken": "google-oauth-token"
}
```

**Response 200 :**
- **Headers:** `Set-Cookie: ...` (Access + Refresh)

```json
{
  "user": {
    "id": "8757f505-eb47-4078-8c64-b33239e264e6",
    "email": "Monty_Rempel@gmail.com",
    "emailVerified": "true",
    "phone": "+261340000000",
    "firstName": "Edwin",
    "lastName": "Bernier",
    "role": "moderator",
    "sellerStats": {
      "totalListings": 5,
      "activeListings": 4,
      "successfulSales": 1,
      "averageRating": 8.5
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
  "message": "Token Google invalide ou expiré"
}
```

**Règles mock MVP :**
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
  "message": "Déconnexion réussie"
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
  "message": "Données invalides",
  "details": {
    "firstName": ["Minimum 2 caractères", "Maximum 50 caractères", "Lettres et espaces uniquement"],
    "lastName": ["Minimum 2 caractères", "Maximum 50 caractères", "Lettres et espaces uniquement"],
    "phone": ["Format invalide (+261 32/33/34/38 + 7 chiffres)"]
  }
}
```

**Response 400 (téléphone existant) :**
```json
{
  "error": "phone_exists",
  "message": "Ce numéro de téléphone est déjà utilisé par un autre compte"
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

### 1.11 Ajouter/Modifier Téléphone (🆕 NOUVEAU)

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
  "message": "Numéro de téléphone mis à jour avec succès"
}
```

**Response 400 (format invalide) :**
```json
{
  "error": "invalid_phone_format",
  "message": "Format de téléphone invalide (+261 32/33/34/38 + 7 chiffres)"
}
```

**Response 400 (téléphone existant) :**
```json
{
  "error": "phone_exists",
  "message": "Ce numéro de téléphone est déjà utilisé par un autre compte"
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

### 1.12 🆕 Vérifier Disponibilité Email (UX)

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
  "available": false,
  "message": "Cet email est déjà utilisé"
}
```

**Response 429 :**
```json
{
  "error": "rate_limited",
  "message": "Trop de requêtes. Réessayez plus tard."
}
```

> **Sécurité :** Rate limiting strict (10 requêtes/minute par IP) pour éviter l'énumération des utilisateurs.

---

### 1.13 🆕 Vérifier Disponibilité Téléphone (UX)

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

---

### 1.14 🆕 Vérifier Disponibilité Slot (UX)

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
  "message": "Créneau déjà réservé",
  "nextAvailable": "2025-01-20T14:00:00Z"
}
```

> **Utilité :** Évite à l'utilisateur de perdre 1 crédit si le slot vient d'être pris par quelqu'un d'autre.

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
    "wc_separate": true,
    "parking_type": "garage",
    "garden_private": true,
    "water_access": true,
    "electricity_access": true
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
    "wc_separate": true,
    "parking_type": "garage",
    "garden_private": true,
    "pool": true,
    "water_access": true,
    "electricity_access": true
  },
  "tags": ["exclusive"]
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

**Response 402 (crédits insuffisants) :**
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

**Response 400 (validation) :**
```json
{
  "error": "validation_failed",
  "details": {
    "photos": ["Maximum 10 images autorisées"],
    "price": ["Prix doit être positif"]
  }
}
```

**Response 413 :**
```json
{
  "error": "file_too_large",
  "message": "Image 1 dépasse 5MB"
}
```

**Response 422 (format invalide) :**
```json
{
  "error": "invalid_mime_type",
  "message": "Format d'image non supporté (JPG, PNG, WebP uniquement)",
  "invalidFiles": ["photo_3.gif"]
}
```

**Response 429 (limite atteinte) :**
```json
{
  "error": "listing_limit_reached",
  "message": "Limite de 10 annonces actives atteinte"
}
```

#### Règles de Validation

**Frontend :**

| Champ                | Règles                                             |
|----------------------|----------------------------------------------------|
| `title`              | 10-100 caractères                                  |
| `description`        | 50-2000 caractères                                 |
| `price`              | Nombre positif, max 999 999 999 999                |
| `surface`            | Nombre positif, max 10 000 m²                      |
| `zone`               | Doit exister dans la liste `/zones`                |
| `photos`             | 3-10 images, max 5MB chacune, formats JPG/PNG/WebP |
| `features.bedrooms`  | 0-20                                               |
| `features.bathrooms` | 0-10                                               |

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
    "wc_separate": true,
    "parking_type": "garage",
    "garden_private": true,
    "pool": true,
    "water_access": true,
    "electricity_access": true
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

**Response 400 (validation) :**
```json
{
  "error": "validation_failed",
  "message": "Données invalides",
  "details": {
    "title": ["Maximum 100 caractères"],
    "description": ["Maximum 2000 caractères"]
  }
}
```

**Response 401 :**
```json
{
  "error": "unauthorized",
  "message": "Authentification requise"
}
```

**Response 403 :**
```json
{
  "error": "forbidden",
  "message": "Vous ne pouvez modifier que vos propres annonces"
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

### 2.5 Renouveler Annonce (Prolonger annonce)

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

**Response 401 :**
```json
{
  "error": "unauthorized",
  "message": "Authentification requise"
}
```

**Response 403 :**
```json
{
  "error": "forbidden",
  "message": "Vous ne pouvez renouveler que vos propres annonces"
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

### 2.6 Définir Disponibilités (Seller)

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

**Response 400 (validation) :**
```json
{
  "error": "validation_failed",
  "message": "Données invalides",
  "details": {
    "weeklySchedule": ["dayOfWeek doit être entre 0 et 6", "startTime doit être au format HH:mm"]
  }
}
```

**Response 401 :**
```json
{
  "error": "unauthorized",
  "message": "Authentification requise"
}
```

**Response 403 :**
```json
{
  "error": "forbidden",
  "message": "Vous ne pouvez définir les disponibilités que de vos propres annonces"
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

### 2.7 Récupérer créneaux disponibles
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

### 2.8 Archiver Annonce (Vendu/Loué)

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

**Response 400 (validation) :**
```json
{
  "error": "validation_failed",
  "message": "Données invalides",
  "details": {
    "finalStatus": ["Valeur invalide. Doit être 'sold' ou 'rented'"]
  }
}
```

**Response 401 :**
```json
{
  "error": "unauthorized",
  "message": "Authentification requise"
}
```

**Response 403 :**
```json
{
  "error": "forbidden",
  "message": "Vous ne pouvez archiver que vos propres annonces"
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

### 2.9 🆕 Mes Annonces

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

### 2.10 🆕 Signaler une annonce

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

**Response 400 (validation) :**
```json
{
  "error": "validation_failed",
  "message": "Données invalides",
  "details": {
    "reason": ["Valeur invalide. Doit être 'fraud', 'spam', 'incorrect_info' ou 'inappropriate'"],
    "comment": ["Minimum 10 caractères requis", "Maximum 500 caractères"]
  }
}
```

**Response 401 :**
```json
{
  "error": "unauthorized",
  "message": "Authentification requise"
}
```

**Response 404 :**
```json
{
  "error": "listing_not_found",
  "message": "Annonce introuvable"
}
```

**Response 409 :**
```json
{
  "error": "already_reported",
  "message": "Vous avez déjà signalé cette annonce"
}
```

---

---

### 2.11 🆕 Génération Description IA

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



**Response 400 (validation) :**
```json
{
  "error": "validation_failed",
  "message": "Données invalides",
  "details": {
    "listingId": ["Format UUID invalide"],
    "slot": ["Format ISO 8601 requis", "Doit être dans le futur (minimum 2h)"]
  }
}
```

**Response 401 :**
```json
{
  "error": "unauthorized",
  "message": "Authentification requise"
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

**Response 403 :**
```json
{
  "error": "cannot_reserve_own_listing",
  "message": "Vous ne pouvez pas réserver votre propre annonce"
}
```

**Response 404 :**
```json
{
  "error": "listing_not_found",
  "message": "Annonce introuvable ou inactive"
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

### 3.2 🆕 Lister mes réservations

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
      "status": "confirmed",
      "feedbackEligible": false,
      "createdAt": "2025-01-15T14:00:00Z"
    }
  ]
}
```

---

### 3.3 🆕 Annuler réservation

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
  "message": "Annulation impossible moins de 2h avant le rendez-vous"
}
```

**Response 401 :**
```json
{
  "error": "unauthorized",
  "message": "Authentification requise"
}
```

**Response 403 :**
```json
{
  "error": "forbidden",
  "message": "Vous ne pouvez annuler que vos propres réservations"
}
```

**Response 404 :**
```json
{
  "error": "reservation_not_found",
  "message": "Réservation introuvable"
}
```

### 3.4 🆕 Confirmer réservation (Vendeur)

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
  "status": "confirmed",
  "confirmedAt": "2025-01-16T10:00:00Z"
}
```

**Response 401 :**
```json
{
  "error": "unauthorized",
  "message": "Authentification requise"
}
```

**Response 403 :**
```json
{
  "error": "forbidden",
  "message": "Seul le vendeur peut confirmer cette réservation"
}
```

**Response 404 :**
```json
{
  "error": "reservation_not_found",
  "message": "Réservation introuvable"
}
```

**Response 409 :**
```json
{
  "error": "reservation_already_processed",
  "message": "Cette réservation a déjà été traitée"
}
```

---

### 3.5 🆕 Refuser réservation (Vendeur)

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
  "status": "rejected"
}
```

**Response 401 :**
```json
{
  "error": "unauthorized",
  "message": "Authentification requise"
}
```

**Response 403 :**
```json
{
  "error": "forbidden",
  "message": "Seul le vendeur peut refuser cette réservation"
}
```

**Response 404 :**
```json
{
  "error": "reservation_not_found",
  "message": "Réservation introuvable"
}
```

**Response 409 :**
```json
{
  "error": "reservation_already_processed",
  "message": "Cette réservation a déjà été traitée"
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
  "rating": 4,
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
  "saved": true
}
```

**Response 400 (validation) :**
```json
{
  "error": "validation_failed",
  "message": "Données invalides",
  "details": {
    "rating": ["Doit être entre 1 et 5"],
    "comment": ["Minimum 10 caractères requis", "Maximum 500 caractères"]
  }
}
```

**Response 400 (déjà exist) :**
```json
{
  "error": "feedback_already_exists",
  "message": "Vous avez déjà laissé un feedback pour cette visite"
}
```

**Response 401 :**
```json
{
  "error": "unauthorized",
  "message": "Authentification requise"
}
```

**Response 403 :**
```json
{
  "error": "reservation_not_done",
  "message": "Vous ne pouvez laisser un feedback qu'après la visite"
}
```

**Response 404 :**
```json
{
  "error": "reservation_not_found",
  "message": "Réservation introuvable"
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

**Response 400 (validation) :**
```json
{
  "error": "validation_failed",
  "message": "Données invalides",
  "details": {
    "amount": ["Doit être un nombre positif", "Minimum 1 crédit"],
    "provider": ["Valeur invalide. Doit être 'orange-money' ou 'mvola'"]
  }
}
```

**Response 400 (paiement) :**
```json
{
  "error": "payment_failed",
  "message": "Paiement échoué. Vérifiez votre solde Mobile Money."
}
```

**Response 401 :**
```json
{
  "error": "unauthorized",
  "message": "Authentification requise"
}
```

**Response 429 (rate limiting) :**
```json
{
  "error": "rate_limited",
  "message": "Trop de recharges. Maximum 3 par heure.",
  "retryAfter": 3600
}
```

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
      "reason": "recharge_pack",
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

### 7.2 Appliquer une action (Modération)

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

**Response 400 (validation) :**
```json
{
  "error": "validation_failed",
  "message": "Données invalides",
  "details": {
    "action": ["Valeur invalide. Doit être 'block_temporary', 'archive_permanent' ou 'request_clarification'"],
    "reason": ["Minimum 10 caractères requis", "Maximum 500 caractères"]
  }
}
```

**Response 401 :**
```json
{
  "error": "unauthorized",
  "message": "Authentification requise"
}
```

**Response 403 :**
```json
{
  "error": "forbidden",
  "message": "Accès réservé aux modérateurs"
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

### 7.3 Historique Modération (Admin)

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

### 7.4 Archivage Permanent (Sécurité)

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
> - **LLM :** OpenRouter + DeepSeek V3 (Cloud gratuit)
> - **Embeddings :** Sentence Transformers (all-MiniLM-L6-v2)
> - **Vector Database :** ChromaDB (Local)
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
    "listingId": "l1" // Optionnel
  }
}
```

**Response 200 :**
```json
{
  "reply": "À Ivandry, le prix moyen au m² est d'environ 4.500.000 Ar...",
  "sources": ["market_report_2024", "listing_l1"]
}
```

### 8.2 Génération Texte (Streaming)

```http
POST /ai/generate
```

**Request :**
```json
{
  "prompt": "Rédige une description pour une villa T4...",
  "stream": true
}
```

**Response 200 (Stream) :**
- Flux d'événements SSE (Server-Sent Events)

### 8.3 Données Marché (RAG source)

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

#### Health Check

```http
GET /ai/health
```

**Response 200 :**
```json
{
  "status": "healthy",
  "providers": {
    "llm": "online",
    "vector_db": "connected"
  }
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
|                      | `POST`   | `/auth/resend-verification`                 |
|                      | `POST`   | `/auth/login`                               |
|                      | `POST`   | `/auth/google`                              |
|                      | `POST`   | `/auth/refresh`                             |
|                      | `POST`   | `/auth/logout`                              |
|                      | `GET`    | `/auth/check-email` 🆕                      |
|                      | `GET`    | `/auth/check-phone` 🆕                      |
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
|                      | `GET`    | `/reservations/check-slot` 🆕               |
|                      | `POST`   | `/reservations/:id/confirm`                 |
|                      | `POST`   | `/reservations/:id/reject`                  |
|                      | `DELETE` | `/reservations/:id`                         |
| **Feedback**         | `POST`   | `/feedback`                                 |
| **Crédits**          | `GET`    | `/credits/balance`                          |
|                      | `POST`   | `/credits/recharge`                         |
|                      | `GET`    | `/credits/history`                          |
| **Zones**            | `GET`    | `/zones`                                    |
| **Modération**       | `GET`    | `/admin/listings/flagged`                   |
|                      | `GET`    | `/admin/listings/:id`                       |
|                      | `POST`   | `/admin/listings/:id/action`                |
|                      | `GET`    | `/admin/actions`                            |
| **AI (Assistant)**   | `POST`   | `/ai/chat`                                  |
|                      | `GET`    | `/ai/market-data`                           |
|                      | `POST`   | `/ai/index`                                 |
|                      | `GET`    | `/ai/index-status/:listingId`               |
|                      | `DELETE` | `/ai/index/:listingId`                      |
| **TOTAL**            |          | **39 Endpoints**                            |

---

## 10. Changelog (Version Corrigée)

**🆕 Ajouts (Validation & UX) :**
- **Section "Règles de Validation"** complète (défense en profondeur, sanitization XSS, rate limiting)
- Endpoints validation temps réel : `GET /auth/check-email`, `GET /auth/check-phone`, `GET /reservations/check-slot`
- Règles de validation détaillées par endpoint critique (register, login, publish, reservations)
- Codes d'erreur 400 avec structure `details` standardisée
- Tableau rate limiting par endpoint
- Règles upload fichiers (formats, tailles, MIME type)

**🆕 Ajouts (Endpoints) :**
- Resend email verification (POST /auth/resend-verification)
- Inscription utilisateur (POST /auth/register)
- Logout
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
- Gestion erreurs enrichie (400, 402, 403, 409, 413, 422, 429)
- Réponses IA validation détaillées
- Pagination sur toutes les listes
- Query params exhaustifs

**✅ Cohérence :**
- Aligné avec Niveau 2.4 (Décisions Produit)
- Workflow téléphone complet
- Rôle IA clarifié (suggère, pas bloque)
- Zones structurées
- **Validation frontend ET backend spécifiée (exigence respectée)**

**🆕 Audit Erreurs Complet (27 Décembre 2024) :**
- **16 endpoints corrigés** avec erreurs manquantes
- Ajout systématique des codes : 400 (validation détaillée), 401, 403, 404, 409, 422, 429
- `/auth/register` : ajout `phone_exists`, validation password complète (majuscule, minuscule, chiffre), 429 rate limiting
- `/auth/login` : ajout 429 rate limiting
- `/auth/google` : ajout 400 invalid_google_token
- `/listings/publish` : ajout 422 invalid_mime_type, 429 listing_limit
- `PUT /listings/:id` : ajout 400, 401, 404
- `/listings/:id/renew|availability|archive` : ajout 401, 403, 404
- `/listings/:id/report` : ajout 400, 401, 404, 409 (already_reported)
- `POST /reservations` : ajout 400, 401, 403 (cannot_reserve_own), 404
- `DELETE /reservations/:id` : ajout 400 (too_late), 401, 403, 404
- `POST /reservations/:id/confirm|reject` : ajout 401, 403, 404, 409
- `POST /feedback` : ajout 400 validation, 401, 404
- `POST /credits/recharge` : ajout 400 validation, 401, 429
- `POST /admin/listings/:id/action` : ajout 400, 401, 403, 404


---
