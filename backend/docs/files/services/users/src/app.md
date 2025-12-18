# services/users/src/app.ts — Service de gestion des utilisateurs

## Métadonnées
- **Chemin relatif**: `backend/services/users/src/app.ts`
- **Type**: Entry point (microservice)
- **Responsabilité métier**: Exposer les endpoints de gestion des utilisateurs (CRUD, stats vendeur, recherche).

## Résumé exécutif
Service autonome qui gère les profils utilisateurs, les statistiques vendeur, et les permissions. Écoute sur le port `PORT_USER_SERVICE` (3002 par défaut). Protégé par le même mécanisme d'authentification inter-services que le service auth.

## Code source et analyse
```typescript
import fastify from "fastify";
import type { FastifyReply, FastifyRequest } from "fastify";
import dotenv from 'dotenv';
import fastifyEnv from '@fastify/env'
import { envSchema } from "./config/env.schema.ts";
import fastifyCors from "@fastify/cors";

const dir = "../../.env";

try {
	dotenv.config({ path: dir });
} catch (error: any) {
	console.log(error);
};

const options = {
	confKey: 'config',
	schema: envSchema,
	dotenv: true,
	data: process.env
};

const server = fastify({
	logger: true
});

await server.register(fastifyEnv, options);

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


server.get("/api/auth", async (req:FastifyRequest, reply: FastifyReply) => {
	return reply.status(200).send("Bonjour depuis auth");
});

const start = async () => {
	try {
		await server.listen({
			port: parseInt(server.config.PORT_USER_SERVICE || '3002'),
			host: '0.0.0.0'
		});

	} catch (error : any) {
		server.log.error(error);
		process.exit(1);
	}
};

start();
```

## Structure et flux
Identique au service auth. Les sections principales:

1. **Chargement env** (lignes 8-12): `../../.env`
2. **Config fastify-env** (lignes 14-19): Expose `app.config`
3. **Création serveur** (lignes 21-23): Logger = true
4. **Enregistrement env plugin** (ligne 25)
5. **Hook de validation** (lignes 27-36): Vérifie `x-internal-gateway`
6. **Route de santé** (lignes 39-41): `GET /api/auth` (devrait être `/users`, voir TODO)
7. **Démarrage** (lignes 43-54): Écoute PORT_USER_SERVICE

## Différences par rapport au auth service
| Aspect | Auth | Users |
|--------|------|-------|
| Port | 3001 (AUTH_SERVICE) | 3002 (USER_SERVICE) |
| Route de santé | `/api/auth` | `/api/auth` ⚠️ (devrait être `/api/users`) |
| Modèle Prisma | `refresh_token` | `User`, `SellerStats` |
| CORS origin | localhost:3001 | ❌ Non enregistré |
| Modules | auth module + routes | ❌ Non implémenté |

## Variables d'environnement
| Variable | Type | Défaut | Usage |
|----------|------|--------|-------|
| `PORT_USER_SERVICE` | number | 3002 | Port du service |
| `INTERNAL_SECRET` | string | - | Auth du gateway |

**Source**: [env.schema.ts](./config/env.schema.ts)

## Sécurité
✅ Same-origin auth via `x-internal-gateway` header
⚠️ Same logging concerns as auth service (console.log secrets)

## Endpoints prévus (non implémentés)
```typescript
// Lecture
GET /users/{id}                  // Récupérer user par ID
GET /users/email/{email}         // Rechercher par email
GET /users/stats/{userId}        // Stats vendeur
GET /users/search?query=...      // Recherche

// Écriture
POST /users                       // Créer user
PUT /users/{id}                   // Mettre à jour
DELETE /users/{id}                // Supprimer

// Stats
GET /users/{id}/stats             // Stats détaillées
PUT /users/{id}/stats             // Mettre à jour stats
```

## Modèles de données disponibles
Voir [schema.prisma](../prisma/schema.prisma):
- `User` (email, phone, role, trustScore, dates, relation SellerStats)
- `SellerStats` (listings, ratings, response rate, index sur note/ventes)

## Prérequis non satisfaits
1. ❌ Prisma client non initialisé
2. ❌ CORS non enregistré (app.ts n'a pas le bloc CORS)
3. ❌ Aucun contrôleur/service implémenté
4. ❌ Route de santé nominalement fausse (`/api/auth` au lieu de `/api/users`)

## Tests recommandés
### Unit
1. Tester l'authentification du hook
2. Tester la validation Prisma (si implémenté)

### Integration
1. Tester `/api/auth` sans header → 403
2. Tester `/api/auth` avec header valide → 200
3. Tester une route users inexistante → 404 (une fois implémentées)

### E2E
```bash
# Créer un user (une fois implémenté)
curl -X POST http://localhost:3000/users \
  -H "Content-Type: application/json" \
  -H "x-internal-gateway: INTERNAL_SECRET" \
  -d '{"email": "test@test.com", "role": "USER"}'

# Récupérer stats vendeur
curl http://localhost:3000/users/123/stats \
  -H "x-internal-gateway: INTERNAL_SECRET"
```

## Références
- [backend/services/users/src/app.ts (full file)](../../users/src/app.ts)
- [backend/services/users/src/config/env.schema.ts](./config/env.schema.ts)
- [backend/services/users/prisma/schema.prisma](../prisma/schema.prisma)

## TODO / À CONFIRMER
- **TODO**: Implémenter les contrôleurs users
- **TODO**: Implémenter les services users (queries Prisma)
- **TODO**: Ajouter le bloc CORS (ou retirer si intra-service uniquement)
- **TODO**: Renommer la route de santé `/api/auth` → `/api/users`
- **TODO**: Initialiser Prisma et migrations
- **TODO**: Remplacer console.log par logging sécurisé

## Améliorations suggérées
1. Factoriser le code de démarrage avec le service auth (super classe/function)
2. Ajouter helmet et rate-limiting
3. Ajouter support de pagination (limit, offset)
4. Ajouter validation des inputs (Zod, Joi)
5. Ajouter logging structuré
