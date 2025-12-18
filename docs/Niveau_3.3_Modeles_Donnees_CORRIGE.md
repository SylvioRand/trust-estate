# 📕 Niveau 3.3 — Modèles de données (MVP) — VERSION CORRIGÉE

## Objectif

Définir des modèles de données simples, cohérents et stables, utilisés :
- par le frontend (state, UI)
- par les mocks API (Apidog)

⚠️ Ces modèles sont volontairement simplifiés pour le MVP.

**🆕 Cette version corrige et enrichit le document initial avec :**
- Zones structurées
- Feedback avec timestamp
- Gestion des documents fonciers
- Relations clarifiées
- États enrichis
- **Ownership par microservice**

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

## 1. User

```typescript
User {
  id: string                    // Unique ID
  email?: string                // Optionnel (si login téléphone)
  phone?: string                // Optionnel (si login email)
  phoneVerified: boolean        // 🆕 Crucial pour réservations
  role: 'user' | 'moderator'
  trustScore: number            // 0-100
  
  // Relation (1-1)
  sellerStats?: SellerStats     // 🆕 Désormais une table séparée (voir section 9)
  
  createdAt: string             // ISO 8601
  updatedAt?: string
}
```

**Règles :**
- Un utilisateur peut être acheteur ET vendeur simultanément
- `role: 'moderator'` → accès aux endpoints `/admin/*`
- Un utilisateur peut être acheteur ET vendeur simultanément
- `role: 'moderator'` → accès aux endpoints `/admin/*`
- `phoneVerified` toujours `true` en MVP (pas de provider SMS réel)
- **Note API :** Bien que `creditBalance` soit une table séparée, l'API `/users/me` l'injecte souvent directement à la racine de l'objet User pour simplifier le frontend.

**Exemples :**

```json
{
  "id": "u1",
  "email": "jean@mail.com",
  "phone": "+261340000001",
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
  "createdAt": "2024-06-15T10:00:00Z"
}
```

---

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
Listing {
  id: string
  type: 'sale' | 'rent'
  title: string
  description: string
  price: number                 // Prix en Ariary (MGA)
  
  // Caractéristiques bien
  surface?: number              // m²
  features?: {
    bedrooms?: number
    bathrooms?: number
    parking?: boolean
    garden?: boolean
    pool?: boolean
    furnished?: boolean         // 🆕 Pour locations
  }
  
  // Localisation
  zone: string                  // 🆕 Format: "tana-analakely"
  zoneDisplay: string           // 🆕 Format: "Antananarivo - Analakely"
  
  // Visuels
  photos: string[]              // URLs ou base64
  photoHashes?: string[]        // 🆕 Hash photos (détection doublons)
  
  // États
  status: 'active' | 'reserved' | 'sold' | 'rented' | 'archived' | 'blocked'  // 🔧 'draft' supprimé pour MVP
  trustScore: number            // 0-100
  
  // 🆕 Modération
  moderationStatus?: {
    flagged: boolean
    flaggedReason?: string
    flaggedAt?: string
    clarificationRequested?: boolean
    clarificationMessage?: string
  }
  
  // Vendeur
  sellerId: string
  sellerVisible: boolean        // False avant réservation confirmée
  
  // Timestamps
  createdAt: string
  updatedAt?: string
  archivedAt?: string
  
  // 🆕 Stats annonce
  stats?: {
    views: number
    reservations: number
    feedbacks: number
  }
}
```

**Règles :**
- `sellerVisible` passe à `true` uniquement après réservation confirmée
- Une annonce `archived` n'est jamais supprimée (conservée pour historique)
- `status = 'blocked'` uniquement par action modérateur humain
- `trustScore` influencé par : complétude, photos, feedbacks, historique vendeur
- `visibilityPenalty` réduit le classement sans bloquer l'annonce

**États du cycle de vie (MVP) :**

```
création → active → reserved → sold/rented → archived
                   ↓
                 blocked (modération humaine uniquement)
```

> **Note MVP :** Le status `draft` (brouillon) a été supprimé pour simplifier. Publication directe après création.

**Exemples :**

```json
{
  "id": "l1",
  "type": "sale",
  "title": "Maison T3 Analakely",
  "description": "Belle maison lumineuse avec jardin arboré...",
  "price": 50000000,
  "surface": 120,
  "features": {
    "bedrooms": 3,
    "bathrooms": 2,
    "parking": true,
    "garden": true
  },
  "zone": "tana-analakely",
  "zoneDisplay": "Antananarivo - Analakely",
  "photos": [
    "https://mock-cdn.com/l1-photo1.jpg",
    "https://mock-cdn.com/l1-photo2.jpg"
  ],
  "photoHashes": [
    "a3f5d9c2e1b4",
    "b7e2c8f1a9d5"
  ],
  "status": "active",
  "trustScore": 82,
  "trustScore": 82,
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

**Exemple avec incohérences mineures :**

```json
{
  "id": "l3",
  "type": "rent",
  "title": "Appartement T2",
  "description": "Joli appartement",
  "price": 800000,
  "surface": 60,
  "zone": "tana-ankorondrano",
  "zoneDisplay": "Antananarivo - Ankorondrano",
  "photos": ["https://mock-cdn.com/l3-photo1.jpg"],
  "status": "active",
  "trustScore": 60,
  "trustScore": 60,
  "sellerId": "u8",
  "sellerVisible": false,
  "createdAt": "2025-01-11T09:50:00Z"
}
```

---

## 3. Reservation

```typescript
Reservation {
  id: string
  listingId: string
  buyerId: string               // Celui qui réserve
  
  slot: string                  // ISO 8601 date/heure créneau
  status: 'pending' | 'confirmed' | 'cancelled' | 'done'
  
  // 🆕 Gestion cycle de vie
  confirmedAt?: string          // Quand vendeur confirme
  doneAt?: string               // 🆕 Quand visite marquée terminée
  cancelledAt?: string
  cancelledBy?: 'buyer' | 'seller' | 'system'
  cancellationReason?: string
  
  // 🆕 Feedback
  feedbackEligible: boolean     // True si status='done' et < 7 jours
  feedbackGiven: boolean
  
  createdAt: string
  updatedAt?: string
}
```

**Règles :**
- `status = 'pending'` → En attente confirmation vendeur
- `status = 'confirmed'` → Contact vendeur révélé à l'acheteur
- `status = 'done'` → Automatique 2h après `slot` OU manuel par vendeur
- `status = 'cancelled'` → Annulation possible jusqu'à 2h avant `slot`
- `feedbackEligible = true` si `status = 'done'` ET `createdAt < 7 jours`

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
  listingId: string             // 🆕 Pour faciliter requêtes
  
  // Auteurs
  authorId: string              // Acheteur qui donne feedback
  targetId: string              // 🆕 Vendeur qui reçoit feedback
  
  // Contenu
  rating: 1 | 2 | 3 | 4 | 5
  comment?: string              // Optionnel
  
  // 🆕 Catégories feedback (optionnel)
  categories?: {
    propertyAccurate: boolean   // Bien conforme à l'annonce
    sellerReactive: boolean     // Vendeur réactif
    visitUseful: boolean        // Visite utile
  }
  
  // 🆕 Visibilité
  visible: boolean              // True par défaut, false si modéré
  moderatedAt?: string
  moderationReason?: string
  
  createdAt: string
}
```

**Règles :**
- Un seul feedback par `reservationId`
- Feedback possible uniquement si `reservation.status = 'done'`
- Feedback impacte : `listing.trustScore` ET `seller.trustScore`
- Feedbacks < 3 étoiles peuvent déclencher alerte modérateur
- Feedbacks restent visibles sauf modération exceptionnelle (insultes, etc.)

**Impact sur les scores :**

```
Nouveau trustScore annonce = 
  (ancien score × 0.7) + (rating × 20 × 0.3)

Nouveau trustScore vendeur = 
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
    "propertyAccurate": true,
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
  
  // 🆕 Historique simplifié
  totalEarned: number           // Total crédits reçus (achats + bonus)
  totalSpent: number            // Total crédits consommés
  
  lastRechargeAt?: string
  updatedAt: string
}
```

**Règles Freemium :**
- Enregistrement : **5 crédits gratuits** (Validité : illimitée)
- Min Solde : **0** (Pas de découvert)

**Table des coûts (MVP) :**
| Action              | Coût       | Durée Visibilité |
|---------------------|------------|------------------|
| Publication Annonce | 1 crédit   | 30 jours         |
| Renouvellement      | 0.5 crédit | +30 jours        |
| Boost Visibilité    | 2 crédits  | 7 jours          |
| Pack "Verified"     | 1 crédit   | Permanent        |

**Tarifs Recharges (Mocked) :**
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
  
  // 🆕 Raisons détaillées
  reason: 
    | 'initial_bonus'           // 🆕 5 crédits gratuits inscription
    | 'recharge_pack'
    | 'recharge_bonus'
    | 'publish_listing'
    | 'boost_listing'
    | 'premium_photos'
    | 'verified_badge'
    | 'refund_cancelled'
  
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

## 7. 🆕 Zone

```typescript
Zone {
  id: string                    // Format: "tana-analakely"
  name: string                  // "Analakely"
  displayName: string           // "Antananarivo - Analakely"
  
  // Hiérarchie
  level: 'city' | 'district' | 'neighborhood'
  parentId?: string             // Ex: "tana-renivohitra"
  
  // État
  active: boolean               // Zones actives dans le MVP
}
```

**Règles MVP :**
- Liste prédéfinie de ~20 zones (Antananarivo uniquement)
- `level = 'neighborhood'` pour toutes les zones MVP

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

## 8. 🆕 ModerationAction (interface modérateur)

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

## 9. Relations clés

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

## 10. Diagramme relations simplifié

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

## 11. Notes MVP

**Simplifications volontaires :**
- Pas de relations complexes (JOIN multiples)
- Pas de contraintes DB strictes (pour flexibilité prototypage)
- Données mockées (pas de persistance réelle)
- Modèles enrichis pour anticiper Phase 2
- **AI Service :** Pas de modèles persistants pour le MVP (stateless).

**Objectif :** Cohérence produit & UX, pas optimisation DB.



---

## 12. Changelog (Version Corrigée)

**🆕 Ajouts :**
- Modèle `Zone` structuré (hiérarchie)
- Modèle `ModerationAction` (traçabilité)
- `User.sellerStats` (historique vendeur)
- `Listing.iaValidation` détaillé
- `Listing.moderationStatus`
- `Listing.photoHashes` (détection doublons)
- `Reservation.doneAt` (trigger feedback)
- `Reservation.feedbackEligible`
- `Feedback.categories` (détail évaluation)
- `Feedback.targetId` (vendeur évalué)
- `CreditTransaction.reason` enrichi (initial_bonus, etc.)
- **AI Service :** Modèles stateless (pas de DB persistence pour le chat MVP)

**🔧 Améliorations :**
- Relations clarifiées (diagramme)
- Règles métier explicites
- Exemples JSON complets
- États cycle de vie documentés

**✅ Cohérence :**
- Aligné avec Niveau 2.4 (Décisions Produit)
- Zones structurées
- Workflow feedback clarifié
- Crédits initiaux gratuits
- Modération tracée

---

**Document validé par :** [À compléter]  
**Date de validation :** [À compléter]  
**Version :** 2.0 (Corrigée)
