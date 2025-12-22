# 📗 Niveau 2.1 — Parcours Acheteur / Locataire

## Objectif

Décrire écran par écran le parcours acheteur / locataire sans ambiguïté.

---

## 🎯 Résumé MVP (Feedback Dev Integ)

| Fonctionnalité            | MVP             | Changement |
|---------------------------|-----------------|------------|
| Accueil / Home            | ✅              | + Sélecteur Langue, + Tags |
| Liste des annonces        | ✅              | + Filtres détaillés (Terrain...) |
| Fiche annonce             | ✅              | - Badge Confiance |
| Réservation de visite     | ✅              | + Notif Email, + Verif Email |
| Feedback post-visite      | ✅ (simplifié)  | + Limite caractères (128-256) |

---

> **Note :** Pour les règles d'accès aux pages (publiques/privées), voir `Niveau_3.4_Regles_Frontend_critiques_Etats_UI_MVP.md`

## 1. Accueil / Home ✅ MVP

### Objectifs
- découverte rapide
- accès immédiat aux annonces

### Éléments UI Nouveaux
- 🌍 **Sélecteur Langue** (FR/EN/MG) flottant.
- 🍪 **Bannière GDPR** (discret en bas) au premier chargement.
- **Tags Marketing** : "Urgent", "Exclusif" mis en avant.

### États
- visiteur (Mode Public)
- utilisateur connecté (Mode Authentifié)

---

## 2. Liste des annonces ✅ MVP

### Fonctions
- pagination
- **Filtres avancés** (Nouveaux champs) :
    - Type : Appartement, Maison, Loft, **Terrain**, Local.
    - Config : Chambres, SDB, WC séparés (Oui/Non).
    - Extérieur : Jardin, Balcon.

### Carte annonce affiche
- photos
- prix
- type de bien
- localisation approximative (Zone uniquement)
- **Tags** (Urgent, Exclusif...)
- ❌ **PAS de badge de confiance** (nettoyé)

---

## 3. Fiche annonce ✅ MVP

### Contenu visible
- galerie photos
- description (rédigée par vendeur/IA, non validée)
- caractéristiques complètes (tous les champs tech)
- **Numérologie / Market Data** (via IA Assistant)

### Contenu masqué
- nom du vendeur
- contact direct
- adresse exacte

### CTA principal
- réserver une visite

---

## 4. Réservation de visite ✅ MVP

> L'**acheteur/locataire** peut réserver un créneau pour visiter un bien.

### Conditions pour réserver
- Acheteur connecté
- **Email vérifié obligatoirement** (Si non : flow de vérification).

### Étapes
1. choix créneau
2. confirmation

### Effets & Notifications
- ✅ Email de confirmation envoyé à l'acheteur.
- ✅ Email "Nouvelle demande" envoyé au vendeur.
- 📅 Ajout au calendrier "Mes Visites".

---

## 5. Après la visite ✅ MVP (simplifié)

### Actions MVP
- note (1 à 5)
- **Commentaire Strict** :
    - Min : 128 caractères.
    - Max : 256 caractères.
    - Objectif : Éviter le spam ou les romans.

### Déclencheur
- Automatique : si `réservation.slot < maintenant`.

---

## 6. Mon compte (Dashboard Unifié)

> ⚠️ **IMPORTANT :** Le compte est **identique** pour acheteurs et vendeurs.
> Voir `Niveau_2.2` pour la structure complète du Dashboard.

---

**Version :** 3.0 (Update Feedback)  
**Date :** Décembre 2024
