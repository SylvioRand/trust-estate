# 📕 Niveau 3 — Spécification UX & Technique (MVP) — Vue d'ensemble

## Objectif du Niveau 3 MVP

Ce niveau traduit le cahier des charges fonctionnel (Niveau 2) en éléments actionnables pour le prototype :
- flows UX clairs
- attentes frontend précises
- contrats API mockables (sans backend réel)

⚠️ Ce document est volontairement limité au MVP, compatible avec un délai de 1 à 1,5 mois.

---

## Périmètre technique MVP

**Phase 1 (Prototype) :**
- Frontend fonctionnel (Next.js)
- Backend simulé (Service mock ou Next.js API Routes)
- API contracts définis (`Niveau_3.2`)

**Phase 2 (Production) :**
- Backend réel : 4 microservices Fastify
- API Gateway : Nginx
- Déploiement : Docker Compose

> Les documents de ce niveau couvrent les deux phases.

---

## Stack cible

- **Frontend :** Next.js 16 (App Router)
- **Backend Core :** Fastify (Node.js)
- **Backend AI :** Python FastAPI
- **AI Stack :**
  - **LLM :** OpenRouter + DeepSeek V3 (Cloud gratuit)
  - **Embeddings :** Sentence Transformers (all-MiniLM-L6-v2)
  - **Vector Database :** ChromaDB
- **API Gateway :** Nginx (reverse proxy, rate limiting, SSL)
- **Styling :** TailwindCSS v4.1
- **Database :** PostgreSQL
- **ORM :** Prisma
- **Architecture :** Microservices (5 services + gateway)
- **Déploiement :** Docker Compose

---

## Découpage du Niveau 3 MVP

Le Niveau 3 est composé de plusieurs documents :

- **Document 3.1 :** Spécification UX Détaillée *(nouveau)*
- **Document 3.2 :** Contrats API (mock) *(corrigé)*
- **Document 3.3 :** Modèles de données (simplifiés) *(corrigé)*
- **Document 3.4 :** Règles frontend critiques
- **Document 3.5 :** Architecture Microservices *(nouveau)*

**Ces documents forment le Niveau 3 MVP complet.**


---
