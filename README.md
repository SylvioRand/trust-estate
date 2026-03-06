*This project has been created as part of the 42 curriculum by aelison, tolrandr, rarakoto, srandria, mravelon*

## Description

A real estate marketplace tailored to the Malagasy market, designed to make buying, selling, and renting property simple and accessible. Users can browse listings published by other members, view detailed property information, and connect to move forward with a transaction.

The platform integrates AI-powered tools to help users discover properties that match their needs and preferences. It supports both sales and rentals across multiple property types, including land, houses, and apartments.

## Project limits

Since this is a student project, we are using a free LLM, which may not offer peak performance. Additionally, the model has rate limits; once these are reached, the AI features will temporarily stop working. We are also using a free tool for email confirmations, which is limited to 100 emails.

## Instructions
### Prerequisites

Ensure your machine has at least *20 GB of free disk space**.

You will need the following tools installed:

- **Git**, to clone the repository
- **Docker** (including **Docker Compose**; if it's not included with your Docker installation, install it separately)
- **Make**, to build and run the project

> For a complete list of environment variables and how to configure them, refer to [ENV_CONFIG.md](ENV_CONFIG.md).

### Execution

#### 1. Environment Setup

Before running the project, review the **.env_example** file located at the root of the project and create your own `.env` file based on it:

```bash
cp .env.example .env
```

Ensure you fill in all required environment variables, especially the ones for database access and AI service keys.

#### 2. Main Commands

The project uses a `Makefile` to streamline Docker operations and environment setup.

| Command | Description |
| :--- | :--- |
| `make all` | **Full Setup**: Generates certs, builds, starts services, syncs DB, and seeds data. |
| `make up` | Starts all services in the background. |
| `make down` | Stops and removes all project containers. |
| `make restart` | Restarts all services. |
| `make status` | Checks the status of the running containers. |

### Resources

- **Documentation**
  - https://react.dev/learn
  - https://tailwindcss.com/docs/installation/using-vite
  - https://developer.mozilla.org/fr/docs/Web/CSS
  - https://react.i18next.com/

- **Video Resources**
  - https://www.youtube.com/watch?v=NTmh8l-Xl4c
  - https://www.youtube.com/watch?v=E8lXC2mR6-k&t=550s
  - https://www.youtube.com/watch?v=-O1ds-kPUZg
  - https://www.youtube.com/@whosajid

- **AI Utilization**
  - Translate all JSON values used by i18n to ensure accurate and consistent localization.

- **LLMs & AI Platforms**
  - http://routeway.ai/
  - https://routeway.ai/mistral/devstral-2512%3Afree
  - https://console.groq.com/home
  - https://www.geeksforgeeks.org/nlp/groq-api-with-llama-3/

- **Vector Databases (ChromaDB)**
  - https://www.datacamp.com/tutorial/chromadb-tutorial-step-by-step-guide
  - https://docs.trychroma.com/guides/deploy/docker
  - https://docs.trychroma.com/guides/deploy/python-thin-client
  - https://docs.trychroma.com/docs/run-chroma/client-server
  - https://docs.trychroma.com/docs/collections/manage-collections
  - https://testcontainers.com/modules/chroma/?language=java

- **Backend & APIs (Python / FastAPI)**
  - https://fastapi.tiangolo.com/advanced/events/
  - https://docs.pydantic.dev/latest/concepts/models/
  - https://www.python-httpx.org/quickstart/#streaming-responses
  - https://www.w3schools.com/python/ref_module_asyncio.asp
  - https://docs.python.org/3/howto/a-conceptual-overview-of-asyncio.html#a-conceptual-overview-of-asyncio

- **PRISMA ORM**
  - https://www.prisma.io/docs/prisma-postgres/quickstart/prisma-orm
  - https://www.youtube.com/watch?v=g09PoiCob4Y&t=1828s
  

- **Python Fundamentals**
  - https://www.geeksforgeeks.org/python/constructors-in-python/
  - https://stackoverflow.com/questions/402504/how-can-i-determine-a-python-variables-type
  - https://www.w3schools.com/python/python_json.asp
  - https://www.w3schools.com/python/python_lists.asp

- **NLP & Embeddings**
  - https://pypi.org/project/sentence-transformers/

- **Security & Auth**
  - https://medium.com/@firatmelih/what-is-jwt-8f570fa2470e

- **HTTP & Networking**
  - https://netnut.io/httpx-vs-requests/

- **Frontend / JS Integration**
  - https://www.npmjs.com/package/react-markdown
  - https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Spread_syntax

- **Video Resources**
  - https://www.youtube.com/watch?v=cm2Ze2n9lxw&t=156s
  - https://www.youtube.com/watch?v=sHCRglj6qtA&start=1


## Team Information

## aelison
- **Role**: Back-End Developer
- **Responsibilities**:
    - Integrated AI capabilities into the project backend.
    - Implemented ChromaDB to manage contextual data for AI interactions.
    - Designed and maintained system prompts combined with ChromaDB to build a robust RAG pipeline.
    - Ensured AI features complied with project requirements through thorough testing and validation.

## mravelon
- **Role**: Product Owner & Back-End Developer
- **Responsibilities**:
    - Defined product vision, features, and priorities in alignment with business objectives.
    - Acted as the primary liaison between stakeholders and the development team.
    - Prioritized and validated backlog items to ensure maximum value delivery per sprint.
    - Approved completed features by verifying functional and business requirements.
    - Designed and maintained the credit management service and related APIs.
    - Helped on some front-end features.

## tolrandr
- **Role**: Back-End Developer
- **Responsibilities**:
    - Developed the authentication and authorization APIs.
    - Implemented the User API to handle all user-related operations.
    - Integrated OAuth flows for secure third-party authentication.
    - Designed and maintained the reservation API.

## srandria
- **Role**: Technical Lead & Full-Stack Developer
- **Responsibilities**:
    - Designed and oversaw the overall system architecture of the project.
    - Implemented the listings API.
    - Developed the reservation interface and related frontend–backend interactions.
    - Reviewed and validated backlog items to ensure technical and functional completeness.

## rarakoto
- **Role**: Project Manager, Front-End Developer & Integration Lead
- **Responsibilities**:
    - Designed and implemented the complete user interface of the application.
    - Defined the project roadmap on GitHub and coordinated task distribution across the team.
    - Led frontend–backend integration to ensure seamless data flow and functionality.
    - Evaluated feature feasibility and scope, deciding which features to implement or defer.

## Project Management

We assigned roles based on what each team member wanted to try, learn, or already had experience with. We used GitHub tools: creating a project on GitHub, creating an issue for each task, and assigning team members with appropriate labels depending on the case. We used Slack to communicate with the team.

## Technical Stack

### Frontend Technologies
- **React** — UI library for building interactive user interfaces with component-based architecture
- **TypeScript** — Type-safe superset of JavaScript for improved code reliability
- **Vite** — Modern build tool with fast hot module replacement (HMR) for development
- **Tailwind CSS** — Utility-first CSS framework for responsive design and consistent styling
- **React i18n** — Internationalization library for multi-language support (FR, EN, ES)

### Backend Technologies
- **Fastify** — Fast and low-overhead Node.js web framework for microservices communication and APIs
- **FastAPI** — Python async framework for AI service with automatic API documentation
- **Node.js & TypeScript** — Runtime and language for auth, credits, and listings services
- **Python 3** — Language for AI/ML capabilities and ChromaDB integration

### Database System
- **PostgreSQL** — Relational database chosen for:
  - ACID compliance and data integrity across microservices
  - Robust transaction support for financial operations (credits)
  - Strong relationship modeling with foreign keys and constraints
  - JSON support for flexible data storage (photos, tags arrays)
  - Scalability and reliability for production use

### ORM & Data Access
- **Prisma ORM** — Type-safe database access layer with auto-generated migrations and type definitions
- **Prisma Client** — Generated client for type-safe database queries across all services

### AI & Machine Learning
- **ChromaDB** — Vector database for embedding storage and semantic search in RAG pipeline
- **NVIDIA LLM API** — Open LLM inference platform for text generation with streaming support
- **Sentence Transformers** — Python library for generating embeddings for semantic search

### Security & Authentication
- **JWT (JSON Web Tokens)** — For stateless authentication and session management
- **OAuth 2.0** — Third-party authentication (Google)
- **bcrypt** — Password hashing for secure storage

### Infrastructure & Deployment
- **Docker & Docker Compose** — Containerization for reproducible, isolated service deployment
- **Nginx** — Reverse proxy and load balancer for routing requests to microservices
- **PostgreSQL Cluster** — Distributed database architecture with service isolation

### Development & Build Tools
- **npm** — Package management for Node.js dependencies
- **Prisma Migrations** — Version-controlled database schema changes

---

## Project Architecture

```
trust-estate/
├── .env.example
├── .dockerignore
├── .gitignore
├── docker-compose.yml
├── Makefile
├── README.md
├── ENV_CONFIG.md
│
├── nginx/                                  (Reverse proxy & TLS termination)
│   ├── Dockerfile
│   ├── certs/
│   │   ├── server.crt
│   │   └── server.key
│   └── conf.d/
│       ├── common_routes.inc
│       └── default.conf
│
├── secret/
│   └── jwtTokenService/
│       ├── jwt_auth_private.key
│       └── jwt_auth_public.pem
│
├── shared/
│   └── zones.json
│
├── frontend/                               (React / TypeScript / Vite)
│   ├── index.html
│   ├── vite.config.ts
│   ├── tsconfig.json
│   ├── tsconfig.app.json
│   ├── tsconfig.node.json
│   ├── package.json
│   ├── eslint.config.js
│   ├── public/
│   │   ├── 429.html
│   │   └── locales/
│   │       ├── en/                         (28 JSON translation files)
│   │       ├── fr/                         (28 JSON translation files)
│   │       └── es/                         (28 JSON translation files)
│   └── src/
│       ├── main.tsx
│       ├── index.css
│       ├── assets/
│       ├── components/
│       │   ├── dashboard/
│       │   │   ├── FilterDropdown.tsx
│       │   │   ├── IconActionButton.tsx
│       │   │   ├── ReservationCard.tsx
│       │   │   ├── StatusAvatar.tsx
│       │   │   └── StatusTag.tsx
│       │   ├── ActionButton.tsx
│       │   ├── ActionsMenu.tsx
│       │   ├── Animate.tsx
│       │   ├── BentoProperty.tsx
│       │   ├── BoxSection.tsx
│       │   ├── ChatTextArea.tsx
│       │   ├── ContentDivider.tsx
│       │   ├── CoolText.tsx
│       │   ├── Countdown.tsx
│       │   ├── FormField.tsx
│       │   ├── GoogleButton.tsx
│       │   ├── ImageUploader.tsx
│       │   ├── Input.tsx
│       │   ├── InputCheckBox.tsx
│       │   ├── InputComponents.tsx
│       │   ├── InputEnum.tsx
│       │   ├── InputRange.tsx
│       │   ├── LineChart.tsx
│       │   ├── NavBar.tsx
│       │   ├── PhoneInput.tsx
│       │   ├── PhotoViewer.tsx
│       │   ├── PopUp.tsx
│       │   ├── RoleStatus.tsx
│       │   ├── SellerStat.tsx
│       │   ├── Separator.tsx
│       │   ├── TagsComponents.tsx
│       │   ├── TextArea.tsx
│       │   ├── TimeInput.tsx
│       │   ├── ToggleButton.tsx
│       │   └── WavyLines.tsx
│       ├── const/
│       │   └── constant.tsx
│       ├── dataModel/
│       │   ├── dataZone.tsx
│       │   ├── modelListings.tsx
│       │   ├── modelProfile.tsx
│       │   ├── modelPropertyList.tsx
│       │   └── modelSlots.tsx
│       ├── hooks/
│       │   └── VerifyUsersState.tsx
│       ├── i18n/
│       │   ├── i18n.ts
│       │   └── types/
│       │       └── react-i18next.d.ts
│       ├── interfaces/
│       │   ├── googleInterface.ts
│       │   └── profileInfos.ts
│       ├── layout/
│       │   └── layout.tsx
│       ├── pages/
│       │   ├── dashboard/
│       │   │   ├── CreditsSection.tsx
│       │   │   ├── ReservationsSection.tsx
│       │   │   ├── VisitsSection.tsx
│       │   │   └── zodSchema/
│       │   │       └── dashboard.schema.tsx
│       │   ├── add_phone.tsx
│       │   ├── ai.tsx
│       │   ├── buyer_slots.tsx
│       │   ├── client_listings_view.tsx
│       │   ├── dashboard.tsx
│       │   ├── edit.tsx
│       │   ├── email_sent.tsx
│       │   ├── errorPage.tsx
│       │   ├── flaggedPage.tsx
│       │   ├── forgot_pass.tsx
│       │   ├── home.tsx
│       │   ├── listings.tsx
│       │   ├── loading.tsx
│       │   ├── my_listings_view.tsx
│       │   ├── privacy_policy.tsx
│       │   ├── profile.tsx
│       │   ├── property.tsx
│       │   ├── publish.tsx
│       │   ├── reset_pass.tsx
│       │   ├── seller_slots.tsx
│       │   ├── settings.tsx
│       │   ├── sign_in.tsx
│       │   ├── sign_up.tsx
│       │   ├── term_of_service.tsx
│       │   ├── verify_email.tsx
│       │   └── welcome.tsx
│       ├── provider/
│       │   ├── DataContext.tsx
│       │   ├── DataProvider.tsx
│       │   └── useDataProvider.tsx
│       ├── types/
│       │   └── google.accounts.d.ts
│       └── utils/
│           ├── fetchWithoutConsoleError.ts
│           ├── Format.tsx
│           ├── generateUUID.ts
│           └── phoneCountry.tsx
│
└── services/
    ├── ai/                                 (Python / FastAPI — AI & RAG)
    │   ├── Dockerfile
    │   ├── main.py
    │   ├── requirements.txt
    │   └── app/
    │       ├── config.py
    │       ├── models.py
    │       ├── __init__.py
    │       └── services/
    │           ├── chromadb.py
    │           ├── embedding.py
    │           ├── llm.py
    │           └── __init__.py
    │
    ├── auth/                               (Node.js / Fastify / TypeScript)
    │   ├── Dockerfile
    │   ├── docker-entrypoint.sh
    │   ├── package.json
    │   ├── tsconfig.json
    │   ├── tsup.config.ts
    │   ├── prisma/
    │   │   ├── schema.prisma
    │   │   └── seed.ts
    │   └── src/
    │       ├── app.ts
    │       ├── config/
    │       │   └── env.schema.ts
    │       ├── hooks/
    │       │   ├── errorHandle.ts
    │       │   └── hooks.ts
    │       ├── interfaces/
    │       │   └── config.interface.ts
    │       ├── modules/
    │       │   ├── auth/
    │       │   │   ├── auth.controllers.ts
    │       │   │   ├── auth.interface.ts
    │       │   │   ├── auth.module.ts
    │       │   │   ├── auth.routes.ts
    │       │   │   ├── auth.schema.ts
    │       │   │   └── auth.services.ts
    │       │   └── user/
    │       │       ├── user.controllers.ts
    │       │       ├── user.interface.ts
    │       │       ├── user.module.ts
    │       │       ├── user.routes.ts
    │       │       ├── user.schema.ts
    │       │       └── user.service.ts
    │       ├── plugin/
    │       │   ├── helmet.plugin.ts
    │       │   ├── jwt.plugin.ts
    │       │   ├── mail.plugin.ts
    │       │   ├── prisma.plugin.ts
    │       │   └── rate-limit.ts
    │       ├── types/
    │       │   ├── fastify-env.d.ts
    │       │   └── fastify-mailer.d.ts
    │       └── utils/
    │           ├── auth.utils.ts
    │           ├── text.ts
    │           └── token.utils.ts
    │
    ├── chromadb/                           (ChromaDB vector store)
    │   └── Dockerfile
    │
    ├── credits/                            (Node.js / Fastify / TypeScript)
    │   ├── Dockerfile
    │   ├── docker-entrypoint.sh
    │   ├── package.json
    │   ├── tsconfig.json
    │   ├── tsup.config.ts
    │   ├── prisma.config.ts
    │   ├── prisma/
    │   │   └── schema.prisma
    │   └── src/
    │       ├── app.ts
    │       ├── config/
    │       │   └── env.schema.ts
    │       ├── hooks/
    │       │   └── errorHandle.ts
    │       ├── interfaces/
    │       │   └── config.interface.ts
    │       ├── module/
    │       │   └── credit/
    │       │       ├── credit.controllers.ts
    │       │       ├── credit.interface.ts
    │       │       ├── credit.modules.ts
    │       │       ├── credit.routes.ts
    │       │       ├── credit.schema.ts
    │       │       └── credit.services.ts
    │       ├── plugin/
    │       │   ├── jwt.plugin.ts
    │       │   └── prisma.plugin.ts
    │       └── types/
    │           ├── fastify-env.d.ts
    │           └── fastify-prisma.d.ts
    │
    ├── listings/                           (Node.js / Fastify / TypeScript)
    │   ├── Dockerfile
    │   ├── docker-entrypoint.sh
    │   ├── package.json
    │   ├── tsconfig.json
    │   ├── tsup.config.ts
    │   ├── prisma/
    │   │   └── schema.prisma
    │   └── src/
    │       ├── app.ts
    │       ├── config/
    │       │   └── prisma.ts
    │       ├── infrastructure/
    │       │   ├── ai.client.ts
    │       │   ├── auth.client.ts
    │       │   ├── credit.client.ts
    │       │   └── reservation.client.ts
    │       ├── modules/
    │       │   ├── listing/
    │       │   │   ├── handlers/
    │       │   │   │   ├── archive.handler.ts
    │       │   │   │   ├── delete-user-data.handler.ts
    │       │   │   │   ├── get-availability.handler.ts
    │       │   │   │   ├── get-mine.handler.ts
    │       │   │   │   ├── get-one.handler.ts
    │       │   │   │   ├── get-seller-stats.handler.ts
    │       │   │   │   ├── increment-reservation-stat.handler.ts
    │       │   │   │   ├── make-available.handler.ts
    │       │   │   │   ├── mark-unvailable.handler.ts
    │       │   │   │   ├── publish.handler.ts
    │       │   │   │   ├── report.handler.ts
    │       │   │   │   ├── search.handler.ts
    │       │   │   │   ├── update-availability.handler.ts
    │       │   │   │   └── update.handler.ts
    │       │   │   ├── listing.controller.ts
    │       │   │   ├── listing.schema.ts
    │       │   │   └── listing.service.ts
    │       │   └── moderator/
    │       │       ├── handlers/
    │       │       │   ├── apply-action.handler.ts
    │       │       │   ├── get-actions-handler.ts
    │       │       │   ├── get-flag-handler.ts
    │       │       │   └── get-listing-post.ts
    │       │       ├── moderator.controller.ts
    │       │       ├── moderator.schema.ts
    │       │       └── moderator.service.ts
    │       ├── shared/
    │       │   └── zones.json
    │       └── types/
    │           └── fastify.d.ts
    │
    └── reservation/                        (Node.js / Fastify / TypeScript)
        ├── Dockerfile
        ├── docker-entrypoint.sh
        ├── package.json
        ├── tsconfig.json
        ├── tsup.config.ts
        ├── prisma/
        │   └── schema.prisma
        └── src/
            ├── app.ts
            ├── config/
            │   └── env.schema.ts
            ├── hooks/
            │   └── errorHandle.ts
            ├── interfaces/
            │   └── config.interface.ts
            ├── module/
            │   └── resa/
            │       ├── resa.controllers.ts
            │       ├── resa.interface.ts
            │       ├── resa.module.ts
            │       ├── resa.routes.ts
            │       ├── resa.schema.ts
            │       └── resa.services.ts
            ├── plugin/
            │   ├── jwt.plugin.ts
            │   └── prisma.plugin.ts
            ├── types/
            │   ├── fastify-env.d.ts
            │   └── fastify-prisma.d.ts
            └── utils/
                └── utils.ts
```

---

## Database Schema

The Trust Estate platform uses a **PostgreSQL** database distributed across four microservices. Each service maintains its own database for data isolation and scalability.

### Architecture Overview

| Auth Service | Listings Service | Credits Service | Reservation Service |
| :--- | :--- | :--- | :--- |
| (Users, Tokens) | (Properties) | (Finances) | (Bookings) |

### Service 1: Authentication Service (`auth`)

**Purpose**: User management, authentication, and authorization

#### Tables

| Table | Purpose | Key Fields |
|-------|---------|-----------|
| `User` | Core user data | `id` (UUID), `email`, `password`, `firstName`, `lastName`, `role`, `trustScore`, `emailVerified`, `phoneVerified` |
| `refresh_token` | JWT refresh token storage | `id`, `userId` (FK), `tokenHash`, `expiresAt` |
| `email_Verification_token` | Email verification tokens | `id`, `userId` (FK), `tokenHash`, `expiresAt` |
| `forgot_password_token` | Password reset tokens | `id`, `userId` (FK), `tokenHash`, `expiresAt` |

**Key Relationships**:
- `User` → `refresh_token` (1:1, cascade delete)
- `User` → `email_Verification_token` (1:1, cascade delete)
- `User` → `forgot_password_token` (1:1, cascade delete)

**Enumerations**:
- `Role`: USER, MODERATOR

---

### Service 2: Listings Service (`listings`)

**Purpose**: Property listing management, seller statistics, and moderation

#### Tables

| Table | Purpose | Key Fields |
|-------|---------|-----------|
| `Listing` | Property listings | `id` (UUID), `type` (sale/rent), `propertyType`, `title`, `description`, `price`, `surface`, `zone`, `photos[]`, `tags[]`, `status`, `sellerId`, `createdAt`, `updatedAt`, `soldAt` |
| `ListingFeatures` | Property amenities | `id`, `listingId` (FK, unique), `bedrooms`, `bathrooms`, `wc`, `water_access`, `electricity_access`, `garden_private`, `parking_type`, `pool` |
| `ListingAvailability` | Viewing time slots | `id`, `listingId` (FK), `dayOfWeek` (0-6), `startTime`, `endTime` |
| `ListingStats` | Listing engagement metrics | `id`, `listingId` (FK, unique), `views`, `reservations` |
| `SellerStats` | Seller performance metrics | `id`, `userId` (unique), `totalListings`, `activeListings`, `successfulSales`, `successfulRents`, `averageRating`, `responseRate` |
| `Report` | User reports on listings | `id`, `listingId` (FK), `reporterId`, `reason`, `comment`, `createdAt` |
| `ModerationAction` | Moderation activities | `id`, `listingId` (FK), `moderatorId`, `action`, `reason`, `internalNote`, `messageToSeller`, `createdAt` |

**Key Relationships**:
- `Listing` → `ListingFeatures` (1:1, cascade delete)
- `Listing` → `ListingAvailability` (1:N, cascade delete)
- `Listing` → `ListingStats` (1:1, cascade delete)
- `Listing` → `Report` (1:N, cascade delete)
- `Listing` → `ModerationAction` (1:N, cascade delete)

**Enumerations**:
- `ListingType`: sale, rent
- `PropertyType`: apartment, house, loft, land, commercial
- `ListingStatus`: active, blocked, archived
- `ParkingType`: none, garage, box, parking
- `MarketingTag`: urgent, exclusive, discount
- `ReportReason`: fraud, duplicate, spam, incorrect_info, inappropriate, other
- `ModerationActionType`: block_temporary, archive_permanent, request_clarification, reject_reports

**Indexes**: `averageRating`, `successfulSales`, `responseRate` on SellerStats; `listingId`, `dayOfWeek` on ListingAvailability

---

### Service 3: Credits Service (`credits`)

**Purpose**: Financial transactions and credit management

#### Tables

| Table | Purpose | Key Fields |
|-------|---------|-----------|
| `CreditBalance` | User credit accounts | `id` (UUID), `userId` (unique), `balance`, `totalEarned`, `totalSpent`, `lastRechargeAt`, `createdAt`, `updatedAt` |
| `CreditTransaction` | Financial transaction log | `id` (UUID), `userId`, `amount`, `type`, `reason`, `listingId`, `reservationId`, `balanceAfter`, `createdAt` |

**Key Relationships**:
- `CreditBalance` → `CreditTransaction` (1:N via userId)

**Enumerations**:
- `TransactionType`: recharge, consume, bonus, refund
- `TransactionReason`: initial_bonus, recharge_pack, publish_listing, renew_listing, reserve_visit, refund_cancelled

**Indexes**: `userId` on CreditTransaction

---

### Service 4: Reservation Service (`reservation`)

**Purpose**: Property reservations and visits

#### Tables

| Table | Purpose | Key Fields |
|-------|---------|-----------|
| `Reservation` | Visit reservations | `reservationId` (UUID, PK), `listingId`, `buyerId`, `sellerId`, `status`, `slot` (DateTime), `confirmedAt`, `rejectedAt`, `cancelledAt`, `cancelledBy`, `doneAt`, `sellerContactVisible`, `feedbackEligible`, `feedbackGiven`, `createdAt`, `updatedAt` |

**Key Relationships**:
- No feedback or reviews are managed since the feedback feature has been removed.

**Enumerations**:
- `ReservationStatus`: pending, confirmed, rejected, cancelled, done
- `CancelledBy`: buyer, seller, system

**Indexes**: `listingId`, `buyerId`, `sellerId`, `status`, `slot` on Reservation

---

### Cross-Service Relationships

```
┌────────────────────────────────────────────────────────────────┐
│              Service Integration Points                        │
├────────────────────────────────────────────────────────────────┤
│ Auth.User.id                                                   │
│    ├─→ Listings.Listing.sellerId                               │
│    ├─→ Listings.SellerStats.userId                             │
│    ├─→ Reservation.Reservation.(buyerId, sellerId)             │
│    ├─→ Credits.CreditBalance.userId                            │
│    └─→ Credits.CreditTransaction.userId                        │
│                                                                │
│ Listings.Listing.id                                            │
│    ├─→ Reservation.Reservation.listingId                       │
│    ├─→ Credits.CreditTransaction.listingId                     │
│                                                                │
│ Reservation.Reservation.id                                     │
│    └─→ Credits.CreditTransaction.reservationId                 │
└────────────────────────────────────────────────────────────────┘
```

---

### Data Types Reference

| Type | Description | Examples |
|------|-------------|----------|
| `String` | Text data | emails, names, descriptions |
| `UUID` | Universally Unique Identifier | Primary and foreign keys |
| `Int` | Integer numbers | counts, ratings (1-5), day of week |
| `Float` | Decimal numbers | prices, ratings (averages), credit balances |
| `Boolean` | True/False values | feature flags, verification status |
| `DateTime` | Timestamp | creation dates, update times |
| `String[]` | Array of strings | photo URLs, tags |
| `Enum` | Enumerated values | status, types, reasons |


---

### Key Design Patterns

1. **Soft Deletions**: Implemented via status fields (e.g., `ListingStatus.archived`) rather than hard deletes
2. **Cascade Deletes**: Foreign key relationships use `onDelete: Cascade` for referential integrity
3. **Indexes**: Applied to frequently queried fields for performance optimization
4. **Unique Constraints**: Enforced on critical fields (email, userId combinations)
5. **Timestamps**: All tables include `createdAt` and `updatedAt` for audit trails
6. **Enumerated Types**: Used for constrained fields to ensure data consistency

---

## Features List

### User Interface

| **Path**                            | **Creator** |
| ----------------------------------- | --------- |
| **/sign-in**                        | rarakoto  |
| **/sign-up**                        | rarakoto  |
| **/sign-in/forgot-pass**            | rarakoto  |
| **/sign-in/reset-password**         | rarakoto  |
| **/welcome**                        | rarakoto  |
| **/property/listings**              | rarakoto  |
| **/profile/publish**                | rarakoto  |
| **/email-sent**                     | rarakoto  |
| **/verify-email**                   | rarakoto  |
| **/add-phone**                      | rarakoto  |
| **/home**                           | rarakoto  |
| **/property**                       | rarakoto  |
| **/ai**                             | mravelon  |
| **/profile**                        | rarakoto && mravelon  |
| **/profile/settings**               | rarakoto && mravelon  |
| **/profile/moderator/flagged**      | rarakoto && mravelon  |
| **/property/listings/edit**         | rarakoto  |
| **/property/listings/seller-slots** | srandria  |
| **/property/listings/buyer-slots**  | srandria  |
| **/terms-of-service**               | rarakoto  |
| **/privacy-policy**                 | rarakoto  |
| **/dashboard**                      | srandria  |
| **/** → `/home`                     | rarakoto  |

### Authentication Service (tolrandr)

| Feature | Description |
|---------|-------------|
| **User Registration** | Create new user accounts with email/password validation and welcome email verification |
| **User Login** | Authenticate users and issue JWT access/refresh tokens for secure session management |
| **Email Verification** | Send verification tokens to users and validate email ownership during registration |
| **Email Resend** | Resend verification emails with rate limiting (1 per minute) to prevent abuse |
| **Forgot Password** | Send password reset tokens to registered emails with rate limiting (1 per minute) |
| **Reset Password** | Allow users to set a new password using a valid reset token |
| **OAuth 2.0 (Google)** | Third-party authentication via Google with automatic account linking |
| **Token Validation** | Internal endpoint to verify JWT tokens for inter-service communication |
| **Moderator Role Check** | Internal endpoint to verify if a user holds a moderator role, used by other services for access control |
| **User Details (Internal)** | Internal endpoint to fetch a user's full profile by ID, enabling cross-service data lookups without exposing a public route |
| **Role Management** | Admin capability to change user roles (USER, MODERATOR) |
| **User Profile** | Get authenticated user information including email, name, phone, trust score |
| **Profile Update** | Update user information (first name, last name) |
| **Phone Management** | Add or update phone number with verification status tracking |
| **Password Update** | Change existing password with current password verification |
| **Set Password** | Add a password for OAuth-only users to enable email/password login |
| **Account Deletion (GDPR)** | Permanently delete user account and associated data with password confirmation |
| **Logout** | Invalidate refresh tokens and end user session |


### Reservation Service (tolrandr)

| Feature | Description |
|---------|-------------|
| **Create Reservation** | Buyer books a viewing slot for a property listing with datetime and seller matching |
| **List User Reservations** | Buyer views all their reservation history with filtering by status and date |
| **Seller Reservations** | Seller views all incoming reservations for their listings with status tracking |
| **Get Available Slots** | Retrieve the seller's weekly schedule and compute available booking slots for a given listing, including ownership check |
| **Confirm Reservation** | Seller accepts a pending reservation and notifies buyer of confirmed time |
| **Reject Reservation** | Seller declines a reservation request with optional reason |
| **Cancel Reservation** | Buyer or seller cancels a pending/confirmed reservation and refunds any credits |
| **Delete Reservation** | Hard delete a pending reservation by the buyer before the cancellation window closes |
| **Mark as Done** | Mark reservation as completed after viewing |
| **Check Slot Availability** | Verify if a specific datetime slot is available for a listing before booking |
| **Get Listing Status** | Internal endpoint to check reservation counts and status for listings |
| **Data Deletion (GDPR)** | Delete all reservation data associated with a deleted user account |


### Credits Service (mravelon)

| Feature | Description |
|---------|-------------|
| **Credit Recharge** | Users purchase credit packages via internal endpoint |
| **Personal Recharge** | Users purchase credits directly with payment processing |
| **Balance Inquiry** | Get current credit balance, total earned, and total spent for authenticated user |
| **Transaction History** | Retrieve complete transaction log with filters (type, reason, date) |
| **Debit Credits** | Internal operation to deduct credits when publishing listings or making reservations |
| **Credit Refund** | Internal operation to refund credits for cancelled actions or refund operations |
| **Transaction Logging** | Automatic logging of all credit movements with type, reason, amount, and remaining balance |
| **Health Check** | Service status endpoint for monitoring and load balancing |
| **Data Deletion (GDPR)** | Delete all credit data associated with a deleted user account |


### AI Service (aelison)

| Feature | Description |
|---------|-------------|
| **AI Health Check** | Reports AI service status and connectivity to ChromaDB. |
| **AI Chat (RAG)** | Accepts user messages, fetches vector context, and streams LLM responses. |
| **AI Chat Streaming** | Streams LLM output back to the client for faster response delivery. |
| **Index Listing (Add)** | Adds a listing to the ChromaDB collection for retrieval. |
| **Index Listing (Update)** | Updates an indexed listing in ChromaDB |
| **Index Listing (Delete)** | Removes a listing’s vectors from ChromaDB by ID. |
| **Index Status Check** | Confirms whether a listing is indexed in ChromaDB. |
| **Generate Listing Description** | Correct the user's grammatical and syntactical errors. |
| **Internal JWT Gate** | Protects internal indexing routes with a signed internal key |
| **ChromaDB Startup Init** | Initializes ChromaDB connection and creates the posts collection at startup |
| **ChromaDB Context Formatting** | Formats retrieved documents into LLM-ready context blocks. |
| **Embedding Generation** | Generates embeddings for listing text using sentence-transformers. |
| **Listing Text/Embedding Formats** | Standardizes listing fields into formats for embeddings and LLM context. |


### Listings Service (srandria)

| Feature | Description |
|---------|-------------|
| **Publish Listing** | Create a new property listing with multipart file upload (3–10 photos), Zod validation, credit debit, and automatic AI indexing via ChromaDB |
| **Search Listings** | Browse all active listings with filters (type, propertyType, zone, price range, surface range), sorting, and paginated results |
| **Get Listing Details** | Retrieve full listing details including features, seller stats, availability, and conditional seller contact info (visible only to owner or confirmed reservation holder) |
| **Get My Listings** | Authenticated sellers retrieve their own listings with engagement stats (views, reservations) |
| **Update Listing** | Modify listing fields (title, description, price, features, tags) with ownership verification and automatic AI re-indexing |
| **Archive Listing** | Seller archives their listing, removing it from active search and deleting its AI index entry |
| **Mark as Sold/Rented** | Seller marks a listing as realized (sold or rented), updating status and removing the AI index |
| **Make Available** | Seller re-activates a previously unavailable listing and re-indexes it in ChromaDB |
| **Report Listing** | Authenticated users can report a listing for fraud, spam, duplicate, incorrect info, or inappropriate content |
| **Set Availability Schedule** | Seller defines weekly viewing time slots (day of week, start/end time) for a listing |
| **Update Availability** | Replace the existing availability schedule for a listing with a new set of time slots |
| **Get Availability** | Retrieve the weekly viewing schedule for a listing, used by the reservation service to compute bookable slots |
| **Seller Stats** | Internal endpoint providing seller performance metrics (total listings, successful sales/rents, average rating, response rate) |
| **Increment Reservation Stat** | Internal endpoint called by the reservation service to update a listing's reservation count upon confirmation |
| **Data Deletion (GDPR)** | Internal endpoint to delete all listing data associated with a deleted user account |


### Moderation Service (srandria && mravelon)

| Feature | Description |
|---------|-------------|
| **Get Flagged Listings** | Moderators retrieve paginated listings that have been reported, with report counts, latest report reason, and seller info |
| **Get Listing for Review** | Moderators view full listing details including all reports and moderation history for review |
| **Apply Moderation Action** | Moderators apply actions on flagged listings: block (temporary), archive (permanent), request clarification, or reject reports — with status update, internal notes, and message to seller |
| **Moderation Action History** | Retrieve paginated log of all moderation actions with filters by moderator and target listing |

---

## Individual Contributions

### mravelon
Sarah contributed to concept design, visual design, some frontend work on the chatbot, and overall project architecture structuring.
- **Key Achievement**: Developed the **Frontend Dashboard & Reservation UI**, bridging the gap between backend logic and seamless user experience. Unified the deployment via a single-command **Makefile**.
- **Challenges & Solutions**: 
    - *Challenge*:  Coordinating data flow between multiple React components and disparate backend services.
                    Ensuring secure and consistent credit transactions across multiple services.
    - *Solution*: Implemented a centralized state management and used standardized API hooks to ensure predictable data handling.

### srandria
Ensured the technical robustness of the platform, from infrastructure to UI.
- **Key Achievement**: Developed the frontend dashboard and reservation UI, and unified the deployment setup.
- **Challenges & Solutions**:
    - *Challenge*: Managing complex viewing slot availability across different timezones and seller schedules.
    - *Solution*: Developed a robust server-side logic in the listings/reservation services to compute real-time availability based on weekly schedules.

### rarakoto
Ny Hasina turned the vision into a premium reality.
- **Key Achievement**: Designed the visual identity and built the responsive frontend components.
- **Challenges & Solutions**:
    - *Challenge*: Creating a premium, responsive UI that works across all browser versions.
    - *Solution*: Used Tailwind CSS for flexible layouts and conducted multi-browser testing to ensure full compatibility.

### tolrandr
Drove the core transactions of the project.
- **Key Achievement**: Complete authentication and reservation management, securing data flows, and orchestrating inter-service events.
- **Challenges & Solutions**:
    - *Challenge*: Ensuring secure, authenticated, when a user login and make a reservation 
    - *Solution*: Implemented JWT validation and secure reservation transactions.

### aelison
Enabled intelligent property discovery and general debugging.
- **Key Achievement**: RAG optimization (ChromaDB indexing for Madagascar).
- **Challenges & Solutions**:
    - *Challenge*: Optimizing the RAG pipeline for accuracy in property search.
    - *Solution*: Fine-tuned the system prompts and implemented ChromaDB with sentence-transformers for better semantic understanding.


---

## Modules

### Major Modules (1 module = 2 pts)
1. **Public API** (tolrandr, aelison, srandria, mravelon)
   - *Justification*: To allow external integrations and provide a structured way for the frontend to consume data.
   - *Implementation*: Built with Fastify, secured with API keys and rate limiting via Nginx. Includes at least 5 CRUD endpoints for listing and user management.
2. **Advanced Permission System** (tolrandr && srandria)
   - *Justification*: To manage different user levels (Moderator, User) and protect sensitive actions.
   - *Implementation*: Role-Based Access Control (RBAC) implemented across Auth and Listings services, allowing moderators to review reports.
3. **Retrieval-Augmented Generation (RAG) System** (aelison)
   - *Justification*: To provide an intelligent search experience where users can ask questions about properties in natural language.
   - *Implementation*: Uses ChromaDB for vector storage and semantic search, retrieving relevant property data to enrich the LLM's context.
4. **LLM Interface** (aelison && mravelon)
   - *Justification*: To facilitate natural language interactions and automated content improvement (e.g., listing descriptions).
   - *Implementation*: Integrated Nvidia API for text generation with streaming support for a responsive chat experience.
5. **Microservices Backend Architecture** (tolrandr, aelison, srandria, mravelon)
   - *Justification*: To ensure scalability, isolation of concerns, and technology flexibility.
   - *Implementation*: 5 distinct services (Auth, Listings, Credits, Reservation, AI) communicating via REST, each with its own database and horizontal scalability.

### Minor Modules (1 module = 1 pt)
1. **Frontend: React** (rarakoto)
   - *Justification*: Chosen for its component-based architecture and reactive state management.
   - *Implementation*: Built with Vite and TypeScript for a modern, efficient development workflow.
2. **Backend: Fastify/FastAPI** (tolrandr, srandria, aelison, mravelon)
   - *Justification*: Fastify for high-performance Node.js APIs and FastAPI for its excellent Python async support for AI features.
   - *Implementation*: Structured into modular handlers and services.
3. **ORM: Prisma + PostgreSQL** (tolrandr, srandria, mravelon)
   - *Justification*: PostgreSQL for ACID compliance; Prisma for type-safe database access and streamlined migrations.
   - *Implementation*: Distributed databases with service-specific schemas.
4. **Notification system** (rarakoto)
   - *Justification*: To keep users informed of critical actions (registrations, reservations).
   - *Implementation*: Integrated email notifications for all key CRUD operations.
5. **Analytics dashboard** (srandria)
   - *Justification*: To provide sellers with insights into their listing performance (views, reservations, credits).
   - *Implementation*: Real-time data aggregation from Listings and Reservation services displayed on the user dashboard.
6. **Custom-made design** (rarakoto)
   - *Justification*: To ensure a unique, premium brand identity that default tailwind components couldn't provide.
   - *Implementation*: Custom color palette, typography, and over 10 reusable UI components.
7. **Advanced search** (rarakoto)
   - *Justification*: To help users quickly find properties matching complex criteria.
   - *Implementation*: Server-side filtering, sorting, and pagination across multiple property attributes.
8. **OAuth 2.0 login** (tolrandr)
   - *Justification*: To simplify user onboarding and provide secure, trusted login options.
   - *Implementation*: Integrated Google OAuth flow with automatic user account linking.
9. **GDPR compliance** (tolrandr, srandria, mravelon, rarakoto)
   - *Justification*: To respect user privacy and comply with data protection standards.
   - *Implementation*: Added features for full account deletion and data export.
10. **Multi-browser support** (rarakoto)
    - *Justification*: To ensure the platform is accessible to all users regardless of their browser choice.
    - *Implementation*: Cross-browser testing and CSS polyfills for Chrome, Firefox, and Safari.
11. **Multilanguage (i18n)** (rarakoto, srandria)
    - *Justification*: To cater to a diverse audience (French, English, Spanish).
    - *Implementation*: Used `react-i18next` with JSON translation files.

### Total Modules Score: 21 pts (10 Major + 11 Minor)

---

## API Reference

(Detailed OpenAPI/endpoint documentation is in the `/docs` folder or referenced project docs.)

---

## Evaluation

**Total Points: 21**
