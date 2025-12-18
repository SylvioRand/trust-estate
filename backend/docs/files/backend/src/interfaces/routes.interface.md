# backend/src/interfaces/routes.interface.ts — Interface de configuration de route proxy

## Métadonnées
- **Chemin relatif**: `backend/backend/src/interfaces/routes.interface.ts`
- **Type**: TypeScript Interface
- **Responsabilité métier**: Définir le contrat TypeScript pour configurer une route de reverse proxy.

## Code source
```typescript
export interface GatewayRouteConfig {
	upstream: string;
	prefix: string;
	rewritePrefix?: string;
}
```

## Propriétés

### upstream (obligatoire)
**Type**: `string`
**Description**: URL de base du service cible
**Exemple**: `http://localhost:3001`
**Usage**: Destination du reverse proxy

### prefix (obligatoire)
**Type**: `string`
**Description**: Préfixe de route exposé par le gateway
**Exemple**: `/auth`
**Usage**: Matcher les requêtes (ex: `/auth/*`)

### rewritePrefix (optionnel)
**Type**: `string | undefined`
**Description**: Préfixe de réécriture pour l'upstream
**Exemple**: `/api/auth`
**Usage**: Transformer `/auth/login` en `/api/auth/login` avant forward
**Défaut**: Undefined (pas de réécriture)

## Exemple d'usage
```typescript
const authRoute: GatewayRouteConfig = {
  prefix: '/auth',
  upstream: 'http://auth-service:3001',
  rewritePrefix: '/api/auth'
};

// Résultat du mapping:
// GET /auth/login → GET http://auth-service:3001/api/auth/login
```

## Utilisation dans le code

### Dans routes.ts
```typescript
const ROUTES: GatewayRouteConfig[] = [
  {
    prefix: '/auth',
    upstream: app.config.API_AUTH_URL_SERVICE,
    rewritePrefix: '/api/auth'
  }
];
```

### Passé à apiGateway()
```typescript
export default async function apiGateway(
  app: FastifyInstance, 
  route: GatewayRouteConfig
): Promise<void>
```

## Sécurité
⚠️ **Notes**:
- `upstream` doit être une URL valide (pas de validation actuellement)
- Les URLs upstreams sont exposées en erreurs (considérer de masquer)

## Références
- [backend/backend/src/interfaces/routes.interface.ts (full file)](../../interfaces/routes.interface.ts)
- [backend/backend/src/module/routes.ts](../module/routes.ts) (utilisation)
- [backend/backend/src/module/gateway.ts](../module/gateway.ts) (traitement)

## TODO / À CONFIRMER
- **TODO**: Ajouter validation d'URL pour `upstream`
- **TODO**: Ajouter propriétés optionnelles pour `timeout`, `rateLimit` par route

## Améliorations suggérées
1. Ajouter JSDoc pour documenter chaque champ
2. Ajouter propriétés optionnelles:
   ```typescript
   timeout?: number;        // Timeout par route
   rateLimit?: RateLimitConfig;
   healthcheck?: string;     // Endpoint de santé
   retryPolicy?: RetryPolicy;
   ```
3. Ajouter validation de type pour `upstream` (format URL)
