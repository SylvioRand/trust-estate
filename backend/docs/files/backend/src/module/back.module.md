# backend/src/module/back.module.ts — Enregistrement des plugins globaux

## Métadonnées
- **Chemin relatif**: `backend/backend/src/module/back.module.ts`
- **Type**: Module (function)
- **Responsabilité métier**: Centraliser l'enregistrement des plugins globaux (rate limiting, helmet).

## Résumé exécutif
Petit module qui orchestre l'enregistrement de deux plugins de sécurité: rate limit et helmet. Appelé au démarrage du gateway.

## Code source
```typescript
import type { FastifyInstance } from "fastify";
import helmetPlugin from "../plugin/helmet.plugin.ts";
import rateLimitPlugin from "../plugin/rate-limit.ts";

export async function moduleRegister(app: FastifyInstance) {
	await app.register(rateLimitPlugin);
	await app.register(helmetPlugin);
}
```

## Flux d'exécution
```typescript
moduleRegister(app)
  ↓
  1. app.register(rateLimitPlugin)
  ↓
  2. app.register(helmetPlugin)
  ↓
  Done (awaited sequentially)
```

**Ordre d'enregistrement**:
1. Rate limit (plus en amont pour arrêter les attaques tôt)
2. Helmet (headers de sécurité généraux)

## Plugins enregistrés

| Plugin | Fichier | Responsabilité |
|--------|---------|-----------------|
| `rateLimitPlugin` | [rate-limit.ts](./rate-limit.ts) | Limitation à 100 req/10s par IP |
| `helmetPlugin` | [helmet.plugin.ts](../plugin/helmet.plugin.ts) | Headers OWASP (CSP, HSTS, etc.) |

## Imports
```typescript
import type { FastifyInstance } from "fastify";
import helmetPlugin from "../plugin/helmet.plugin.ts";
import rateLimitPlugin from "../plugin/rate-limit.ts";
```

## Signature
```typescript
export async function moduleRegister(app: FastifyInstance): Promise<void>
```

## Effets de bord
1. Enregistre les plugins dans l'ordre spécifié
2. Tous les handlers HTTP subséquents sont protégés par rate limit et helmet

## Sécurité (protection en cascade)
```
Request
  ↓ [Rate Limit]  → 429 if too many from same IP
  ↓ [Helmet]      → Add security headers
  ↓ [Handler]     → Process request
  ↓
Response (with security headers)
```

## Performance
- **Overhead**: Negligible (~2ms pour l'enregistrement au démarrage)
- **Runtime**: Voir [rate-limit.ts](./rate-limit.ts) et [helmet.plugin.ts](../plugin/helmet.plugin.ts)

## Appel dans le code
```typescript
// Dans app.ts (ligne 43)
await moduleRegister(server);
```

## Références
- [backend/backend/src/module/back.module.ts (full file)](../../module/back.module.ts)
- [backend/backend/src/app.ts](../app.ts) (appelant)
- [backend/backend/src/plugin/rate-limit.ts](../plugin/rate-limit.ts)
- [backend/backend/src/plugin/helmet.plugin.ts](../plugin/helmet.plugin.ts)

## TODO / À CONFIRMER
- **TODO**: Confirmer que l'ordre (rate-limit puis helmet) est optimal
- **TODO**: Ajouter d'autres plugins si nécessaire (ex: CORS est enregistré dans app.ts, pas ici)

## Améliorations suggérées
1. Extraire l'ordre en configuration (config-driven plugin loading)
2. Ajouter des logs de débogage pour chaque plugin enregistré
3. Créer un système d'activation/désactivation des plugins par env (ex: ENABLE_HELMET=true)
