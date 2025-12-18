# backend/src/module/routes.ts — Enregistrement des routes du gateway

## Métadonnées
- **Chemin relatif**: `backend/backend/src/module/routes.ts`
- **Type**: Module (fonction d'enregistrement de routes)
- **Responsabilité métier**: Centraliser la configuration des routes de reverse proxy et les enregistrer via le module gateway.

## Résumé exécutif
Fichier court qui définit la liste des services upstream et enregistre les routes correspondantes. Actuellement, seul le service auth est configuré.

## Imports et dépendances
```typescript
import type { FastifyInstance } from "fastify";
import apiGateway from "./gateway.ts";
import type { GatewayRouteConfig } from "../interfaces/routes.interface.ts";
```

## Signature et interface
```typescript
export async function gatewayRoutes(app: FastifyInstance): Promise<void>
```

## Code source complet
```typescript
export async function gatewayRoutes(app: FastifyInstance) {
	const ROUTES : GatewayRouteConfig[] = [
		{
			prefix: '/auth',
			upstream: app.config.API_AUTH_URL_SERVICE,
			rewritePrefix: '/api/auth'
		}
	];
	await Promise.all(
		ROUTES.map(route => apiGateway(app, route))
	)
}
```

## Flux d'exécution

### 1. Définition du tableau ROUTES (lignes 2-8)
```typescript
const ROUTES : GatewayRouteConfig[] = [
	{
		prefix: '/auth',
		upstream: app.config.API_AUTH_URL_SERVICE,
		rewritePrefix: '/api/auth'
	}
];
```

**Détail**:
- `prefix: '/auth'`: Les requêtes `/auth/*` seront redirigées
- `upstream: app.config.API_AUTH_URL_SERVICE`: Déterminé via env (défaut `http://127.0.0.1:3001`)
- `rewritePrefix: '/api/auth'`: La requête `/auth/login` devient `/api/auth/login` sur l'upstream

**Exemple de réécriture**:
| Requête entrante | Upstream | Path final |
|------------------|----------|-----------|
| `POST /auth/login` | http://localhost:3001 | `POST /api/auth/login` |
| `GET /auth/refresh` | http://localhost:3001 | `GET /api/auth/refresh` |

### 2. Enregistrement parallèle des routes (lignes 9-11)
```typescript
await Promise.all(
	ROUTES.map(route => apiGateway(app, route))
)
```

**Détail**:
- `map`: Crée une Promise pour chaque route (appel à `apiGateway()`)
- `Promise.all`: Attend que toutes les routes soient enregistrées (parallélisation)
- **Impact**: Chaque route crée un nouveau handler HTTP proxy

## Identité et responsabilité
- **Centralisation**: Toutes les routes proxy sont définies en un seul endroit
- **Extensibilité**: Ajouter un nouveau service = ajouter un objet au tableau `ROUTES`
- **Validation**: Les variables d'env utilisées (`API_AUTH_URL_SERVICE`) sont validées au démarrage

## Variables d'environnement utilisées
| Variable | Type | Défaut | Usage |
|----------|------|--------|-------|
| `API_AUTH_URL_SERVICE` | string | http://127.0.0.1:3001 | Upstream du service auth |

**Source**: [backend.schema.ts](./backend.schema.ts)

## Services identifiés (upstream mapping)

| Préfixe | Upstream | Service | Port |
|---------|----------|---------|------|
| `/auth` | `http://127.0.0.1:3001` | auth-service | 3001 |
| `/users` | `http://127.0.0.1:3002` | **NOT CONFIGURED** ⚠️ | 3002 |
| `/orders` | - | **NOT CONFIGURED** ⚠️ | - |

**Observations**:
- Le service `users` (port 3002) est défini dans le `.env` mais aucune route ne le proxy
- La route `/orders` est filtrée dans `app.ts` mais non proxy vers aucun upstream

## Architecture et pattern
```
Client Request
    ↓
Gateway (app.ts) - Route filtering
    ↓
gatewayRoutes() - Centralised config
    ↓
apiGateway() - Reverse proxy setup (gateway.ts)
    ↓
Upstream Service (auth/users/orders)
```

## Effets de bord
1. Enregistrement de handlers HTTP proxy (un par route)
2. Les routes deviennent immédiatement accessibles via le gateway

## Sécurité
- ✅ Les URLs upstreams sont chargées depuis env (configurable par déploiement)
- ⚠️ Pas de validation d'URL (une URL malveillante pourrait être fournie)

## Complexité et performance
- **Temps d'enregistrement**: O(n) où n = nombre de routes
- **Mémoire**: Un petit objet de config par route (~100 bytes)

## Tests recommandés
### Unit
1. Vérifier que chaque route est bien enregistrée
2. Vérifier la réécriture du prefix (ex: `/auth/x` → `/api/auth/x`)

### Integration
1. Vérifier que toutes les routes du tableau sont accessible via GET /
2. Tester le routing vers auth (une fois le service démarré)

### E2E
```bash
# Vérifier les routes disponibles
curl -i http://localhost:3000/auth/
curl -i http://localhost:3000/users/   # Devrait 404 (pas configuré)
curl -i http://localhost:3000/orders/  # Devrait 404 (pas configuré)
```

## Références
- [backend/backend/src/module/routes.ts (full file)](../../module/routes.ts)
- [backend/backend/src/module/gateway.ts](./gateway.ts)
- [backend/backend/src/module/app.ts](../app.ts) (appelant)

## TODO / À CONFIRMER
- **TODO**: Configurer la route `/users` vers `API_USER_URL_SERVICE` (env variable existe mais non utilisée)
- **TODO**: Confirmer si `/orders` doit être implémenté (filtré dans app.ts mais pas de upstream)
- **TODO**: Ajouter validation des URLs upstreams (ex: `new URL()` pour vérifier la syntaxe)
- **ASSUMPTION**: Les URLs upstreams doivent inclure le protocole (http/https)

## Améliorations suggérées
1. Extraire `ROUTES` en fichier de config séparé (routes.config.ts)
2. Ajouter des field comme `healthcheck`, `timeout`, `rateLimit` par route
3. Valider les URLs au démarrage avec des test de connectivité (optional)
