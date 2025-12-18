# 📊 Modules ft_transcendence — Plateforme Immobilière Madagascar

**Objectif :** 14 points minimum  
**Major = 2 pts | Minor = 1 pt**

---

## ✅ Modules Sélectionnés (basé sur la documentation existante)

### 🌐 WEB

| Module                                                | Type  | Points | Justification Documentation                                     |
|-------------------------------------------------------|-------|--------|-----------------------------------------------------------------|
| **Use a framework for frontend + backend**            | Major | 2      | Next.js 16 (full-stack) défini dans Niveau_3                    |
| **Use an ORM for the database**                       | Minor | 1      | Prisma défini dans Niveau_3                                     |
| **Notification system**                               | Minor | 1      | Confirmations, alertes modération, feedback triggers            |
| **Advanced search with filters, sorting, pagination** | Minor | 1      | GET /listings avec filtres zone, prix, type, pagination         |
| **File upload and management system**                 | Minor | 1      | Upload photos annonces (base64/URLs), validation, hash doublons |

**Sous-total Web : 6 points**

---

### 👤 USER MANAGEMENT

| Module                                          | Type  | Points | Justification Documentation                                                            |
|-------------------------------------------------|-------|--------|----------------------------------------------------------------------------------------|
| **Standard user management and authentication** | Major | 2      | Profils, avatars, système amis (historique vendeur visible), auth email + Google OAuth |
| **Advanced permissions system**                 | Major | 2      | Rôles user/moderator, CRUD utilisateurs, vues différentes selon rôle                   |
| **Implement 2FA (Two-Factor Authentication)**   | Minor | 1      | OTP téléphone (exclu MVP mais prévu Phase 2)                                           |

**Sous-total User Management : 4-5 points** (5 si 2FA implémentée)

> ⚠️ **Note :** Le 2FA/OTP est exclu du MVP. Si vous l'ajoutez plus tard = +1 point

---

### 🤖 ARTIFICIAL INTELLIGENCE

| Module                            | Type  | Points | Justification Documentation                                                |
|-----------------------------------|-------|--------|----------------------------------------------------------------------------|
| **Complete LLM system interface** | Major | 2      | Génération descriptions IA (POST /listings/generate-description)           |
| **AI Real Estate Assistant (RAG)**| Major | 2      | Chatbot intelligent : questions marché + contexte annonce (POST /ai/chat)  |

**Sous-total AI : 4 points**

---

### 📊 DATA AND ANALYTICS

| Module                        | Type  | Points | Justification Documentation                                                         |
|-------------------------------|-------|--------|-------------------------------------------------------------------------------------|
| **GDPR compliance features**  | Minor | 1      | Privacy Policy, Terms of Service (exigés par le sujet), gestion données utilisateur |
| **Data export functionality** | Minor | 1      | Historique crédits, feedbacks, annonces archivées                                   |

**Sous-total Data : 2 points**

---

### 🔧 DEVOPS

| Module                       | Type  | Points | Justification Documentation                                            |
|------------------------------|-------|--------|------------------------------------------------------------------------|
| **Backend as microservices** | Major | 2      | 5 services Fastify (auth, listings, reservations, credits, ai) + Nginx |

**Sous-total Devops : 2 points**


## 📈 Calcul Total Points

| Catégorie               | Points           |
|-------------------------|------------------|
| Web                     | 6                |
| User Management         | 4                |
| Artificial Intelligence | 3                |
| Data and Analytics      | 2                |
| Devops                  | 2                |
| **TOTAL**               | **17 points** ✅ |

> 🎯 **Objectif 14 points : ATTEINT** (+3 points de marge)

---

## 🔄 Options Alternatives / Bonus

Si vous voulez sécuriser davantage ou ajouter des points :

### Modules facilement ajoutables :

| Module                                    | Type  | Points | Effort      | Déjà prévu ?            |
|-------------------------------------------|-------|--------|-------------|-------------------------|
| **Multiple languages (3+)**               | Minor | 1      | Moyen       | Non (possible FR/EN/MG) |
| **PWA with offline support**              | Minor | 1      | Moyen       | Non                     |
| **Custom design system (10+ components)** | Minor | 1      | Faible      | Partiellement           |
| **Public API (5+ endpoints)**             | Major | 2      | Déjà fait ! | ✅ OUI                  |

### 🔥 Module Public API (potentiellement à ajouter)

Votre documentation définit déjà plus de 5 endpoints publics :
- GET /listings
- POST /listings
- PUT /listings/:id
- DELETE /reservations/:id
- POST /feedback

**→ Si vous documentez et sécurisez l'API publique = +2 points (Major)**

---

## 📋 Récapitulatif Modules Retenus

### Modules Majeurs (2 pts chacun)
1. ✅ **Web: Framework frontend + backend** (Next.js + Fastify)
2. ✅ **User Management: Standard user management** 
3. ✅ **User Management: Advanced permissions system** (rôles modérateur)
4. ✅ **AI: LLM system interface** (génération descriptions)
5. ✅ **AI: AI Real Estate Assistant** (Chat RAG)
6. ✅ **Devops: Backend as microservices** (5 services + Nginx gateway)

**Total Majeurs : 6 × 2 = 12 points**

### Modules Mineurs (1 pt chacun)
1. ✅ **Web: ORM** (Prisma)
2. ✅ **Web: Notification system**
3. ✅ **Web: Advanced search**
4. ✅ **Web: File upload system**
5. ✅ **Data: GDPR compliance**
6. ✅ **Data: Data export**

**Total Mineurs : 6 × 1 = 6 points**

---

## 🎯 SCORE FINAL : 17 POINTS

| Catégorie | Points |
|-----------|--------|
| Majeurs   | 12     |
| Mineurs   | 6      |
| **TOTAL** | **18** |
| Objectif  | 14     |
| **Marge** | +4 ✅  |

---

## ⚠️ Modules NON applicables (à éviter)

| Module          | Raison                            |
|-----------------|-----------------------------------|
| Gaming modules  | Pas de jeu dans le projet         |
| Blockchain      | Non pertinent pour immobilier MVP |
| Remote players  | Pas de jeu multijoueur            |

---

## 📝 Pour le README.md (exigé par le sujet)

```markdown
## Modules

### Major Modules (2 pts each)
| Module                                  | Category         | Points |
|-----------------------------------------|------------------|--------|
| Framework frontend + backend            | Web              | 2      |
| Standard user management                | User Management  | 2      |
| Advanced permissions system             | User Management  | 2      |
| LLM system interface                    | AI               | 2      |
| Backend as microservices                | Devops           | 2      |
| **Subtotal**                            |                  | **10** |

### Minor Modules (1 pt each)
| Module                | Category         | Points |
|-----------------------|------------------|--------|
| ORM (Prisma)          | Web              | 1      |
| Notification system   | Web              | 1      |
| Advanced search       | Web              | 1      |
| File upload system    | Web              | 1      |
| Content moderation AI | AI               | 1      |
| GDPR compliance       | Data             | 1      |
| Data export           | Data             | 1      |
| **Subtotal**          |                  | **7**  |

### **Total: 17 points** ✅ (Minimum required: 14)
```


---

**Document créé le :** 18 Décembre 2024  
**Basé sur :** en.subject.pdf + Documentation MVP complète
