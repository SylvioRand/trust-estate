# 📑 Public API Documentation (Module Major)

This documentation describes the **Public API** layer of Trust Estate. It is designed to expose key platform capabilities (Listing Search & AI Assistant) to external consumers while maintaining high security via **API Keys** and **Rate Limiting**.

---

## 🏗️ Architecture & Security

The Public API is served through an **Nginx Gateway** acting as a Reverse Proxy and API Gateway.

### 1. API Gateway (Nginx)
Nginx is responsible for:
- **Routing**: Mapping public `/api/*` requests to the correct microservice.
- **Rate Limiting**: Protecting services from DoS attacks and abuse.
- **SSL/TLS**: Ensuring all external communication is encrypted (HTTPS).

### 2. Authentication (Secured API Key)
External management endpoints are secured using a **Service-to-Service API Key**.
- **Header**: `x-internal-key`
- **Validation**: Every request to indexing endpoints must include a valid JWT-signed key derived from `INTERNAL_KEY_SECRET`.
- **Registry**: Managed within the `auth-service` and validated by specialized decorators (`internalAuthenticate`).

### 3. Rate Limiting
Configured in `nginx/conf.d/default.conf`:
- **AI Chatbot**: 10 requests/minute (Strict limit due to LLM costs).

---

## 🚀 API Endpoints (CRUD)

The following endpoints allow full interaction with the Trust Estate data ecosystem.

### [GET] Public Listings Search
`GET /api/listings`
- **Auth**: None (Truly Public)
- **Description**: Search and filter properties across the platform.
- **Params**: `type`, `zone`, `minPrice`, `maxPrice`.

### [POST] AI Assistant Chat
`POST /api/ai/chat`
- **Auth**: None (Truly Public)
- **Description**: Interact with the AI RAG system to find properties using natural language.
- **Rate Limit**: 10r/m.

### [POST] Indexing (Create/Update)
`POST /api/ai/index`
- **Auth**: **Secured API Key** (`x-internal-key`)
- **Description**: Manually push a listing to the ChromaDB vector database for AI discovery.
- **Body**: `{ "listingId": "UUID", "action": "upsert" }`

### [PUT] Indexing Update
`PUT /api/ai/index`
- **Auth**: **Secured API Key** (`x-internal-key`)
- **Description**: Update vector data for an existing listing.

### [DELETE] Remove from Index
`DELETE /api/ai/index/{listingId}`
- **Auth**: **Secured API Key** (`x-internal-key`)
- **Description**: Permanent removal of property data from the AI search engine.

### [GET] Indexing Status
`GET /api/ai/index-status/{listingId}`
- **Auth**: None
- **Description**: Verify if a property is currently searchable by the AI.

---

## 🔧 Implementation Reference

- **Nginx Config**: `nginx/conf.d/common_routes.inc`
- **Rate Limits**: `nginx/conf.d/default.conf`
- **AI Controller**: `services/ai/main.py`
- **Listing Controller**: `services/listings/src/modules/listing/listing.controller.ts`
