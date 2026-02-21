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
- **Docker** (including **Docker Compose**; if it’s not included with your Docker installation, install it separately)
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

We assigned roles from what each of use wanted to try, to learn, or just to do because the member already know about it.
We used github tools: creating a project on github, create an issue for each task, assign someone to it with the appropriate flags depending on the case.
We used slack to communicate with the team.

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
| `ListingStats` | Listing engagement metrics | `id`, `listingId` (FK, unique), `views`, `reservations`, `feedbacks` |
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

**Purpose**: Property reservations, visits, and user feedback

#### Tables

| Table | Purpose | Key Fields |
|-------|---------|-----------|
| `Reservation` | Visit reservations | `reservationId` (UUID, PK), `listingId`, `buyerId`, `sellerId`, `status`, `slot` (DateTime), `confirmedAt`, `rejectedAt`, `cancelledAt`, `cancelledBy`, `doneAt`, `sellerContactVisible`, `feedbackEligible`, `feedbackGiven`, `createdAt`, `updatedAt` |
| `Feedback` | User reviews | `id` (UUID), `reservationId` (FK, unique), `listingId`, `authorId`, `targetId`, `rating`, `comment`, `listingAccurate`, `sellerReactive`, `visitUseful`, `visible`, `moderatedAt`, `moderationReason`, `createdAt`, `updatedAt` |

**Key Relationships**:
- `Reservation` → `Feedback` (1:1, cascade delete)

**Enumerations**:
- `ReservationStatus`: pending, confirmed, rejected, cancelled, done
- `CancelledBy`: buyer, seller, system

**Indexes**: `listingId`, `buyerId`, `sellerId`, `status`, `slot` on Reservation; `listingId`, `targetId` on Feedback

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
│    └─→ Feedback.Feedback.listingId                             │
│                                                                │
│ Reservation.Reservation.id                                     │
│    ├─→ Feedback.Feedback.reservationId                         │
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
| `String[]` | Array of strings | photos URLs, tags |
| `Enum` | Enumerated values | status, types, reasons |

---

### Key Design Patterns

1. **Soft Deletions**: Implemented via status fields (e.g., `ListingStatus.archived`) rather than hard deletes
2. **Cascade Deletes**: Foreign key relationships use `onDelete: Cascade` for referential integrity
3. **Indexes**: Applied to frequently queried fields for performance optimization
4. **Unique Constraints**: Enforced on critical fields (email, userId combinations)
5. **Timestamps**: All tables include `createdAt` and `updatedAt` for audit trails
6. **Enumerated Types**: Used for constrained fields to ensure data consistency

## Features List

### Authentication Service (tolrandr)

| Feature | Description |
|---------|-------------|
| **User Registration** | Create new user accounts with email/password validation and welcome email verification |
| **User Login** | Authenticate users and issue JWT access/refresh tokens for secure session management |
| **Email Verification** | Send verification tokens to users and validate email ownership during registration |
| **Email Resend** | Resend verification emails with rate limiting (1 per minute) to prevent abuse |
| **Forgot Password** | Send password reset tokens to registered emails with rate limiting (1 per minute) |
| **Reset Password** | Allow users to set new password using valid reset token |
| **OAuth 2.0 (Google)** | Third-party authentication via Google with automatic account linking |
| **Token Validation** | Internal endpoint to verify JWT tokens for inter-service communication |
| **Moderator Role Check** | Internal endpoint to verify if a user holds a moderator or admin role, used by other services for access control |
| **User Details (Internal)** | Internal endpoint to fetch a user's full profile by ID, enabling cross-service data lookups without exposing a public route |
| **Role Management** | Admin capability to change user roles (ADMIN, USER, MODERATOR) |
| **User Profile** | Get authenticated user information including email, name, phone, trust score |
| **Profile Update** | Update user information (first name, last name) |
| **Phone Management** | Add or update phone number with verification status tracking |
| **Password Update** | Change existing password with current password verification |
| **Set Password** | Add password for OAuth-only users to enable email/password login |
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
| **Data Deletion (GDPR)** | Delete all credit data associated with deleted user account |

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
| **Mark as Done** | Mark reservation as completed after viewing, enables feedback submission |
| **Check Slot Availability** | Verify if a specific datetime slot is available for a listing before booking |
| **Get Listing Status** | Internal endpoint to check reservation counts and status for listings |
| **Submit Feedback** | Leave rating (1-5 stars) and review for property, seller, or viewing experience |
| **Retrieve Feedback** | Get all feedback received on user's properties or given by user |
| **Data Deletion (GDPR)** | Delete all reservation and feedback data associated with deleted user account |

---

## Individuals contributions

### srandria
Sylvio ensured the platform was technically robust from infrastructure to high-level UI.
- **Key Achievement**: Developed the **Frontend Dashboard & Reservation UI**, bridging the gap between Arthinew's backend logic and a seamless user experience. He also unified the deployment via a single-command **Makefile**.

### rarakoto
Ny Hasina transformed the vision into a premium reality.
- **Key Achievement**: Designed the **Visual Identity** and built the responsive core component system that powers the entire application.

### tolrandr
Arthinew was the powerhouse behind the platform's core transactions.

**Services implemented**: Authentication & User Management (`services/auth`), Credit Management (`services/credits`), Reservations & Feedback (`services/reservation`)

**Implemented features:**
- Full authentication system: email/password registration, login with bcrypt (salt rounds=12), email verification, forgot/reset password flows with rate limiting (1 req/min per email+IP+User-Agent)
- JWT session management: RS256 access tokens (short-lived) + HS256 refresh tokens (long-lived), both stored as HttpOnly Secure cookies to prevent XSS token theft
- OAuth 2.0 with Google: full authorization flow (redirect → callback → token exchange → user info → account creation or linking)
- Role-Based Access Control: `USER`, `MODERATOR`, `ADMIN` roles with protected role-specific routes and cross-service moderator verification
- Inter-service JWT validation: internal `POST /verify-token` endpoint allows all other services to validate user tokens using only the public key, without sharing the private key
- Credit system: immutable transaction log with `balanceAfter` snapshots, balance checks before every debit, automatic +5 credits bonus on registration, paginated history
- Full reservation lifecycle: slot booking (30-min slots, D+2 minimum, 14-day window, GMT+3 timezone, seller schedule validation), seller confirmation/rejection, buyer/seller cancellation with automatic credit refund, mark-as-done, and structured feedback collection (rating 1–5, categories, comment 10–1000 chars)
- GDPR-compliant account deletion propagated across all 3 services via internal `X-Service-Key` protected endpoints

**Key Achievement**: Successfully implemented the **Inter-Service Event Flow**, ensuring that credit debits and refunds are perfectly synchronized with reservation status changes.

**Design choices:**
- **RS256 (asymmetric JWT)** for access tokens: other services verify with the public key only — the private key never leaves the auth service
- **HttpOnly + Secure cookies** instead of `localStorage` tokens: prevents client-side XSS theft of session credentials
- **`X-Service-Key` internal header** for all inter-service calls: a shared secret protecting internal routes, never forwarding or exposing user tokens
- **Immutable `CreditTransaction` log** with `balanceAfter` fields: full financial history can be audited without replaying transactions
- **`feedbackEligible` flag** set server-side on `PATCH /done`: ensures buyers can only submit feedback after the seller explicitly closes the visit

**Challenges faced:**
- **OAuth account linking**: a user who registered with email/password then logs in with Google using the same email must be linked to the existing account without creating a duplicate — solved via a dedicated `sub` field (Google subject ID) on the `User` model
- **Credit atomicity across services**: when creating a reservation, a network call to the credits service debits the buyer; if the reservation then fails to persist, a compensating refund call must fire — required careful error propagation, try/catch at each step, and a rollback-by-design pattern
- **Slot timezone handling**: seller schedules are stored in local time (GMT+3 / Madagascar), but reservation slots arrive as UTC — all availability and conflict checks had to be performed after converting to GMT+3 to avoid off-by-one day and hour mismatches

### aelison
aelison enabled the majority of bugs to be found.
aelison enabled intelligent property discovery.
- **Key achievement**: optimization of **ChromaDB indexing** for Madagascan geographical areas, ensuring high accuracy for the RAG assistant.

---

## Modules

## Major Modules
### 1. Public API
A secured public API for interacting with the database.

**Requirements**
- API key–based authentication
- Rate limiting
- Public documentation
- At least 5 endpoints, including:
	- `GET /api/{resource}`
	- `POST /api/{resource}`
	- `PUT /api/{resource}`
	- `DELETE /api/{resource}`
### 2. Advanced Permission System
A role-based access control (RBAC) system.

**Implemented by**: **tolrandr** (`services/auth`)

**Features**
- Full user management (CRUD operations)
- Role management (admin, user, guest, moderator, etc.)
- Conditional views and actions based on user roles

**How it was implemented**:
- Three roles defined as a Prisma enum: `USER`, `MODERATOR`, `ADMIN`
- Each protected route uses a Fastify `preHandler` hook that verifies the JWT and checks the `role` field
- Admin-only `PATCH /auth/change-permission/:id` endpoint to promote/demote users
- Internal `GET /auth/is-moderator` endpoint used by the listings service to gate moderation actions (blocking, archiving listings)
- All role checks are centralized in hook middleware, never duplicated in controller logic
### 3. Retrieval-Augmented Generation (RAG) System
An AI-powered question–answering system built on contextual retrieval.

**Capabilities**
- Interaction with a large, indexed dataset
- User-driven question answering
- Accurate context retrieval and response generation

**Implementation**
- Assigned to **aelison**
- Implemented using **ChromaDB**
- Experimentation with multiple system prompts for optimal RAG behavior
### 4. LLM System Interface
A unified interface for interacting with Large Language Models.

**Capabilities**
- Text (and/or image) generation from user input
- Streaming response handling
- Robust error handling and rate limiting

**Implementation**
- Assigned to **aelison**
- Implemented using **Groq LLM APIs**
- Uses free models with real-time streaming support
---
### 5. Microservices-Based Backend
A scalable backend architecture built with independent services.

**Implemented by**: **srandria** (architecture & listings), **tolrandr** (auth, credits, reservation), **mravelon** (credits coordination), **aelison** (AI service)

**Principles**
- Loosely coupled services with clear responsibilities
- Communication via REST APIs and/or message queues
- Each service follows the single-responsibility principle

**How it was implemented**:
- 5 independent Docker containers: `auth` (port 3001), `listings` (port 3002), `reservation` (port 3003), `credits` (port 3004), `ai` (port 8000)
- Each service has its own PostgreSQL database — no shared DB, no cross-service ORM queries
- Inter-service communication uses HTTP with a shared `INTERNAL_KEY_SECRET` sent in the `X-Service-Key` header
- Nginx reverse proxy routes all public traffic; internal service URLs are Docker network-only
- Each service is independently buildable and startable; the full stack runs with a single `make` command via Docker Compose
## Minor Modules

### Frontend & Backend Stack
- Frontend framework: **React**
- Backend framework: **Fastify**, **FastAPI**
- Database ORM: **Prisma ORM** with **PostgreSQL**

### Platform Features
- Notification system for all create, update, and delete operations
- User activity analytics and insights dashboard
- Advanced search with filtering, sorting, and pagination

### Authentication & Compliance
- Remote authentication using **OAuth 2.0** (Google) — **implemented by tolrandr** (`services/auth`): full Google authorization flow, account creation and linking via `sub` field, HttpOnly cookie session
- GDPR compliance features — **implemented by tolrandr** across `services/auth`, `services/credits`, `services/reservation`:
	- User data deletion with password confirmation (`DELETE /users/me`)
	- Cross-service cascade: auth triggers internal delete calls to credits and reservation services
	- Confirmation emails for sensitive data operations

### Accessibility & Internationalization
- Support for additional web browsers
- Multi-language support (i18n)

---

## API Reference (tolrandr services)

### Auth Service — port `3001`

**Auth Routes** (`/api/auth`)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `POST` | `/auth/login` | ❌ | Email/password login — sets JWT + refresh token as HttpOnly cookies |
| `POST` | `/auth/register` | ❌ | Account creation, bcrypt hash (salt=12), sends verification email |
| `POST` | `/auth/logout` | Partial | Clears cookies, deletes refresh token from DB |
| `POST` | `/auth/forgot-password` | ❌ | Sends reset email. Rate limit: 1/min per email+IP+UA |
| `POST` | `/auth/reset-password` | ❌ | Resets password with valid token |
| `POST` | `/auth/email/verify-email` | ❌ | Validates email verification token |
| `POST` | `/auth/email/resend-email` | Partial | Resends verification email. Rate limit: 1/min |
| `GET` | `/auth/oauth/google` | ❌ | Redirects to Google consent page |
| `GET` | `/auth/oauth/google/callback` | ❌ | Google callback — creates/links account, sets session |

**User Routes** (`/api`)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `GET` | `/users/me` | ✅ JWT | Returns authenticated user profile |
| `PUT` | `/users/me` | ✅ JWT | Updates first name and/or last name |
| `PUT` | `/users/me/phone` | ✅ JWT + email verified | Adds or updates phone number |
| `PUT` | `/users/me/update-password` | ✅ JWT | Changes password (requires current password) |
| `PUT` | `/users/me/add-password` | ✅ JWT | Sets a password for OAuth-only accounts |
| `DELETE` | `/users/me` | ✅ JWT | Deletes account + cascades all data (GDPR) |

**Internal Routes** (`X-Service-Key` header required)

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/auth/internal/verify-token` | Validates JWT, returns decoded user payload |
| `GET` | `/auth/is-moderator` | Checks MODERATOR or ADMIN role |
| `PATCH` | `/auth/change-permission/:id` | Changes user role (Admin only) |
| `GET` | `/users/:id/details` | Returns user profile by ID for cross-service lookups |

**Required environment variables**: `JWT_SECRET_PRIVATE_KEY`, `JWT_SECRET_PUBLIC_KEY`, `JWT_REFRESH_SECRET`, `COOKIE_SECRET`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `REDIRECT_URI`, `AUTH_URL`, `TOKEN_URL`, `USER_INFO_URL`, `GMAIL_USER`, `GMAIL_APP_PASSWORD`, `INTERNAL_KEY_SECRET`, `CREDITS_SERVICE_URL`, `LISTINGS_SERVICE_URL`, `RESERVATION_SERVICE_URL`, `DATABASE_URL`

---

### Credits Service — port `3004`

**User Routes** (`/api/credits`)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `GET` | `/credits/balance` | ✅ JWT | Returns balance, totalEarned, totalSpent |
| `GET` | `/credits/history` | ✅ JWT | Paginated transaction log |
| `POST` | `/credits/recharge/me` | ✅ JWT | User purchases credits |
| `GET` | `/credits/health` | ❌ | Health check |

**Internal Routes** (`X-Service-Key` header required)

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/internal/credits/debit` | Deducts credits (publish listing, book visit) |
| `POST` | `/internal/credits/credit` | Adds credits (bonus on register, refund on cancel) |
| `POST` | `/credits/recharge` | Admin/system-triggered recharge |
| `DELETE` | `/internal/delete/data` | Deletes all credit data for user (GDPR) |

**Credit cost table**: Registration `+5` bonus · Publish listing `−1` · Reserve visit `−1` · Renew listing `−0.5` · Cancellation refund `+N`

**Required environment variables**: `PORT_CREDITS_SERVICE`, `JWT_SECRET_PUBLIC_KEY`, `COOKIE_SECRET`, `AUTH_SERVICE_URL`, `INTERNAL_KEY_SECRET`, `GMAIL_USER`, `GMAIL_APP_PASSWORD`, `DATABASE_URL`

---

### Reservation Service — port `3003`

**Reservation Routes** (`/api/reservations`)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `POST` | `/reservations` | ✅ JWT | Create reservation — debits 1 credit from buyer |
| `GET` | `/reservations/mine` | ✅ JWT | Buyer's reservation list (filter: status, page, limit) |
| `GET` | `/reservations/seller/me` | ✅ JWT | Seller's incoming reservations |
| `GET` | `/reservations/get-slot` | ✅ JWT | Available 30-min slots for a listing (from seller's schedule, GMT+3) |
| `GET` | `/reservations/check-slot` | ✅ JWT | Check if a specific slot is free |
| `PATCH` | `/reservations/:id/confirm` | ✅ JWT | Seller confirms pending reservation |
| `PATCH` | `/reservations/:id/reject` | ✅ JWT | Seller rejects pending reservation |
| `PATCH` | `/reservations/:id/cancel` | ✅ JWT | Buyer or seller cancels — refunds credit |
| `PATCH` | `/reservations/:id/done` | ✅ JWT | Seller marks visit as completed, enables feedback |
| `DELETE` | `/reservations/:id` | ✅ JWT | Hard delete a pending reservation |

**Feedback Routes** (`/api`)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `POST` | `/feedback` | ✅ JWT | Submit review (rating 1–5, comment 10–1000 chars, optional categories) |
| `GET` | `/feedback/mine` | ✅ JWT | Get feedback given or received |

**Internal Routes** (`X-Service-Key` header required)

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/reservations/internal/status` | Reservation counts for a listing |
| `DELETE` | `/internal/delete/data` | Deletes all reservations + feedbacks for user (GDPR) |

**Slot booking rules**: minimum D+2 · maximum D+16 · slot must fit in seller's weekly schedule · 30-min duration · GMt+3 timezone · no duplicate active reservation per buyer/listing

**Required environment variables**: `PORT_AUTH_RESERVATION`, `JWT_SECRET_PUBLIC_KEY`, `COOKIE_SECRET`, `AUTH_SERVICE_URL`, `CREDITS_SERVICE_URL`, `LISTINGS_SERVICE_URL`, `INTERNAL_KEY_SECRET`, `GMAIL_USER`, `GMAIL_APP_PASSWORD`, `DATABASE_URL`

---

## Evaluation
**Total Points: 20**
