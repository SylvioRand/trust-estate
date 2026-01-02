.PHONY: all build up down clean logs restart

# Default target: build and run everything
all: build up
	@echo ""
	@echo "✅ Trust Estate is running!"
	@echo "🌐 Frontend: https://localhost:8443"
	@echo ""

# Build all containers
build:
	@echo "🔨 Building containers..."
	DOCKER_BUILDKIT=0 docker-compose build --no-cache

# Start all services
up:
	@echo "🚀 Starting services..."
	DOCKER_BUILDKIT=0 docker-compose up -d

# Stop all services
down:
	@echo "🛑 Stopping services..."
	DOCKER_BUILDKIT=0 docker-compose down

# Clean everything (containers, images, volumes)
clean:
	@echo "🧹 Cleaning up..."
	DOCKER_BUILDKIT=0 docker-compose down -v --rmi local
	@echo "✅ Cleanup complete"

# View logs
logs:
	DOCKER_BUILDKIT=0 docker-compose logs -f

# Restart services
restart: down up

# Check status
status:
	DOCKER_BUILDKIT=0 docker-compose ps
