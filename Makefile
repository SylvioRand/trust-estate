.PHONY: all build up down clean logs restart status dev rebuild db-sync seed certs reload-% check run-no-ai

define PrintWarning
	printf "[\033[33m WARNING \033[0m]: $(1)\n"
endef

define PrintInfo
	printf "[\033[34m INFO \033[0m]: $(1)\n"
endef

define PrintError
	printf "[\033[31m ERROR \033[0m]: $(1)\n"
endef

define PrintSuccess
	printf "[\033[32m SUCCESS \033[0m]: $(1)\n"
endef

DOCKER_COMPOSE := $(shell \
	if docker compose version >/dev/null 2>&1; then \
		echo "docker compose"; \
	elif docker-compose --version >/dev/null 2>&1; then \
		echo "docker-compose"; \
	else \
		echo "docker compose"; \
	fi)

export DOCKER_BUILDKIT=0

all: certs build up db-sync
	@$(call PrintInfo,Casa is running)
	@$(call PrintInfo,Entrypoint: https://localhost:8443)
	@$(call PrintInfo,Using: $(DOCKER_COMPOSE))

db-sync:
	@$(call PrintInfo,Waiting for auth service to be ready)
	@until docker inspect --format='{{.State.Health.Status}}' trust-estate-auth 2>/dev/null | grep -q "healthy"; do \
		$(call PrintInfo,Still processing ...); \
		sleep 2; \
	done
	@$(call PrintSuccess,Auth service is ready)
	@$(call PrintInfo,Synchronizing Prisma schemas with database ...)

	@$(call PrintInfo, -> Pushing listings schema ...)
	@cd services/listings && DATABASE_URL="postgresql://trustestate:trustestate_secret@localhost:5433/trustestate?schema=listings" npx -y prisma@6.19.1 db push --accept-data-loss > /dev/null 2>&1 || \
		($(call PrintError,Failed pushing listings schema); exit 1)
	@$(call PrintInfo, -> Pushing auth schema ...)
	@cd services/auth && DATABASE_URL="postgresql://trustestate:trustestate_secret@localhost:5433/trustestate?schema=auth" npx -y prisma@6.19.1 db push --accept-data-loss > /dev/null 2>&1 || \
		($(call PrintError,Failed pushing auth schema); exit 1)
	@$(call PrintInfo, -> Pushing reservation schema ...)
	@cd services/reservation && DATABASE_URL="postgresql://trustestate:trustestate_secret@localhost:5433/trustestate?schema=reservation" npx -y prisma@6.19.1 db push --accept-data-loss > /dev/null 2>&1 || \
		($(call PrintError,Failed pushing reservation schema); exit 1)
	@$(call PrintSuccess,Database schemas synchronized)

seed:
	@$(call PrintInfo,Seeding database ...)
	@$(call PrintInfo, -> Seeding Auth (Admin Account) ...)
	@cd services/auth && DATABASE_URL="postgresql://trustestate:trustestate_secret@localhost:5433/trustestate?schema=auth" npx tsx prisma/seed.ts > /dev/null 2>&1 || \
		($(call PrintError,Failed seeding auth); exit 1)
	@$(call PrintInfo, -> Seeding Listings (Test Data) ...)
	@cd services/listings && DATABASE_URL="postgresql://trustestate:trustestate_secret@localhost:5433/trustestate?schema=listings" npm run seed > /dev/null 2>&1 || \
		($(call PrintError,Failed seeding listings); exit 1)
	@$(call PrintSuccess,Seeding complete)

build:
	@$(call PrintInfo, -> Building containers with $(DOCKER_COMPOSE)(This can take a while) ...)
	@$(DOCKER_COMPOSE) build > /dev/null 2>&1 || ($(call PrintError,Build failed); exit 1)
	@$(call PrintSuccess,Containers built)

rebuild:
	@$(call PrintInfo, -> Rebuilding containers without cache ...)
	@$(DOCKER_COMPOSE) build --no-cache > /dev/null 2>&1 || ($(call PrintError,Rebuild failed); exit 1)
	@$(call PrintSuccess,Containers rebuilt)

up: certs
	@$(call PrintInfo,Starting services ...)
	@$(DOCKER_COMPOSE) up -d > /dev/null 2>&1 || ($(call PrintError,Failed to start services); exit 1)
	@$(call PrintSuccess,Services started)

down:
	@$(call PrintInfo,Stopping services ...)
	@$(DOCKER_COMPOSE) down > /dev/null 2>&1 || ($(call PrintError,Failed to stop services); exit 1)
	@$(call PrintSuccess,Services stopped)

clean:
	@$(call PrintInfo,Cleaning up everything ...)
	@$(DOCKER_COMPOSE) down -v --rmi local > /dev/null 2>&1 || ($(call PrintError,Cleanup failed); exit 1)
	@$(call PrintSuccess,Cleanup complete)

logs:
	@$(DOCKER_COMPOSE) logs -f

restart: down up

status:
	@$(DOCKER_COMPOSE) ps

dev: build
	@$(call PrintInfo,Starting in development mode ...)
	@$(DOCKER_COMPOSE) up > /dev/null 2>&1 || ($(call PrintError,Failed to start dev mode); exit 1)
	@$(call PrintSuccess,Development mode started)

reload-%:
	@$(call PrintInfo,Reloading $* service ...)
	@$(DOCKER_COMPOSE) up -d --build $* > /dev/null 2>&1 || \
		($(call PrintError,Failed to reload $*); exit 1)
	@$(call PrintSuccess,$* service reloaded)

check:
	@$(call PrintInfo,Docker Compose command: $(DOCKER_COMPOSE))
	@$(DOCKER_COMPOSE) version > /dev/null 2>&1

certs:
	@$(call PrintInfo,Checking SSL certificates ...)
	@mkdir -p nginx/certs
	@if [ ! -f nginx/certs/server.key ] || [ ! -f nginx/certs/server.crt ]; then \
		$(call PrintInfo,Generating self-signed certificates ...); \
		openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
			-keyout nginx/certs/server.key \
			-out nginx/certs/server.crt \
			-subj "/C=MG/ST=Antananarivo/L=Antananarivo/O=TrustEstate/OU=Dev/CN=localhost" > /dev/null 2>&1 || \
			($(call PrintError,Failed generating certificates); exit 1); \
		$(call PrintSuccess,Certificates generated); \
	else \
		$(call PrintSuccess,Certificates already exist); \
	fi

# run-no-ai:
# 	@DOCKER_BUILDKIT=0 docker compose up -d --build nginx auth-service listings-service reservations-service db credits-service > /dev/null 2>&1 || \
# 	($(call PrintError,Failed to start services); exit 1)
# 	@$(call PrintSuccess,Services started without AI)
