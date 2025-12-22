# 📕 Niveau 3.1 — Flows UX clés (MVP) — VERSION CORRIGÉE (UPDATE)

## Objectif

Définir des parcours UX clairs, intégrant les nouvelles features (Numerologie, Email Check).

---

## Flow 🆕 C — Assistant Intelligent (Numerologie & Market)

### C1. Interface Conversation
- **Nouvelle Feature : Numérologie Immobilière**
    - L'utilisateur peut demander : "Analyse les chiffres de ce bien".
    - L'IA répond avec :
        - ROI estimé.
        - Prix/m² vs Quartier.
        - Tendance (Hausse/Baisse).
- **Konsole Data** : Graphiques simples affichés dans le chat.

### C2. Limites
- Pas de validation de description (Cleanup).
- Pas de conseil juridique.

---

## Flow A — Acheteur (Réservation Sécurisée)

### A1. Réservation
1. Clic "Réserver".
2. **Check Auth** :
    - Si pas connecté -> Login.
    - Si connecté mais Email non validé -> **Écran Blocage** "Veuillez valider votre email".
        - Bouton "Renvoyer email".
3. Sélection Créneau.
4. Confirmation -> **Envoi Notification Email Réelle**.

### A2. Feedback
- Disponible uniquement post-visite.
- **Contrainte Frontend** :
    - `textarea minlength=128`
    - `textarea maxlength=256`
    - "Votre commentaire doit faire entre 128 et 256 caractères".

---

## Flow B — Vendeur (Création Avancée)

### B1. Formulaire Création (Champs Nouveaux)
- **Select Type** : Terrain / Appartement / etc.
- **Affichage Conditionnel** :
    - Si `Terrain` : Afficher "Eau", "Électricité", "Constructible". Cacher "Cuisine", "Chambres".
    - Si `Appartement` : Afficher "Étage", "Ascenseur".
- **Tags** : Checkbox multiple "Urgent", "Exclusif".

### B2. Paiement
- Écran "Payer 1 Crédit".
- **Simulation** : Validation immédiate sans redirect externe.
- Succès -> Publication.

---

**Version :** 3.0 (Update Feedback)  
**Date :** Décembre 2024

