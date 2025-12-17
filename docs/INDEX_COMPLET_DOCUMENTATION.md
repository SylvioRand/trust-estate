# 📚 INDEX COMPLET — Documentation Plateforme Immobilière Madagascar

## Vue d'ensemble

Cette documentation complète décrit l'intégralité du projet de plateforme immobilière digitale pour Madagascar, du concept à l'implémentation technique.



---

## 📋 Structure de la documentation

La documentation est organisée en **3 niveaux hiérarchiques** :

```
Niveau 1 (Vision & Philosophie)
    ↓
Niveau 2 (Cahier des Charges Fonctionnel)
    ↓
Niveau 3 (Spécification Technique MVP)
```

---

## 📘 Niveau 1 — Vision & Philosophie

### Document principal
**`Niveau_1_Vision_Philosophie_Produit.md`**

**Contenu :**
- Introduction et contexte Madagascar
- Problèmes réels du marché immobilier
- Vision produit (vente + location)
- Philosophie produit (3 principes fondateurs)
- Positionnement stratégique
- Comptes et rôles
- Localisation et sécurité
- Documents fonciers (position éthique)
- Vérification des annonces
- Réservation de visite
- Modèle économique
- Assistant IA
- Rôle du modérateur
- Limites éthiques et légales



---

## 📗 Niveau 2 — Cahier des Charges Fonctionnel

### Vue d'ensemble
**`Niveau_2_Cahier_Charges_Fonctionnel_Vue_Ensemble.md`**

**Contenu :**
- Périmètre général
- Acteurs du système
- Authentification
- Structure des documents Niveau 2



---

### Documents détaillés

#### 1. Parcours Acheteur / Locataire
**`Niveau_2.1_Parcours_Acheteur_Locataire.md`**

**Contenu :**
- Écran Home
- Liste des annonces
- Fiche annonce
- Réservation de visite
- Après la visite (feedback)
- Historique utilisateur



---

#### 2. Parcours Vendeur / Bailleur
**`Niveau_2.2_Parcours_Vendeur_Bailleur.md`**

**Contenu :**
- Tableau de bord vendeur
- Création d'annonce
- Validation IA (4 niveaux)
- Modèle crédits détaillé
- Publication & visibilité
- Gestion réservations
- Vente / Location conclue
- Archivage

---

#### 3. Modération, Classement, Monnaie & MVP
**`Niveau_2.3_Moderation_Classement_Monnaie_MVP.md`**

**Contenu :**
- Modération humaine
- Classement & visibilité
- Monnaie virtuelle (crédits)
- États limites
- MVP vs Hors-MVP
- Interface modérateur MVP



## 📕 Niveau 3 — Spécification Technique MVP

### Vue d'ensemble
**`Niveau_3_Specification_UX_Technique_Vue_Ensemble.md`**

**Contenu :**
- Objectif Niveau 3 MVP
- Périmètre technique
- Stack cible
- Structure des documents



---

### Documents détaillés

#### 1. Flows UX clés (MVP)
**`Niveau_3.1_Flows_UX_cles_MVP.md`**

**Contenu :**
- Flow A : Acheteur/Locataire (6 écrans)
- Flow B : Vendeur/Bailleur (7 écrans)
- États validation IA
- Notes MVP

---

#### 2. Spécification API Complète
**`Niveau_3.2_Specification_API.md`**

**Contenu :**
- 33 endpoints REST complets
- Authentification (inscription, login, refresh, logout)
- Profil utilisateur
- Annonces (CRUD, disponibilités, génération IA)
- Réservations
- Feedback
- Crédits
- Zones
- Modération (endpoints admin)
- Upload images
- Compatible Apidog / OpenAPI 3.0

---

#### 3. Modèles de données (MVP)
**`Niveau_3.3_Modeles_Donnees.md`**

**Contenu :**
- User
- Listing
- Reservation
- Feedback
- CreditBalance
- CreditTransaction
- Zone
- ModerationAction
- Relations clés
- Diagrammes

---

#### 4. Règles Frontend critiques & États UI
**`Niveau_3.4_Regles_Frontend_critiques_Etats_UI_MVP.md`**

**Contenu :**
- Règles globales d'affichage
- Règles masquage/révélation
- Règles crédits
- États UI obligatoires
- États spécifiques par feature
- Comportements fallback
- Règles cohérence UX



---

## 📊 Documents transversaux

### README Principal
**`README.md`**

**Contenu :**
- Vue d'ensemble du projet
- Guide de navigation de la documentation
- Instructions de démarrage rapide



---

### Spécification API Complète (Apidog)
**`Niveau_3.2_Specification_API.md`**

**Contenu :**
- Spécification API complète et détaillée
- Format compatible Apidog
- Tous les endpoints avec exemples
- Schémas de données complets
- Codes d'erreur exhaustifs



---

## 🎯 Guide de lecture selon les profils

### 👔 Chef de projet
**Lecture recommandée :**
1. `README.md`
2. `Niveau_1_Vision_Philosophie_Produit.md`
3. Niveau 2 complet

---

### 💻 Développeur Frontend
**Lecture recommandée :**
1. `README.md`
2. `Niveau_3.1_Flows_UX_cles_MVP.md`
3. `Niveau_3.2_Specification_API.md`
4. `Niveau_3.4_Regles_Frontend_critiques_Etats_UI_MVP.md`

**Référence permanente :**
- `Niveau_3.3_Modeles_Donnees.md`

---

### 🔧 Développeur Backend
**Lecture recommandée :**
1. `README.md`
2. `Niveau_3.2_Specification_API.md`
3. `Niveau_3.3_Modeles_Donnees.md`

**Référence permanente :**
- Niveau 2 complet (règles métier)

---

### 🎨 Designer UX/UI
**Lecture recommandée :**
1. `Niveau_1_Vision_Philosophie_Produit.md`
2. `Niveau_2.1_Parcours_Acheteur_Locataire.md`
3. `Niveau_2.2_Parcours_Vendeur_Bailleur.md`
4. `Niveau_3.1_Flows_UX_cles_MVP.md`

---

### 🧪 QA / Testeur
**Lecture recommandée :**
1. `README.md`
2. Niveau 2 complet
3. `Niveau_3.4_Regles_Frontend_critiques_Etats_UI_MVP.md`
4. `Niveau_3.2_Specification_API.md`

---

## 📈 Statut global de la documentation
### Prêt pour développement

- Vision claire et assumée
- Règles métier cohérentes
- Spécifications techniques complètes
- Workflows détaillés
- API mockables
- Modèles de données stables
