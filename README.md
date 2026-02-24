*This project has been created as part of the 42 curriculum by
aelison, tolrandr, rarakoto, srandria, mravelon*

## Description

A real estate marketplace tailored to the Malagasy market, designed to make buying, selling, and renting property simple and accessible. Users can browse listings published by other members, view detailed property information, and connect to move forward with a transaction.

The platform integrates AI-powered tools to help users discover properties that match their needs and preferences. It supports both sales and rentals across multiple property types, including land, houses, and apartments.

## Instructions
### Prerequisites

Ensure your machine has at least **15 GB of free disk space**.

You will need the following tools installed:

- **Git**, to clone the repository
- **Docker** (including **Docker Compose**; if it's not included with your Docker installation, install it separately)
- **Make**, to build and run the project

### Execution

First, review the `.env_example` file located at the root of the project and create your own `.env` file based on it.

Then, simply run the command:

```bash
make
```

### Resources

## Front-End

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

## AI Service

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
- **Groq LLM API** — Open LLM inference platform for text generation with streaming support
- **Sentence Transformers** — Python library for generating embeddings for semantic search

### Security & Authentication
- **JWT (JSON Web Tokens)** — For stateless authentication and session management
- **OAuth 2.0** — Third-party authentication (Google, GitHub, 42)
- **bcrypt** — Password hashing for secure storage

### Infrastructure & Deployment
- **Docker & Docker Compose** — Containerization for reproducible, isolated service deployment
- **Nginx** — Reverse proxy and load balancer for routing requests to microservices
- **PostgreSQL Cluster** — Distributed database architecture with service isolation

### Development & Build Tools
- **npm/pnpm** — Package management for Node.js dependencies
- **Prisma Migrations** — Version-controlled database schema changes


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
- `Role`: ADMIN, USER, MODERATOR

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
| **Moderator Role Check** | Internal endpoint to verify if a user holds a moderator or admin role, used by other services for access control |
| **User Details (Internal)** | Internal endpoint to fetch a user's full profile by ID, enabling cross-service data lookups without exposing a public route |
| **Role Management** | Admin capability to change user roles (ADMIN, USER, MODERATOR) |
| **User Profile** | Get authenticated user information including email, name, phone, trust score |
| **Profile Update** | Update user information (first name, last name) |
| **Phone Management** | Add or update phone number with verification status tracking |
| **Password Update** | Change existing password with current password verification |
| **Set Password** | Add a password for OAuth-only users to enable email/password login |
| **Account Deletion (GDPR)** | Permanently delete user account and associated data with password confirmation |
| **Logout** | Invalidate refresh tokens and end user session |

### Credits Service (tolrandr)

| Feature | Description |
|---------|-------------|
| **Credit Recharge** | Users purchase credit packages via internal endpoint (admin/system integration) |
| **Personal Recharge** | Users purchase credits directly with payment processing |
| **Balance Inquiry** | Get current credit balance, total earned, and total spent for authenticated user |
| **Transaction History** | Retrieve complete transaction log with filters (type, reason, date) |
| **Debit Credits** | Internal operation to deduct credits when publishing listings or making reservations |
| **Credit Refund** | Internal operation to refund credits for cancelled actions or refund operations |
| **Transaction Logging** | Automatic logging of all credit movements with type, reason, amount, and remaining balance |
| **Health Check** | Service status endpoint for monitoring and load balancing |
| **Data Deletion (GDPR)** | Delete all credit data associated with a deleted user account |

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

---

## Individual Contributions

### mravelon
Sarah contributed to concept design, visual design, some frontend work on the chatbot, and overall project architecture structuring.
- **Key Achievement**: Developed the **Frontend Dashboard & Reservation UI**, bridging the gap between backend logic and seamless user experience. Unified the deployment via a single-command **Makefile**.

### srandria
Ensured the technical robustness of the platform, from infrastructure to UI.
- **Key Achievement**: Developed the frontend dashboard and reservation UI, and unified the deployment setup.

### rarakoto
Ny Hasina turned the vision into a premium reality.
- **Key Achievement**: Designed the visual identity and built the responsive frontend components.

### tolrandr
Drove the core transactions of the project.
- **Key Achievement**: Complete authentication and credit management, securing data flows, and orchestrating inter-service events.

### aelison
Enabled intelligent property discovery and general debugging.
- **Key Achievement**: RAG optimization (ChromaDB indexing for Madagascar).


---

## Modules

### Major Modules (1 module = 2 pts)
1. Public API
   - Secured public API with API key and rate limiting
   - Documentation (at least 5 CRUD endpoints)
2. Advanced Permission System
   - Roles: admin, user, guest, moderator...
   - CRUD users, manage roles via RBAC
3. Retrieval-Augmented Generation (RAG) System
   - Large dataset indexed, contextual answers
4. LLM Interface
   - Generation of text/images, streamed reply, error handling
5. Microservices Backend Architecture
   - 5 services independently deployed, REST communication

### Total major modules: 10 pts

---

### Minor Modules (1 module = 1 pt)
- Frontend: React
- Backend: Express (and Fastify, FastAPI, etc. where relevant)
- ORM: Prisma + PostgreSQL
- Notification system: All create/update/delete
- Analytics dashboard: User activity and insights
- Advanced search: Filter/sort/pagination
- OAuth 2.0 login (Google, GitHub, etc.)
- GDPR compliance: Data download/export/deletion/confirmation
- Multi-browser support
- Multilanguage (i18n)

### Total minor modules: 10 pts

---

## API Reference

(Detailed OpenAPI/endpoint documentation is in the `/docs` folder or referenced project docs.)

---

## Evaluation

**Total Points: 20**
