# backend/src/plugin/helmet.plugin.ts — Plugin de sécurité HTTP headers

## Métadonnées
- **Chemin relatif**: `backend/backend/src/plugin/helmet.plugin.ts`
- **Type**: Plugin Fastify
- **Responsabilité métier**: Configurer les headers de sécurité HTTP avancés et les règles CSP (Content Security Policy).

## Résumé exécutif
Enregistre le plugin Fastify Helmet qui ajoute de nombreux headers de sécurité défensifs. Configure notamment une CSP restrictive, HSTS, frameguard, et autres protections OWASP.

## Imports et dépendances
```typescript
import fp from "fastify-plugin";
import fastifyHelmet from "@fastify/helmet";
import type { FastifyInstance } from "fastify";
import crypto from 'crypto'
```

**Dépendances**:
- `@fastify/helmet`: Implémentation Fastify d'Helmet.js
- `fastify-plugin`: Wrapper pour créer un plugin Fastify
- `crypto`: Génération de nonce pour CSP

## Code source complet et analyse ligne par ligne

### Wrapper du plugin (ligne 6)
```typescript
const helmetPlugin = async (fastify: FastifyInstance): Promise<void> => {
```

### Génération du nonce (ligne 7)
```typescript
const nonce = crypto.randomBytes(16).toString('base64');
```

**But**: Générer une valeur aléatoire pour le CSP nonce.
**Détail**: 
- `randomBytes(16)`: 16 bytes = 128 bits d'aléatoire
- `.toString('base64')`: Convertir en chaîne Base64 (usable en HTTP header)
- **Impact**: Permet des inline scripts/styles sécurisés avec `nonce-<value>`

**⚠️ NOTE**: Le nonce est généré une seule fois à l'init. Pour plus de sécurité, il faudrait le générer par requête.

### Enregistrement du plugin Helmet (lignes 9-43)
```typescript
await fastify.register(fastifyHelmet, {
  // Configuration détaillée...
});
```

#### Configuration CSP (lignes 10-19)
```typescript
contentSecurityPolicy: {
	directives: {
		defaultSrc: ["'self'"],
		scriptSrc: ["'self'"],
		styleSrc: ["'self'","https://fonts.googleapis.com", "'unsafe-inline'"],
		imgSrc: ["'self'","data:", "https:"],
		fontSrc: ["'self'","https://fonts.gstatic.com"],
		objectSrc: ["'none'"],
		upgradeInsecureRequests: []
	}
}
```

**But**: Définir une politique restrictive pour les ressources chargées par le navigateur.

| Directive | Valeur | Explication |
|-----------|--------|------------|
| `defaultSrc` | `["'self'"]` | Par défaut, charger depuis l'origine uniquement |
| `scriptSrc` | `["'self'"]` | Scripts inline interdits, sauf même origine |
| `styleSrc` | `["'self'", "https://fonts.googleapis.com", "'unsafe-inline'"]` | CSS locales + Google Fonts + inline allowed |
| `imgSrc` | `["'self'", "data:", "https:"]` | Images locales + data URIs + HTTPS |
| `fontSrc` | `["'self'", "https://fonts.gstatic.com"]` | Fonts locales + Google Fonts |
| `objectSrc` | `["'none'"]` | Aucun objet/embed/applet |
| `upgradeInsecureRequests` | `[]` | Upgrade HTTP → HTTPS |

**⚠️ SECURITY**: 
- `'unsafe-inline'` pour CSS est permissif. À considérer pour les APIs (pas d'HTML rendu).
- Le nonce est généré statiquement. Pour des scripts inline, utiliser le nonce per-request.

**⚠️ NOTE**: Cette CSP est stricte mais peut bloquer du contenu. Tester en prod.

#### Autres directives de sécurité (lignes 20-43)
```typescript
crossOriginEmbedderPolicy: true,
crossOriginOpenerPolicy: { policy: "same-origin-allow-popups" },
crossOriginResourcePolicy: { policy: "same-origin" },
frameguard: { action: 'deny' },
hidePoweredBy: true,
hsts: {
	maxAge: 31536000,
	includeSubDomains: true,
	preload: false
},
originAgentCluster: true,
permittedCrossDomainPolicies: { permittedPolicies:'none' },
referrerPolicy: { policy: "strict-origin-when-cross-origin" },
noSniff:true,
xssFilter:true
```

| Option | Valeur | Effet |
|--------|--------|-------|
| `crossOriginEmbedderPolicy` | `true` | Isoler le contexte (COEP) |
| `crossOriginOpenerPolicy` | `same-origin-allow-popups` | Isoler les openers, sauf popups |
| `crossOriginResourcePolicy` | `same-origin` | Ressources cross-origin refusées |
| `frameguard` | `deny` | Embedding en iframe interdit |
| `hidePoweredBy` | `true` | Supprimer X-Powered-By |
| `hsts.maxAge` | 31536000 (1 an) | Force HTTPS un an |
| `hsts.includeSubDomains` | `true` | HSTS pour tous les subdomains |
| `hsts.preload` | `false` | Pas d'enregistrement HSTS preload |
| `originAgentCluster` | `true` | Isoler l'agent (Spectre mitigation) |
| `permittedCrossDomainPolicies` | `none` | Aucune policy Flash/PDF cross-domain |
| `referrerPolicy` | `strict-origin-when-cross-origin` | Referrer seulement en HTTPS same-origin |
| `noSniff` | `true` | X-Content-Type-Options: nosniff |
| `xssFilter` | `true` | X-XSS-Protection: 1; mode=block |

### Export du plugin (ligne 46)
```typescript
export default fp(helmetPlugin);
```

**But**: Exporter en tant que plugin Fastify (wrappé avec `fp`).
**Impact**: Peut être enregistré avec `app.register(helmetPlugin)`.

## Variables d'environnement
Aucune. Tout est hardcodé.

## Effets de bord
Chaque réponse HTTP aura les headers de sécurité Helmet ajoutés.

## Sécurité (OWASP Top 10 coverage)
| Risque | Mitigation |
|--------|-----------|
| **A03:2021 – Injection** | CSP stricte (defaultSrc='self') |
| **A06:2021 – SSRF** | CSP + CORS |
| **A07:2021 – CSRF** | SameSite cookies (via autre plugin) |
| **A08:2021 – XSS** | CSP + X-XSS-Protection + noSniff |
| **A01:2021 – Broken AC** | CORS + referrer policy |
| **A10:2021 – Using known vulnerable components** | Helmet garanti à jour |

**Scores**:
- ✅ HSTS: HTTPS enforcement (1 an)
- ✅ CSP: Strict policy
- ✅ Frameguard: Anti-clickjacking
- ✅ Helmet: Industry standard

**Opportunités d'amélioration**:
1. Générer le nonce per-request (actuellement statique)
2. Ajouter une CSP report-uri pour monitoring
3. Vérifier `crossOriginOpenerPolicy: "same-origin"` si popups vraiment utiles

## Gestion des erreurs
Aucune gestion particulière. Helmet ajoute les headers, pas de validations.

## Complexité et performance
- **Overhead**: <1ms (headers ajoutés, pas de traitement)
- **Mémoire**: ~1KB par réponse (headers)

## Tests recommandés
### Unit
1. Vérifier la génération du nonce (crypto.randomBytes)
2. Vérifier l'existence de tous les headers Helmet

### Integration
```bash
curl -i http://localhost:3000/

# Vérifier les headers:
# Strict-Transport-Security: max-age=31536000...
# Content-Security-Policy: ...
# X-Frame-Options: DENY
# X-Content-Type-Options: nosniff
```

### E2E
1. Charger le site en navigateur et vérifier console (CSP violations)
2. Tester depuis domain externe (vérifier CORS rejection)

## Références
- [backend/backend/src/plugin/helmet.plugin.ts (full file)](../../plugin/helmet.plugin.ts)
- [@fastify/helmet](https://github.com/fastify/fastify-helmet)
- [OWASP Secure headers](https://owasp.org/www-project-secure-headers/)
- [CSP level 3 spec](https://w3c.github.io/webappsec-csp/)

## TODO / À CONFIRMER
- **TODO**: Le nonce est générée une seule fois. Pour les scripts inline, générer un nonce per-request et passer au template.
- **TODO**: `styleSrc: "'unsafe-inline'"` peut être trop permissif. Considérer des hashes de style ou un nonce.
- **TODO**: Vérifier si les ressources Google Fonts/Gstatic sont réellement utilisées (sinon les retirer de CSP).
- **TODO**: `hsts.preload: false` — Confirmer si on veut s'enregistrer dans la liste HSTS publique.

## Améliorations suggérées
1. Extraire les directives CSP en fichier de config
2. Ajouter CSP report-uri pour monitoring
3. Implémenter un Content-Security-Policy-Report-Only pour audit avant enforcement
4. Générer nonce per-request (si contenu HTML est servi)
