# Backend — Documentation complète

**Résumé**
- **But**: Fournir la documentation complète du backend du projet (gateway + services `auth` et `users`).
- **Audience**: développeurs découvrant le projet ou devant le déployer.

**Comportements applicatifs (haute-niveau)**
- **Gateway central**: écoute sur `PORT_BACKEND` (par défaut 3000). Il enregistre des modules, des hooks et des routes et agit comme reverse gateway vers les services internes.
- **Filtrage d'accès**: le gateway n'expose que les préfixes de route suivants: `/auth`, `/users`, `/orders`. Toute autre requête renverra 404 (voir [backend/backend/src/app.ts](backend/backend/src/app.ts)).
- **Service Auth**: service interne pour l'authentification, écoute sur `PORT_AUTH_SERVICE` (par défaut 3001). Toutes les requêtes doivent porter l'en-tête `x-internal-gateway` valant la valeur `INTERNAL_SECRET`, sinon 403 (voir [backend/services/auth/src/app.ts](backend/services/auth/src/app.ts)).
- **Service Users**: service interne pour la gestion des utilisateurs, écoute sur `PORT_USER_SERVICE` (par défaut 3002). Même exigence d'en-tête `x-internal-gateway`.
- **Routes d'exemple**:
  - Gateway: `GET /` → message de santé (`Bonjour`).
  - Auth: `GET /api/auth` → message de santé d'auth (`Bonjour depuis auth`).
  - (Les routes métiers réelles sont définies dans les modules et contrôleurs des services, voir la section "Fichiers importants".)

**Logique métier (points clés)**
- **Sécurité interne**: communication inter-services protégée par `INTERNAL_SECRET` transmis via l'en-tête `x-internal-gateway`.
- **Reverse proxy**: le gateway centralise l'accès et redirige vers les services internes (configuration via `@fastify/http-proxy` possible dans les modules).
- **Token refresh**: le service `auth` contient un modèle `refresh_token` (Prisma) pour stocker des tokens rafraîchis (hash, userId, expiresAt).
- **Utilisateurs & statistiques**: le service `users` modèle `User` et `SellerStats` avec champs utiles (role, trustScore, listings, ratings, etc.).

**Structure des dossiers**
- **backend/** (racine du backend)
  - **backend/**: application gateway (principal)
    - src/
      - app.ts — point d'entrée du gateway ([backend/backend/src/app.ts](backend/backend/src/app.ts))
      - module/ — modules du gateway (enregistrement des routes, hooks)
  - **services/**
    - **auth/**
      - src/app.ts — point d'entrée du service auth ([backend/services/auth/src/app.ts](backend/services/auth/src/app.ts))
      - prisma/schema.prisma — modèle `refresh_token` ([backend/services/auth/prisma/schema.prisma](backend/services/auth/prisma/schema.prisma))
      - package.json — dépendances et scripts ([backend/services/auth/package.json](backend/services/auth/package.json))
    - **users/**
      - src/app.ts — point d'entrée du service users ([backend/services/users/src/app.ts](backend/services/users/src/app.ts))
      - prisma/schema.prisma — modèles `User`, `SellerStats` ([backend/services/users/prisma/schema.prisma](backend/services/users/prisma/schema.prisma))
      - package.json — dépendances et scripts ([backend/services/users/package.json](backend/services/users/package.json))
  - docker-compose.yml — orchestration (si présent) ([backend/docker-compose.yml](backend/docker-compose.yml))
  - docs/ — documentation (ici) ([backend/docs/README_BACKEND.md](backend/docs/README_BACKEND.md))

**Fichiers importants**
- **Gateway**: [backend/backend/src/app.ts](backend/backend/src/app.ts)
- **Gateway env schema**: [backend/backend/src/module/backend.schema.ts](backend/backend/src/module/backend.schema.ts)
- **Auth service**: [backend/services/auth/src/app.ts](backend/services/auth/src/app.ts)
- **Auth Prisma**: [backend/services/auth/prisma/schema.prisma](backend/services/auth/prisma/schema.prisma)
- **Auth env schema**: [backend/services/auth/src/config/env.schema.ts](backend/services/auth/src/config/env.schema.ts)
- **Users service**: [backend/services/users/src/app.ts](backend/services/users/src/app.ts)
- **Users Prisma**: [backend/services/users/prisma/schema.prisma](backend/services/users/prisma/schema.prisma)
- **Users env schema**: [backend/services/users/src/config/env.schema.ts](backend/services/users/src/config/env.schema.ts)

**Dépendances principales**
- **Framework HTTP**: `fastify` (+ `fastify-plugin`).
- **Sécurité & utilitaires**: `@fastify/helmet`, `@fastify/cors`, `dotenv`, `@fastify/env`, `@fastify/rate-limit`.
- **Prisma & Postgres (services)**: `@prisma/client`, `prisma`, `pg`, `@prisma/adapter-pg`.
- **Dev**: `nodemon`, `ts-node`, `typescript`.
(Se référer aux `package.json` par service pour la liste complète: [backend/backend/package.json](backend/backend/package.json), [backend/services/auth/package.json](backend/services/auth/package.json), [backend/services/users/package.json](backend/services/users/package.json)).

**Configuration & variables d'environnement**
- **Gateway** ([backend/backend/src/module/backend.schema.ts](backend/backend/src/module/backend.schema.ts)):
  - `PORT_BACKEND` (number) — default 3000
  - `API_AUTH_URL_SERVICE` (string) — URL du service auth (ex: http://127.0.0.1:3001)
  - `INTERNAL_SECRET` (string) — secret partagé for internal requests

- **Auth service** ([backend/services/auth/src/config/env.schema.ts](backend/services/auth/src/config/env.schema.ts)):
  - `PORT_AUTH_SERVICE` (number) — default 3001
  - `INTERNAL_SECRET` (string) — default INTERNAL_SERVICE_SECRET

- **Users service** ([backend/services/users/src/config/env.schema.ts](backend/services/users/src/config/env.schema.ts)):
  - `PORT_USER_SERVICE` (number) — default 3002
  - `INTERNAL_SECRET` (string)

- **Base de données (Prisma)**:
  - `DATABASE_URL` — chaîne de connexion PostgreSQL utilisée par Prisma dans chaque service.

Exemple minimal `.env` (à la racine `backend/`):

```env
PORT_BACKEND=3000
API_AUTH_URL_SERVICE=http://127.0.0.1:3001
PORT_AUTH_SERVICE=3001
PORT_USER_SERVICE=3002
INTERNAL_SECRET=SUPER_SECRET_INTERNAL
DATABASE_URL=postgresql://user:pass@localhost:5432/dbname
```

**Base de données / Prisma**
- Le service `auth` contient le modèle `refresh_token` (id, userId, tokenHash, expiresAt). Voir [backend/services/auth/prisma/schema.prisma](backend/services/auth/prisma/schema.prisma).
- Le service `users` contient `User` et `SellerStats` avec relations et index utiles. Voir [backend/services/users/prisma/schema.prisma](backend/services/users/prisma/schema.prisma).
- Génération client: `prisma generate` est configurée dans les `devDependencies` des services.

**Scripts et commandes utiles**
- Démarrer en dev (chaque service):

```bash
# Gateway
cd backend/backend
npm install
npm run dev

# Auth
cd backend/services/auth
npm install
npm run dev

# Users
cd backend/services/users
npm install
npm run dev
```

- Build & run (production):

```bash
# build
npm run build
# start (example containerized start expects /app/dist/app.js)
npm run start
```

- Avec Docker Compose (si présent):

```bash
cd backend
docker-compose up --build -d
```

**Sécurité & bonnes pratiques**
- **Ne pas exposer `INTERNAL_SECRET` publiquement**: il sécurise la communication inter-service via l'en-tête `x-internal-gateway`.
- **Limiter les origines CORS**: les services enregistrent des origins spécifiques (ex: `http://127.0.0.1:3001`) — ajuster en fonction de l'environnement.
- **Validation d'input**: utiliser les schémas `fastify` (ajouter validations JSON-Schema pour toutes les routes métiers).
- **Rate limiting & helmet**: les plugins `@fastify/rate-limit` et `@fastify/helmet` sont inclus comme plugins dans `package.json` — activer et configurer selon besoin.

**Développement &  checklist de contribution rapide**
- Vérifier les variables d'environnement dans `.env` à la racine `backend/`.
- Lancer les services en mode dev (voir scripts ci-dessus).
- Pour les migrations Prisma: dans chaque service contenant `prisma/`:

```bash
cd backend/services/<service>
npm run prisma:migrate # (si script défini) ou utiliser prisma cli
```

- Ajouter des tests unitaires et d'intégration pour les routes exposées.

**Contact & prochaines étapes recommandées**
- Documenter les routes métiers détaillées dans chaque service (controllers/routes) et ajouter un fichier `API_SPEC.md` par service.
- Ajouter des scripts `docker`/`k8s` plus complets pour staging/production.

---

Si vous voulez, je peux:
- générer un `API_SPEC.md` détaillé en parcourant les routes existantes dans `src/`,
- ajouter un exemple Postman collection ou des tests d'intégration.

Indiquez ce que vous préférez que je fasse ensuite.
