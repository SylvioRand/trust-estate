# 📗 Niveau 2.3 — Modération, Classement & Crédits

## 🎯 Résumé MVP

| Fonctionnalité                    | MVP   |
|-----------------------------------|-------|
| Crédits (5 gratuits + recharge)   | ✅    |
| Publication = 1 crédit            | ✅    |
| Modération manuelle (signalements)| ✅    |
| Interface modérateur (3 écrans)   | ✅    |
| Classement par date/complétude    | ✅    |

---

## 1. Crédits ✅ MVP

### Nature
- Unité interne, non transférable, non remboursable

### Acquisition MVP
- **5 crédits gratuits** à l'inscription
- **Recharge Mobile Money** (Orange Money, MVola)

### Utilisation MVP
| Action              | Coût       |
|---------------------|------------|
| Publication annonce | 1 crédit   |
| Réservation visite  | 1 crédit   |
| Renouvellement      | 0.5 crédit |

### Crédits épuisés
- Annonces existantes **restent visibles**
- Nouvelles publications **bloquées**
- Réservation de visites **bloquées** (solde nul)
- Message : "Rechargez pour publier"

---

## 2. Classement & Visibilité

### ✅ MVP : Classement simple

En MVP, le classement des annonces est **basique** :
- Par **date de publication** (plus récent = plus haut)
- Par **complétude** (annonces complètes favorisées)

> Pas de pénalités automatiques, pas de bonus, pas de scoring complexe.

### ✅ Philosophie : "Fraîcheur Garantie"
**Pourquoi ce système ?**
Pour éviter le syndrome des "annonces zombies" (biens vendus mais toujours affichés) qui frustrent les acheteurs sur les plateformes classiques.
*   **Règle :** Toute annonce expire techniquement après 30 jours (`expiresAt`).
*   **But :** Forcer le vendeur à réaffirmer périodiquement la disponibilité du bien.
*   **Résultat :** "Si c'est sur le site, c'est disponible (ou confirmé récemment)."

---
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
| Accès `/moderator/*` | ❌ 403 Forbidden | ✅ Autorisé    |
| Publier annonces | ✅               | ❌ (pas prévu) |
| Crédits          | ✅               | ❌             |

### Interface Modérateur MVP (3 écrans)

```
1. Dashboard (/admin)
   └── Liste des annonces signalées par les utilisateurs

2. Détail annonce (/moderator/listings/:id)
   ├── Voir l'annonce complète
   ├── Infos vendeur
   └── Actions possibles
```

### Actions disponibles MVP

| Action                      | Description                   |
|-----------------------------|-------------------------------|
| **Demander clarification**  | Envoyer un message au vendeur |
| **Masquer temporairement**  | 48h max, le temps de vérifier |
| **Archiver définitivement** | Fraude avérée uniquement      |

---