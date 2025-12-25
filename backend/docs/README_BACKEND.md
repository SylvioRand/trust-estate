# Backend — Documentation complète

**Résumé**
- **But**: Fournir la documentation complète du backend du projet (Gateway + Auth Service).
- **Audience**: développeurs découvrant le projet ou devant le déployer.

**Architecture Simplifiée**
Actuellement, le backend se compose de deux services principaux :
1. **Gateway** (Port 3000) : Point d'entrée unique, Reverse Proxy, pare-feu applicatif.
2. **Auth Service** (Port 3001) : Gère l'authentification (Tokens, OAuth) ET les données utilisateurs (Profils, Stats).

**Comportements applicatifs (haute-niveau)**
- **Gateway central**: écoute sur `PORT_BACKEND` (par défaut 3000).
- **Filtrage d'accès**: le gateway n'expose que les routes configurées (`/auth/*`, `/api/profile`, etc.).
- **Auth Service**: écoute sur `PORT_AUTH_SERVICE` (par défaut 3001). Il contient toute la logique Prisma et la base de données.
- **Sécurité interne**: communication inter-services protégée par un `INTERNAL_SECRET`.

**Structure des dossiers**
- **backend/** (racine du backend)
  - **gateway/**: application gateway
    - src/
      - app.ts — point d'entrée
      - module/ — routes et proxy config
  - **services/**
    - **auth/**
      - src/ — logique auth et users
      - prisma/schema.prisma — modèles complets (User, RefreshToken, Stats)
  - **docs/** — documentation

**Démarrage Rapide**

1. **Variables d'environnement**
   Copiez `.env.example` en `.env` à la racine et configurez `DATABASE_URL`.

2. **Démarrage (Mode Dev)**

```bash
# Gateway
cd gateway
npm install
npm run dev

# Auth Service
cd services/auth
npm install
npx prisma generate
npm run dev
```

**Base de données / Prisma**
Tout le schéma de base de données est centralisé dans `services/auth/prisma/schema.prisma`.
Pour appliquer les changements :
```bash
cd services/auth
npx prisma migrate dev
```

**Liens Utiles**
- [Documentation Architecture Gateway](docs/architecture/gateway.md)
- [Documentation Auth Service](docs/architecture/auth-service.md)
- [Modèles de Données](docs/PRISMA_MODELS.md)
