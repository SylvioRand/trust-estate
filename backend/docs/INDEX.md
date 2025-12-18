# Backend Documentation Index

**Generated**: 2024-12-18  
**Version**: 1.1.0

---

## Quick Navigation

### Main Documentation
- [README_BACKEND.md](./README_BACKEND.md) ← **START HERE** - Complete technical overview
- [PRISMA_MODELS.md](./PRISMA_MODELS.md) - Detailed database models & migrations
- [COMMIT_MESSAGE.md](../COMMIT_MESSAGE.md) - What was documented

---

## File-by-File Documentation

### Gateway Application (backend/backend/)

#### Entry Point
- [app.ts](./files/backend/src/app.md) - Gateway bootstrap & server initialization

#### Modules
- [back.module.ts](./files/backend/src/module/back.module.md) - Plugin registration
- [gateway.ts](./files/backend/src/module/gateway.md) - HTTP reverse proxy configuration
- [routes.ts](./files/backend/src/module/routes.md) - Route mapping & upstream config
- [hook.ts](./files/backend/src/module/hook.md) - Security & validation hooks
- [backend.schema.ts](./files/backend/src/module/backend.schema.md) - Environment validation

#### Plugins (Security)
- [helmet.plugin.ts](./files/backend/src/plugin/helmet.plugin.md) - OWASP headers (CSP, HSTS, etc.)
- [rate-limit.ts](./files/backend/src/plugin/rate-limit.md) - DoS prevention (100 req/10s)

#### Interfaces & Types
- [config.interface.ts](./files/backend/src/interfaces/config.interface.md) - Config type definition
- [routes.interface.ts](./files/backend/src/interfaces/routes.interface.md) - Route config type

---

### Auth Service (backend/services/auth/)

#### Entry Point
- [app.ts](./files/services/auth/src/app.md) - Authentication service bootstrap

#### Components (Not yet documented - all empty/TODO)
- auth.module.ts - Route registration (placeholder)
- auth.routes.ts - Route definitions (placeholder)
- auth.controllers.ts - Handler functions (EMPTY)
- auth.services.ts - Business logic (EMPTY)
- auth.schema.ts - Input validation (EMPTY)

#### Database
- [schema.prisma](./PRISMA_MODELS.md#service-auth) - Refresh token model
- migrations/ - Database versioning (init + update)

---

### Users Service (backend/services/users/)

#### Entry Point
- [app.ts](./files/services/users/src/app.md) - Users service bootstrap

#### Components (Not yet documented)
- Controllers, routes, services - NOT YET IMPLEMENTED

#### Database
- [schema.prisma](./PRISMA_MODELS.md#service-users) - User & SellerStats models
- migrations/ - Database initialization

---

## Documentation by Topic

### Architecture
- [README_BACKEND.md - Architecture Section](./README_BACKEND.md#architecture-système)
- [Mermaid Diagrams](./README_BACKEND.md#diagramme-mermaid)

### Security
- [README_BACKEND.md - Security Section](./README_BACKEND.md#sécurité)
- [PRISMA_MODELS.md - Security Notes](./PRISMA_MODELS.md#sécurité)
- [helmet.plugin.ts Documentation](./files/backend/src/plugin/helmet.plugin.md)
- [rate-limit.ts Documentation](./files/backend/src/plugin/rate-limit.md)
- [hook.ts Documentation](./files/backend/src/module/hook.md)

### Configuration
- [README_BACKEND.md - Configuration](./README_BACKEND.md#configuration-et-variables-denvironnement)
- [backend.schema.ts Documentation](./files/backend/src/module/backend.schema.md)
- [Environment variables by service](./README_BACKEND.md#variables-par-service)

### Deployment
- [README_BACKEND.md - Deployment](./README_BACKEND.md#déploiement-et-démarrage)
- [Docker Compose](./README_BACKEND.md#docker-compose)
- [Startup scripts](./README_BACKEND.md#scripts-disponibles)

### Database
- [PRISMA_MODELS.md - Complete Guide](./PRISMA_MODELS.md)
- [ER Diagram](./PRISMA_MODELS.md#architecture-base-de-données)
- [Migrations](./PRISMA_MODELS.md#migrations)
- [Common queries](./PRISMA_MODELS.md#requêtes-prisma-courantes)

### API & Routes
- [README_BACKEND.md - HTTP Endpoints](./README_BACKEND.md#points-dentrée-http)
- [gateway.ts - Reverse Proxy](./files/backend/src/module/gateway.md)
- [routes.ts - Route Config](./files/backend/src/module/routes.md)

### Patterns & Best Practices
- See individual file documentation for patterns used
- [hook.ts](./files/backend/src/module/hook.md) - Pre/post processing
- [gateway.ts](./files/backend/src/module/gateway.md) - Stream passthrough, header filtering
- [rate-limit.ts](./files/backend/src/plugin/rate-limit.md) - Rate limiting strategy

---

## Issues & TODO

### Critical (Needs Implementation)
- [ ] Auth service controllers (all empty)
- [ ] Auth service business logic (all empty)
- [ ] Auth service schema validation (empty)
- [ ] Users service all routes & logic (not implemented)
- [ ] /users route proxying (not configured)
- [ ] /orders route implementation (stub only)

See [README_BACKEND.md - TODO section](./README_BACKEND.md#todo--à-confirmer) for full list.

---

## How to Use This Documentation

### For New Developers
1. Start with [README_BACKEND.md](./README_BACKEND.md)
2. Read [Architecture System section](./README_BACKEND.md#architecture-système)
3. Review [PRISMA_MODELS.md](./PRISMA_MODELS.md)
4. Deep dive: Check file-specific docs in `files/` folder

### For DevOps
1. [Deployment section](./README_BACKEND.md#déploiement-et-démarrage)
2. [Environment variables](./README_BACKEND.md#configuration-et-variables-denvironnement)
3. [Docker Compose](./docker-compose.yml)
4. [Health checks](./README_BACKEND.md#vérification-de-santé)

### For Security Review
1. [README_BACKEND.md - Security](./README_BACKEND.md#sécurité)
2. [PRISMA_MODELS.md - Security](./PRISMA_MODELS.md#sécurité)
3. [helmet.plugin.ts](./files/backend/src/plugin/helmet.plugin.md) - Headers
4. [rate-limit.ts](./files/backend/src/plugin/rate-limit.md) - DoS protection
5. [hook.ts](./files/backend/src/module/hook.md) - Request validation

### For Database Management
1. [PRISMA_MODELS.md](./PRISMA_MODELS.md) - Start here
2. Migration guides in each service
3. Query examples in PRISMA_MODELS.md

---

## Document Structure

Each file documentation contains:
- **Métadonnées**: Path, type, responsibility
- **Résumé exécutif**: Quick overview
- **Code source**: Full code with inline comments
- **Flux d'exécution**: Step-by-step explanation
- **APIs & Types**: Interfaces used
- **Effets de bord**: Side effects & state
- **Sécurité**: Security considerations
- **Erreurs**: Error handling
- **Complexité**: Performance notes
- **Tests**: Recommended test cases
- **Références**: Links to related files
- **TODO**: Known issues & improvements

---

## Key Sections by Technology

### Fastify Framework
- [app.ts](./files/backend/src/app.md) - Bootstrap
- [back.module.ts](./files/backend/src/module/back.module.md) - Plugin registration
- [hook.ts](./files/backend/src/module/hook.md) - Lifecycle hooks
- [helmet.plugin.ts](./files/backend/src/plugin/helmet.plugin.md) - Plugin example
- [rate-limit.ts](./files/backend/src/plugin/rate-limit.ts) - Plugin example

### Reverse Proxy Pattern
- [gateway.ts](./files/backend/src/module/gateway.md) - Implementation
- [routes.ts](./files/backend/src/module/routes.md) - Configuration

### Security
- [helmet.plugin.ts](./files/backend/src/plugin/helmet.plugin.md) - OWASP headers
- [rate-limit.ts](./files/backend/src/plugin/rate-limit.md) - DoS prevention
- [hook.ts](./files/backend/src/module/hook.md) - Request/response validation

### Prisma ORM
- [PRISMA_MODELS.md](./PRISMA_MODELS.md) - Complete database guide

---

## Quick References

### Environment Variables
[Complete list](./README_BACKEND.md#variables-par-service)

### Routes & Endpoints
[All exposed endpoints](./README_BACKEND.md#routes-exposées-via-gateway)

### Security Checklist
[Validation cascade](./README_BACKEND.md#validation-et-sécurité)

### Deployment Checklist
[What to verify](./README_BACKEND.md#checklist-de-validation)

---

## Version History

- **v1.1.0** (2024-12-18): Initial complete documentation generated
- See [COMMIT_MESSAGE.md](../COMMIT_MESSAGE.md) for what was created

---

## Contact & Support

For questions about specific components, refer to the individual file documentation in `files/` folder.

For general architecture questions, see [README_BACKEND.md](./README_BACKEND.md).

For database questions, see [PRISMA_MODELS.md](./PRISMA_MODELS.md).

---

**Last updated**: 2024-12-18  
**Documentation format**: Markdown  
**Target audience**: Developers, DevOps, Architects
