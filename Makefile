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
all: build up
	@echo ""
	@echo "✅ Trust Estate is running!"
	@echo "🌐 Frontend: https://localhost:8443"
	@echo "🐳 Using: $(DOCKER_COMPOSE)"
	@echo ""

# Build all containers
build:
	@echo "🔨 Building containers with $(DOCKER_COMPOSE)..."
	$(DOCKER_COMPOSE) build

# Rebuild without cache (use only when needed)
rebuild:
	@echo "🔨 Rebuilding containers without cache..."
	$(DOCKER_COMPOSE) build --no-cache

# Start all services
up:
	@echo "🚀 Starting services..."
	$(DOCKER_COMPOSE) up -d

# Stop all services
down:
	@echo "🛑 Stopping services..."
	$(DOCKER_COMPOSE) down

# Clean everything (containers, images, volumes)
clean:
	@echo "🧹 Cleaning up..."
	$(DOCKER_COMPOSE) down -v --rmi local
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

# Show which docker compose command is being used
check:
	@echo "🐳 Docker Compose command: $(DOCKER_COMPOSE)"
	@$(DOCKER_COMPOSE) version
