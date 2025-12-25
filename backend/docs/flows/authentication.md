# Authentification Flow

Ce document décrit le flux complet d'authentification, de la connexion à l'accès aux ressources protégées, en passant par le rafraîchissement des tokens.

## 1. Login
L'utilisateur envoie ses identifiants (Email/Password ou OAuth Google) à la Gateway.

1. **Client** -> `POST /auth/login` -> **Gateway**.
2. **Gateway** -> Proxy vers -> **Auth Service**.
3. **Auth Service** :
   - Vérifie les identifiants.
   - Génère une paire de tokens : `Access Token` (JWT 15m) et `Refresh Token` (JWT 7j).
   - Renvoie les tokens dans des **Cookies HttpOnly** sécurisés.

> **Note** : Les tokens ne sont jamais accessibles en JavaScript (protection XSS).

## 2. Accès aux Ressources (Access Token)
Pour accéder à une route protégée (ex: `/profile`).

1. **Client** -> `GET /api/profile` (avec Cookies) -> **Gateway**.
2. **Gateway** :
   - Intercepte la requête.
   - Vérifie la validité du cookie `realestate_access_token`.
   - **Si invalide/absent** : Renvoie 401 Unauthorized.
   - **Si valide** :
     - Génère un **Internal Token** (signé par la Gateway).
     - Injecte le token dans le header `Authorization: Bearer <internal_token>`.
     - Injecte le secret `x-internal-gateway`.
     - Transfère la requête au service concerné.
3. **Service** (ex: Auth/User Service) :
   - Vérifie le token interne et le secret.
   - Traite la requête et répond.

## 3. Internal Token (Service-to-Service)
L'Internal Token est un JWT à courte durée de vie généré par la Gateway. Il permet aux services internes de savoir *qui* fait la requête (ID utilisateur, Rôle) sans avoir à re-vérifier les cookies ou la base de données de session.

## 4. Refresh Token
Lorsque l'`Access Token` expire (après 15m).

1. **Client** reçoit une 401 lors d'un appel API.
2. **Client** -> `POST /auth/refresh` (avec Cookie Refresh Token) -> **Gateway**.
3. **Gateway** -> Proxy vers -> **Auth Service**.
4. **Auth Service** :
   - Vérifie le `Refresh Token` en base de données (pour s'assurer qu'il n'a pas été révoqué).
   - Invalide l'ancien Refresh Token.
   - Génère une **nouvelle paire** (Access + Refresh).
   - Met à jour les Cookies HttpOnly du client.

Ce mécanisme de rotation assure que si un Refresh Token est volé, il ne pourra être utilisé qu'une seule fois avant d'invalider la session légitime (détection de vol).
