# 📕 [DEPRECATED] Niveau 2.2 — Parcours Vendeur / Bailleur (BO)

> ⚠️ **OBSOLÈTE :** Ce document est conservé pour référence historique.
> 👉 La source de vérité pour les développeurs est **[Niveau 3.1 - Spécification UX Détaillée](./Niveau_3.1_Specification_UX_Detaillee_MVP.md)**.
— VERSION CORRIGÉE (UPDATE)

## Objectif

Décrire le cycle de vie complet d'une annonce avec les nouvelles contraintes techniques.

---

## 🎯 Résumé MVP (Feedback Dev Integ)

| Fonctionnalité            | MVP                    | Changement |
|---------------------------|------------------------|------------|
| Création d'annonce        | ✅                     | + Champs complexes (Terrain, Loft) ❌ Pas de validation IA description  |
| Génération description IA | ✅ (optionnel)         |- |
| Crédits                   | ✅                     | Simulation paiement |
| Publication annonce       | ✅ (directe)           | Pas de badge confiance |

---

## 1. Tableau de bord — Compte unifié

### Structure du Dashboard (Fusionné)
Pas de séparation stricte. Le menu latéral contient :
- **Mode Vendeur** : `Mes Annonces`, `Portefeuille Crédits`, `Leads`.
- **Mode Acheteur** : `Mes Visites`, `Favoris`.

---

## 2. Création d'une annonce (Mise à jour majeure)

### Étape 1 : Catégorie & Config
- **Type** : `Appartement`, `Maison`, `Loft`, `Terrain`, `Local commercial`.
- **Si Terrain** :
    - Masquer Chambres/SDB.
    - Demander : `Accès Eau` (Oui/Non), `Accès Électricité` (Oui/Non), `Constructible`.
- **Si Habitation** :
    - `WC séparés` ?
    - `Étage` / `Ascenseur` ?
    - `Cuisine` (Américaine/Fermée/Équipée) ?

### Étape 2 : Extérieur & Tags
- `Balcon`, `Terrasse`, `Loggia`.
- `Garage`, `Box`, `Parking`.
- **Tags Marketing** : Sélection multiple (Urgent, Exclusif...).

### Étape 3 : Médias & Description
- Upload Photos.
- **Description** :
    - Génération IA possible (aide rédaction).
    - ❌ **Suppression** de la validation automatique "qualité" par IA. Le vendeur est seul responsable.

---

## 3. Paiement & Crédits (Simulation MVP)

### Règle de publication
- Coût : **1 Crédit** par annonce.

### Flow Paiement Simulé
1. L'utilisateur clique "Payer & Publier".
2. **Backend** : Simule une transaction Mobile Money réussie.
3. **Frontend** : Affiche succès immédiat et décrémente le solde.
4. Pas d'intégration API Telma/Orange réelle pour le MVP.

---

## 4. Publication & Notification

### Résultat
- Annonce visible immédiatement.
- **Pas de badge "Vérifié"** (Clean up).
- Email de confirmation envoyé au vendeur.

---

## 5. Gestion des Réservations

### Actions Vendeur
- Recevoir Email "Nouvelle demande".
- Aller sur Dashboard -> "Leads".
### Actions Vendeur
- Recevoir Email "Nouvelle demande".
- Aller sur Dashboard -> "Leads".
- **Accepter / Refuser**.
    - Si Accepte : Statut `Confirmed` (Contact révélé à l'acheteur).
    - Si Refus : Statut `Rejected` (Email auto envoyé à l'acheteur).

### Marquer Vendu/Loué
- Bouton simple.
- Archive l'annonce (plus visible publiquement).

---

**Version :** 4.0 (Update Feedback)  
**Date :** Décembre 2024

