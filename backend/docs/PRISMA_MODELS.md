# Modèles Prisma et Architecture de base de données

## Vue d'ensemble
Le projet utilise Prisma comme ORM avec PostgreSQL. Deux services ont leur propre base de données:
- **auth** service: Gère les tokens de rafraîchissement
- **users** service: Gère les profils utilisateurs et statistiques vendeur

## Architecture base de données

```mermaid
erDiagram
  USER ||--|| SELLER-STATS : owns
  USER {
    string id PK "uuid"
    string email UK "unique, nullable"
    string phone UK "unique, nullable"
    boolean phoneVerified "default: false"
    enum role "USER | MODERATOR, default: USER"
    int trustScore "default: 0"
    datetime createAt
    datetime updateAt
  }
  
  SELLER-STATS {
    string id PK "uuid"
    string userId FK "unique"
    int totalListings "default: 0"
    int activeListings "default: 0"
    int successfulSales "default: 0"
    int successfulRents "default: 0"
    float averageRating "default: 0, indexed"
    float responseRate "default: 0, indexed"
  }
  
  REFRESH-TOKEN {
    int id PK "auto-increment"
    string userId "no FK"
    string tokenHash
    datetime expiresAt
  }
```

## Service: Auth (`services/auth/prisma/schema.prisma`)

### Modèle: refresh_token
**Responsabilité**: Stocker les tokens de rafraîchissement hashmés pour les sessions utilisateur.

**Champs**:
```prisma
model refresh_token {
  id        Int      @id @default(autoincrement())
  userId    String
  tokenHash String
  expiresAt DateTime @default(now())
}
```

| Champ | Type | Attributs | Utilité |
|-------|------|-----------|---------|
| `id` | `Int` | `@id @default(autoincrement())` | Clé primaire auto-incrémentée |
| `userId` | `String` | - | Référence l'utilisateur (pas de FK défini) |
| `tokenHash` | `String` | - | Hash du token (jamais le token brut) |
| `expiresAt` | `DateTime` | `@default(now())` | Timestamp d'expiration |

**Problèmes identifiés**:
- ⚠️ `userId` n'a pas de Foreign Key vers la table User du service users
- ⚠️ `expiresAt` a un défaut `now()` mais devrait être `now() + 7 jours` (ou autre)
- ⚠️ Pas d'index sur `userId` (queries vont être lentes)

**Cas d'usage**:
```typescript
// Au login: créer un refresh token
const token = crypto.randomBytes(32).toString('hex');
const hash = crypto.createHash('sha256').update(token).digest('hex');

await prisma.refresh_token.create({
  data: {
    userId: user.id,
    tokenHash: hash,
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 jours
  }
});

// Au refresh: valider et supprimer
const rt = await prisma.refresh_token.findUnique({
  where: { tokenHash: hash }
});
if (!rt || rt.expiresAt < new Date()) throw new Error('Token expired');

await prisma.refresh_token.delete({
  where: { id: rt.id }
});
```

**Migrations**:
1. `20251218093038_init`: Crée table `User` (supprimée plus tard)
2. `20251218094032_update_name_table`: Renomme en `refresh_token`

### Recommandations pour auth
1. Ajouter index: `@@index([userId])` pour performances
2. Ajouter contraint: `@@unique([userId, tokenHash])` (un token par user)
3. Considérer: Ajouter champ `revoked: Boolean` pour logout

## Service: Users (`services/users/prisma/schema.prisma`)

### Énumération: Role
```prisma
enum Role {
	USER
	MODERATOR
}
```

**Utilité**: Définir les rôles possibles pour les utilisateurs.
**Valeurs**:
- `USER`: Utilisateur standard (acheteur/vendeur/locataire)
- `MODERATOR`: Modérateur de plateforme

### Modèle: User
**Responsabilité**: Profil utilisateur avec authentification et métadonnées.

**Champs**:
```prisma
model User {
	id				String		@id @default(uuid())
	email			String?		@unique
	phone			String?		@unique
	phoneVerified	Boolean		@default(false)
	role			Role		@default(USER)
	trustScore		Int			@default(0)
	createAt		DateTime	@default(now())
	updateAt		DateTime	@updatedAt
	sellerStats		SellerStats?
}
```

| Champ | Type | Attributs | Utilité |
|-------|------|-----------|---------|
| `id` | `String` | `@id @default(uuid())` | UUID primaire |
| `email` | `String?` | `@unique` | Unique, optionnel (phone alternative) |
| `phone` | `String?` | `@unique` | Unique, optionnel (email alternative) |
| `phoneVerified` | `Boolean` | `@default(false)` | Flag de vérification SMS/2FA |
| `role` | `Role` | `@default(USER)` | Rôle (User ou Moderator) |
| `trustScore` | `Int` | `@default(0)` | Confiance plateforme (0-100?) |
| `createAt` | `DateTime` | `@default(now())` | Timestamp création |
| `updateAt` | `DateTime` | `@updatedAt` | Timestamp last update (auto) |
| `sellerStats` | `SellerStats?` | Relation one-to-one | Stats vendeur liées |

**Contraintes et index**:
- Clé primaire: `id` (UUID)
- Uniques: `email`, `phone`

**Problèmes identifiés**:
- ⚠️ Email et phone optionnels → risque de doublons NULL
- ⚠️ `trustScore` sans documentation de plage (0-100? 0-1000?)
- ⚠️ Pas d'index sur `email` ou `phone` (déjà unique = auto-indexed en PG)
- ⚠️ `phoneVerified` est boolean mais pas de `emailVerified`

**Cas d'usage**:
```typescript
// Créer un user
const user = await prisma.user.create({
  data: {
    email: 'john@example.com',
    role: 'USER'
  }
});

// Mettre à jour trust score
await prisma.user.update({
  where: { id: userId },
  data: { trustScore: 50 }
});

// Récupérer avec stats
const userWithStats = await prisma.user.findUnique({
  where: { id: userId },
  include: { sellerStats: true }
});
```

### Modèle: SellerStats
**Responsabilité**: Statistiques des activités vendeur/loueur de l'utilisateur.

**Champs**:
```prisma
model SellerStats {
	id					String	@id @default(uuid())
	userId				String	@unique
	totalListings		Int		@default(0)
	activeListings		Int		@default(0)
	successfulSales		Int		@default(0)
	successfulRents		Int		@default(0)
	averageRating		Float	@default(0)
	responseRate		Float	@default(0)
	user				User	@relation(fields: [userId], references: [id], onDelete: Cascade)
	@@index([averageRating])
	@@index([successfulSales])
	@@index([responseRate])
}
```

| Champ | Type | Attributs | Utilité |
|-------|------|-----------|---------|
| `id` | `String` | `@id @default(uuid())` | UUID primaire |
| `userId` | `String` | `@unique` | Clé étrangère vers User (one-to-one) |
| `totalListings` | `Int` | `@default(0)` | Nombre total d'annonces |
| `activeListings` | `Int` | `@default(0)` | Annonces actuellement actives |
| `successfulSales` | `Int` | `@default(0)` | Ventes complétées |
| `successfulRents` | `Int` | `@default(0)` | Locations complétées |
| `averageRating` | `Float` | `@default(0)`, `@@index` | Note moyenne (0-5?) |
| `responseRate` | `Float` | `@default(0)`, `@@index` | % de réponses (0-100) |
| `user` | `User` | Relation, FK | Référence l'User propriétaire |
| - | - | `onDelete: Cascade` | Si User supprimé, SellerStats aussi |

**Indexes**:
- `averageRating`: Requis pour trier par note (résultats top-rated)
- `successfulSales`: Requis pour classement par ventes
- `responseRate`: Requis pour classement par réactivité

**Relation avec User**:
```
User (1) ------>O (SellerStats)
```
- Un User peut avoir zéro ou un SellerStats (optionnel)
- Un SellerStats appartient exactement à un User
- Suppression en cascade

**Problèmes identifiés**:
- ⚠️ `averageRating` sans documentation (0-5? 0-10?)
- ⚠️ `responseRate` sans clarification (hourly? daily? overall?)
- ⚠️ Pas de champ `lastUpdated` (difficulté à savoir si les stats sont à jour)
- ⚠️ Pas de relation vers les `Review` ou `Order` (nécessaire pour calculs)

**Cas d'usage**:
```typescript
// Créer stats vendeur
const stats = await prisma.sellerStats.create({
  data: {
    userId: userId
  }
});

// Mettre à jour après une vente
await prisma.sellerStats.update({
  where: { userId: userId },
  data: {
    successfulSales: { increment: 1 },
    totalListings: { increment: 1 }
  }
});

// Récupérer les top vendeurs
const topSellers = await prisma.sellerStats.findMany({
  orderBy: { averageRating: 'desc' },
  take: 10,
  include: { user: true }
});
```

## Migrations

### Auth Service
1. **20251218093038_init**: Crée table `User` (T1)
   ```sql
   CREATE TABLE "User" (
     "id" TEXT NOT NULL,
     "userId" TEXT NOT NULL,
     "tokenHash" TEXT NOT NULL,
     "expiresAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
   );
   ```

2. **20251218094032_update_name_table**: Renomme et restructure
   ```sql
   DROP TABLE "User";
   CREATE TABLE "refresh_token" (
     "id" SERIAL NOT NULL,
     "userId" TEXT NOT NULL,
     "tokenHash" TEXT NOT NULL,
     "expiresAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
   );
   ```
   **Note**: Perte de données (drop table)

### Users Service
1. **20251218102043_init_user_db**: Crée tables User et SellerStats
   - Crée enum `Role` (USER, MODERATOR)
   - Crée table `User` avec UUID, email unique, phone unique
   - Crée table `SellerStats` avec FK vers User en cascade
   - Ajoute 3 indexes (rating, sales, responseRate)
   - Ajoute 2 uniques (email, phone, userId)

## Variables d'environnement Prisma

**Requis** (pour migration/generation):
```env
DATABASE_URL=postgresql://user:password@localhost:5432/auth_db
```

**Pour auth service**: Connect à `auth_db`
**Pour users service**: Connect à `users_db` (ou même DB, schémas différents)

**Note**: Chaque service peut avoir sa propre DB ou partager avec schémas.

## Recommandations pour amélioration

### Auth Service
1. Ajouter index:
   ```prisma
   @@index([userId])
   @@index([expiresAt])
   ```
2. Ajouter contrainte unique:
   ```prisma
   @@unique([userId, tokenHash])
   ```
3. Ajouter champ:
   ```prisma
   createdAt DateTime @default(now())
   revoked Boolean @default(false)
   ```

### Users Service
1. Ajouter indexes:
   ```prisma
   @@index([email])
   @@index([phone])
   @@index([role])
   ```
2. Clarifier plages:
   ```typescript
   /// @zod.positive().max(5)
   averageRating Float @default(0)
   
   /// @zod.min(0).max(100)
   responseRate Float @default(0)
   ```
3. Ajouter timestamps:
   ```prisma
   sellerStats {
     lastUpdated DateTime @default(now())
   }
   ```
4. Ajouter relations vers Order/Review:
   ```prisma
   model User {
     reviews Review[]
     orders Order[]
   }
   ```

## Diagramme d'architecture complet

```
┌─────────────────────────────────────────────────────────┐
│                    PostgreSQL Cluster                    │
├─────────────────┬───────────────────────────────────────┤
│   Auth DB       │         Users DB                      │
│                 │                                       │
│ ┌─────────────┐ │ ┌─────────────┐ ┌────────────────┐  │
│ │refresh_token│ │ │    User     │ │  SellerStats   │  │
│ ├─────────────┤ │ ├─────────────┤ ├────────────────┤  │
│ │id (PK)      │ │ │id (PK)      │ │id (PK)         │  │
│ │userId       │ │ │email (UK)   │ │userId (FK→User)│  │
│ │tokenHash    │ │ │phone (UK)   │ │totalListings   │  │
│ │expiresAt    │ │ │phoneVerified│ │activeListings  │  │
│ └─────────────┘ │ │role         │ │successfulSales │  │
│                 │ │trustScore   │ │successfulRents │  │
│                 │ │createAt     │ │averageRating🔍 │  │
│                 │ │updateAt     │ │responseRate 🔍 │  │
│                 │ │sellerStats→ │ └────────────────┘  │
│                 │ └─────────────┘                       │
│                 │        ▲                              │
│                 │        │ (1:0-1 relation)            │
│                 │        │ (onDelete: Cascade)         │
│                 │        └──────────────────            │
└─────────────────┴───────────────────────────────────────┘
```

## Configuration Prisma

### auth/prisma.config.ts
```typescript
schema: "prisma/schema.prisma"
migrations: { path: "prisma/migrations" }
datasource.url: env("DATABASE_URL")
```

### users/prisma.config.ts
```typescript
schema: "prisma/schema.prisma"
migrations: { path: "prisma/migrations" }
datasource.url: env("DATABASE_URL")
jsonTypes: "prisma-json-types-generator" (adds type safety)
```

## TODO / À CONFIRMER
- **TODO**: Confirmer plage de `trustScore` (0-100? 0-1000?)
- **TODO**: Clarifier `responseRate` (0-100 %)
- **TODO**: Ajouter FK de `refresh_token` vers `User`
- **TODO**: Décider si une ou deux databases (actuellement deux)
- **TODO**: Ajouter modèles Order, Review, Listing (non présents actuellement)
- **TODO**: Documenter la stratégie de sharding/replication PG

## Références
- [services/auth/prisma/schema.prisma](../../auth/prisma/schema.prisma)
- [services/users/prisma/schema.prisma](../../users/prisma/schema.prisma)
- [Prisma Docs](https://www.prisma.io/docs/)
