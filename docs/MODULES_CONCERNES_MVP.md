# 📊 Modules ft_transcendence — Plateforme Immobilière Madagascar

**Objectif :** 14 points minimum  
**Major = 2 pts | Minor = 1 pt**

> 📋 **Référence :** Ce document est aligné avec le sujet ft_transcendence v19.0

---

## ✅ Modules Sélectionnés

### 🌐 WEB

| Module                                                | Type  | Points | Justification                                                   |
|-------------------------------------------------------|-------|--------|-----------------------------------------------------------------|
| **Use a framework for frontend + backend**            | Major | 2      | Next.js 16 (full-stack) + Fastify microservices                 |
| **Use an ORM for the database**                       | Minor | 1      | Prisma ORM pour PostgreSQL                                      |
| **Complete notification system**                      | Minor | 1      | Confirmations, alertes modération, feedback triggers (email)    |
| **Advanced search with filters, sorting, pagination** | Minor | 1      | GET /listings avec filtres zone, prix, type, pagination         |
| **File upload and management system**                 | Minor | 1      | Upload photos annonces, validation type/size, hash doublons     |

**Sous-total Web : 6 points**

---

### 👤 USER MANAGEMENT

| Module                                          | Type  | Points | Justification                                                            |
|-------------------------------------------------|-------|--------|--------------------------------------------------------------------------|
| **Standard user management and authentication** | Major | 2      | Profils, avatars, email vérifié, Google OAuth, dashboard unifié          |
| **Advanced permissions system**                 | Major | 2      | Rôles user/moderator, CRUD utilisateurs, vues différentes selon rôle     |

**Sous-total User Management : 4 points**

> ⚠️ **Note :** 2FA/OTP exclu du MVP (Phase 2 potentielle = +1 point)

---

### 🤖 ARTIFICIAL INTELLIGENCE

| Module                                    | Type  | Points | Justification                                                |
|-------------------------------------------|-------|--------|--------------------------------------------------------------|
| **Complete LLM system interface**         | Major | 2      | Génération descriptions IA (POST /listings/generate-description) |
| **Complete RAG system** (Real Estate Assistant) | Major | 2 | Chatbot RAG avec contexte annonces + données marché (POST /ai/chat) |

**Sous-total AI : 4 points**

> **🔧 Stack Technique AI :**
> - **Service :** Python FastAPI (port 3005)
> - **LLM :** OpenRouter + DeepSeek V3 (Cloud gratuit)
> - **Embeddings :** Sentence Transformers (all-MiniLM-L6-v2)
> - **Vector Database :** ChromaDB (Local)
>
> Voir [Niveau_3.5_Architecture_Microservices.md](./Niveau_3.5_Architecture_Microservices.md) pour la configuration Docker complète.

---

### 📊 DATA AND ANALYTICS

| Module                        | Type  | Points | Justification                                                         |
|-------------------------------|-------|--------|-----------------------------------------------------------------------|
| **GDPR compliance features**  | Minor | 1      | Privacy Policy, Terms of Service, export/suppression données          |
| **Data export functionality** | Minor | 1      | Export historique crédits, feedbacks, annonces (JSON/CSV)             |

**Sous-total Data : 2 points**

---

### 🔧 DEVOPS

| Module                       | Type  | Points | Justification                                                            |
|------------------------------|-------|--------|--------------------------------------------------------------------------|
| **Backend as microservices** | Major | 2      | 5 services (auth, listings, reservations, credits, ai) + Nginx gateway  |

**Sous-total Devops : 2 points**

> **Services Architecture :**
> - auth-service (Fastify, port 3001)
> - listings-service (Fastify, port 3002)
> - reservations-service (Fastify, port 3003)
> - credits-service (Fastify, port 3004)
> - ai-service (Python FastAPI, port 3005)
> - Nginx API Gateway (ports 80/443)

---

## 📈 Calcul Total Points

| Catégorie               | Points |
|-------------------------|--------|
| Web                     | 6      |
| User Management         | 4      |
| Artificial Intelligence | 4      |
| Data and Analytics      | 2      |
| Devops                  | 2      |
| **TOTAL**               | **18 points** ✅ |

> 🎯 **Objectif 14 points : ATTEINT** (+4 points de marge)

---

## � Récapitulatif par Type

### Modules Majeurs (2 pts chacun) — 6 modules = 12 pts
1. ✅ **Web:** Framework frontend + backend (Next.js + Fastify)
2. ✅ **User Management:** Standard user management (profils, OAuth)
3. ✅ **User Management:** Advanced permissions system (rôles moderator)
4. ✅ **AI:** LLM system interface (génération descriptions)
5. ✅ **AI:** RAG system (Real Estate Assistant chatbot)
6. ✅ **Devops:** Backend as microservices (5 services + gateway)

### Modules Mineurs (1 pt chacun) — 6 modules = 6 pts
1. ✅ **Web:** ORM database (Prisma)
2. ✅ **Web:** Notification system (email confirmations)
3. ✅ **Web:** Advanced search (filtres, pagination)
4. ✅ **Web:** File upload system (photos annonces)
5. ✅ **Data:** GDPR compliance (Privacy Policy, Terms of Service)
6. ✅ **Data:** Data export functionality

---

## 🔄 Options Bonus (Non incluses dans le calcul)

| Module                                    | Type  | Points | Effort  | Notes                         |
|-------------------------------------------|-------|--------|---------|-------------------------------|
| Multiple languages (FR/EN/MG)             | Minor | 1      | Moyen   | i18n potentiel                |
| 2FA (Two-Factor Authentication)           | Minor | 1      | Moyen   | Phase 2                       |
| Content moderation AI                     | Minor | 1      | Faible  | Déjà préparé dans validation IA |
| PWA with offline support                  | Minor | 1      | Moyen   | Non prévu MVP                 |

---

## ⚠️ Modules NON applicables

| Module                        | Raison                                    |
|-------------------------------|-------------------------------------------|
| Gaming modules                | Pas de jeu dans le projet                 |
| AI Opponent                   | Nécessite un jeu implémenté               |
| Tournament system             | Nécessite un jeu implémenté               |
| Blockchain                    | Non pertinent pour immobilier MVP         |
| Remote players                | Pas de jeu multijoueur                    |
| Spectator mode                | Pas de jeu                                |

---

## 📝 Format README.md (exigé par ft_transcendence)

```markdown
## Modules

### Major Modules (2 pts each)
| Module                                  | Category         | Points |
|-----------------------------------------|------------------|--------|
| Framework frontend + backend            | Web              | 2      |
| Standard user management                | User Management  | 2      |
| Advanced permissions system             | User Management  | 2      |
| LLM system interface                    | AI               | 2      |
| RAG system (Real Estate Assistant)      | AI               | 2      |
| Backend as microservices                | Devops           | 2      |
| **Subtotal**                            |                  | **12** |

### Minor Modules (1 pt each)
| Module                | Category         | Points |
|-----------------------|------------------|--------|
| ORM (Prisma)          | Web              | 1      |
| Notification system   | Web              | 1      |
| Advanced search       | Web              | 1      |
| File upload system    | Web              | 1      |
| GDPR compliance       | Data             | 1      |
| Data export           | Data             | 1      |
| **Subtotal**          |                  | **6**  |

### **Total: 18 points** ✅ (Minimum required: 14)
```

---

**Document créé le :** 18 Décembre 2024  
**Mis à jour le :** 22 Décembre 2024  
**Basé sur :** ft_transcendence v19.0 + Documentation MVP complète
