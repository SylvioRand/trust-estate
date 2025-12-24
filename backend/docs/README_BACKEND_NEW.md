# Backend — Documentation Technique Complète (v1.1)

**Date de génération**: 18 Décembre 2024  
**Version**: 1.1.0  
**Branch**: tolrandr  
**Audience**: Développeurs, DevOps, Mainteneurs

---

## Table des matières

1. [Vue d'ensemble](#vue-densemble)
2. [Architecture système](#architecture-système)
3. [Structure du projet](#structure-du-projet)
4. [Services et dépendances](#services-et-dépendances)
5. [Configuration et variables d'environnement](#configuration-et-variables-denvironnement)
6. [Points d'entrée HTTP](#points-dentrée-http)
7. [Modèles de données](#modèles-de-données)
8. [Sécurité](#sécurité)
9. [Déploiement et démarrage](#déploiement-et-démarrage)
10. [Checklist de validation](#checklist-de-validation)

---

## Vue d'ensemble

### Résumé exécutif

Le backend du projet ft_transcendence est une **architecture microservices** avec un **API Gateway central** qui orchestre l'accès à trois services internes spécialisés:

- **Gateway (port 3000)**: Reverse proxy HTTP qui filtre et redirige les requêtes
- **Auth Service (port 3001)**: Gestion de l'authentification, tokens, OAuth, 2FA
- **Users Service (port 3002)**: Gestion des profils, rôles, statistiques vendeur

### Stack technique

| Composant | Technologie | Version |
|-----------|-------------|---------|
| **Framework HTTP** | Fastify | 5.6.2 |
| **Language** | TypeScript | 5.9.3 |
| **ORM** | Prisma | 7.2.0 |
| **Base de données** | PostgreSQL | 16 |
| **Sécurité** | Helmet, Rate-Limit, CORS | Multiples |
| **Déploiement** | Docker Compose | 3.9 |

---

## Architecture système

### Diagramme Mermaid

```mermaid
graph TB
    CLIENT["Client (Frontend)"]
    
    subgraph "API Layer"
        GATEWAY["API Gateway<br/>(Port 3000)<br/>Fastify"]
    end
    
    subgraph "Service Layer"
        AUTH["Auth Service<br/>(Port 3001)"]
        USERS["Users Service<br/>(Port 3002)"]
    end
    
    subgraph "Data Layer"
        AUTH_DB["Auth DB<br/>(PostgreSQL)"]
        USERS_DB["Users DB<br/>(PostgreSQL)"]
    end
    
    CLIENT -->|HTTP| GATEWAY
    GATEWAY -->|/auth/*| AUTH
    GATEWAY -->|/users/*| USERS
    AUTH --> AUTH_DB
    USERS --> USERS_DB
```

---

## Structure du projet

**Dossiers clés**:
- `backend/backend/` - Gateway principal
- `backend/services/auth/` - Service d'authentification
- `backend/services/users/` - Service de gestion des utilisateurs
- `backend/docs/` - Documentation (ce fichier + détails par composant)

**Pour structure complète**, voir le dossier `docs/files/` pour documentation détaillée par fichier source.

---

## Services et dépendances

### Gateway Backend
- **Plugins**: rate-limit, helmet, CORS, fastifyEnv, http-proxy
- **Responsabilités**: Reverse proxy, validation, sécurité

### Service Auth (changements récents)
- **Prisma**: `refresh_token` model (stockage des refresh tokens hashés), champ `User.sub` ajouté pour OAuth
- **Routes implémentées/ajoutées**: `/login`, `/register`, `/verify-email`, `/resend-email` (rate-limited), `/refresh`, `/google`, `/google/callback`
- **Fonctionnalités**: génération et stockage de refresh tokens, cookies sécurisés `realestate_access_token` et `realestate_refresh_token`, Google OAuth redirect/callback flow, email verification resend flow avec rate-limit par email.

### Service Users
- **Prisma**: User, SellerStats models
- **Routes**: /users CRUD + /stats (À implémenter)

---

## Configuration et variables d'environnement

### .env (racine backend/)

```env
PORT_BACKEND=3000
API_AUTH_URL_SERVICE=http://127.0.0.1:3001
API_USER_URL_SERVICE=http://127.0.0.1:3002
INTERNAL_SECRET=change-in-prod
DATABASE_URL=postgresql://tyrell:secret123@pg-docker:5432/ma_base
```

### Variables par service

**Gateway**:
- PORT_BACKEND (défaut 3000)
- API_AUTH_URL_SERVICE (défaut http://127.0.0.1:3001)
- INTERNAL_SECRET (obligatoire)

**Auth Service**:
- PORT_AUTH_SERVICE (défaut 3001)
- INTERNAL_SECRET (doit matcher gateway)

**Users Service**:
- PORT_USER_SERVICE (défaut 3002)
- INTERNAL_SECRET (doit matcher gateway)

---

## Points d'entrée HTTP

### Routes exposées (via Gateway)

| Méthode | Path | Service | Status |
|---------|------|---------|--------|
| GET | `/` | Gateway | ✅ |
| `*` | `/auth/*` | Auth | ✅ (login, register, verify-email, resend-email, refresh, google, google/callback)
| `*` | `/users/*` | Users | ⚠️ Not implemented |
| `*` | `/orders/*` | - | ❌ Not configured |

### Sécurité en cascade

1. CORS validation
2. Rate limit (100 req/10s per IP)
3. Payload size (≤10 MB)
4. Helmet (CSP, HSTS, etc.)
5. Route filtering
6. Service auth (x-internal-gateway header)

---

## Modèles de données

**Voir [PRISMA_MODELS.md](./PRISMA_MODELS.md) pour documentation complète.**

### Modèles principaux

- **refresh_token** (Auth DB): tokens hashés
- **User** (Users DB): email, phone, role, trustScore
- **SellerStats** (Users DB): listings, ratings, response rates

---

## Sécurité

### Risques et mitigations

| Risque | Sévérité | Mitigation |
|--------|----------|-----------|
| DoS | HIGH | Rate limit 100/10s |
| MITM | HIGH | HSTS, CORS |
| Secrets leak | CRITICAL | Vault required |
| Weak auth | CRITICAL | TODO: 2FA, OAuth |

### Variables sensibles

- `INTERNAL_SECRET`: Vault, 90-day rotation
- `DATABASE_URL`: Vault, per-environment

---

## Déploiement et démarrage

### Local (Docker)

```bash
# Start DB
docker-compose up -d db pgadmin

# Start gateway
cd backend/backend && npm install && npm run dev

# In another terminal - start auth
cd ../services/auth && npm install && npm run dev

# In another terminal - start users
cd ../services/users && npm install && npm run dev
```

### Health checks

```bash
curl http://localhost:3000/
curl -H "x-internal-gateway: SECRET" http://localhost:3001/api/auth
```

---

### Changements récents à valider

- Appliquer les migrations Prisma pour le service Auth (ajout du champ `sub`, relaxation des contraintes):
    ```bash
    cd backend/services/auth && npx prisma migrate deploy
    ```
- Vérifier les variables d'environnement Google/OAuth:
    - `REDIRECT_URI`, `AUTH_URL`, `TOKEN_URL`, `USER_INFO_URL`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`
- Tester le bouton Google dans `backend/api-tester.html` (redirige vers `/auth/google`).
- Vérifier que les cookies `realestate_access_token` et `realestate_refresh_token` sont correctement posés après login/refresh.


## Checklist de validation

- [ ] All services start without errors
- [ ] Health checks pass (GET /)
- [ ] CORS working from frontend
- [ ] Rate limit enforced (100 req/10s)
- [ ] Security headers present
- [ ] Prisma migrations applied
- [ ] Auth endpoints implemented
- [ ] Users endpoints implemented

---

## Références

- [Detailed Prisma documentation](./PRISMA_MODELS.md)
- [File-by-file documentation](./files/)
- [Fastify Documentation](https://www.fastify.io/)
- [Prisma Documentation](https://www.prisma.io/docs/)

---

**v1.1.0 — 18 Décembre 2024**
