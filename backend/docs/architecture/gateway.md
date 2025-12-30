# Gateway Service

## Rôle
La **Gateway** est le point d'entrée unique pour toutes les requêtes externes vers l'API backend. Elle agit comme un reverse-proxy sécurisé qui protège les micro-services internes.

## Responsabilités
### Ce que la Gateway fait :
- **Reverse Proxy** : Redirige les requêtes vers les services appropriés (ex: `Auth Service`, `User Service`).
- **Authentification Centralisée** : Vérifie la présence et la validité des `HttpOnly Cookies` (Access Token) pour les routes protégées.
- **Sécurisation des Services** :
  - Supprime les headers sensibles (Host, X-Forwarded-For, etc.).
  - Injecte un **Internal Service Token** pour la communication inter-services.
  - Ajoute un header `x-internal-gateway` contenant un secret partagé pour prouver l'origine de la requête.
- **Rate Limiting** : Protège les endpoints sensibles (ex: login, register) contre les abus.
- **Gestion des Erreurs** : Standardise les erreurs (ex: 502 si un service est down).

### Ce que la Gateway NE fait PAS :
- Elle ne gère pas la logique métier (création d'utilisateur, modification de données).
- Elle ne stocke pas de données persistantes (pas de base de données propre, sauf configuration).

## Sécurité
La Gateway transforme une requête externe (Cookie-based) en une requête interne de confiance (Token-based + Secret).
