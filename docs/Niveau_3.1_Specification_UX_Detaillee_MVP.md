# 📕 Niveau 3.1 — Spécification UX Détaillée (MVP)

## Objectif

Ce document remplace les anciens flows partiels. Il décrit **intégralement** l'expérience utilisateur, écran par écran, pour le MVP.
Il sert de référence unique pour les développeurs Frontend (Next.js).

---

## 1. Structure Globale & Navigation

### 1.1 Header (Global)
**États :**
1.  **Visiteur (Non connecté)**
    *   Logo (Redirection `/`)
    *   Menu Desktop : `Acheter`, `Louer`, `Vendre` (redirige vers Login/Creation)
    *   Droite :
        *   Sélecteur Langue (FR/EN/MG) - *Dropdown*
        *   Bouton `Connexion` (Variant Ghost)
        *   Bouton `Inscription` (Variant Primary)
2.  **Connecté (User)**
    *   Logo (Redirection `/`)
    *   Menu Desktop : `Acheter`, `Louer`
    *   Droite :
        *   Sélecteur Langue
        *   **Menu Avatar** (Dropdown) :
            *   `Mon Tableau de Bord`
            *   `Mes Favoris`
            *   `Mes Visites (Acheteur)`
            *   `Déconnexion`
        *   Bouton CTA `Publier une annonce` (Variant Outline ou Primary) -> `/listings/new`

**Comportement Mobile :**
*   Burger Menu à droite.
*   Ouvre un "Sheet" ou "Drawer" latéral contenant les mêmes liens.

### 1.2 Footer (Global)
*   Links : `À propos`, `CGU`, `Confidentialité`.
*   Copyright.

---

## 2. Parcours Public (Découverte)

### 2.1 Page d'Accueil (`/`)
*   **Hero Section** :
    *   Titre accrocheur (H1).
    *   **Barre de Recherche Rapide** (Centrale) :
        *   Input texte "Ville, Quartier...".
        *   Select "Acheter" / "Louer".
        *   Bouton Recherche.
*   **Catégories Rapides** (Chips/Icones) : `Appartements`, `Maisons`, `Terrains`, `Lofts`.
*   **Section "Dernières Annonces"** : Grid de 3 ou 4 cartes.
*   **Section "Pourquoi nous choisir"** (Réassurance Clean & Trust).

### 2.2 Page de Résultats / Recherche (`/listings`)
**Layout :**
*   **Sidebar (Desktop) / Modal Filtres (Mobile)** :
    *   **Transaction** : Acheter / Louer (Radio ou Tabs).
    *   **Type de bien** : Checkbox multiple (Maison, Appart, Terrain...).
    *   **Prix** : Range Slider (Min - Max).
    *   **Surface** : Range Slider.
    *   **Pièces** : Boutons "Studio", "2", "3", "4", "5+".
    *   **Spécifique Terrain** (Affiché si "Terrain" coché) : Constructible (Oui/Non), Eau, Électricité.
*   **Contenu Principal** :
    *   Header liste : "X résultats pour votre recherche" + Tri (Prix croissant/décroissant, Plus récent).
    *   **Grid des cartes** (Responsive : 1 col mobile, 3 cols desktop).
    *   **Pagination** en bas (Simpifiée : Précédent / Suivant ou Load More).

### 2.3 Composant "Carte Annonce" (ListingCard)
*   **Image** : Aspect ratio 4:3 ou 16:9. Cover object.
*   **Tags (Overlay)** :
    *   Top Left : Badge "Exclusif" (si applicable), Badge "Urgent".
    *   Top Right : Bouton "Cœur" (Favoris) - *Interaction immédiate*.
*   **Infos** :
    *   Prix (Formaté : "100 000 000 Ar").
    *   Titre (ex: "Villa 4 pièces Ivandry").
    *   Localisation : Quartier uniquement (ex: "Antananarivo, Ivandry").
    *   Caractéristiques (Icons) : Lits, SDB, Surface (m²).

### 2.4 Fiche Détail Annonce (`/listings/[id]`)
**Header Média :**
*   Grid photos mosaïque ou Carrousel (Mobile).
*   Bouton "Voir toutes les photos".
*   Bouton "Favoris" (Cœur) visible.
*   Bouton "Signaler" (Drapeau) - *Ouvre modal signalement*.

**Contenu (2 colonnes Desktop) :**
*   **Colonne Gauche (Détails)** :
    *   Fil d'ariane.
    *   H1 Titre.
    *   Prix.
    *   **Caractéristiques Clés** : Grid d'icônes with labels.
    *   **Description** : Titre, Description, Prix... et **Disponibilités**.
        *   *UI Disponibilités* : Semainier simple (Lundi-Dimanche). Coche "Matin (9h-12h)" / "Après-midi (14h-18h)".
    *   **Photos** : Upload drag & drop (min 3).
    *   **Assistant IA** (Float ou intégré) :
        *   **Philosophie** : "Démocratiser l'expertise." L'IA remplace le conseiller immobilier pour donner des données objectives (Prix marché, tendances, commodités).
        *   Chat pour questions contextuelles ("Quel est le ROI ?", "Est-ce cher pour le quartier ?").

*   **Colonne Droite (Action - Sticky) :**
    *   **Card Propriétaire** (Masqué jusqu'à réservation confirmée) :
        *   "Vendeur Particulier" (Anonyme).
    *   **Module de Réservation** :
        *   **"Demander une visite"** (Sticky Bottom sur mobile).
    *   Ouvre **Modal Réservation** :
        *   **Calendrier** : Affiche les jours disponibles.
        *   **Créneaux** : Liste des heures dispos (basé sur `GET /slots`).
        *   Sélection -> Résumé -> Confirmer (1 crédit).
    *   *Info Coût* : "Réserver cette visite coûte 1 crédit."
            *   Bouton `Demander une visite` (Disabled si solde = 0).

---

## 3. Parcours Authentification (Auth)

### 3.1 Inscription (`/register`)
*   **Formulaire** :
    *   Nom (ex: Rakoto).
    *   **Prénom** (ex: Jean).
    *   Email.
    *   **Téléphone (Obligatoire)** (Format international +261...). *Info-bulle: "Validation de format uniquement."*
    *   Mot de passe.
*   **Action** : "S'inscrire".
*   **Post-Action** :
    *   Envoi Email de vérification.
    *   Redirection page "Vérifiez votre email".
    *   *Note : Pas de connexion automatique. L'utilisateur DOIT vérifier son email.*

### 3.2 Vérification Email
*   L'utilisateur clique sur le lien dans l'email.
*   Page "Succès" -> Redirection `/login`.
*   *Note : Le téléphone n'est PAS vérifié (Pas d'OTP).*

### 3.3 Login (`/login`)
*   Formulaire : Email, Mot de passe.
*   **Logique de blocage** :
    *   Si email non vérifié -> **Erreur 403** : "Veuillez vérifier votre email pour accéder à votre compte." + Lien "Renvoyer l'email".
    *   *Note : Aucune action (Réserver, Publier, Favoris) n'est possible sans login validé.*

### 3.4 Pas de 2FA
*   Suppression explicite de tout mécanisme 2FA pour le MVP.

---

## 4. Parcours Acheteur (Privé)

### 4.0 Solde Crédits
*   Affiché dans le Header.
*   Permet de réserver des visites.
*   Si solde insuffisant : Redirection vers Recharge.

### 4.1 Mes Favoris (`/dashboard/favorites`)
*   Grille des annonces marquées "Cœur".
*   Action : Retirer des favoris.
*   Tri : Date d'ajout.

### 4.2 Gestion des Réservations (`/dashboard/visits`)
**Liste des demandes de visites (Côté Acheteur) :**
*   Tableau ou Liste de cartes.
*   Colonnes : Annonce, Date, Statut.

**Cycle de Vie & Actions (Deep Management) :**
1.  **En attente** (Pending) :
    *   Action possible : `Annuler la demande`.
2.  **Confirmé** (Confirmed) :
    *   Le vendeur a accepté.
    *   **Information** : Le numéro du vendeur s'affiche.
    *   Action possible : `Annuler` (jusqu'à 2h avant).
3.  **Refusé** (Rejected) :
    *   Motif affiché (si fourni).
    *   Action : Voir d'autres annonces.
4.  **Terminé** (Done) :
    *   La date est passée.
    *   Action : `Laisser un avis` (Feedback).
    *   Statut final.
5.  **Annulé** (Cancelled) :
    *   Par l'acheteur ou le vendeur avant la date.

### 4.3 Feedback Post-Visite
*   Accessible uniquement si statut = **Terminé**.
*   Modal : Note (1-5) + Commentaire (128-256 chars obligatoires).

---

## 5. Parcours Vendeur (Privé)

### 5.1 Dashboard Unifié (`/dashboard`)
*   **Sidebar** :
    *   Vue Ensemble.
    *   **Mes Annonces** (Gestion biens).
        *   Liste des cartes "Vendeur".
        *   **Status** : Active (Verte), Expirée (Rouge), Archivée (Grise).
        *   **Action "Renouveler"** :
            *   Visible si `expiresAt < now + 5 days`.
            *   Clic -> Affiche prix (0.5 crédit) -> Confirmation.
    *   **Réservations reçues** (Gestion des demandes de visite).
    *   Portefeuille Crédits.

### 5.2 Création Annonce (`/listings/new`)
**Pré-requis** : Avoir au moins **1 Crédit**.
*   Si Solde = 0 -> Redirection forcée ou Modal bloquante "Rechargez vos crédits pour publier".

**Wizard (Étapes) :**
1.  **Catégorie** (Maison, Appart, Terrain...) + **Localisation**.
2.  **Caractéristiques** (Surface, Pièces...).
3.  **Médias** (Photos).
4.  **Description** (IA optionnelle).
5.  **Paiement** : "Publier pour 1 Crédit".

### 5.3 Gestion des Réservations reçues (Vendeur)
**Liste des demandes reçues :**
*   Affichage : Nom acheteur, Créneau demandé.
*   **Actions** :
    *   `Accepter` -> Passe en "Confirmé" -> Acheteur reçoit notif.
    *   `Refuser` -> Passe en "Refusé" -> Acheteur reçoit notif.
    *   *Note : Pas de proposition de nouveau créneau (MVP). Si refus, l'acheteur doit refaire une demande.*

---

## 6. Parcours Modérateur (Admin)

### 6.1 Admin Dashboard (`/admin`)
*   Liste des signalements.
*   Actions : Masquer, Archiver d'office.

---

**Version :** 2.0 (User Feedback Integrated)  
**Date :** Décembre 2024.
