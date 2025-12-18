# backend/src/interfaces/config.interface.ts — Interface de configuration

## Métadonnées
- **Chemin relatif**: `backend/backend/src/interfaces/config.interface.ts`
- **Type**: TypeScript Interface
- **Responsabilité métier**: Définir le contrat TypeScript pour l'objet de configuration du gateway.

## Code source
```typescript
export interface EnvConfigInterface {
	PORT_BACKEND: string,
	API_AUTH_URL_SERVICE: string,
	INTERNAL_SECRET: string
}
```

## Propriétés

### PORT_BACKEND
**Type**: `string`
**Description**: Port d'écoute du gateway
**Valeur attendue**: Nombre valide sous forme de chaîne (ex: "3000")
**Usage**: Converti en `number` via `parseInt()` dans app.ts

### API_AUTH_URL_SERVICE
**Type**: `string`
**Description**: URL de base du service auth
**Valeur attendue**: URL valide (ex: "http://localhost:3001")
**Usage**: Utilisé dans routes.ts pour le reverse proxy

### INTERNAL_SECRET
**Type**: `string`
**Description**: Secret partagé pour l'auth inter-services
**Valeur attendue**: Chaîne forte (ex: "sha256hex...")
**Usage**: Injecté dans l'en-tête `x-internal-gateway` par gateway.ts

## Utilisation dans le code

### En-tête TypeScript (fastify-env.d.ts)
```typescript
declare module 'fastify' {
  interface FastifyInstance {
    config: EnvConfigInterface,
  }
}
```

**Impact**: `app.config` est typé et autocomplété en TypeScript.

### Accès au runtime
```typescript
const port = parseInt(app.config.PORT_BACKEND);
const upstreamUrl = app.config.API_AUTH_URL_SERVICE;
const secret = app.config.INTERNAL_SECRET;
```

## Sécurité
⚠️ **Notes de sécurité**:
- `INTERNAL_SECRET` est sensible. Ne jamais le logger.
- `PORT_BACKEND` peut révéler la présence du gateway (header Server supprimé ailleurs)

## Références
- [backend/backend/src/interfaces/config.interface.ts (full file)](../../interfaces/config.interface.ts)
- [backend/backend/src/module/backend.schema.ts](./backend.schema.ts) (validation)
- [backend/backend/src/types/fastify-env.d.ts](../types/fastify-env.d.ts) (déclaration)

## TODO / À CONFIRMER
- **ASSUMPTION**: Le type `string` pour `PORT_BACKEND` est correct (bien que logiquement un `number`). Vérifier la cohérence.

## Améliorations suggérées
1. Ajouter JSDoc pour documenter chaque champ
2. Ajouter propriété optionnelle pour `API_USER_URL_SERVICE`
3. Considérer un type littéral pour `PORT_BACKEND` (ex: `number`)
