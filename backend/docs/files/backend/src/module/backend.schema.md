# backend/src/module/backend.schema.ts — JSON Schema de validation des env

## Métadonnées
- **Chemin relatif**: `backend/backend/src/module/backend.schema.ts`
- **Type**: Configuration (JSON Schema)
- **Responsabilité métier**: Définir et valider les variables d'environnement du gateway à la startup.

## Code source
```typescript
export const envSchema = {
	type: 'object',
	required: ['PORT_BACKEND', 'API_AUTH_URL_SERVICE', 'INTERNAL_SECRET'],
	properties: {
		PORT_BACKEND: {
			type: 'number',
			default: 3000
		},
		API_AUTH_URL_SERVICE: {
			type: 'string',
			default: 'http://127.0.0.1:3001'
		},
		INTERNAL_SECRET: {
			type: 'string',
			default: 'INTERNAL_SERVICE_SECRET'
		}
	}
};
```

## Variables d'environnement définies

### 1. PORT_BACKEND
**Type**: `number`
**Obligatoire**: Non (has default)
**Défaut**: `3000`
**Usage**: Port sur lequel le gateway écoute
**Exemple**:
```env
PORT_BACKEND=3000
```

### 2. API_AUTH_URL_SERVICE
**Type**: `string`
**Obligatoire**: Non (has default)
**Défaut**: `http://127.0.0.1:3001`
**Usage**: URL de base du service d'authentification (upstream)
**Exemple**:
```env
API_AUTH_URL_SERVICE=http://auth-service:3001
```

**Note**: Utilisée dans [routes.ts](./routes.ts) pour configurer le reverse proxy.

### 3. INTERNAL_SECRET
**Type**: `string`
**Obligatoire**: Oui ❗
**Défaut**: `INTERNAL_SERVICE_SECRET`
**Usage**: Token partagé pour l'authentification inter-services
**Exemple**:
```env
INTERNAL_SECRET=your-super-secret-key-here
```

**⚠️ SECURITY**: 
- Ne jamais utiliser la valeur par défaut en production
- Doit être un secret cryptographiquement fort
- Doit être identique sur tous les services

## Validation et traitement

**Utilisation du schema dans app.ts**:
```typescript
const options = {
	confKey: 'config',
	schema: envSchema,
	dotenv: true,
	data: process.env
}

await server.register(fastifyEnv, options);
```

**Processus**:
1. Le plugin `@fastify/env` lit les variables
2. Valide contre le schema JSON
3. Si invalide: lance une erreur (fail-fast)
4. Si valide: expose via `app.config.<var_name>`

**Accès au runtime**:
```typescript
app.config.PORT_BACKEND      // 3000
app.config.API_AUTH_URL_SERVICE  // http://127.0.0.1:3001
app.config.INTERNAL_SECRET   // INTERNAL_SERVICE_SECRET
```

## Références
- [backend/backend/src/module/backend.schema.ts (full file)](../../module/backend.schema.ts)
- [backend/backend/src/app.ts](../app.ts) (utilisation)
- [backend/backend/src/interfaces/config.interface.ts](../interfaces/config.interface.ts) (type)
- [backend/backend/src/types/fastify-env.d.ts](../types/fastify-env.d.ts) (déclaration)

## TODO / À CONFIRMER
- **TODO**: Ajouter validation d'URL pour `API_AUTH_URL_SERVICE` (format URL)
- **TODO**: Ajouter validation de port pour `PORT_BACKEND` (range 1-65535)
- **TODO**: Documenter les secrets requis pour production

## Améliorations suggérées
1. Ajouter validation d'URL: `pattern: "^https?://"`
2. Ajouter port range: `minimum: 1, maximum: 65535`
3. Ajouter descriptions pour chaque variable
4. Ajouter env variable `DATABASE_URL` si utilisée
