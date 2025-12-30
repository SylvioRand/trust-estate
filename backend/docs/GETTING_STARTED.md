# 🚀 GETTING STARTED

## Démarrage Rapide

Ce guide vous aide à lancer le backend complet (Gateway + Auth Service) en quelques minutes.

### Prérequis
- Node.js (v18+)
- Docker (pour la base de données PostgreSQL)
- NPM ou PNPM

### Installation

1. **Cloner le repo**
```bash
git clone <repo_url>
cd backend
```

2. **Démarrer la Base de Données**
```bash
docker-compose up -d db
```

3. **Configurer et Lancer le Auth Service**
C'est le service principal qui gère utilisateurs et authentification.
```bash
cd services/auth
cp .env.example .env
npm install
npx prisma generate
npx prisma migrate dev
npm run dev
```

4. **Configurer et Lancer la Gateway**
Le point d'entrée de votre API.
```bash
cd ../../gateway
cp .env.example .env
npm install
npm run dev
```

### Vérification
Ouvrez votre navigateur ou Postman :
- **Gateway Health**: `http://localhost:3000/` (Devrait répondre "Bonjour")
- **Login**: `POST http://localhost:3000/auth/login`

## Architecture

```
Client  -->  [Gateway :3000]  -->  [Auth Service :3001]  -->  [PostgreSQL]
```

## Documentation
Pour plus de détails :
- [Modèles de données (Prisma)](PRISMA_MODELS.md)
- [Architecture Gateway](architecture/gateway.md)
- [Flux d'Authentification](flows/authentication.md)
