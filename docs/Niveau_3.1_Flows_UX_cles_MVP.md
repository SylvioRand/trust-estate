# 📕 Niveau 3.1 — Flows UX clés (MVP)

## Objectif

Définir des parcours UX clairs, séquentiels et actionnables, permettant au frontend de construire un prototype fidèle sans interprétation.

Chaque flow précise :
- les écrans
- les actions utilisateur
- les états UI
- ce qui est mocké

---

## Flow A — Acheteur / Locataire (Découverte → Visite → Feedback)

### A1. Écran Home

**Actions possibles :**
- rechercher par zone
- choisir vente ou location
- cliquer sur une annonce mise en avant

**États UI :**
- visiteur
- utilisateur connecté

**Données :**
- annonces mockées (liste)

---

### A2. Écran Liste des annonces

**Actions :**
- filtrer (prix, surface, type)
- trier (pertinence)
- ouvrir une fiche annonce

**États UI :**
- chargement
- résultats
- aucun résultat

**Données :**
- annonces filtrées (mock)

---

### A3. Écran Fiche annonce

**Contenu affiché :**
- photos
- description
- caractéristiques
- score confiance
- statut (actif / vendu / loué)

**Actions :**
- réserver une visite

**Règles :**
- vendeur masqué tant que visite non réservée

---

### A4. Écran Réservation de visite

**Préconditions :**
- utilisateur connecté
- ~~téléphone vérifié~~ → **Post-MVP** (en MVP : tous les users peuvent réserver)

**Actions :**
- choisir un créneau
- confirmer

**États UI :**
- confirmation
- erreur (crédit insuffisant / indisponible)

**Effets :**
- contact vendeur visible

---

### A5. Écran Confirmation visite

**Contenu :**
- résumé
- contact vendeur
- rappel date

**Actions :**
- ajouter au calendrier (mock)

---

### A6. Écran Feedback post-visite

**Déclencheur MVP :**
- Automatique : si `réservation.slot < maintenant` → feedback disponible
- Pas d'action manuelle requise

> **Post-MVP :** Fenêtre de feedback limitée à 7 jours

**Actions :**
- noter (1–5)
- commenter

**Règles :**
- un seul feedback par visite

---

## Flow B — Vendeur / Bailleur (Publication → Gestion → Archivage)

### B1. Dashboard vendeur

**Actions :**
- voir annonces
- consulter réservations
- consulter solde crédits

**États UI :**
- aucune annonce
- annonces actives

---

### B2. Création d'annonce

**Étapes UX :**
1. Type (vente / location)
2. Infos bien (surface, pièces, prix, zone)
3. Photos (upload multiple)
4. Description (manuelle ou générée par IA)

**Flow Génération Description IA :**

```
1. Vendeur remplit infos bien (type, surface, zone, prix, caractéristiques)
   ↓
2. Bouton "✨ Générer description avec IA" visible
   ↓
3. Clic → Appel API POST /listings/generate-description
   ↓
4. États UI :
   - ⏳ "Génération en cours..." (loading)
   - ✅ Description affichée dans le champ texte
   - ❌ "Service indisponible, écrivez manuellement" (fallback)
   ↓
5. Vendeur peut :
   - ✏️ Modifier le texte généré
   - 🔄 Régénérer (max 3 fois)
   - ✍️ Supprimer et écrire manuellement
```

**Limites :**
- Maximum 3 régénérations par annonce
- LLM : À définir (OpenAI, Claude, Mistral...)
- Fallback : Écriture manuelle si IA indisponible

**Actions finales :**
- Soumettre l'annonce

---

### B3. Validation IA 🔄 POST-MVP

> **MVP :** Pas de validation IA. Publication directe après paiement. Le badge "Validé" n'apparaît pas.

**Post-MVP — États possibles :**

| État | Badge | Visibilité |
|------|-------|------------|
| ✅ Acceptée | Vert "Validée" | Normale |
| ⚠️ Incohérences mineures | Orange | -30% |
| 🔶 Incohérences majeures | Rouge | -70% |
| 🚨 Fraude manifeste | Rouge | -90% + modérateur |

> Cette fonctionnalité sera implémentée en Phase 2.

---

### B4. Paiement (Crédits)

**Actions :**
- recharger crédits
- confirmer paiement publication

**États :**
- succès
- échec

**Affichage :**
- Solde actuel
- Coût publication
- Solde après publication

---

### B5. Publication

**Résultat :**
- annonce visible
- score initial neutre
- badge validation IA

**Notification :**
- "Votre annonce est maintenant visible"
- Lien vers l'annonce publiée

---

### B6. Gestion des réservations

**Actions :**
- accepter / refuser
- proposer créneaux alternatifs

**États :**
- réservation en attente
- réservation confirmée
- réservation annulée

---

### B7. Marquer Vendu/Loué

**Action :**
- Bouton "Marquer comme vendu" ou "Marquer comme loué"

**Effets :**
- L'annonce disparaît des résultats de recherche
- L'annonce reste dans l'historique du vendeur

> **Rappel :** La plateforme ne vérifie pas la transaction. Son rôle = mise en relation uniquement.

---

## Notes MVP

**Toutes les données sont mockées :**
- Aucun paiement réel
- Aucun SMS réel
- Aucun email réel

**Objectif :** Réalisme UX, pas implémentation finale.

**Validation IA :** 
- Aucune validation automatique en MVP.
- Publication instantanée.

