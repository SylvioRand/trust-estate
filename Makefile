.PHONY: all build up down clean logs restart status dev rebuild

# Détection automatique de la commande docker compose
DOCKER_COMPOSE := $(shell \
	if docker compose version >/dev/null 2>&1; then \
		echo "docker compose"; \
	elif docker-compose --version >/dev/null 2>&1; then \
		echo "docker-compose"; \
	else \
		echo "docker compose"; \
	fi)

# Variable pour Docker Buildkit
export DOCKER_BUILDKIT=0

# Default target: build and run everything
all: certs build up db-sync
	@echo ""
	@echo "✅ Trust Estate is running!"
	@echo "🌐 Frontend: https://localhost:8443"
	@echo "🐳 Using: $(DOCKER_COMPOSE)"
	@echo ""

# Synchronize Prisma schemas with database
db-sync:
	@echo "⏳ Waiting for auth service to be ready (migrations complete)..."
	@# Attendre que trust-estate-auth soit healthy
	@until docker inspect --format='{{.State.Health.Status}}' trust-estate-auth 2>/dev/null | grep -q "healthy"; do \
		echo "   ... waiting for auth service ..."; \
		sleep 2; \
	done
	@echo "✅ Auth service is ready! Proceeding with listings sync..."
	@echo "🔄 Synchronizing Prisma schemas with database..."
	@echo "   -> Pushing listings schema..."
	@cd services/listings && DATABASE_URL="postgresql://trustestate:trustestate_secret@localhost:5433/trustestate?schema=listings" npx -y prisma@6.19.1 db push --accept-data-loss
	@echo "   -> Pushing auth schema..."
	@cd services/auth && DATABASE_URL="postgresql://trustestate:trustestate_secret@localhost:5433/trustestate?schema=auth" npx -y prisma@6.19.1 db push --accept-data-loss
	@echo "   -> Pushing reservation schema..."
	@cd services/reservation && DATABASE_URL="postgresql://trustestate:trustestate_secret@localhost:5433/trustestate?schema=reservation" npx -y prisma@6.19.1 db push --accept-data-loss
	@echo "✅ Database schemas synchronized!"

# Seed the database with test data
seed:
	@echo "🌱 Seeding database..."
	@cd services/listings && DATABASE_URL="postgresql://trustestate:trustestate_secret@localhost:5433/trustestate?schema=listings" npm run seed
	@echo "✅ Seeding complete!"

# Build all containers
build:
	@echo "🔨 Building containers with $(DOCKER_COMPOSE)..."
	$(DOCKER_COMPOSE) build

# Rebuild without cache (use only when needed)
rebuild:
	@echo "🔨 Rebuilding containers without cache..."
	$(DOCKER_COMPOSE) build --no-cache

# Start all services
up: certs
	@echo "🚀 Starting services..."
	$(DOCKER_COMPOSE) up -d

# Stop all services
down:
	@echo "🛑 Stopping services..."
	$(DOCKER_COMPOSE) down

# Clean everything (containers, images, volumes)
clean:
	@echo "🧹 Cleaning up..."
# 	$(DOCKER_COMPOSE) down -v --rmi local
	$(DOCKER_COMPOSE) down -v local
	@echo "✅ Cleanup complete"

# View logs
logs:
	$(DOCKER_COMPOSE) logs -f

# Restart services
restart: down up

# Check status
status:
	$(DOCKER_COMPOSE) ps

# Development mode: build and start with logs
dev: build
	@echo "🔧 Starting in development mode..."
	$(DOCKER_COMPOSE) up

# Fast reload for listings service only
reload-listings:
	@echo "🔄 Reloading listings service..."
	$(DOCKER_COMPOSE) up -d --build listings-service

# Fast reload for listings service only
reload-nginx:
	@echo "🔄 Reloading nginx service..."
	$(DOCKER_COMPOSE) up -d --build nginx

# Show which docker compose command is being used
check:
	@echo "🐳 Docker Compose command: $(DOCKER_COMPOSE)"
	@$(DOCKER_COMPOSE) version

# Generate SSL certificates locally
certs:
	@echo "🔐 Checking SSL certificates..."
	@mkdir -p nginx/certs
	@if [ ! -f nginx/certs/server.key ] || [ ! -f nginx/certs/server.crt ]; then \
		echo "⚙️  Generating self-signed certificates..."; \
		openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
		-keyout nginx/certs/server.key \
		-out nginx/certs/server.crt \
		-subj "/C=MG/ST=Antananarivo/L=Antananarivo/O=TrustEstate/OU=Dev/CN=localhost"; \
		echo "✅ Certificates generated in nginx/certs/"; \
	else \
		echo "✅ Certificates already exist."; \
	fi
