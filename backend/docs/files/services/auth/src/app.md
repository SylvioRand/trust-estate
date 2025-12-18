# services/auth/src/app.ts — Service d'authentification

## Métadonnées
- **Chemin relatif**: `backend/services/auth/src/app.ts`
- **Type**: Entry point (microservice)
- **Responsabilité métier**: Exposer les endpoints d'authentification (login, register, refresh, oauth, 2FA) à travers une API interne sécurisée.

## Résumé exécutif
Service autonome qui gère toute la logique d'authentification. Il écoute sur le port `PORT_AUTH_SERVICE` (3001 par défaut) et rejette les requêtes sans le header `x-internal-gateway` valide.

## Imports et dépendances
```typescript
import fastify from "fastify";
import type { FastifyReply, FastifyRequest } from "fastify";
import dotenv from 'dotenv';
import fastifyEnv from '@fastify/env'
import { envSchema } from "./config/env.schema.ts";
import fastifyCors from "@fastify/cors";
```

## Flux d'exécution

### 1. Chargement des variables d'environnement (lignes 8-13)
```typescript
const dir = "../../.env";

try {
	dotenv.config({ path: dir });
} catch (error: any) {
	console.log(error);
};
```

**But**: Charger le fichier `.env` au niveau parent.
**Chemin**: `../../.env` depuis le répertoire compilé

### 2. Configuration du plugin env (lignes 15-20)
```typescript
const options = {
	confKey: 'config',
	schema: envSchema,
	dotenv: true,
	data: process.env
};
```

Identique au gateway. Exposera `app.config.PORT_AUTH_SERVICE` et `app.config.INTERNAL_SECRET`.

### 3. Création du serveur (lignes 22-24)
```typescript
const server = fastify({
	logger: true
});
```

**Note**: Logger au niveau debug (tous les events).

### 4. Enregistrement du plugin CORS (lignes 26-32)
```typescript
await server.register(fastifyCors, {
	origin: ['http://127.0.0.1:3001'],
	methods: ['GET','POST','PUT'],
	allowedHeaders: ['Content-Type','Authorization'],
	exposedHeaders: ['X-Total-Count'],
	credentials:true,
	maxAge:600
});
```

**⚠️ NOTE**: CORS limité à localhost:3001. À adapter en prod.

### 5. Enregistrement des plugins (lignes 34-35)
```typescript
await server.register(fastifyEnv, options);
```

### 6. Hook d'authentification interne (lignes 37-45)
```typescript
server.addHook('onRequest', async (req, reply) => {
	console.log(req.server.config);
	console.log("HELLO", req.headers['x-internal-gateway'], req.server.config.INTERNAL_SECRET );
	if (req.headers['x-internal-gateway'] !== server.config.INTERNAL_SECRET || !req.headers['x-internal-gateway']) {
		return reply.code(403).send({
				"error": "forbidden",
				"message": "Vous n'avez pas la permission d'effectuer cette action"
				});
	}
});
```

**But**: Validez que seules les requêtes provenant du gateway (avec le bon header) sont traitées.

**Logique**:
1. Affiche la config (debug)
2. Affiche le header `x-internal-gateway` reçu (debug)
3. Vérifie: `x-internal-gateway` === `INTERNAL_SECRET`
4. Si invalid: répondre 403 Forbidden

**⚠️ SECURITY**: Ce hook bloque tous les accès directs au service (protection contre les contournements du gateway).

**⚠️ DEBUG**: Les `console.log()` doivent être loggés de manière sécurisée en prod (ne pas exposer les secrets).

### 7. Route de santé (lignes 48-50)
```typescript
server.get("/api/auth", async (req:FastifyRequest, reply: FastifyReply) => {
	return reply.status(200).send("Bonjour depuis auth");
});
```

**But**: Endpoint simple de health check.
**Path**: `GET /api/auth` (note: non `/auth` car rewritePrefix le réécrire)

### 8. Fonction de démarrage (lignes 52-64)
```typescript
const start = async () => {
	try {
		await server.listen({
			port: parseInt(server.config.PORT_AUTH_SERVICE || '3001'),
			host: '0.0.0.0'
		});

	} catch (error : any) {
		server.log.error(error);
		process.exit(1);
	}
};

start();
```

**But**: Écouter sur le port configuré.

## Variables d'environnement consommées
| Variable | Type | Défaut | Usage |
|----------|------|--------|-------|
| `PORT_AUTH_SERVICE` | number | 3001 | Port du service |
| `INTERNAL_SECRET` | string | - | Authentification du gateway |

**Source**: [env.schema.ts](./config/env.schema.ts)

## Endpoints déclarés

### Actuellement implémenté
- `GET /api/auth` → "Bonjour depuis auth" (health check)

### Déclarés dans routes.ts (implémentation TODO)
- `POST /login`
- `POST /login-phone`
- `POST /register`
- `POST /logout`
- `POST /refresh`
- `POST /oauth/google`

**Plus (en routes.ts)**:
- `POST /verification/*`
- `POST /two-fa/*`
- `POST /password/*`

**Note**: Aucun de ces endpoints n'est implémenté (authControllers est vide ou undefined).

## Sécurité
| Aspect | Status | Détail |
|--------|--------|--------|
| **Auth inter-services** | ✅ | Header `x-internal-gateway` validé |
| **Public access** | ⚠️ | Pas de CORS au service (OK), mais gateway doit être trusted |
| **Logging** | ⚠️ | console.log() affiche config/secrets (danger en prod) |
| **TLS/HTTPS** | ❌ | Pas d'HTTPS intra-service (OK en docker network) |

## Prérequis non satisfaits
1. ❌ Prisma client non initialisé (no prisma.generate call)
2. ❌ Contrôleurs Auth vides (auth.controllers.ts)
3. ❌ Services Auth vides (auth.services.ts)
4. ❌ Schémas vides (auth.schema.ts)

## Effets de bord
1. Écoute réseau sur PORT_AUTH_SERVICE
2. Valide tous les accès via hook
3. Logs debug en console

## Gestion des erreurs
| Cas | Code | Détail |
|-----|------|--------|
| Auth invalid | 403 | "forbidden" |
| Erreur démarrage | - | Log + exit(1) |

## Tests recommandés
### Unit
1. Tester le hook d'authentification (request avec/sans header)
2. Tester la normalisation du `x-internal-gateway`

### Integration
1. Envoyer `GET /api/auth` sans header → 403
2. Envoyer `GET /api/auth` avec header valide → 200
3. Via gateway: `/auth/` → proxifié vers `/api/auth/`

### E2E
```bash
# Sans header (doit fail)
curl -i http://localhost:3001/api/auth

# Avec header (doit pass si secret correct)
curl -i -H "x-internal-gateway: INTERNAL_SERVICE_SECRET" http://localhost:3001/api/auth
```

## Références
- [backend/services/auth/src/app.ts (full file)](../../auth/src/app.ts)
- [backend/services/auth/src/config/env.schema.ts](./config/env.schema.ts)
- [backend/services/auth/src/modules/routes/auth.routes.ts](./modules/routes/auth.routes.ts) (routes déclarées)
- [backend/services/auth/prisma/schema.prisma](../../auth/prisma/schema.prisma) (modèle)

## TODO / À CONFIRMER
- **TODO**: Implémenter les contrôleurs d'authentification (actuellement vides)
- **TODO**: Implémenter les services d'authentification (hash, JWT, OAuth, etc.)
- **TODO**: Implémenter la validation des schémas
- **TODO**: Remplacer console.log par logging sécurisé (sans afficher les secrets)
- **TODO**: Ajouter support de DATABASE_URL pour Prisma
- **TODO**: Initialiser Prisma client et migrations

## Améliorations suggérées
1. Extraire la logique du hook en middleware réutilisable
2. Ajouter helmet plugin (comme le gateway)
3. Ajouter rate limiting (réduction spécifique pour /login)
4. Ajouter logging structuré avec pino/winston
5. Ajouter support de tracing distribué (pour debug inter-services)
