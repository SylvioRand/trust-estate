# 📕 Niveau 3.4 — Règles Frontend critiques & États UI (MVP)

## Objectif

Définir sans ambiguïté les règles frontend critiques afin que le prototype :
- soit cohérent fonctionnellement
- respecte les règles produit (Niveau 2)
- reste réaliste sans backend réel

---

## 1. Règles globales d'affichage

### 1.1 Authentification

**Utilisateur non connecté (visiteur) :**
- peut consulter les annonces
- ne peut pas réserver
- redirigé vers login si action privée

**Utilisateur connecté :**
- peut réserver des visites
- peut publier (s'il a des crédits)
- accès à son dashboard

### 1.2 Pages Publiques vs Privées

| Page                       | Accès           | Notes                                     |
|----------------------------|-----------------|—------------------------------------------|
| **Accueil / Home**         | 🌐 Public       | Visiteur peut explorer                    |
| **Liste des annonces**     | 🌐 Public       | Visiteur peut chercher et filtrer         |
| **Fiche annonce**          | 🌐 Public       | Visiteur peut voir, CTA redirige au login |
| **Réservation de visite**  | 🔒 Privé        | Connexion requise                         |
| **Dashboard vendeur**      | 🔒 Privé        | Connexion requise                         |
| **Création annonce**       | 🔒 Privé        | Connexion requise                         |
| **Mon profil**             | 🔒 Privé        | Connexion requise                         |
| **Feedback post-visite**   | 🔒 Privé        | Connexion requise                         |
| **Login / Register**       | 🌐 Public       | Accès uniquement si non connecté          |

> **Principe :** Permettre la découverte sans friction, demander la connexion uniquement pour les actions engageantes.

### 1.3 Vérification téléphone

> **MVP :** Tous les utilisateurs peuvent réserver sans vérification téléphone.

### 1.4 Sécurité & Tokens (Mise à jour)
- **Stockage :** Interdiction stricte de stocker les tokens (`realestate_access_token`, `realestate_refresh_token`) dans `localStorage` ou `sessionStorage`.
- **Transport :** Utiliser exclusivement des **Cookies HttpOnly**.
- **API Client :** Configurer Axios/Fetch avec `withCredentials: true` (ou `credentials: 'include'`).

---

## 2. Règles de masquage / révélation

### 2.1 Informations vendeur

**Avant réservation :**
- nom vendeur masqué
- contact masqué

**Après réservation confirmée :**
- contact vendeur visible

### 2.2 Annonces vendues / louées

- visibles en consultation
- badge "Vendu" / "Loué"
- CTA désactivé

---

## 3. Règles liées aux crédits

### 3.1 Affichage du solde

**Emplacement :** Visible dans le dashboard vendeur (section "Mes annonces")

**Format :** "X crédits disponibles"

### 3.2 État "Crédits suffisants"

- Bouton "Publier" actif
- Publication autorisée

### 3.3 État "Crédits insuffisants" (solde = 0)

**Ce qui fonctionne toujours :**
- ✅ Annonces existantes restent visibles
- ✅ Accès au dashboard

**Ce qui est bloqué :**
- ❌ Création de nouvelles annonces
- ❌ Réservation de visites (coût: 1 crédit)

**UI à afficher :**

| Écran                | Élément          | Comportement                                 |
|----------------------|------------------|--------------------------------------------  |
| **Dashboard**        | Badge solde      | "0 crédit" en rouge                          |
| **Création annonce** | Bouton "Publier" | Désactivé (grisé)                            |
| **Création annonce** | Message          | "Vous n'avez plus de crédits"                |
| **Création annonce** | CTA              | "Recharger maintenant" → `/credits/recharge` |
| **API Response**     | Erreur 402       | `{ "error": "insufficient_credits" }`        |

---

## 4. États UI obligatoires

**Chaque écran doit gérer :**
- état loading
- état success
- état error
- état empty (avec CTA quand pertinent)

### 4.1 États vides du Dashboard

**Toutes les sections du dashboard sont toujours visibles**, même vides.

| Section                 | Message état vide                           | CTA                                                |
|-------------------------|---------------------------------------------|----------------------------------------------------|
| **Mes annonces**        | "Vous n'avez pas encore d'annonce"          | "Publiez votre première annonce" → `/listings/new` |
| **Mes visites**         | "Vous n'avez pas encore réservé de visite"  | "Trouvez votre prochain bien" → `/listings`        |
| **Réservations reçues** | "Aucune demande de visite"                  | —                                                  |
| **Feedbacks à laisser** | "Aucun feedback en attente"                 | —                                                  |

> **Principe :** L'état vide n'est jamais silencieux. Il informe ET encourage l'action.

---

## 5. États spécifiques par feature

### 5.1 Publication annonce

**États MVP :**
- en cours de création
- publiée (après paiement du crédit)

### 5.2 Réservation

**États :**
- créneau indisponible
- réservation confirmée
- réservation annulée

### 5.3 Feedback

**Disponibilité MVP :**
- Si `réservation.slot < maintenant` → feedback disponible
- Pas d'action manuelle requise

**États :**
- non disponible (créneau pas encore passé)
- disponible (créneau passé)
- envoyé (désactivé après envoi)

---

## 6. Comportements fallback (mock)

**API indisponible :**
- afficher données mock statiques

**Erreur API :**
- afficher message générique

---

## 7. Règles de cohérence UX

- aucun bouton sans action définie
- aucune page vide sans explication
- aucun état silencieux

---

## Conclusion

Ces règles garantissent :
- un prototype réaliste
- une UX cohérente

👉 Le Niveau 3 MVP est maintenant COMPLET.

---

**Version :** 1.0  
**Statut :** Document de référence  
**Date :** Décembre 2024
