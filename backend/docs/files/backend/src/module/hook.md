# backend/src/module/hook.ts — Hooks de sécurité et validation

## Métadonnées
- **Chemin relatif**: `backend/backend/src/module/hook.ts`
- **Type**: Module (hooks Fastify)
- **Responsabilité métier**: Ajouter des hooks globaux pour la sécurité, la validation des payloads, et l'injection de headers de sécurité.

## Résumé exécutif
Définit trois hooks Fastify qui s'appliquent à toutes les requêtes: validation de taille, nettoyage des headers dangereux, et injection de headers de sécurité.

## Imports
```typescript
import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
```

## Signature
```typescript
export async function addHooks(server: FastifyInstance): Promise<void>
```

## Flux d'exécution (trois hooks)

### Hook 1: `preParsing` - Validation de taille de payload (lignes 3-10)

```typescript
server.addHook("preParsing", async (req: FastifyRequest, reply: FastifyReply): Promise<void> => {
	const maxSize = 10 * 1024 * 1024;  // 10 MB
	const contentLength = parseInt(req.headers['content-length'] || '0');

	if (contentLength > maxSize) {
		throw new Error(`Payload trop volumineux: ${contentLength} bytes (max: ${maxSize})`);
	}
})
```

**But**: Rejeter les payloads trop volumineux avant le parsing.

**Détail ligne par ligne**:
1. `maxSize = 10 * 1024 * 1024`: Limite = 10 MB
2. `contentLength`: Lecture du header HTTP `Content-Length`
3. Vérification: Si taille > 10 MB, lancer une erreur
4. **Impact**: Fastify arrête la requête et répond 413 (Payload Too Large)

**⚠️ SECURITY**: Cette limite est importante pour prévenir les attaques par déni de service (DoS).

**Note**: Pas d'en-tête `Content-Length` → contentLength = 0 (pas de rejet préventif).

### Hook 2: `onRequest` - Nettoyage des headers (lignes 12-21)

```typescript
server.addHook('onRequest', async (req: FastifyRequest, reply: FastifyReply) => {
	delete req.headers['x-powered-by']
	delete req.headers['referer']

	if (req.headers['x-forwarded-for']) {
		req.headers['x-forwarded-for'] = (req.headers['x-forwarded-for'] as any).split(',')[0].trim()
	}
})
```

**But**: Nettoyer et normaliser les headers reçus.

**Détail**:
1. `delete req.headers['x-powered-by']`: Supprime l'en-tête révélant la technologie (Express, etc.)
2. `delete req.headers['referer']`: Supprime l'en-tête d'origine (privacy)
3. `x-forwarded-for`: Si présent, garde seulement le premier IP (le client réel)
   - Exemple: `"203.0.113.1, 198.51.100.2"` → `"203.0.113.1"`
   - Raison: En proxy chaîné, seul le premier IP est pertinent

**⚠️ SECURITY**: Évite les fuites d'info et les spoofing d'IP.

### Hook 3: `onSend` - Injection de headers de sécurité (lignes 23-29)

```typescript
server.addHook('onSend', async (req:FastifyRequest, reply: FastifyReply) => {
	reply.header('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload')
	reply.header('X-Content-Type-Options', 'nosniff')
	reply.header('X-Frame-Options', 'DENY')
	reply.header('Referrer-Policy', 'no-referrer')
})
```

**But**: Ajouter des headers de sécurité défensifs à toutes les réponses.

| Header | Valeur | Effet |
|--------|--------|-------|
| `Strict-Transport-Security` | `max-age=63072000; includeSubDomains; preload` | Force HTTPS pendant 2 ans, incluant subdomains |
| `X-Content-Type-Options` | `nosniff` | Empêche le browser de deviner le type MIME |
| `X-Frame-Options` | `DENY` | Empêche l'embedding en iframe |
| `Referrer-Policy` | `no-referrer` | Ne transmet pas le referrer au clic |

**⚠️ SECURITY**: Headers standards pour prévenir:
- MITM attacks (HSTS)
- MIME-type attacks (nosniff)
- Clickjacking (X-Frame-Options)
- Referrer leaks

## Ordre d'exécution des hooks
```
onRequest (1) → preParsing (2) → [Body parsing] → onSend (3)
```

**Note**: `onRequest` avant `preParsing` = cleanup avant validation.

## Variables d'environnement
Aucune. Les limites sont hardcodées.

## Effets de bord
1. **Modification de requête**: Headers supprimés, x-forwarded-for normalisé
2. **Injection de réponse**: 4 headers de sécurité ajoutés
3. **Arrêt possible**: Si taille payload > 10 MB

## Sécurité (OWASP)
| Risque | Mitigation | Status |
|--------|-----------|--------|
| **DoS (Payload giant)** | Limite 10 MB validée en preParsing | ✅ |
| **Information leakage** | Suppression x-powered-by | ✅ |
| **MITM** | HSTS header | ✅ |
| **MIME sniffing** | X-Content-Type-Options: nosniff | ✅ |
| **Clickjacking** | X-Frame-Options: DENY | ✅ |
| **Referrer leak** | Referrer-Policy: no-referrer | ✅ |

## Gestion des erreurs
| Cas | Code HTTP | Détail |
|-----|-----------|--------|
| Payload > 10 MB | 413 | Message d'erreur: "Payload trop volumineux" |

**Exemple**:
```
HTTP/1.1 413 Payload Too Large
Content-Type: application/json

{
  "statusCode": 413,
  "error": "Payload Too Large",
  "message": "Payload trop volumineux: 15728640 bytes (max: 10485760)"
}
```

## Complexité et performance
- **Overhead**: ~1ms par requête (checks simples)
- **Mémoire**: None (stateless)
- **Impact HSTS**: Impacte le first load en HTTPS future requests

## Tests recommandés
### Unit
1. Tester avec payload exactement 10 MB (accept)
2. Tester avec payload 10 MB + 1 byte (reject 413)
3. Tester avec Content-Length absent (accept)
4. Tester la normalisation de x-forwarded-for

### Integration
1. Envoyer une requête avec `x-powered-by` header et vérifier suppression
2. Vérifier les headers de sécurité dans la réponse (curl -i)

### E2E
```bash
# Vérifier les headers de sécurité
curl -i http://localhost:3000/
# Doit contenir: Strict-Transport-Security, X-Content-Type-Options, etc.

# Tester un gros payload (11 MB)
dd if=/dev/zero bs=1M count=11 | curl -X POST http://localhost:3000/ \
  -H "Content-Type: application/octet-stream" --data-binary @-
# Doit répondre 413
```

## Références
- [backend/backend/src/module/hook.ts (full file)](../../module/hook.ts)
- [Fastify Hooks](https://www.fastify.io/docs/latest/Guides/Lifecycle/)
- [OWASP Secure headers](https://owasp.org/www-project-secure-headers/)

## TODO / À CONFIRMER
- **TODO**: La limite de 10 MB est-elle appropriée? Vérifier les use cases (uploads de fichiers, etc.)
- **TODO**: `HSTS preload` est activé. Confirmer que le domaine sera enregistré dans la liste HSTS publique.
- **ASSUMPTION**: Les headers injectés correspondent aux recommandations OWASP standard. À adapter selon la politique de sécurité du projet.

## Améliorations suggérées
1. Rendre `maxSize` configurable via env (actuellement 10 MB hardcodé)
2. Ajouter un header CSP (Content-Security-Policy) pour les réponses HTML
3. Ajouter validation supplémentaire des headers (ex: validation de format)
4. Logger les suppressions de headers (debug)
