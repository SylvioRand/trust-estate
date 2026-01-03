# 📊 Système d'Audit Logs

## Vue d'ensemble

Le système d'audit logs permet de tracer toutes les actions critiques des utilisateurs pour la sécurité et la conformité.

## Actions Trackées

### 🔐 Authentification

#### Login Success
```json
{
  "userId": "uuid",
  "email": "user@example.com",
  "action": "login_success",
  "timestamp": "2026-01-03T10:30:00.000Z"
}
```

#### Login Failed - User Not Found
```json
{
  "email": "unknown@example.com",
  "action": "login_failed",
  "reason": "user_not_found",
  "timestamp": "2026-01-03T10:30:00.000Z"
}
```

#### Login Failed - Invalid Password
```json
{
  "userId": "uuid",
  "email": "user@example.com",
  "action": "login_failed",
  "reason": "invalid_password",
  "timestamp": "2026-01-03T10:30:00.000Z"
}
```

#### Login Failed - OAuth User
```json
{
  "userId": "uuid",
  "email": "user@example.com",
  "action": "login_failed",
  "reason": "oauth_user_password_login_attempt",
  "timestamp": "2026-01-03T10:30:00.000Z"
}
```

---

### 📝 Création de Compte

```json
{
  "userId": "uuid",
  "email": "newuser@example.com",
  "phone": "+261340000000",
  "action": "account_created",
  "timestamp": "2026-01-03T10:30:00.000Z"
}
```

---

### ✉️ Vérification Email

#### Email Verified
```json
{
  "userId": "uuid",
  "action": "email_verified",
  "timestamp": "2026-01-03T10:30:00.000Z"
}
```

#### Verification Email Sent
```json
{
  "userId": "uuid",
  "email": "user@example.com",
  "action": "verification_email_sent",
  "timestamp": "2026-01-03T10:30:00.000Z"
}
```

#### Resend Rate Limited
```json
{
  "userId": "uuid",
  "email": "user@example.com",
  "action": "resend_email_rate_limited",
  "remainingSeconds": 45,
  "timestamp": "2026-01-03T10:30:00.000Z"
}
```

---

### 📱 Gestion du Téléphone

#### Phone Updated
```json
{
  "userId": "uuid",
  "phone": "+261340000000",
  "action": "phone_updated",
  "timestamp": "2026-01-03T10:30:00.000Z"
}
```

#### Phone Update Failed - Already Exists
```json
{
  "userId": "uuid",
  "phone": "+261340000000",
  "action": "phone_update_failed",
  "reason": "phone_already_exists",
  "timestamp": "2026-01-03T10:30:00.000Z"
}
```

---

## 🔍 Comment Consulter les Logs

### En développement
Les logs apparaissent dans la console Fastify avec coloration :
- 🟢 `INFO` : Actions réussies
- 🟡 `WARN` : Tentatives suspectes
- 🔴 `ERROR` : Erreurs système

### En production
Les logs peuvent être :
1. **Exportés vers un fichier** : `pino-pretty > logs/app.log`
2. **Envoyés à un service** : Datadog, Sentry, LogRocket
3. **Stockés en base** : Table `audit_logs` (à créer)

---

## 🚀 Limites de Rate

### Resend Email Verification
- **Limite** : 1 email par minute
- **Message** : "Please wait X seconds before requesting a new verification email"
- **Implementation** : Vérifie l'expiresAt du token existant

### Suggestions pour l'avenir
- Login attempts : 5 tentatives / 15 minutes
- Password reset : 3 tentatives / heure
- Phone update : 3 tentatives / jour

---

## 📈 Métriques Recommandées

À surveiller via les logs :
- Taux de login échoués (> 10% = problème)
- Temps moyen de vérification email
- Nombre d'emails de vérification renvoyés
- Tentatives de réutilisation de téléphone

---

## 🔒 Sécurité et RGPD

### Données sensibles à NE PAS logger
- ❌ Mots de passe
- ❌ Tokens JWT complets
- ❌ Adresses IP complètes (anonymiser)
- ❌ Données bancaires

### Données OK à logger
- ✅ User ID
- ✅ Email (hash en production)
- ✅ Actions effectuées
- ✅ Timestamps
- ✅ Reasons d'échec

---

## 🛠️ Configuration Fastify Logger

Pour personnaliser les logs, modifier `app.ts` :

```typescript
const app = fastify({
  logger: {
    level: process.env.LOG_LEVEL || 'info',
    transport: {
      target: 'pino-pretty',
      options: {
        colorize: true,
        translateTime: 'SYS:standard',
        ignore: 'pid,hostname'
      }
    }
  }
});
```

---

## 📊 Exemple de Dashboard

Créer un dashboard avec :
- Total logins / jour
- Taux de succès login
- Temps moyen de vérification email
- Tentatives de fraude détectées
