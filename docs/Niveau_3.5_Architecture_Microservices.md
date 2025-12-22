# 📕 Niveau 3.5 — Architecture Microservices (MVP)

## Objectif

Définir l'architecture technique des microservices pour la plateforme immobilière.

---

## Vue d'Ensemble

```
┌─────────────────────────────────────────────────────────────────┐
│                        FRONTEND (Next.js)                       │
│                         Port 3000                               │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                     API GATEWAY (Nginx)                         │
│                         Port 80/443                             │
│         - Reverse Proxy   - Rate Limiting   - SSL/TLS           │
└─────────────────────────────────────────────────────────────────┘
      │           │              │              │           │
      ▼           ▼              ▼              ▼           ▼
┌──────────┐ ┌──────────┐ ┌────────────┐ ┌──────────┐ ┌──────────┐
│   AUTH   │ │ LISTINGS │ │RESERVATIONS│ │ CREDITS  │ │    AI    │────┐
│ SERVICE  │ │ SERVICE  │ │  SERVICE   │ │ SERVICE  │ │ SERVICE  │    │
│ Fastify  │ │ Fastify  │ │  Fastify   │ │ Fastify  │ │ Python   │    │
│  :3001   │ │  :3002   │ │   :3003    │ │  :3004   │ │ FastAPI  │    │
└────┬─────┘ └────┬─────┘ └─────┬──────┘ └────┬─────┘ │  :3005   │    │
     │            │             │             │       └────┬─────┘    │
     │            │             │             │            │          │
     │            │             │             │            │          ▼
     │            │             │             │            │    ┌───────────┐
     │            │             │             │            │    │  OLLAMA   │
     │            │             │             │            │    │llama3.2:3b│
     │            │             │             │            │    └───────────┘
     │            │             │             │            │          │
     │            │             │             │            │          ▼
     │            │             │             │            │    ┌───────────┐
     │            │             │             │            │    │ ChromaDB  │
     │            │             │             │            │    │ VectorDB  │
     │            │             │             │            │    └───────────┘
     └────────────┴─────────────┼─────────────┴────────────┴──────────┘
                                │
                                ▼
                    ┌─────────────────────┐
                    │     PostgreSQL      │
                    │    (Base unique)    │
                    └─────────────────────┘
```

---

## 🗄️ Stratégie Base de Données : Décision Architecturale

### Choix : Base PostgreSQL Unique (Partagée)

Nous avons choisi une **base de données unique partagée** entre tous les services plutôt que des bases séparées par service.

### Comparaison des Approches

| Critère                 | Base Unique ✅ (Choisi) | Bases Séparées   |
|-------------------------|-------------------------|------------------|
| **Complexité**          | Simple                  | Complexe         |
| **Transactions ACID**   | ✅ Natives              | ❌ Saga patterns |
| **JOINs cross-service** | ✅ Possibles            | ❌ Impossibles   |
| **Cohérence données**   | ✅ Immédiate            | ⚠️ Eventual      |
| **Coût infrastructure** | ✅ 1 instance           | ❌ 4 instances   |
| **Backup/Restore**      | ✅ 1 backup             | ❌ 4 backups     |
| **Couplage schéma**     | ⚠️ Couplé               | ✅ Indépendant   |
| **Scaling granulaire**  | ⚠️ Limité               | ✅ Par service   |

### Justification du Choix (Contraintes MVP)

| Contrainte                  | Impact sur le choix                                 |
|-----------------------------|-----------------------------------------------------|
| **Délai MVP (1-1,5 mois)**  | Pas de temps pour transactions distribuées          |
| **Équipe réduite**          | Maintenance d'une seule DB plus réaliste            |
| **Transactions critiques**  | Créer annonce + consommer crédit = atomique         |
| **Module ft_transcendence** | Exige des *services* séparés, pas des *DB* séparées |
| **Budget infrastructure**   | 1 PostgreSQL < 4 PostgreSQL                         |

### Règles d'Accès aux Données

Bien que la base soit partagée, chaque service respecte des **boundaries logiques** :

| Service      | Tables en écriture                        | Accès lecture seule (via API) |
|--------------|-------------------------------------------|-------------------------------|
| auth         | `users`, `seller_stats`                   | —                             |
| listings     | `listings`, `zones`, `moderation_actions` | `users`                       |
| reservations | `reservations`, `feedbacks`               | `users`, `listings`           |
| credits      | `credit_balances`, `credit_transactions`  | `users`                       |

> **Règle :** Les services utilisent les **endpoints `/internal/*`** pour les données cross-service, pas de JOINs directs.

### Migration Future (Phase 2+)

Si scaling nécessaire → extraction progressive des services vers leurs propres DB.

---

## Services

### 1. Auth Service (Port 3001)

**Responsabilité :** Authentification et gestion utilisateurs

| Endpoint         | Méthode | Description            |
|------------------|---------|------------------------|
| `/auth/register` | POST    | Inscription            |
| `/auth/login`    | POST    | Connexion email        |
| `/auth/google`   | POST    | Connexion Google OAuth |
| `/auth/refresh`  | POST    | Rafraîchir token       |
| `/auth/logout`   | POST    | Déconnexion            |
| `/users/me`      | GET     | Mon profil             |
| `/users/me`      | PUT     | Modifier profil        |

**Modèles gérés :** `User`, `SellerStats`

---

### 2. Listings Service (Port 3002)

**Responsabilité :** Gestion des annonces, zones, modération

| Endpoint                         | Méthode | Description            |
|----------------------------------|---------|------------------------|
| `/listings`                      | GET     | Liste annonces         |
| `/listings/:id`                  | GET     | Détail annonce         |
| `/listings`                      | POST    | Créer annonce          |
| `/listings/:id`                  | PUT     | Modifier annonce       |
| `/listings/:id/archive`          | POST    | Archiver (vendu/loué)  |
| `/listings/mine`                 | GET     | Mes annonces           |
| `/listings/generate-description` | POST    | Génération IA          |
| `/zones`                         | GET     | Liste zones            |
| `/admin/listings/flagged`        | GET     | Annonces signalées     |
| `/admin/listings/:id/*`          | POST    | Actions modération     |

**Modèles gérés :** `Listing`, `Zone`, `ModerationAction`

**Dépendances :**
- → Auth Service (vérifier vendeur)
- → Credits Service (consommer crédit)

---

### 3. Reservations Service (Port 3003)

**Responsabilité :** Réservations et feedbacks

| Endpoint              | Méthode | Description            |
|-----------------------|---------|------------------------|
| `/reservations`       | POST    | Créer réservation      |
| `/reservations/mine`  | GET     | Mes réservations       |
| `/reservations/:id`   | DELETE  | Annuler réservation    |
| `/feedback`           | POST    | Créer feedback         |

**Modèles gérés :** `Reservation`, `Feedback`

**Dépendances :**
- → Auth Service (vérifier acheteur)
- → Listings Service (vérifier annonce)

---

### 4. Credits Service (Port 3004)

**Responsabilité :** Gestion des crédits et transactions

| Endpoint            | Méthode | Description                |
|---------------------|---------|----------------------------|
| `/credits/balance`  | GET     | Consulter solde            |
| `/credits/recharge` | POST    | Recharger crédits          |
| `/credits/history`  | GET     | Historique transactions    |
| `/credits/consume`  | POST    | Consommer crédit (interne) |

**Modèles gérés :** `CreditBalance`, `CreditTransaction`

**Dépendances :**
- → Auth Service (vérifier utilisateur)

---

### 5. AI Service (Port 3005)

**Responsabilité :** Assistant Chat & RAG

| Endpoint            | Méthode | Description                |
|---------------------|---------|----------------------------|
| `/ai/chat`          | POST    | Chat RAG avec LLM          |
| `/ai/market-data`   | GET     | Données marché pour l'IA   |

**Modèles gérés :** Aucun (stateless ou session en mémoire/Redis pour MVP)

---

## API Gateway (Nginx)

### Configuration Routing

```nginx
upstream auth_service {
    server auth-service:3001;
}

upstream listings_service {
    server listings-service:3002;
}

upstream reservations_service {
    server reservations-service:3003;
}

upstream credits_service {
    server credits-service:3004;
}

server {
    listen 80;
    listen 443 ssl;
    
    # Auth routes
    location /api/auth/ {
        proxy_pass http://auth_service/auth/;
    }
    location /api/users/ {
        proxy_pass http://auth_service/users/;
    }
    
    # Listings routes
    location /api/listings/ {
        proxy_pass http://listings_service/listings/;
    }
    location /api/zones/ {
        proxy_pass http://listings_service/zones/;
    }
    location /api/admin/ {
        proxy_pass http://listings_service/admin/;
    }
    
    # Reservations routes
    location /api/reservations/ {
        proxy_pass http://reservations_service/reservations/;
    }
    location /api/feedback/ {
        proxy_pass http://reservations_service/feedback/;
    }
    
    # Credits routes
    location /api/credits/ {
        proxy_pass http://credits_service/credits/;
    }
    upstream ai_service {
        server ai-service:3005;
    }

    # AI routes
    location /api/ai/ {
        proxy_pass http://ai_service/ai/;
    }
}
```

### Rate Limiting

```nginx
limit_req_zone $binary_remote_addr zone=api_limit:10m rate=10r/s;

server {
    location /api/ {
        limit_req zone=api_limit burst=20 nodelay;
    }
}
```

---

## Communication Inter-Services

| Service Source | Service Cible | Endpoint                         | Cas d'usage                         |
|----------------|---------------|----------------------------------|-------------------------------------|
| listings       | auth          | `GET /internal/users/:id`        | Vérifier vendeur                    |
| listings       | credits       | `POST /internal/credits/consume` | Consommer crédit publication        |
| reservations   | auth          | `GET /internal/users/:id`        | Vérifier acheteur                   |
| reservations   | listings      | `GET /internal/listings/:id`     | Vérifier annonce active             |
| credits        | auth          | `GET /internal/users/:id`        | Vérifier utilisateur                |

> **Note :** Les endpoints `/internal/*` sont accessibles uniquement depuis le réseau Docker interne.

---

## Docker Compose

```yaml
version: '3.8'

services:
  # Frontend
  frontend:
    build: ./frontend
    ports:
      - "3000:3000"
    depends_on:
      - nginx

  # API Gateway
  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf
    depends_on:
      - auth-service
      - listings-service
      - reservations-service
      - credits-service
      - ai-service

  # Microservices
  auth-service:
    build: ./services/auth
    ports:
      - "3001:3001"
    environment:
      - DATABASE_URL=postgresql://user:pass@db:5432/realstate
    depends_on:
      - db

  listings-service:
    build: ./services/listings
    ports:
      - "3002:3002"
    environment:
      - DATABASE_URL=postgresql://user:pass@db:5432/realstate
      - AUTH_SERVICE_URL=http://auth-service:3001
      - CREDITS_SERVICE_URL=http://credits-service:3004
    depends_on:
      - db

  reservations-service:
    build: ./services/reservations
    ports:
      - "3003:3003"
    environment:
      - DATABASE_URL=postgresql://user:pass@db:5432/realstate
      - AUTH_SERVICE_URL=http://auth-service:3001
      - LISTINGS_SERVICE_URL=http://listings-service:3002
    depends_on:
      - db

  credits-service:
    build: ./services/credits
    ports:
      - "3004:3004"
    environment:
      - DATABASE_URL=postgresql://user:pass@db:5432/realstate
      - AUTH_SERVICE_URL=http://auth-service:3001
    depends_on:
      - db

  # AI Service avec RAG
  ai-service:
    build: ./services/ai
    ports:
      - "3005:3005"
    environment:
      - DATABASE_URL=postgresql://user:pass@db:5432/realstate
      - OLLAMA_URL=http://ollama:11434
      - OLLAMA_MODEL=llama3.2:3b
      - CHROMADB_HOST=chromadb
      - CHROMADB_PORT=8000
      - EMBEDDING_MODEL=all-MiniLM-L6-v2
      - LISTINGS_SERVICE_URL=http://listings-service:3002
    depends_on:
      - db
      - ollama
      - chromadb
      - listings-service
    volumes:
      - ./services/ai:/app
    restart: unless-stopped

  # Ollama - LLM Server
  ollama:
    image: ollama/ollama:latest
    ports:
      - "11434:11434"
    volumes:
      - ollama_data:/root/.ollama
    restart: unless-stopped

  # ChromaDB - Vector Database
  chromadb:
    image: chromadb/chroma:latest
    ports:
      - "8000:8000"
    volumes:
      - chromadb_data:/chroma/chroma
    environment:
      - IS_PERSISTENT=TRUE
      - ANONYMIZED_TELEMETRY=FALSE
    restart: unless-stopped

  # Database principale
  db:
    image: postgres:15-alpine
    ports:
      - "5432:5432"
    environment:
      - POSTGRES_USER=user
      - POSTGRES_PASSWORD=pass
      - POSTGRES_DB=realstate
    volumes:
      - postgres_data:/var/lib/postgresql/data
    restart: unless-stopped

volumes:
  postgres_data:
  ollama_data:
  chromadb_data:
```

---

## Health Checks

Chaque service expose un endpoint `/health` :

```json
GET /health

Response 200:
{
  "status": "healthy",
  "service": "auth-service",
  "version": "1.0.0",
  "timestamp": "2025-01-15T10:00:00Z"
}
```

---

## Structure du Projet

```
project/
├── frontend/                 # Next.js
│   └── ...
├── services/
│   ├── auth/                 # Fastify auth service
│   │   ├── src/
│   │   ├── prisma/
│   │   ├── Dockerfile
│   │   └── package.json
│   ├── listings/             # Fastify listings service
│   │   └── ...
│   ├── reservations/         # Fastify reservations service
│   │   └── ...
│   └── credits/              # Fastify credits service
│       └── ...
│   ├── ai/                   # Python FastAPI AI service
│       ├── main.py
│       ├── requirements.txt
│       └── Dockerfile
├── nginx/
│   └── nginx.conf
├── docker-compose.yml
└── .env.example
```

---

## Déploiement

```bash
# Développement
docker-compose up -d

# ⚠️ Important : Initialisation Modèle IA
# Une fois le conteneur ollama démarré, télécharger le modèle :
docker exec -it listings-service-ollama-1 ollama pull llama3.2:3b
```

---

**Version :** 1.0  
**Statut :** Document de référence  
**Date :** Décembre 2024
