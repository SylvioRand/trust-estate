# backend/src/app.ts — Point d'entrée du API Gateway

## Métadonnées
- **Chemin relatif**: `backend/backend/src/app.ts`
- **Type**: Entry point (Bootstrap)
- **Responsabilité métier**: Initialiser et démarrer le serveur gateway central qui orchestre le routage vers les services internes.

## Résumé exécutif
Ce fichier constitue le point d'entrée du gateway API central. Il initialise une instance Fastify, enregistre les plugins de sécurité (CORS, rate limiting, helmet), charge les variables d'environnement, met en place des hooks de validation et configure le reverse proxy vers les services internes (auth, users, orders).

## Imports et dépendances
```typescript
import fastify from "fastify";
import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import fastifyEnv from '@fastify/env'
import dotenv from 'dotenv';
import { envSchema } from "./module/backend.schema.ts";
import { moduleRegister } from "./module/back.module.ts";
import fastifyCors from "@fastify/cors";
import { addHooks } from "./module/hook.ts";
import { gatewayRoutes } from "./module/routes.ts";
```

**Dépendances clés**:
- `fastify`: Framework HTTP minimaliste et performant
- `@fastify/env`: Plugin de gestion des variables d'environnement avec validation JSON Schema
- `@fastify/cors`: Plugin de gestion CORS
- `dotenv`: Chargement des fichiers .env
- `moduleRegister`: Enregistrement des plugins globaux (rate limiting, helmet)
- `addHooks`: Ajout des hooks globaux (validation, sécurité)
- `gatewayRoutes`: Configuration du reverse proxy vers services

## Flux d'exécution (bloc par bloc)

### 1. Chargement des variables d'environnement (lignes 13-18)
```typescript
const dir = "../.env";
try {
	dotenv.config({ path: dir });
} catch (error: any) {
	console.log(error);
}
```
**But**: Charger le fichier `.env` situé au niveau parent du répertoire courant.
**Détail**:
- Chemin relatif: `../` depuis le répertoire du script compilé (`dist/app.js` en production)
- Le fichier `.env` doit être à `backend/.env`
- Erreurs capturées mais seulement loggées (pas de exit)

### 2. Configuration Fastify et schéma d'environnement (lignes 21-25)
```typescript
const options = {
	confKey: 'config',
	schema: envSchema,
	dotenv: true,
	data: process.env
}
```
**But**: Préparer les options pour le plugin `@fastify/env`.
**Configuration**:
- `confKey: 'config'`: Les variables validées seront accessibles via `app.config`
- `schema: envSchema`: Validation via JSON Schema défini dans `backend.schema.ts`
- `dotenv: true`: Utilise également dotenv en interne
- `data: process.env`: Source des variables

### 3. Création de l'instance Fastify (lignes 28-31)
```typescript
const server : FastifyInstance = fastify({
	logger: {
		level: 'info',
	},
	trustProxy: true
});
```
**But**: Créer l'instance du serveur gateway.
**Options**:
- `logger.level: 'info'`: Logs au niveau info (production-friendly)
- `trustProxy: true`: Fait confiance aux headers X-Forwarded-* (pour docker/reverse proxy)

### 4. Enregistrement du plugin CORS (lignes 33-40)
```typescript
await server.register(fastifyCors, {
	origin: ['http://127.0.0.1:3000'],
	methods: ['GET','POST','PUT'],
	allowedHeaders: ['Content-Type','Authorization'],
	exposedHeaders: ['X-Total-Count'],
	credentials:true,
	maxAge:600
});
```
**But**: Autoriser les requêtes cross-origin avec une whitelist stricte.
**Configuration**:
- `origin`: Seul localhost:3000 est autorisé (frontend prévu)
- `methods`: GET, POST, PUT (DELETE non exposé)
- `allowedHeaders`: Content-Type et Authorization (Standard)
- `credentials: true`: Autoriser les cookies/credentials
- `maxAge: 600`: Cache les préflights 10 minutes

**⚠️ SECURITY**: La liste des origines doit être enrichie avec l'URL du frontend en prod.

### 5. Enregistrement du plugin env et modules (lignes 42-43)
```typescript
await server.register(fastifyEnv, options);
await moduleRegister(server);
```
**But**:
- Charger et valider les variables d'environnement
- Enregistrer les plugins globaux (rate limiting, helmet)
**Détail**: `moduleRegister` est défini dans [backend/backend/src/module/back.module.ts](../../module/back.module.ts)

### 6. Ajout des hooks (ligne 44)
```typescript
await addHooks(server);
```
**But**: Ajouter les hooks Fastify pour la sécurité et la validation.
**Détail**: Défini dans [backend/backend/src/module/hook.ts](../../module/hook.ts)

### 7. Configuration du reverse proxy (ligne 45)
```typescript
await gatewayRoutes(server);
```
**But**: Enregistrer les routes du gateway qui proxifient vers les services internes.
**Détail**: Défini dans [backend/backend/src/module/routes.ts](../../module/routes.ts)

### 8. Hook de filtrage global (lignes 47-52)
```typescript
server.addHook('onRequest', async (req, reply) => {
	const allowedPrefixes = ['/auth', '/users', '/orders']

	if (!allowedPrefixes.some(p => req.url.startsWith(p))) {
		return reply.code(404).send({ error: 'Route non exposée' })
	};
});
```
**But**: Filtrer les accès aux seules routes exposées.
**Détail**:
- Préfixes autorisés: `/auth`, `/users`, `/orders`
- Toute autre route → 404 avec message d'erreur
- **Note**: `/orders` est déclaré mais ne semble pas implémenté (TODO)

### 9. Route de santé (lignes 54-56)
```typescript
server.get("/", async (req:FastifyRequest, reply: FastifyReply) => {
	return reply.status(200).send("Bonjour");
})
```
**But**: Health check / ping simple.
**Réponse**: Texte brut "Bonjour" avec code 200.

### 10. Fonction de démarrage (lignes 58-67)
```typescript
const start = async () => {
	try {
		await server.listen({
			port: parseInt(process.env.PORT_BACKEND || '3000'),
			host: '0.0.0.0'
		});

	} catch (error : any) {
		server.log.error(error);
		process.exit(1);
	}
}

start();
```
**But**: Démarrer le serveur sur le port configuré.
**Détail**:
- Port: Lue depuis `process.env.PORT_BACKEND` (défaut 3000)
- Host: `0.0.0.0` (accessible de l'extérieur du conteneur)
- Erreur fatale: Exit processus (code 1)

## Interfaces et types utilisés
- `FastifyInstance`: Type du serveur Fastify
- `FastifyRequest`: Type de la requête HTTP
- `FastifyReply`: Type de la réponse HTTP
- `EnvConfigInterface`: Interface des variables d'environnement (voir [backend.schema.ts](./backend.schema.ts))

## Variables d'environnement consommées
| Variable | Type | Défaut | Usage |
|----------|------|--------|-------|
| `PORT_BACKEND` | number | 3000 | Port d'écoute du gateway |
| `API_AUTH_URL_SERVICE` | string | http://127.0.0.1:3001 | URL upstream du service auth |
| `INTERNAL_SECRET` | string | - | Clé partagée pour auth inter-services |

**Source de validation**: [backend.schema.ts](./backend.schema.ts)

## Effets de bord et état
1. **Chargement du .env**: Exécuté au démarrage
2. **Écoute réseau**: Le serveur écoute sur le port spécifié
3. **Logging**: Tous les événements sont loggés via Fastify logger
4. **Processus**: Exit en cas d'erreur de démarrage (arrêt du conteneur)

## Sécurité
**Points d'attention**:
- ✅ CORS whitelist restrictive (only localhost:3000)
- ✅ Trust proxy activé (nécessaire en docker)
- ⚠️ Origin whitelist doit être mise à jour en prod
- ⚠️ Le service dépend d'une `INTERNAL_SECRET` partagée (voir auth.ts pour validation)

**En-têtes automatiques**:
- Voir [hook.ts](./module/hook.ts) pour les headers de sécurité ajoutés globalement

## Erreurs et gestion
| Cas | Code HTTP | Message |
|-----|-----------|---------|
| Route non exposée | 404 | `{ error: 'Route non exposée' }` |
| Erreur démarrage | - | Log + exit(1) |

## Complexité et performance
- **Temps de démarrage**: ~500ms (dépend du chargement des plugins)
- **Mémoire**: ~50-100MB en état idle
- **Concurrence**: Fastify gère les connexions async natives

## Tests recommandés
### Unit tests
1. Vérifier que seules les routes `/auth`, `/users`, `/orders` sont accessibles
2. Tester la réponse de la route `/` (health check)

### Integration tests
1. Vérifier que le gateway réachemine les requêtes vers auth
2. Tester le timeout (10s configuré dans gateway.ts)
3. Vérifier la validation des variables d'env

### E2E tests
1. Démarrer le gateway et les services
2. Envoyer une requête `/auth/login` et vérifier le proxying
3. Envoyer une requête invalide (`/invalid`) et vérifier le 404

## Exemples curl
```bash
# Health check
curl -i http://localhost:3000/

# Tentative d'accès route non exposée
curl -i http://localhost:3000/admin

# Tentative d'accès auth (une fois le service auth démarré)
curl -i -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "test@test.com"}'
```

## Patterns et observations
1. **Fastify as gateway**: Usage de `@fastify/http-proxy` pour le reverse proxying (voir [gateway.ts](./module/gateway.ts))
2. **Config-first**: Les variables d'env sont validées au démarrage (fail-fast)
3. **Module-based**: Architecture modulaire (hooks, routes, plugins séparés)

## Références de code source
- [backend/backend/src/app.ts (full file)](../../app.ts)
- Liens pour les dépendances:
  - [backend/backend/src/module/back.module.ts](../../module/back.module.ts)
  - [backend/backend/src/module/hook.ts](../../module/hook.ts)
  - [backend/backend/src/module/routes.ts](../../module/routes.ts)
  - [backend/backend/src/module/backend.schema.ts](../../module/backend.schema.ts)

## TODO / À CONFIRMER
- **TODO**: La route `/orders` est déclarée dans le filtrage mais non implémentée. Confirmer si elle est planifiée.
- **TODO**: Vérifier si `API_USER_URL_SERVICE` est utilisée. Elle n'est pas enregistrée de route vers `/users` dans `gatewayRoutes`.
- **ASSUMPTION**: Le frontend est supposé être sur `http://127.0.0.1:3000` pour CORS. À adapter selon le déploiement réel.
