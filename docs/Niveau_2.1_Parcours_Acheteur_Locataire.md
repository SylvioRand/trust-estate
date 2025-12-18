# 📗 Niveau 2.1 — Parcours Acheteur / Locataire

## Objectif

Décrire écran par écran le parcours acheteur / locataire sans ambiguïté.

---

## 🎯 Résumé MVP

| Fonctionnalité            | MVP             |
|---------------------------|-----------------|
| Accueil / Home            | ✅              |
| Liste des annonces        | ✅              |
| Fiche annonce             | ✅              |
| Réservation de visite     | ✅              |
| Feedback post-visite      | ✅ (simplifié)  |

---

> **Note :** Pour les règles d'accès aux pages (publiques/privées), voir `Niveau_3.4_Regles_Frontend_critiques_Etats_UI_MVP.md`

## 1. Accueil / Home ✅ MVP

### Objectifs
- découverte rapide
- accès immédiat aux annonces

### Éléments UI
- recherche par zone
- filtres rapides (vente / location)
- annonces mises en avant (classement)

### États
- visiteur
- utilisateur connecté

---

## 2. Liste des annonces ✅ MVP

### Fonctions
- pagination
- filtres avancés (prix, surface, type)
- tri par pertinence

### Carte annonce affiche
- photos
- prix
- type de bien
- localisation approximative
- badge confiance

---

## 3. Fiche annonce ✅ MVP

### Contenu visible
- galerie photos
- description validée IA
- caractéristiques
- score de confiance
- score de confiance

### Contenu masqué
- nom du vendeur
- contact direct

### CTA principal
- réserver une visite

---

## 4. Réservation de visite ✅ MVP

> L'**acheteur/locataire** peut réserver un créneau pour visiter un bien.

### Conditions pour réserver
- Acheteur/locataire connecté à son compte
- Acheteur/locataire connecté à son compte

### Étapes
- choix créneau
- confirmation

### Effets
- contact vendeur révélé
- engagement enregistré

---

## 5. Après la visite ✅ MVP (simplifié)

### Actions MVP
- note (1 à 5)
- commentaire encadré

### Effets
- impact classement annonce
- impact score vendeur

### Déclencheur MVP
**Automatique basé sur la date :**
- Si `réservation.slot < maintenant` → feedback disponible
- Pas besoin d'action manuelle du vendeur ni de l'acheteur
- Simple vérification côté frontend

- Simple vérification côté frontend

---

## 6. Mon compte

> ⚠️ **IMPORTANT :** Le compte est **identique** pour acheteurs et vendeurs.
> 
> Toute la documentation du dashboard "Mon compte" est centralisée dans :
> **`Niveau_2.2_Parcours_Vendeur_Bailleur_CORRIGE.md` — Section 1**
>
> Cette centralisation évite la duplication et garantit que le compte reste unifié comme défini dans le Niveau 1.

### Ce que l'acheteur utilise dans "Mon compte"

| Section          | Utilisation par l'acheteur                             |
|------------------|--------------------------------------------------------|
| **Mon profil**   | ✅ Modifier ses infos                                  |
| **Mes annonces** | Visible mais peut être vide (CTA pour devenir vendeur) |
| **Mes visites**  | ✅ Voir ses réservations, laisser des feedbacks        |

---

**Version :** 2.0  
**Statut :** Document de référence (MVP clarifié)  
**Date :** Décembre 2024

