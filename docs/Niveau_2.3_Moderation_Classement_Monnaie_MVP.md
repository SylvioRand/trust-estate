# 📗 Niveau 2.3 — Modération, Classement & Crédits

## 🎯 Résumé MVP vs Post-MVP

| Fonctionnalité                    | MVP   | Post-MVP   |
|-----------------------------------|-------|------------|
| Crédits (5 gratuits + recharge)   | ✅    |            |
| Publication = 1 crédit            | ✅    |            |
| Modération manuelle (signalements)| ✅    |            |
| Interface modérateur (3 écrans)   | ✅    |            |
| Classement par date/complétude    | ✅    |            |
| Validation IA                     |       | ✅ Phase 2 |
| Pénalités visibilité automatiques |       | ✅ Phase 2 |
| TrustScore vendeur                |       | ✅ Phase 2 |
| Détection photos recyclées        |       | ✅ Phase 2 |
| Options premium (Boost, Badge)    |       | ✅ Phase 2 |

---

## 1. Crédits ✅ MVP

### Nature
- Unité interne, non transférable, non remboursable

### Acquisition MVP
- **5 crédits gratuits** à l'inscription
- **Recharge Mobile Money** (Orange Money, MVola)

### Utilisation MVP
| Action              | Coût     |
|---------------------|----------|
| Publication annonce | 1 crédit |

### Crédits épuisés
- Annonces existantes **restent visibles**
- Nouvelles publications **bloquées**
- Réservation de visites **toujours possible**
- Message : "Rechargez pour publier"

### 🔄 Post-MVP : Options premium

| Option            | Coût       | Phase   |
|-------------------|------------|---------|
| Renouvellement    | 0,5 crédit | Phase 2 |
| Boost visibilité  | +2 crédits | Phase 2 |
| Photos illimitées | +1 crédit  | Phase 2 |
| Badge "Vérifié"   | +1 crédit  | Phase 2 |

---

## 2. Classement & Visibilité

### ✅ MVP : Classement simple

En MVP, le classement des annonces est **basique** :
- Par **date de publication** (plus récent = plus haut)
- Par **complétude** (annonces complètes favorisées)

> Pas de pénalités automatiques, pas de bonus, pas de scoring complexe.

### 🔄 Post-MVP : Classement intelligent

| Critère              | Impact   | Phase   |
|----------------------|----------|---------|
| TrustScore vendeur   | Bonus    | Phase 2 |
| Feedbacks positifs   | Bonus    | Phase 2 |
| Incohérences IA      | Pénalité | Phase 2 |
| Photos recyclées     | Pénalité | Phase 2 |
| Annulations répétées | Pénalité | Phase 2 |
| Inactivité prolongée | Baisse   | Phase 3 |

---

## 3. Modération ✅ MVP

### Principe
Le modérateur intervient **uniquement sur signalement** (pas de validation IA automatique en MVP).

### Sources de signalement MVP
- **Signalement utilisateur** : Un acheteur signale une annonce
- **Signalement manuel** : Le modérateur repère un problème

### Compte Modérateur MVP

**En MVP : 1 seul modérateur**

| Élément            | Valeur                                         |
|--------------------|------------------------------------------------|
| **Création**       | Manuellement en base                           |
| **Email**          | À définir (ex: `admin@plateforme.mg`)          |
| **Role**           | `moderator`                                    |
| **URL d'accès**    | `/admin`                                       |
| **Pas de crédits** | Le modérateur n'a pas de crédits (pas vendeur) |

**Différence avec un compte utilisateur :**

| Élément          | Utilisateur      | Modérateur     |
|------------------|------------------|----------------|
| `role`           | `user`           | `moderator`    |
| Accès `/admin/*` | ❌ 403 Forbidden | ✅ Autorisé    |
| Publier annonces | ✅               | ❌ (pas prévu) |
| Crédits          | ✅               | ❌             |

### Interface Modérateur MVP (3 écrans)

```
1. Dashboard (/admin)
   └── Liste des annonces signalées par les utilisateurs

2. Détail annonce (/admin/listings/:id)
   ├── Voir l'annonce complète
   ├── Infos vendeur
   └── Actions possibles

3. Historique actions (/admin/history)
   └── Log de toutes les actions modérateur
```

### Actions disponibles MVP

| Action                      | Description                   |
|-----------------------------|-------------------------------|
| **Demander clarification**  | Envoyer un message au vendeur |
| **Masquer temporairement**  | 48h max, le temps de vérifier |
| **Archiver définitivement** | Fraude avérée uniquement      |

### 🔄 Post-MVP : Modération avancée

| Fonctionnalité                    | Phase   |
|-----------------------------------|---------|
| Signalement automatique par IA    | Phase 2 |
| Pénalités visibilité automatiques | Phase 2 |
| Multi-modérateurs                 | Phase 3 |
| Tableau de bord statistiques      | Phase 3 |

---

## 4. Règles supprimées du MVP

Les éléments suivants **ne sont PAS dans le MVP** :

| Élément                             | Raison                  | Phase   |
|-------------------------------------|-------------------------|---------|
| Validation IA des annonces          | Complexe                | Phase 2 |
| TrustScore automatique              | Dépend de validation IA | Phase 2 |
| Détection photos recyclées          | Nécessite ML            | Phase 2 |
| Pénalités visibilité                | Pas de validation IA    | Phase 2 |
| Vendeur inactif (baisse visibilité) | Complexe                | Phase 3 |
| Annonce obsolète (signal 60j)       | Complexe                | Phase 3 |

