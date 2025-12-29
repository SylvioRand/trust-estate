# 📕 Niveau 3.5 — Architecture Microservices (MVP) - UPDATED

## Objectif

Définir l'architecture technique des microservices pour la plateforme immobilière avec **IA rapide et gratuite**.

---

## Vue d'Ensemble MISE À JOUR

```
┌─────────────────────────────────────────────────────────────────┐
│               FRONTEND (React 19.1.2 + Tailwind)        │
│                         Port 3000                               │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                     API GATEWAY (Nginx 1.25)                    │
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
     │            │             │             │            │    │ ChromaDB  │
     │            │             │             │            │    │ 0.4.22    │
     │            │             │             │            │    │ VectorDB  │
     │            │             │             │            │    │  (Local)  │
     │            │             │             │            │    └───────────┘
     │            │             │             │            │          
     │            │             │             │            ├──────────────────┐
     │            │             │             │            │                  │
     │            │             │             │            │                  ▼
     │            │             │             │            │         ┌─────────────────┐
     │            │             │             │            │         │  OpenRouter API │
     │            │             │             │            │         │  DeepSeek V3    │
     │            │             │             │            │         │    (Cloud)      │
     │            │             │             │            │         │   GRATUIT ✅    │
     │            │             │             │            │         └─────────────────┘
     └────────────┴─────────────┼─────────────┴────────────┴──────────┘
                                │
                                ▼
                    ┌─────────────────────┐
                    │  PostgreSQL 15.5    │
                    │   (Base unique)     │
                    └─────────────────────┘
```

---

## 🆕 Changements Majeurs

### **1. Remplacement Ollama → Fournisseur LLM Cloud**

| Avant (Ollama local) | Après (API Cloud) |
|----------------------|--------------------------|
| ❌ Lent (10s+ par requête sur ton PC) | ✅ Rapide (<1s par requête) |
| ❌ Consomme 3GB RAM | ✅ 0 RAM local (cloud) |
| ❌ Besoin de télécharger modèle | ✅ Prêt immédiatement |
| ✅ Gratuit | ✅ Variable (selon fournisseur) |
| ✅ Données locales | ⚠️ LLM cloud (ChromaDB reste local) |

### **2. Versions Fixes (au lieu de :latest)**

| Service | Avant | Après | Pourquoi |
|---------|-------|-------|----------|
| Nginx | `nginx:alpine` | `nginx:1.25-alpine` | Reproductibilité |
| ChromaDB | `chromadb/chroma:latest` | `chromadb/chroma:0.4.22` | Stabilité API |
| PostgreSQL | `postgres:15-alpine` | `postgres:15.5-alpine` | Version LTS précise |

### **3. Ajout Conformité ft_transcendence**

- ✅ **Error handling** explicite dans AI Service
- ✅ **Rate limiting** (Adapté au fournisseur)
- ✅ **Streaming support** pour LLM
- ✅ **Health checks** robustes

---

## 🗄️ Stratégie Base de Données : INCHANGÉE

*[Section identique à l'original - pas de changement]*

La stratégie de base unique reste optimale pour le MVP.

---

## Services

### 1-4. Auth, Listings, Reservations, Credits (Fastify + Prisma)

Ces services utilisent **Fastify** pour la performance et **Prisma** comme ORM standardisé.


*[Sections identiques à l'original - pas de changement]*

---

### 5. AI Service (Port 3005) - **MISE À JOUR**

**Responsabilité :** Assistant Chat & RAG avec **LLM cloud rapide**

| Endpoint            | Méthode | Description                      |
|---------------------|---------|----------------------------------|
| `/ai/chat`          | POST    | Chat RAG avec LLM Externe        |
| `/ai/generate`      | POST    | Génération texte (streaming)     |
| `/ai/market-data`   | GET     | Données marché pour l'IA         |
| `/ai/index`         | POST    | Indexer / Mettre à jour annonce  |
| `/ai/index-status`  | GET     | Vérifier statut indexation       |
| `/ai/index/:id`     | DELETE  | Supprimer lien et vecteurs       |
| `/ai/health`        | GET     | Health check                     |

**Stack technique :**
- **LLM :** API Externe (OpenAI, Anthropic, Mistral, etc.)

- **Embeddings :** Sentence Transformers local (all-MiniLM-L6-v2)
- **Vector DB :** ChromaDB 0.4.22 (local, persistent)
- **Framework :** FastAPI avec rate limiting

**Modèles gérés :** `AIListingLink` (Table de mapping Listing ID <-> Vector ID)

---

## 🧩 Orchestration & Synchronisation RAG

*[Section identique à l'original - pas de changement]*

---

## API Gateway (Nginx) - CONFIGURATION SUFFISANTE

> [!NOTE]
> **Décision Architecture** : Nginx est **suffisant** comme API Gateway unique.
> L'ajout d'une Gateway Fastify supplémentaire ajouterait de la latence et de la complexité inutiles pour ce MVP. Nginx gère efficacement le reverse proxy, le SSL offloading et le rate limiting. L'authentification est vérifiée par les microservices (via JWT partagé) ou via `auth_request` si nécessaire.

### Configuration Routing

```nginx
# Version fixe
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

upstream ai_service {
    server ai-service:3005;
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

    # AI routes - avec rate limiting spécifique
    location /api/ai/ {
        limit_req zone=ai_limit burst=5 nodelay;
        proxy_pass http://ai_service/ai/;
        proxy_read_timeout 30s;  # Pour streaming
    }
}
```

### Rate Limiting **AMÉLIORÉ**

```nginx
# Rate limiting général API
limit_req_zone $binary_remote_addr zone=api_limit:10m rate=10r/s;

# Rate limiting spécifique IA (protection budget/quota)
limit_req_zone $binary_remote_addr zone=ai_limit:10m rate=15r/m;

server {
    location /api/ {
        limit_req zone=api_limit burst=20 nodelay;
    }
    
    location /api/ai/ {
        limit_req zone=ai_limit burst=5 nodelay;
    }
}
```

---

## Communication Inter-Services

*[Section identique à l'original - pas de changement]*

---

## Docker Compose **MISE À JOUR**

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
    restart: unless-stopped

  # API Gateway - VERSION FIXE
  nginx:
    image: nginx:1.25-alpine  # ✅ Version fixe
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
    restart: unless-stopped

  # Microservices
  auth-service:
    build: ./services/auth
    ports:
      - "3001:3001"
    environment:
      - DATABASE_URL=postgresql://user:pass@db:5432/realstate
    depends_on:
      - db
    restart: unless-stopped

  listings-service:
    build: ./services/listings
    ports:
      - "3002:3002"
    environment:
      - DATABASE_URL=postgresql://user:pass@db:5432/realstate
      - AUTH_SERVICE_URL=http://auth-service:3001
      - CREDITS_SERVICE_URL=http://credits-service:3004
      - AI_SERVICE_URL=http://ai-service:3005
    depends_on:
      - db
    restart: unless-stopped

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
    restart: unless-stopped

  credits-service:
    build: ./services/credits
    ports:
      - "3004:3004"
    environment:
      - DATABASE_URL=postgresql://user:pass@db:5432/realstate
      - AUTH_SERVICE_URL=http://auth-service:3001
    depends_on:
      - db
    restart: unless-stopped

  # AI Service (External Provider)
  ai-service:
    build: ./services/ai
    ports:
      - "3005:3005"
    environment:
      # Base de données
      - DATABASE_URL=postgresql://user:pass@db:5432/realstate
      
      # ✅ Provider API (LLM cloud)
      - LLM_API_KEY=${LLM_API_KEY}
      - LLM_MODEL=provider/model-name

      
      # ✅ ChromaDB (vecteurs locaux)
      - CHROMADB_HOST=chromadb
      - CHROMADB_PORT=8000
      - CHROMADB_COLLECTION=trust_estate_knowledge
      
      # ✅ Embeddings locaux
      - EMBEDDING_MODEL=all-MiniLM-L6-v2
      
      # Services
      - LISTINGS_SERVICE_URL=http://listings-service:3002
      
    depends_on:
      - db
      - chromadb
      - listings-service
    volumes:
      - ./services/ai:/app
    deploy:
      resources:
        limits:
          memory: 1G  # Réduit de 3G car pas de LLM local
    restart: unless-stopped

  # ChromaDB - Vector Database
  chromadb:
    image: chromadb/chroma:0.4.22  # ✅ Version fixe
    ports:
      - "8000:8000"
    volumes:
      - chromadb_data:/chroma/chroma
    environment:
      - IS_PERSISTENT=TRUE
      - ANONYMIZED_TELEMETRY=FALSE
    deploy:
      resources:
        limits:
          memory: 512M
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8000/api/v1/heartbeat"]
      interval: 30s
      timeout: 10s
      retries: 3
    restart: unless-stopped

  # ============================================
  # Database principale - VERSION FIXE
  # ============================================
  db:
    image: postgres:15.5-alpine  # ✅ Version fixe
    ports:
      - "5432:5432"
    environment:
      - POSTGRES_USER=user
      - POSTGRES_PASSWORD=pass
      - POSTGRES_DB=realstate
    volumes:
      - postgres_data:/var/lib/postgresql/data
    deploy:
      resources:
        limits:
          memory: 512M
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U user"]
      interval: 10s
      timeout: 5s
      retries: 5
    restart: unless-stopped

volumes:
  postgres_data:
  chromadb_data:

# ❌ SUPPRIMÉ : ollama_data (plus besoin d'Ollama local)
```

---

## 📊 Comparaison Ressources

| Composant | Avant (Ollama) | Après (API Cloud) | Économie |
|-----------|----------------|---------------------|----------|
| **RAM totale** | 6.5 GB | 3.5 GB | **-46%** |
| **Stockage** | 4 GB | 1 GB | **-75%** |
| **Latence IA** | 10-20s | <1s | **10-20x plus rapide** |
| **Coût/mois** | $0 | Variable | Dépend du provider |

### Détail RAM :

```
Service            Avant    Après
──────────────────────────────────
Frontend           512 MB   512 MB
Nginx              128 MB   128 MB
Auth               256 MB   256 MB
Listings           256 MB   256 MB
Reservations       256 MB   256 MB
Credits            256 MB   256 MB
AI Service         1 GB     1 GB
Ollama             3 GB     ❌ (0 GB)
ChromaDB           512 MB   512 MB
PostgreSQL         512 MB   512 MB
──────────────────────────────────
TOTAL              6.6 GB   3.6 GB
```

---

## Health Checks **AMÉLIORÉS**

Chaque service expose un endpoint `/health` avec plus de détails :

### AI Service Health Check

```json
GET /ai/health

Response 200:
{
  "status": "healthy",
  "service": "ai-service",
  "version": "1.0.0",
  "timestamp": "2025-01-15T10:00:00Z",
  "providers": {
    "llm": {
      "provider": "external_provider",
      "model": "gpt-4-or-similar",
      "status": "online"
    },
    "embeddings": {
      "model": "all-MiniLM-L6-v2",
      "status": "loaded"
    },
    "vector_db": {
      "provider": "chromadb",
      "status": "connected",
      "documents": 1523
    }
  }
}
```

---

## Structure du Projet **MISE À JOUR**

```
project/
├── frontend/                 # React 19.1.2 + Tailwind
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
│   ├── credits/              # Fastify credits service
│   │   └── ...
│   └── ai/                   # ✅ Python FastAPI AI service
│       ├── main.py           # Point d'entrée
│       ├── services/
│       │   ├── llm_provider.py    # ✅ Client API Generique
│       │   ├── chromadb_client.py # Client ChromaDB
│       │   └── embeddings.py      # Sentence Transformers
│       ├── routers/
│       │   ├── chat.py       # Routes /ai/chat
│       │   ├── generate.py   # Routes /ai/generate
│       │   └── index.py      # Routes /ai/index
│       ├── models/
│       │   └── schemas.py    # Pydantic schemas
│       ├── utils/
│       │   ├── rate_limiter.py    # ✅ Rate limiting
│       │   └── error_handler.py   # ✅ Error handling
│       ├── requirements.txt
│       ├── Dockerfile
│       └── .env.example      # ✅ Template config
├── nginx/
│   └── nginx.conf
├── docker-compose.yml
├── .env.example              # ✅ Template avec LLM_API_KEY
└── README.md
```

---

## Déploiement **SIMPLIFIÉ**

```bash
# 1. Configuration
cp .env.example .env
# Éditer .env et ajouter : LLM_API_KEY=sk-...

# 2. Lancement
docker-compose up -d

# 3. Vérifier que tout fonctionne
curl http://localhost:3005/ai/health

# ✅ Plus besoin de télécharger manuellement un modèle !
# ✅ Prêt en <30 secondes au lieu de 5-10 minutes
```

---

## 🎓 Validation ft_transcendence

### Modules Validés avec cette Architecture

#### **Major : Complete LLM system interface (2 pts)**
✅ **Implémenté via OpenRouter + DeepSeek V3**
- Generate text from user input
- Streaming responses (`stream=True`)
- Error handling (try/except + HTTP status codes)
- Rate limiting (15 req/min via Nginx + slowapi)

**Preuve :** `/ai/generate` endpoint dans `services/ai/routers/generate.py`

#### **Major : Complete RAG system (2 pts)**
✅ **Implémenté via API Externe**
- Generate text from user input
- Large dataset (10,000+ annonces immobilières)
- Context retrieval (embeddings + semantic search)
- Response generation (DeepSeek avec contexte)

**Preuve :** `/ai/chat` endpoint dans `services/ai/routers/chat.py`

#### **Minor : Content moderation AI (1 pt) - OPTIONNEL**
✅ **Possible avec la plupart des LLM**
- Classification de texte (approprié/inapproprié)
- Filtrage automatique annonces suspectes

**Total IA validé :** 4-5 points (sur 14 requis)

---

## 🔐 Sécurité & Conformité

### Variables d'Environnement (.env.example)

```bash
# Database
DATABASE_URL=postgresql://user:pass@db:5432/realstate

# LLM Provider
LLM_API_KEY=sk-xxxxxxxxxxxxxxxxxxxxxxxx

# AI Configuration
AI_PROVIDER=external
LLM_MODEL=provider/model-name
EMBEDDING_MODEL=all-MiniLM-L6-v2

# ChromaDB
CHROMADB_HOST=chromadb
CHROMADB_PORT=8000
CHROMADB_COLLECTION=trust_estate_knowledge

# Services URLs
AUTH_SERVICE_URL=http://auth-service:3001
LISTINGS_SERVICE_URL=http://listings-service:3002
CREDITS_SERVICE_URL=http://credits-service:3004

# Logging
LOG_LEVEL=info
```

### Privacy Policy & Terms of Service

*[À compléter selon exigences ft_transcendence - pages obligatoires]*

---

## 📈 Performance Attendue

| Métrique | Avant (Ollama) | Après (API Cloud) |
|----------|----------------|---------------------|
| Cold start AI Service | 5-10 min | <30s |
| Temps réponse LLM | 10-20s | <1s |
| Requêtes/min possibles | 3-6 | Variable (Quota) |
| RAM serveur requise | 8 GB | 4 GB |
| Stockage requis | 10 GB | 5 GB |

---

## 🚨 Points d'Attention Évaluation

### Ce que les évaluateurs vont vérifier :

1. **Architecture microservices** ✅
   - Services séparés avec responsabilités claires
   - Communication via API REST
   - Docker Compose fonctionnel

2. **Modules IA ft_transcendence** ✅
   - LLM system interface opérationnel
   - RAG system complet et fonctionnel
   - Error handling + rate limiting
   - Capacité d'expliquer l'implémentation

3. **Versions fixes Docker** ✅
   - Pas de `:latest` en production
   - Reproductibilité garantie

4. **Health checks** ✅
   - Tous les services exposent `/health`
   - Statut des dépendances visibles

5. **Privacy Policy & Terms** ⚠️
   - **À NE PAS OUBLIER** (rejet si absent)

---

## 🎯 Checklist Avant Évaluation

- [ ] `.env` configuré avec `LLM_API_KEY` valide
- [ ] `docker-compose up -d` fonctionne sans erreur
- [ ] Tous les health checks retournent 200 OK
- [ ] `/ai/chat` répond en <2s avec contexte pertinent
- [ ] `/ai/generate` supporte streaming
- [ ] Rate limiting testé (16e requête/min bloquée)
- [ ] Error handling testé (clé API invalide → 500 propre)
- [ ] Privacy Policy page accessible
- [ ] Terms of Service page accessible
- [ ] README.md complet avec justifications modules
- [ ] Chaque membre peut expliquer son rôle et contributions

---

**Version :** 2.1 (External Provider + Versions fixes)  
**Statut :** Prêt pour ft_transcendence  
**Date :** Décembre 2024  
**Validation :** Architecture conforme sujet v19.0

---

## 🆘 Support & Troubleshooting

### Problème : API Key invalide
```bash
# Vérifier que la clé est correcte
curl https://api.provider.com/v1/models \
  -H "Authorization: Bearer $LLM_API_KEY"
```

### Problème : ChromaDB ne démarre pas
```bash
# Vérifier les logs
docker-compose logs chromadb

# Recréer le volume si corrompu
docker-compose down -v
docker-compose up -d chromadb
```

### Problème : AI Service lent
```bash
# Vérifier la latence réseau vers le provider
curl -w "@curl-format.txt" -o /dev/null -s \
  https://api.provider.com/v1/models
```

### Problème : Rate limiting trop strict
```nginx
# Ajuster dans nginx.conf
limit_req_zone $binary_remote_addr zone=ai_limit:10m rate=30r/m;
# Puis : docker-compose restart nginx
```