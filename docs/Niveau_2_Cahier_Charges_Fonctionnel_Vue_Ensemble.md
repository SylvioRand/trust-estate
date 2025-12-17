# 📗 Niveau 2 — Cahier des Charges Fonctionnel (Vue d'ensemble)

## Rôle du document

Document central de travail décrivant toutes les fonctionnalités, règles métier et responsabilités du produit. Il est strictement aligné avec le **Niveau 1 — Vision & Philosophie Produit**.

Ce document ne décrit pas la technique (Niveau 3) mais fixe le contrat produit.

---

## 1. Périmètre général

La plateforme permet :
- la vente et la location de biens immobiliers
- la mise en relation structurée acheteurs / vendeurs / locataires / bailleurs
- la construction d'une confiance progressive via classement, historique et feedback

**La plateforme n'effectue pas la transaction légale.**

---

## 2. Acteurs du système

### 2.1 Acheteur / Locataire

- consulter les annonces
- réserver des visites
- laisser un feedback post-visite

### 2.2 Vendeur / Bailleur

- publier des annonces
- gérer les réservations
- déclarer une vente ou location conclue

### 2.3 Modérateur

- superviser la qualité
- gérer les signalements
- intervenir humainement sur la visibilité

### 2.4 Système IA

- assister la rédaction
- valider les descriptions
- détecter incohérences et signaux faibles

---

## 3. Authentification & Compte utilisateur

### Méthodes supportées

- email + mot de passe
- téléphone + OTP
- Google OAuth

### Règles

- 1 compte = 1 email + 1 téléphone uniques
- un même compte peut acheter et vendre

---

## 4. Découpage du Niveau 2

Le Niveau 2 est composé de plusieurs documents :

- **Document 2.1 :** Parcours Acheteur / Locataire
- **Document 2.2 :** Parcours Vendeur / Bailleur
- **Document 2.3 :** Modération, Classement, Monnaie, MVP

**Ces documents forment un seul et même Niveau 2.**

