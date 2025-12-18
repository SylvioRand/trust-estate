# backend/src/plugin/rate-limit.ts — Plugin de limitation de débit

## Métadonnées
- **Chemin relatif**: `backend/backend/src/plugin/rate-limit.ts`
- **Type**: Plugin Fastify
- **Responsabilité métier**: Limiter le nombre de requêtes par IP pour prévenir les attaques par déni de service (DoS).

## Résumé exécutif
Enregistre le plugin Fastify Rate Limit qui limite à 100 requêtes par 10 secondes par IP. Répond avec 429 (Too Many Requests) en cas de dépassement.

## Imports et dépendances
```typescript
import fp from "fastify-plugin";
import fastifyRateLimit from '@fastify/rate-limit'
import type { FastifyInstance } from "fastify";
```

## Code source complet et analyse

```typescript
const rateLimitPlugin = async (app: FastifyInstance): Promise<void> => {
	await app.register(fastifyRateLimit, {
		max: 100,
		timeWindow: '10 seconds',
		global: true,
		errorResponseBuilder(req: any, context: any) {
			console.log(`User ${context.key} has exceeded the rate limit`);
			return {
				statusCode: 429,
				error: 'Too Many Requests',
				message: `Rate limit exceeded, retry after ${context.ttl} seconds`
			};
		},
		keyGenerator: (request) => {
			const ip = (request.headers['x-forwarded-for'] as any)?.split(',')[0]
					|| request.socket.remoteAddress;
			return ip
		},
		addHeaders: {
			'x-ratelimit-limit':true,
			'x-ratelimit-remaining':true,
			'x-ratelimit-reset':true
		}
	});
}

export default fp(rateLimitPlugin);
```

## Flux d'exécution (bloc par bloc)

### Paramètres de configuration

#### Limites (ligne 3)
```typescript
max: 100,
timeWindow: '10 seconds',
global: true,
```

| Paramètre | Valeur | Explication |
|-----------|--------|-------------|
| `max` | 100 | Nombre maximum de requêtes autorisées |
| `timeWindow` | '10 seconds' | Fenêtre de temps (réinitialisation tous les 10s) |
| `global` | true | Appliqué à toutes les routes du serveur |

**Impact**: 100 requêtes / 10 secondes = 10 requêtes/sec par IP

#### Fonction d'erreur personnalisée (lignes 5-11)
```typescript
errorResponseBuilder(req: any, context: any) {
	console.log(`User ${context.key} has exceeded the rate limit`);
	return {
		statusCode: 429,
		error: 'Too Many Requests',
		message: `Rate limit exceeded, retry after ${context.ttl} seconds`
	};
}
```

**But**: Construire une réponse JSON personnalisée au lieu du défaut Helmet.

**Paramètres**:
- `req`: L'objet de requête Fastify
- `context.key`: La clé utilisée pour tracker (l'IP)
- `context.ttl`: Secondes restantes avant reset du compteur

**Réponse**:
```json
{
  "statusCode": 429,
  "error": "Too Many Requests",
  "message": "Rate limit exceeded, retry after 3 seconds"
}
```

**Side effect**: `console.log()` enregistre l'IP qui a dépassé la limite.

#### Générateur de clé (lignes 12-16)
```typescript
keyGenerator: (request) => {
	const ip = (request.headers['x-forwarded-for'] as any)?.split(',')[0]
			|| request.socket.remoteAddress;
	return ip
}
```

**But**: Déterminer quelle "clé" (IP) est utilisée pour tracker les requêtes.

**Logique**:
1. Essayer `x-forwarded-for` header (client réel derrière proxy)
2. Si présent, prendre seulement le premier IP (split(',')[0])
3. Sinon, utiliser `request.socket.remoteAddress` (IP directe)

**Impact**:
- En Docker/behind reverse proxy: Utilise le client réel
- Localement: Utilise l'IP TCP
- Limitation: Tous les clients derrière un proxy NAT partagent la limite

**⚠️ SECURITY NOTE**: Cette clé est loggée dans console.log() → risque d'exposition d'IPs en production.

#### Headers de réponse (lignes 17-21)
```typescript
addHeaders: {
	'x-ratelimit-limit':true,
	'x-ratelimit-remaining':true,
	'x-ratelimit-reset':true
}
```

**But**: Ajouter des headers informatifs sur le rate limit à chaque réponse.

| Header | Exemple | Signification |
|--------|---------|---------------|
| `x-ratelimit-limit` | `100` | Limite totale par fenêtre |
| `x-ratelimit-remaining` | `42` | Requêtes restantes dans cette fenêtre |
| `x-ratelimit-reset` | `1671234567` | Unix timestamp du reset |

**Exemple de réponse**:
```
HTTP/1.1 200 OK
x-ratelimit-limit: 100
x-ratelimit-remaining: 95
x-ratelimit-reset: 1671234567
```

### Export du plugin (ligne 24)
```typescript
export default fp(rateLimitPlugin);
```

## Variables d'environnement
Aucune. Les limites sont hardcodées.

## Effets de bord
1. Chaque requête incrémente le compteur pour l'IP source
2. Si limit dépassé: répondre 429 au lieu de traiter la requête
3. Logging via `console.log()` de chaque dépassement

## Sécurité (DoS mitigation)
| Aspect | Détail | Status |
|--------|--------|--------|
| **DoS prevention** | 100 req / 10s = max 10 req/s par IP | ✅ |
| **Distributed DoS** | Pas de protection (chaque IP a 10 req/s) | ⚠️ |
| **Proxy bypass** | Si x-forwarded-for is spoofable | ⚠️ |
| **Logging** | console.log() des IPs en limite | ⚠️ |

**Risques**:
- Clients derrière NAT partagent la limite (500 users = 1 limit)
- Logging en console → possibilité d'exposition d'IPs sensibles
- Limite de 100 req / 10s = 10 req/sec peut être trop faible pour des clients mobiles en réseau mauvais

## Gestion des erreurs
| Cas | Code HTTP | Message | Details |
|-----|-----------|---------|---------|
| Limit dépassé | 429 | Too Many Requests | Message inclut TTL restant |

**Exemple d'erreur**:
```bash
curl -i http://localhost:3000/

# 101e requête (après 100):
HTTP/1.1 429 Too Many Requests
Content-Type: application/json

{
  "statusCode": 429,
  "error": "Too Many Requests",
  "message": "Rate limit exceeded, retry after 7 seconds"
}
```

## Complexité et performance
- **Overhead per request**: ~1ms (lookup en mémoire)
- **Mémoire**: ~1KB par IP unique tracked (~1MB pour 1000 IPs)
- **Reset**: Automatique après timeWindow

## Tests recommandés
### Unit
1. Générer 100 requêtes → success
2. Générer 101e requête → 429
3. Vérifier les headers x-ratelimit-*

### Integration
```bash
# Bash loop pour tester
for i in {1..105}; do
  curl -i http://localhost:3000/
done
# Attendu: 100x 200, 5x 429
```

### E2E
1. Tester avec différentes IPs (vérifier isolation)
2. Tester x-forwarded-for spoofing (sécurité)

## Références
- [backend/backend/src/plugin/rate-limit.ts (full file)](../../plugin/rate-limit.ts)
- [@fastify/rate-limit](https://github.com/fastify/fastify-rate-limit)
- [RFC 6585 - HTTP 429 status](https://tools.ietf.org/html/rfc6585)

## TODO / À CONFIRMER
- **TODO**: Valider la limite de 100 req / 10s (10 req/s). Est-ce approprié pour les APIs mobiles?
- **TODO**: Remplacer `console.log()` par `app.log.warn()` (logging structuré)
- **TODO**: Vérifier si `x-forwarded-for` peut être spoofée (utiliser un header de confiance du reverse proxy)
- **TODO**: Considérer une limite différente par type de route (ex: /login = 5 req/min, /api/* = 100 req/10s)

## Améliorations suggérées
1. Rendre `max` et `timeWindow` configurables via env
2. Utiliser un store distribué (Redis) au lieu de mémoire (pour multi-instance)
3. Ajouter whitelist d'IPs (ex: health checks, monitoring)
4. Implémenter adaptive rate limiting (ajuster selon charge)
5. Remplacer console.log par logging structuré (pino, winston)
6. Ajouter une route d'admin pour vérifier/reset les limites
