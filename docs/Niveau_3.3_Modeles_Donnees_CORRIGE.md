# 📕 Niveau 3.3 — Modèles de données (MVP) — VERSION CORRIGÉE (UPDATE)

## Objectif

Refléter la base de données réelle nécessaire pour les nouvelles features.



**Changements majeurs depuis feedback dev :**
- `emailVerified` obligatoire (remplaçant phoneVerified)
- PropertyType étendu (land, loft, commercial)
- Nouveaux champs Listing (wc_separate, floor, elevator, water_access...)
- Tags marketing
- Suppression confidenceScore/validationBadge


---

## 🔧 Ownership des Modèles par Service

| Modèle              | Service Owner        | Port |
|---------------------|----------------------|------|
| `User`              | auth-service         | 3001 |
| `SellerStats`       | auth-service         | 3001 |
| `Listing`           | listings-service     | 3002 |
| `Zone`              | listings-service     | 3002 |
| `ModerationAction`  | listings-service     | 3002 |
| `Reservation`       | reservations-service | 3003 |
| `Feedback`          | reservations-service | 3003 |
| `CreditBalance`     | credits-service      | 3004 |
| `CreditTransaction` | credits-service      | 3004 |

> **Note :** Chaque service est responsable de ses modèles. Les relations cross-service utilisent des IDs (pas de JOIN direct).

---

## 🔒 Contraintes de Validation

> **Référence :** Voir `Niveau_3.2_Contrats_API_CORRIGE.md` section "Règles de Validation" pour les détails complets.

### Principes

- Toutes les contraintes sont appliquées **frontend ET backend** (défense en profondeur)
- Le backend utilise `additionalProperties: false` pour rejeter les champs non définis
- Les limites de taille sont **identiques** entre frontend et backend

### Contraintes par Champ

| Modèle             | Champ         | Min | Max          | Format/Règles                         |
|--------------------|---------------|-----|--------------|---------------------------------------|
| `User`             | `email`       | 5   | 255          | Format email valide                   |
| `User`             | `firstName`   | 2   | 50           | Lettres et espaces uniquement         |
| `User`             | `lastName`    | 2   | 50           | Lettres et espaces uniquement         |
| `User`             | `phone`       | 13  | 13           | Regex: `^\+261(32\|33\|34\|38)\d{7}$` |
| `User`             | `password`    | 8   | 128          | 1 majuscule, 1 minuscule, 1 chiffre   |
| `Listing`          | `title`       | 10  | 100          | Sanitization XSS                      |
| `Listing`          | `description` | 50  | 2000         | Sanitization XSS                      |
| `Listing`          | `price`       | 1   | 999999999999 | Nombre positif                        |
| `Listing`          | `surface`     | 1   | 10000        | m²                                    |
| `Feedback`         | `comment`     | 10  | 500          | Sanitization XSS                      |
| `ModerationAction` | `reason`      | 10  | 500          | Justification                         |

### Enums Partagés (Source Unique)

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

> ⚠️ **Cohérence obligatoire :** Ces valeurs doivent être **strictement identiques** entre les schémas Zod (frontend) et JSON Schema (backend).

---

## 1. User

```typescript
interface User {
  id: string;
  email: string;
  emailVerified: boolean;  // Vérifié à l'inscription, obligatoire pour se connecter
  phone: string;           // Obligatoire (Validation format uniquement, pas d'OTP)
  firstName: string;
  lastName: string;
  role: 'user' | 'moderator';
  
  // Stats vendeur (optionnel, créé à la 1ère annonce)
  sellerStats?: SellerStats;
  
  // Crédits (injecté depuis credits-service)
  creditBalance: number;
  
  createdAt: string;
  updatedAt?: string;

  // Données internes de sécurité (non exposées)
  resetPasswordToken?: string;   // Hashé
  resetPasswordExpires?: Date;
}
```

**Règles :**
- `emailVerified` doit être `true` pour pouvoir se connecter (vérifié à l'inscription)
- Réservation = utilisateur connecté (donc email déjà vérifié)
- Un utilisateur peut être acheteur ET vendeur simultanément
- `role: 'moderator'` → accès aux endpoints `/admin/*`
- **Note API :** `creditBalance` injecté par l'API `/users/me` pour simplifier le frontend

**Exemple :**

```json
{
  "id": "u1",
  "email": "jean@mail.com",
  "emailVerified": true,
  "phone": "+261340000001",
  "firstName": "Jean",
  "lastName": "Rakoto",
  "role": "user",
  "sellerStats": {
    "totalListings": 8,
    "activeListings": 2,
    "successfulSales": 5,
    "successfulRents": 1,
    "averageRating": 4.3,
    "responseRate": 92
  },
  "creditBalance": 12,
  "createdAt": "2024-06-15T10:00:00Z"
}
```

---


## 2. SellerStats (Historique Vendeur)

```typescript
SellerStats {
  id: string
  userId: string                // Clé étrangère unique (1-1)
  
  totalListings: number
  activeListings: number
  successfulSales: number
  successfulRents: number
  averageRating: number         // 0-5.0 (indexé pour tri)
  responseRate: number          // 0-100 (indexé pour tri)
  
  updatedAt: string
}
```

**Règles :**
- Relation 1-1 stricte avec `User`
- Créé à la première publication d'annonce
- Séparé de `User` pour performance recherche et tri (backend feedback)
- Indexé sur `averageRating` et `responseRate`

---

## 3. Listing (Annonce)

```typescript
type PropertyType = 'apartment' | 'house' | 'loft' | 'land' | 'commercial';

interface Listing {
  id: string;
  type: 'sale' | 'rent';         // Transaction Type
  propertyType: PropertyType;    // Morphology (apartment, house...)
  mine?: boolean;                // Champ virtuel (API uniquement)
  
  // Contenu principal
  title: string;
  description: string;
  
  // Config Générale
  price: number;
  surface: number;
  
  // Localisation
  zone: string;                  // ID de la zone (ex: "tana-analakely")
  zoneDisplay: string;           // Nom lisible (ex: "Antananarivo - Analakely")
  
  // Médias
  photos: string[];              // URLs des images
  
  // Caractéristiques physiques (Groupées)
  features: ListingFeatures;
  
  // Marketing
  tags: ('urgent' | 'exclusive' | 'discount')[];
  
  // État et visibilité
  status: ListingStatus;
  sellerId: string;              // ⚠️ API: Exposé via objet `seller` après réservation confirmée (privacy)
  sellerVisible: boolean;        // True après réservation confirmée
  
  // Statistiques
  stats?: {
    views: number;
    reservations: number;
    feedbacks: number;
  };
  
  // Disponibilités
  availability?: ListingAvailability[]; // Plages horaires définies
  
  // Timestamps
  createdAt: string;
  updatedAt?: string;
}

interface ListingFeatures {
  // Config Pièces
  rooms?: number;
  bedrooms?: number;
  bathrooms?: number;
  wc?: number;
  wc_separate?: boolean;

  // Config Immeuble
  floor?: number;
  elevator?: boolean;

  // Config Terrain
  water_access?: boolean;
  electricity_access?: boolean;
  constructible?: boolean;

  // Extérieur
  balcony?: boolean;
  terrace?: boolean;
  garden_private?: boolean;
  parking_type?: 'garage' | 'box' | 'parking' | 'none';
  pool?: boolean;
}

interface ListingAvailability {
  id: string;
  listingId: string;
  dayOfWeek: number;   // 0=Dimanche, 1=Lundi... 6=Samedi
  startTime: string;   // "09:00"
  endTime: string;     // "18:00"
}

type ListingStatus = 'active' | 'reserved' | 'sold' | 'rented' | 'blocked' | 'archived';
```

**Règles :**
- `sellerVisible` passe à `true` uniquement après réservation confirmée
- Une annonce `archived` n'est jamais supprimée (conservée pour historique)
- `status = 'blocked'` uniquement par action modérateur humain
- Classement influencé par : complétude, photos, feedbacks, historique vendeur

**États du cycle de vie :**

```
création → active → reserved → sold/rented → archived
                   ↓
                 blocked (modération humaine uniquement)
```



**Exemples :**

```json
{
  "id": "l1",
  "type": "sale",
  "propertyType": "house",
  "mine": true,
  "title": "Maison T3 Analakely",
  "description": "Belle maison lumineuse avec jardin arboré...",
  "price": 50000000,
  "surface": 120,
  "features": {
    "bedrooms": 3,
    "bathrooms": 2,
    "parking_type": "garage",
    "garden_private": true
  },
  "tags": ["urgent"],
  "zone": "tana-analakely",
  "zoneDisplay": "Antananarivo - Analakely",
  "photos": [
    "https://mock-cdn.com/l1-photo1.jpg",
    "https://mock-cdn.com/l1-photo2.jpg"
  ],
  "status": "active",
  "sellerId": "u5",
  "sellerVisible": false,
  "stats": {
    "views": 245,
    "reservations": 3,
    "feedbacks": 2
  },
  "createdAt": "2025-01-10T08:00:00Z",
  "updatedAt": "2025-01-12T14:30:00Z"
}
```



---

## 4. Reservation

```typescript
interface Reservation {
  id: string;
  listingId: string;           // Référence annonce
  buyerId: string;
  sellerId: string;
  slot: Date;
  status: 'pending' | 'confirmed' | 'rejected' | 'cancelled' | 'done';
  
  confirmedAt?: string;
  doneAt?: string;
  
  feedbackEligible: boolean;
  feedbackGiven: boolean;
  
  createdAt: string;
  updatedAt?: string;
}
```

**Règles :**
- `status = 'pending'` → En attente confirmation vendeur
- `status = 'confirmed'` → Contact vendeur révélé à l'acheteur
- `status = 'rejected'` → Refusé par le vendeur
- `status = 'cancelled'` → Annulation possible jusqu'à 2h avant `slot`
- `status = 'done'` → Automatique 2h après `slot` (visite passée)
- `feedbackEligible = true` si `status = 'done'` ET `createdAt < 7 jours`

**Règles Feedback :**
- Un seul feedback par réservation
- `feedbackComment.length` doit être entre 10 et 500 caractères
- Feedback disponible uniquement si `status = 'done'`

**Passage automatique à 'done' :**

```
Job CRON (toutes les heures)
→ SELECT reservations WHERE status='confirmed' AND slot < (now() - 2 hours)
→ UPDATE status='done', doneAt=now()
→ SEND notifications (acheteur + vendeur)
```

**Exemples :**

```json
{
  "id": "r1",
  "listingId": "l1",
  "buyerId": "u2",
  "slot": "2025-01-20T10:00:00Z",
  "status": "confirmed",
  "confirmedAt": "2025-01-15T14:30:00Z",
  "feedbackEligible": false,
  "feedbackGiven": false,
  "createdAt": "2025-01-15T14:00:00Z"
}
```

```json
{
  "id": "r2",
  "listingId": "l3",
  "buyerId": "u4",
  "slot": "2025-01-18T15:00:00Z",
  "status": "done",
  "confirmedAt": "2025-01-16T10:00:00Z",
  "doneAt": "2025-01-18T17:05:00Z",
  "feedbackEligible": true,
  "feedbackGiven": true,
  "createdAt": "2025-01-16T09:45:00Z"
}
```

---

## 4. Feedback

```typescript
Feedback {
  id: string
  reservationId: string         // Lien vers réservation
  listingId: string             // Pour faciliter requêtes
  
  // Auteurs
  authorId: string              // Acheteur qui donne feedback
  targetId: string              // Vendeur qui reçoit feedback
  
  // Contenu
  rating: 1 | 2 | 3 | 4 | 5
  comment?: string              // Optionnel
  
  // Catégories feedback (optionnel)
  categories?: {
    listingAccurate: boolean    // Bien conforme à l'annonce
    sellerReactive: boolean     // Vendeur réactif
    visitUseful: boolean        // Visite utile
  }
  
  // Visibilité
  visible: boolean              // True par défaut, false si modéré
  moderatedAt?: string
  moderationReason?: string
  
  createdAt: string
}
```

**Règles :**
- Un seul feedback par `reservationId`
- Feedback possible uniquement si `reservation.status = 'done'`
- Feedbacks < 3 étoiles peuvent déclencher alerte modérateur
- Feedbacks restent visibles sauf modération exceptionnelle (insultes, etc.)

**Impact sur les stats vendeur :**

```
sellerStats.averageRating = 
  moyenne pondérée des feedbacks reçus (50 derniers)
```

**Exemples :**

```json
{
  "id": "f1",
  "reservationId": "r2",
  "listingId": "l3",
  "authorId": "u4",
  "targetId": "u8",
  "rating": 4,
  "comment": "Visite conforme. Appartement bien entretenu. Vendeur réactif.",
  "categories": {
    "listingAccurate": true,
    "sellerReactive": true,
    "visitUseful": true
  },
  "visible": true,
  "createdAt": "2025-01-18T18:00:00Z"
}
```

---

## 5. CreditBalance

```typescript
CreditBalance {
  userId: string                // Clé primaire
  balance: number               // Crédits disponibles
  
  // Historique simplifié
  totalEarned: number           // Total crédits reçus (achats + bonus)
  totalSpent: number            // Total crédits consommés
  
  lastRechargeAt?: string
  updatedAt: string
}
```

**Règles Freemium :**
- Enregistrement : **5 crédits gratuits** (Validité : illimitée)
- Min Solde : **0** (Pas de découvert)

**Table des coûts :**
| Action              | Coût       | Durée Visibilité  |
|---------------------|------------|-------------------|
| Publication Annonce | 1 crédit   | 30 jours          |
| Réservation Visite  | 1 crédit   | - (Débit immédiat)|

**Tarifs Recharges :**
- Starter (5cr) : 5.000 Ar
- Standard (12cr) : 10.000 Ar (+2 bonus)
- Premium (30cr) : 20.000 Ar (+5 bonus)

**Exemples :**

```json
{
  "userId": "u1",
  "balance": 12,
  "totalEarned": 25,
  "totalSpent": 13,
  "lastRechargeAt": "2025-01-15T10:00:00Z",
  "updatedAt": "2025-01-15T11:30:00Z"
}
```

---

## 6. CreditTransaction

```typescript
CreditTransaction {
  id: string
  userId: string
  
  // Transaction
  amount: number                // Positif (recharge) ou négatif (consommation)
  type: 'recharge' | 'consume' | 'bonus' | 'refund'
  
  // Raisons détaillées
  reason: 
    | 'initial_bonus'           // 5 crédits gratuits inscription
    | 'recharge_pack'           // Achat pack crédits
    | 'recharge_bonus'          // Bonus recharge (ex: +2 cr sur pack Standard)
    | 'publish_listing'         // Publication annonce
    | 'reserve_visit'           // Réservation visite
    | 'refund_cancelled'        // Remboursement annulation
  
  // Contexte
  listingId?: string            // Si lié à une annonce
  reservationId?: string        // Si lié à une réservation
  metadata?: any                // Données additionnelles
  
  // Solde après transaction
  balanceAfter: number
  
  createdAt: string
}
```

**Règles :**
- Chaque transaction est immutable (jamais modifiée)
- `balanceAfter` permet de reconstruire l'historique
- `type = 'bonus'` pour les crédits offerts (recharges, parrainage)

**Exemples :**

```json
{
  "id": "tx1",
  "userId": "u1",
  "amount": 5,
  "type": "bonus",
  "reason": "initial_bonus",
  "balanceAfter": 5,
  "createdAt": "2024-06-15T10:00:00Z"
}
```

```json
{
  "id": "tx2",
  "userId": "u1",
  "amount": 12,
  "type": "recharge",
  "reason": "recharge_pack",
  "metadata": {
    "pack": "standard",
    "price": 10000,
    "bonus": 2
  },
  "balanceAfter": 17,
  "createdAt": "2025-01-15T10:00:00Z"
}
```

```json
{
  "id": "tx3",
  "userId": "u1",
  "amount": -1,
  "type": "consume",
  "reason": "publish_listing",
  "listingId": "l1",
  "balanceAfter": 16,
  "createdAt": "2025-01-15T11:30:00Z"
}
```

---

## 7. Zone

```typescript
Zone {
  id: string                    // Format: "tana-analakely"
  name: string                  // "Analakely"
  displayName: string           // "Antananarivo - Analakely"
  
  // Hiérarchie
  level: 'city' | 'district' | 'neighborhood'
  parentId?: string             // Ex: "tana-renivohitra"
  
  // État
  active: boolean
}
```



**Exemples :**

```json
{
  "id": "tana-analakely",
  "name": "Analakely",
  "displayName": "Antananarivo - Analakely",
  "level": "neighborhood",
  "parentId": "tana",
  "active": true
}
```

---

## 8. ModerationAction (interface modérateur)

```typescript
ModerationAction {
  id: string
  moderatorId: string
  
  // Cible
  targetType: 'listing' | 'user' | 'feedback'
  targetId: string
  
  // Action
  action: 
    | 'request_clarification'
    | 'adjust_visibility'
    | 'block_temporary'
    | 'archive_permanent'
    | 'hide_feedback'
  
  // Détails
  reason: string
  metadata?: {
    visibilityPenalty?: number
    duration?: number           // heures
    message?: string
  }
  
  // Résultat
  applied: boolean
  appliedAt?: string
  
  createdAt: string
}
```

**Règles :**
- Toutes les actions modérateur sont loggées
- Historique complet pour traçabilité
- `applied = false` si action annulée ou échouée

**Exemples :**

```json
{
  "id": "ma1",
  "moderatorId": "m1",
  "targetType": "listing",
  "targetId": "l5",
  "action": "block_temporary",
  "reason": "Photos trompeuses confirmées",
  "metadata": {
    "duration": 48,
    "message": "Merci de fournir des photos récentes"
  },
  "applied": true,
  "appliedAt": "2025-01-15T14:00:00Z",
  "createdAt": "2025-01-15T14:00:00Z"
}
```

---

## 9. Report (Signalement Utilisateur)

```typescript
Report {
  id: string
  targetId: string              // Listing ID
  reporterId: string            // User ID
  
  reason: 'fraud' | 'spam' | 'incorrect_info' | 'inappropriate'
  comment?: string
  
  status: 'pending' | 'reviewed' | 'addressed'
  
  createdAt: string
}
```

**Règles :**
- Un utilisateur ne peut signaler une annonce qu'une seule fois
- Alimente le Dashboard Modérateur (`GET /admin/listings/flagged`)

---

## 10. AI Service Modeling (Mapping)

Modèle de correspondance utilisé par le service AI pour lier les données structurées (SQL) aux données vectorielles (ChromaDB).

```typescript
interface AIListingLink {
  listingId: string;   // ID source de l'annonce d'origine (Postgres)
  vectorId: string;    // ID du document correspondant dans ChromaDB
}
```

**Règles :**
- `listingId` est la clé primaire unique dans la table de mapping AI.
- Une entrée est créée lors de l'appel à `POST /ai/index`.
- L'entrée est supprimée lors de l'appel à `DELETE /ai/index/:id`.

---

## 11. Relations clés

```
User 1—N Listing (en tant que vendeur)
User 1—N Reservation (en tant qu'acheteur)
User 1—N Feedback (en tant qu'auteur)
User 1—N Feedback (en tant que cible/vendeur)
User 1—1 CreditBalance
User 1—1 SellerStats (relation 1-1)

Listing 1—N Reservation
Listing 1—N Feedback

Reservation 1—1 Feedback (optionnel)
Reservation N—1 Listing
Reservation N—1 User (acheteur)

Feedback N—1 Reservation
Feedback N—1 Listing
Feedback N—1 User (auteur)
Feedback N—1 User (cible)

CreditBalance 1—1 User
CreditBalance 1—N CreditTransaction

Zone 1—N Listing
Zone 1—N Zone (hiérarchie parent/enfant)

ModerationAction N—1 User (modérateur)
```

---

## 12. Diagramme relations simplifié

```
┌──────────┐
│   User   │
└────┬─────┘
     │
     ├─1:N─→ Listing (seller)
     ├─1:N─→ Reservation (buyer)
     ├─1:N─→ Feedback (author)
     ├─1:N─→ Feedback (target)
     ├─1:1─→ SellerStats
     └─1:1─→ CreditBalance
                │
                └─1:N─→ CreditTransaction

┌──────────┐
│  Listing │
└────┬─────┘
     │
     ├─1:N─→ Reservation
     ├─1:N─→ Feedback
     └─N:1─→ Zone

┌─────────────┐
│ Reservation │
└──────┬──────┘
       │
       └─1:1─→ Feedback (optionnel)
```

---



