# backend/src/module/gateway.ts — Reverse Proxy HTTP & Upstream Management

## Métadonnées
- **Chemin relatif**: `backend/backend/src/module/gateway.ts`
- **Type**: Module (plugin Fastify)
- **Responsabilité métier**: Configurer le reverse proxy qui redirige les requêtes du gateway vers les services internes (auth, users, etc.)

## Résumé exécutif
Ce fichier implémente un reverse proxy HTTP Fastify qui re-route les requêtes préfixées vers les services en amont (upstream). Il gère les headers, le streaming de réponse, la gestion d'erreurs, et l'injection d'en-têtes internes d'authentification.

## Imports et dépendances
```typescript
import type {  FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import fastifyHttpProxy from "@fastify/http-proxy";
import { PassThrough } from 'stream';
import type { GatewayRouteConfig } from "../interfaces/routes.interface.ts";
```

**Dépendances clés**:
- `@fastify/http-proxy`: Plugin Fastify pour le reverse proxying
- `stream.PassThrough`: Stream Node.js pour le streaming transparent
- `GatewayRouteConfig`: Interface définissant la config d'une route proxy

## Signature et interface
```typescript
export default async function apiGateway(
  app: FastifyInstance, 
  route: GatewayRouteConfig
): Promise<void>
```

**Paramètres**:
- `app`: Instance Fastify du gateway
- `route`: Configuration de la route (upstream URL, prefix, rewritePrefix)

**Retour**: Promise<void> (async function)

## Structure de GatewayRouteConfig
```typescript
interface GatewayRouteConfig {
  upstream: string;           // URL du service en amont (ex: http://localhost:3001)
  prefix: string;             // Préfixe de route exposé (ex: /auth)
  rewritePrefix?: string;     // Préfixe pour réécrire la requête (ex: /api/auth)
}
```

## Flux d'exécution (bloc par bloc)

### 1. Configuration du timeout serveur (ligne 5)
```typescript
app.server.setTimeout(10000);
```
**But**: Configurer un timeout de 10 secondes pour toutes les connexions HTTP.
**Impact**: Si un upstream ne répond pas après 10s, la connexion est fermée.

### 2. Enregistrement du plugin http-proxy (lignes 7-41)
```typescript
await app.register(fastifyHttpProxy, { ... });
```
**But**: Enregistrer le plugin de reverse proxy avec configuration détaillée.

#### 2.1 Configuration de base (lignes 8-13)
```typescript
upstream: route.upstream,
prefix: route.prefix,
rewritePrefix: route.rewritePrefix,
http2: false,
disableCache: true,
```

| Option | Valeur | Explication |
|--------|--------|-------------|
| `upstream` | `route.upstream` | URL du service cible (ex: http://localhost:3001) |
| `prefix` | `route.prefix` | Préfixe de route à matcher (ex: /auth) |
| `rewritePrefix` | `route.rewritePrefix` | Prefix réécrire la route upstream (ex: /auth → /api/auth) |
| `http2` | `false` | N'utilise que HTTP/1.1 pour upstreams (compat) |
| `disableCache` | `true` | Désactive le cache HTTP (important pour APIs) |

#### 2.2 Gestion de la réponse (lignes 14-38)
```typescript
replyOptions: {
  onResponse: async (request, reply, res: any) => {
    // Traitement custom de la réponse
  },
  onError: (reply, error: any) => {
    // Traitement custom des erreurs
  },
  preHandler: (request, reply, done: any) => {
    // Traitement pré-proxy
  }
}
```

**Bloc `onResponse` (lignes 15-34)**:
```typescript
onResponse: async (request, reply , res: any) => {
  reply.raw.statusCode = res.statusCode ?? 502;

  const allowedHeaders = [
    'content-type',
    'content-length',
    'set-cookie'
  ];

  for (const [key, value] of Object.entries(res.headers)) {
    if (allowedHeaders.includes(key.toLowerCase()) && value) {
      const headerValue =
        Array.isArray(value) ? value.join(', ') : String(value);
        reply.raw.setHeader(key, headerValue);
    }
  }
  
  if (res.stream) {
    const passthrough = new PassThrough();
    res.stream.pipe(passthrough);
    reply.send(passthrough);
  } else {
    reply.send();
  }
}
```

**Détail ligne par ligne**:
1. `reply.raw.statusCode = res.statusCode ?? 502`: Applique le code HTTP de l'upstream (défaut 502)
2. `allowedHeaders`: Whitelist des en-têtes à transférer (filtre de sécurité)
3. Boucle: Copie uniquement les headers autorisés
4. Conversion headers: Gère les valeurs multiples (array → string)
5. Streaming: Si l'upstream envoie un stream, le passe à travers un PassThrough
6. Envoi: Pipe la réponse au client

**⚠️ SECURITY**: Seuls `content-type`, `content-length`, `set-cookie` sont relayés. Les headers comme `server`, `x-powered-by` sont supprimés.

**Bloc `onError` (lignes 35-38)**:
```typescript
onError: (reply, error: any) => {
  app.log.error(error);
  reply.code(502).send({ error: 'Auth service unavailable' });
}
```

**Détail**:
- Logue l'erreur via Fastify logger
- Répond avec 502 Bad Gateway et message générique
- **Note**: Le message mentionne "Auth service" mais s'applique à tous les upstreams (TODO: améliorer)

**Bloc `preHandler` (lignes 39-45)**:
```typescript
preHandler: (request, reply , done: any) => {
  delete request.headers.host;
  delete request.headers['x-forwarded-host'];
  delete request.headers['x-forwarded-for'];
  delete request.headers['x-real-ip'];
  request.headers['x-gateway-name'] = 'api-gateway';
  request.headers['x-internal-gateway'] = app.config.INTERNAL_SECRET;
  done();
}
```

**Détail**:
1. **Suppression de headers**: Nettoie les headers qui pourraient exposer l'IP réelle ou confondre l'upstream
   - `host`: Remplacé automatiquement par http-proxy
   - `x-forwarded-*`: Réinitialiser pour éviter les spoofing
   - `x-real-ip`: Idem
2. **Ajout de headers internes**:
   - `x-gateway-name`: Identifie le composant source ('api-gateway')
   - `x-internal-gateway`: Token d'authentification inter-services (valeur de `INTERNAL_SECRET`)

## Variables d'environnement utilisées
- `app.config.INTERNAL_SECRET`: Clé partagée injectée dans l'en-tête `x-internal-gateway`

## Effets de bord
1. **Configuration réseau**: Modifie le timeout du serveur (10s)
2. **Modification requête**: Ajoute/supprime des en-têtes
3. **Streaming**: Pipe les réponses upstreams directement au client
4. **Logging**: Erreurs loggées via Fastify

## Sécurité
| Aspect | Détail | Status |
|--------|--------|--------|
| **Headers secrets** | `x-internal-gateway` contient la clé partagée | ⚠️ À restreindre si exposition réseau |
| **Whitelist headers** | Seuls content-type, content-length, set-cookie | ✅ Bon |
| **Suppression headers** | host, x-forwarded-*, x-real-ip | ✅ Bon |
| **Error handling** | Retour 502 générique (pas de stack leak) | ✅ Bon |
| **Cache** | Désactivé (correct pour APIs) | ✅ Bon |
| **Timeout** | 10s (configurable) | ✅ Bon |

**Risques**:
- Le header `x-internal-gateway` transmet la clé en clair. En prod, utiliser une session/token limité en temps.
- Le message d'erreur "Auth service unavailable" peut révéler l'infrastructure.

## Gestion des erreurs
| Erreur | Code | Message | Action |
|--------|------|---------|--------|
| Upstream down | 502 | `{ error: 'Auth service unavailable' }` | Log + réponse client |
| Timeout (10s) | 502 | Idem | Socket fermée server-side |
| Response stream corrupted | 500/502 | Dépend de onError | Log + réponse |

## Patterns utilisés
1. **Reverse Proxy Pattern**: Redirige requêtes sans modifier la logique métier
2. **Stream Passthrough**: Utilise Node.js PassThrough pour transformer le stream
3. **Header Filtering**: Whitelist pour la sécurité
4. **Pre-handler Injection**: Enrichit les requêtes en amont avec métadonnées

## Complexité et performance
- **Overhead**: Negligible (passthrough stream)
- **Latency**: ~5-10ms added (proxy headers + validation)
- **Throughput**: Limited par l'upstream (pas de buffering)

## Tests recommandés
### Unit
1. Tester la création d'une instance gateway avec différentes configs
2. Vérifier l'injection de headers
3. Vérifier la suppression de headers sensibles

### Integration
1. Démarrer un service mock upstream
2. Envoyer une requête via le gateway
3. Vérifier le code HTTP, headers, et body relayés
4. Tester le timeout (simpler un upstream lent)
5. Tester le 502 (arrêter l'upstream)

### E2E
```bash
# Service upstream sur port 3001
node -e "require('http').createServer((req, res) => res.writeHead(200).end('OK')).listen(3001)"

# Requête via gateway
curl -i http://localhost:3000/auth/test
```

## Exemples de configuration
### Auth service
```typescript
{
  prefix: '/auth',
  upstream: 'http://auth-service:3001',
  rewritePrefix: '/api/auth'
}
```

### Users service
```typescript
{
  prefix: '/users',
  upstream: 'http://users-service:3002',
  rewritePrefix: '/api/users'
}
```

## Références
- [backend/backend/src/module/gateway.ts (full file)](../../module/gateway.ts)
- [backend/backend/src/module/routes.ts](../../module/routes.ts) (utilisation)
- [backend/backend/src/interfaces/routes.interface.ts](../../interfaces/routes.interface.ts) (type)
- [@fastify/http-proxy docs](https://github.com/fastify/fastify-http-proxy)

## TODO / À CONFIRMER
- **TODO**: Le message d'erreur "Auth service unavailable" est hardcodé. Généraliser avec `route.prefix` ou autre.
- **TODO**: Vérifier si `disableCache: true` est optimal. Certains endpoints peuvent bénéficier du cache.
- **TODO**: Documenter le mapping des upstreams dans `routes.ts` (voir section "Identification des upstreams").
- **ASSUMPTION**: Le `INTERNAL_SECRET` doit être identique sur le gateway et tous les services. À confirmer dans le déploiement.
