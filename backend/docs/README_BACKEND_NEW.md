# Backend — Documentation Technique Complète (v1.2)

**Date de génération**: 23 Décembre 2024  
**Version**: 1.2.0  
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

Le backend du projet ft_transcendence est une **architecture microservices** avec un **API Gateway central** qui orchestre l'accès à services internes spécialisés:

- **Gateway (port 3000)**: Reverse proxy HTTP qui filtre et redirige les requêtes
- **Auth Service (port 3001)**: Gestion de l'authentification, tokens JWT, email verification, OAuth Google (en cours)
- **Users Service (port 3002)**: Gestion des profils, rôles, statistiques vendeur (À implémenter)

### Stack technique

| Composant | Technologie | Version |
|-----------|-------------|---------|
| **Framework HTTP** | Fastify | 5.6.2 |
| **Language** | TypeScript | 5.9.3 |
| **ORM** | Prisma | 6.10.0 |
| **Base de données** | PostgreSQL | 16 |
| **Auth** | JWT + Cookies + bcrypt | Multiples |
| **Email** | Gmail SMTP + nodemailer | 7.0.12 |
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

### Service Auth (IMPLÉMENTÉ)
- **Plugins**: JWT, Prisma, Mail (fastify-mailer), Cookies
- **Dépendances**: bcrypt, nodemailer, @prisma/client
- **Routes**: 
  - POST /login - Authentification utilisateur
  - POST /register - Création de compte avec email verification
  - POST /verify-email - Activation du compte
  - POST /resend-email - Renvoyer l'email de vérification
  - POST /refresh - Refresh JWT token (placeholder)
  - POST /logout - Déconnexion (placeholder)
  - POST /oauth/google - OAuth Google (placeholder)
- **Models Prisma**: User, SellerStats, refresh_token, email_Verification_token
- **Fonctionnalités**: 
  - Password hashing avec bcrypt (salt rounds: 12)
  - JWT tokens (access: 15min, refresh: 7 days)
  - Email notifications via Gmail SMTP
  - Token verification avec expiration
  - Rate limiting sur email resend (3/5min)
  - HTTP-only secure cookies pour tokens

### Service Users (À IMPLÉMENTER)
- **Prisma**: User, SellerStats models
- **Routes**: /users CRUD + /stats
- **Status**: Non encore implémenté

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
- JWT_SECRET (pour signer les access tokens) - obligatoire
- JWT_REFRESH_SECRET (pour signer les refresh tokens) - obligatoire
- GOOGLE_CLIENT_ID (pour OAuth Google) - obligatoire
- GOOGLE_CLIENT_SECRET (pour OAuth Google) - obligatoire
- GMAIL_USER (adresse email Gmail pour notifications) - obligatoire
- GMAIL_APP_PASSWORD (mot de passe application Gmail) - obligatoire
- COOKIE_SECRET (pour signer les cookies) - défaut: COOKIE_SECRET_KEY
- FRONTEND_URL (URL du frontend pour liens verification) - défaut: http://localhost:8080
- DATABASE_URL (connection string PostgreSQL) - obligatoire

**Users Service**:
- PORT_USER_SERVICE (défaut 3002)
- INTERNAL_SECRET (doit matcher gateway)
- DATABASE_URL (connection string PostgreSQL) - obligatoire

---

## Points d'entrée HTTP

### Routes exposées (via Gateway)

| Méthode | Path | Service | Status | Description |
|---------|------|---------|--------|-------------|
| POST | `/auth/login` | Auth | ✅ Implémenté | Authentification utilisateur |
| POST | `/auth/register` | Auth | ✅ Implémenté | Création de compte |
| POST | `/auth/verify-email` | Auth | ✅ Implémenté | Vérification email avec token |
| POST | `/auth/resend-email` | Auth | ✅ Implémenté | Renvoi email vérification |
| POST | `/auth/logout` | Auth | ⚠️ Placeholder | Déconnexion utilisateur |
| POST | `/auth/refresh` | Auth | ⚠️ Placeholder | Refresh token JWT |
| POST | `/auth/oauth/google` | Auth | ⚠️ Placeholder | Authentification OAuth Google |
| `*` | `/users/*` | Users | ⚠️ Not implemented | Gestion utilisateurs |

### Sécurité en cascade

1. CORS validation
2. Rate limit (100 req/10s per IP)
3. Helmet protection headers
4. Email verification requirement (certains endpoints)
5. JWT token validation
6. Rate limit spécial: 3 tentatives/5min par email (resend-email)
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
| Weak password | CRITICAL | Min 12 chars, uppercase, lowercase, number, special char |
| Email verification | HIGH | Token avec expiration 24h |
| Password storage | CRITICAL | Bcrypt avec salt rounds 12 |
| SQL Injection | LOW | Prisma ORM protection |

### Variables sensibles

- `INTERNAL_SECRET`: Vault, 90-day rotation
- `JWT_SECRET`: Vault, strong random string
- `JWT_REFRESH_SECRET`: Vault, strong random string
- `GMAIL_APP_PASSWORD`: Vault (not actual password, app-specific)
- `DATABASE_URL`: Vault, per-environment

### Implémentations de sécurité Auth Service

- **Password hashing**: bcrypt avec salt rounds 12
- **Token storage**: HTTP-only, Secure, SameSite=none cookies
- **Email verification**: SHA256 hash des tokens
- **Rate limiting**: 3 tentatives par 5 minutes sur resend-email
- **CORS**: Configuré avec whitelist frontend
- **Helmet**: Protection contre XSS, clickjacking, etc.

---

## Déploiement et démarrage

### Local (Docker)

```bash
# Start DB
docker-compose up -d

# Start gateway
cd backend/gateway && npm install && npm run dev

# In another terminal - start auth
cd backend/services/auth && npm install && npm run dev

# In another terminal - start users (once implemented)
cd backend/services/users && npm install && npm run dev
```

### Configuration pour l'Auth Service

Avant de démarrer le service auth, assurez-vous que le fichier `.env` dans `backend/services/auth/` contient:

```env
PORT_AUTH_SERVICE=3001
INTERNAL_SECRET=your-internal-secret
JWT_SECRET=your-jwt-secret-key
JWT_REFRESH_SECRET=your-refresh-secret
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GMAIL_USER=your-email@gmail.com
GMAIL_APP_PASSWORD=your-app-password
COOKIE_SECRET=your-cookie-secret
FRONTEND_URL=http://localhost:8080
DATABASE_URL=postgresql://user:password@localhost:5432/dbname
```

### Vérification du déploiement

1. **Gateway**: http://localhost:3000/
2. **Auth Service**: http://localhost:3001/
3. **Test API**: Ouvrir `/backend/api-tester.html` dans le navigateur

### Migrations Prisma

```bash
# Pour Auth Service
cd backend/services/auth
npx prisma migrate deploy  # Apply latest migrations
npx prisma studio        # Voir la DB dans une interface web
```

### Logs de démarrage attendus

```
Auth Service startup:
- ✅ Loading config from env
- ✅ Connecting to database
- ✅ Registering JWT plugin
- ✅ Registering Prisma plugin  
- ✅ Registering Mail plugin
- ✅ Registering Cookie plugin
- ✅ Registering auth routes
- ✅ Server listening on http://localhost:3001
```
```

### Health checks

```bash
curl http://localhost:3000/
curl -H "x-internal-gateway: SECRET" http://localhost:3001/api/auth
```

---

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
