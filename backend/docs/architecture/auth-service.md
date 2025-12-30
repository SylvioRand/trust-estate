# Auth Service

## Rôle
Le **Auth Service** est le service central du backend. Il est responsable non seulement de l'authentification mais aussi de la gestion complète des utilisateurs.

## Responsabilités

### 1. Authentification & Sécurité
- **Login/Register** : Vérification des mots de passe (bcrypt) et création de comptes.
- **Gestion des Tokens** :
  - Génération de l'`Access Token` (validité courte).
  - Génération et rotation du `Refresh Token` en base de données.
- **OAuth** : Gestion du flux de connexion Google.

### 2. Gestion des Utilisateurs (User Management)
- **Profils** : Stockage et récupération des données utilisateurs (`User`).
- **Statistiques** : Gestion des statistiques vendeurs (`SellerStats`).
- **Sécurité des données** : Protection des champs sensibles (email, téléphone).

### 3. Base de Données
Le service possède sa propre connexion Prisma vers la base de données PostgreSQL. Il gère toutes les migrations définies dans `prisma/schema.prisma`.

## Interaction avec la Gateway
Le Auth Service :
- Ne doit **jamais** être exposé directement si possible.
- Vérifie la présence du header `x-internal-gateway` pour accepter une requête.
- Reçoit l'`userId` via le token interne décodé par la Gateway (pour les routes authentifiées).
