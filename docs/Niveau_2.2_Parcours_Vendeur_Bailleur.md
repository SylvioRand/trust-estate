# 📗 Niveau 2.2 — Parcours Vendeur / Bailleur

## Objectif

Décrire le cycle de vie complet d'une annonce.

---

## 🎯 Résumé MVP vs Post-MVP

| Fonctionnalité            | MVP                    | Post-MVP             |
|---------------------------|------------------------|----------------------|
| Tableau de bord vendeur   | ✅ (simplifié)         | Version complète     |
| Création d'annonce        | ✅                     |                      |
| Génération description IA | ✅ (optionnel)         |                      |
| Validation IA             |                        | ✅ Phase 2           |
| Crédits (5 gratuits)      | ✅                     |                      |
| Publication annonce       | ✅ (directe)           |                      |
| Gestion réservations      | ✅                     |                      |
| Marquer Vendu/Loué        | ✅                     |                      |
| Renouvellement annonce    |                        | ✅                   |
| Boost visibilité          |                        | ✅                   |
| Photos illimitées         |                        | ✅                   |
| Badge "Vérifié"           |                        | ✅                   |

---

## 1. Tableau de bord — Compte unifié (Documentation centralisée)

> ⚠️ **DOCUMENTATION CENTRALISÉE**
> 
> Cette section décrit le compte "Mon compte" utilisé par **TOUS les utilisateurs** (acheteurs ET vendeurs).
> Le document `Niveau_2.1` renvoie ici pour éviter la duplication.
>
> **Rappel Niveau 1 :** Un seul type de compte. Les rôles (vendeur/acheteur) sont **contextuels**.

### 1.1 Principe d'affichage

**Toutes les sections sont toujours visibles**, même si vides.

Les sections vides affichent un **état vide avec CTA** pour encourager l'action :

| Section | État vide | CTA affiché |
|---------|-----------|-------------|
| **Mes annonces** | "Vous n'avez pas encore d'annonce" | "Publiez votre première annonce" |
| **Mes visites** | "Vous n'avez pas encore réservé de visite" | "Trouvez votre prochain bien" |

> **Avantage :** L'utilisateur découvre immédiatement qu'il peut être vendeur ET acheteur.

### 1.2 Structure du Dashboard

```
Mon compte
│
├── 👤 Mon profil
│   ├── Nom, email, téléphone
│   └── Modifier mot de passe
│
├── 🏠 Mes annonces  ← TOUJOURS VISIBLE
│   ├── [Liste annonces] OU [État vide + CTA]
│   ├── Réservations reçues (demandes de visite)
│   └── Crédits & recharges
│
└── 📅 Mes visites  ← TOUJOURS VISIBLE
    ├── [Visites réservées] OU [État vide + CTA]
    └── Feedbacks à laisser
```

### 1.3 MVP vs Post-MVP

#### ✅ MVP

| Élément                            | Inclus |
|------------------------------------|--------|
| Profil basique                     | ✅     |
| Liste annonces actives             | ✅     |
| Solde crédits                      | ✅     |
| Recharger crédits                  | ✅     |
| Voir réservations reçues (vendeur) | ✅     |
| Voir visites réservées (acheteur)  | ✅     |

#### 🔄 Post-MVP

| Élément                               | Phase   |
|---------------------------------------|---------|
| Annonces archivées (historique)       | Phase 2 |
| Statistiques détaillées (vues, clics) | Phase 2 |
| Notifications push                    | Phase 2 |
| Badge "Vendeur vérifié"               | Phase 2 |
| Historique complet utilisateur        | Phase 2 |
| Export données                        | Phase 3 |

---

## 2. Création d'une annonce ✅ MVP

### Étapes
1. type : vente ou location
2. informations du bien
3. localisation approximative (zone prédéfinie)
4. photos
5. description (libre ou générée par IA)

### Contraintes
- champs obligatoires
- ~~analyse photos (doublons, recyclage)~~ → **Post-MVP**

---

## 3. IA lors de la publication

### ✅ MVP : Publication directe

| Fonctionnalité                  | MVP            |
|---------------------------------|----------------|
| **Génération description IA**   | ✅ (optionnel) |
| **Validation IA**               | ❌ Post-MVP    |
| **Pénalités visibilité**        | ❌ Post-MVP    |

**En MVP :**
- Annonce publiée immédiatement après paiement (1 crédit)
- Toutes les annonces ont la **même visibilité**
- Pas de détection automatique d'incohérences

### 🔄 Post-MVP : Validation IA avancée

| Fonctionnalité                             | Phase     |
|--------------------------------------------|-----------|
| Détection incohérences (prix, description) | Phase 2   |
| Pénalités visibilité (-30%, -70%, -90%)    | Phase 2   |
| Détection photos recyclées                 | Phase 2   |
| Signalement modérateur automatique         | Phase 2   |
| Classement intelligent                     | Phase 3   |

---

## 4. Paiement & crédits ✅ MVP

### Crédits gratuits
- **5 crédits offerts** à l'inscription (non renouvelables)
- Permet de tester la plateforme

### Règle de publication MVP

| Action                | Coût       | MVP         |
|-----------------------|------------|-------------|
| **Annonce standard**  | 1 crédit   | ✅          |
| **Renouvellement**    | 0,5 crédit | ❌ Post-MVP |
| **Boost visibilité**  | +2 crédits | ❌ Post-MVP |
| **Photos illimitées** | +1 crédit  | ❌ Post-MVP |
| **Badge "Vérifié"**   | +1 crédit  | ❌ Post-MVP |

### Recharge crédits ✅ MVP

| Pack      | Crédits | Prix MGA  | Bonus |
|-----------|---------|-----------|-------|
| Starter   | 5       | 5 000 Ar  | —     |
| Standard  | 12      | 10 000 Ar | +2    |
| Premium   | 30      | 20 000 Ar | +5    |
| Pro       | 100     | 50 000 Ar | +20   |

### Recharge via
- Mobile Money (Orange Money, MVola)

---

## 5. Publication & visibilité ✅ MVP

- annonce visible après paiement
- score initial neutre

### Visibilité influencée par (simplifié en MVP)
- complétude de l'annonce
- ~~historique vendeur~~ → Post-MVP
- ~~feedbacks~~ → Post-MVP (simplifié)


---

## 6. Réservations ✅ MVP

### Gestion MVP
- définition disponibilités
- acceptation / refus

### Post-MVP
- annulation exceptionnelle avec pénalité
- proposer créneaux alternatifs

---

## 7. Marquer Vendu/Loué ✅ MVP

Le vendeur peut marquer son annonce comme **"Vendue"** ou **"Louée"**.

**Action :**
- Bouton "Marquer comme vendu" ou "Marquer comme loué" dans le dashboard

**Effet :**
- L'annonce **disparaît** des résultats de recherche
- L'annonce **reste** dans l'historique du vendeur

> **Rappel du rôle de la plateforme :**  
> La plateforme ne vérifie pas si la transaction a réellement eu lieu.  
> Son rôle est **uniquement la mise en relation** acheteur/vendeur.

