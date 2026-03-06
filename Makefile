.PHONY: all build up down clean logs restart status dev rebuild

DOCKER_COMPOSE := $(shell \
	if docker compose version >/dev/null 2>&1; then \
		echo "docker compose"; \
	elif docker-compose --version >/dev/null 2>&1; then \
		echo "docker-compose"; \
	else \
		echo "docker compose"; \
	fi)

define printInfo
	echo "[\033[34m INF \033[0m] $(1)"
endef

define printError
	echo "[\033[31m NOK \033[0m] $(1)"
endef

define printSuccess
	echo "[\033[32m OK \033[0m] $(1)"
endef

export DOCKER_BUILDKIT=0

all: certs generate-certs build up db-sync seed
	@$(call printSuccess,CASA is running!)

db-sync:
	@$(call printInfo,Waiting for services to be ready)
	@until docker inspect --format='{{.State.Health.Status}}' trust-estate-auth 2>/dev/null | grep -q "healthy"; do \
		$(call printInfo,Waiting for auth service); \
		sleep 2; \
	done
	@until docker inspect --format='{{.State.Health.Status}}' trust-estate-listings 2>/dev/null | grep -q "healthy"; do \
		$(call printInfo,Waiting for listings service); \
		sleep 2; \
	done
	@until docker inspect --format='{{.State.Health.Status}}' trust-estate-reservations 2>/dev/null | grep -q "healthy"; do \
		$(call printInfo,Waiting for reservation service); \
		sleep 2; \
	done
	@$(call printInfo,All services ready! Synchronizing schemas ...)
	@$(call printInfo,Synchronizing Prisma schemas with database ...)
	@$(call printInfo,Pushing auth schema ...)
	@docker exec trust-estate-auth npx prisma db push --accept-data-loss
	@$(call printInfo,Pushing listings schema ...)
	@docker exec trust-estate-listings npx prisma db push --accept-data-loss
	@$(call printInfo,Pushing reservation schema ...)
	@docker exec trust-estate-reservations npx prisma db push --accept-data-loss
	@$(call printSuccess,Database schemas synchronized!)

seed:
	@$(call printInfo,Seeding DB ...)
	@$(call printInfo,Seeding Auth ...)
	@docker exec trust-estate-auth npx tsx prisma/seed.ts
	@$(call printSuccess,Seeding complete!)

build:
	@$(call printInfo,Building containers ...)
	$(DOCKER_COMPOSE) build
	@$(call printSuccess,Containers built!)

rebuild:
	@$(call printInfo,Rebuilding containers ...)
	$(DOCKER_COMPOSE) build --no-cache
	@$(call printSuccess,Containers rebuilt!)


up: certs generate-certs
	@$(call printInfo,Starting services ...)
	$(DOCKER_COMPOSE) up -d
	@$(call printSuccess,Services started!)

down:
	@$(call printInfo,Stopping services ...)
	$(DOCKER_COMPOSE) down
	@$(call printSuccess,Services stopped!)

clean:
	@$(call printInfo,Cleaning Started ...)
	$(DOCKER_COMPOSE) down -v --rmi local
	@$(call printSuccess,Cleanup complete!)

logs:
	$(DOCKER_COMPOSE) logs -f

restart: down up

status:
	$(DOCKER_COMPOSE) ps

dev: build
	@$(call printInfo,Starting in development mode ...)
	$(DOCKER_COMPOSE) up
	@$(call printSuccess,Development mode started!)

reload-listings:
	@$(call printInfo,Reloading listings service ...)
	$(DOCKER_COMPOSE) up -d --build listings-service
	@$(call printSuccess,Service listings reloaded!)

reload-nginx:
	@$(call printInfo,Reloading nginx service ...)
	$(DOCKER_COMPOSE) up -d --build nginx
	@$(call printSuccess,Service nginx reloaded!)

reload-reservation:
	@$(call printInfo,Reloading reservation service ...)
	$(DOCKER_COMPOSE) up -d --build reservations-service
	@$(call printSuccess,Service reservation reloaded!)

reload-credits:
	@$(call printInfo,Reloading credits service ...)
	$(DOCKER_COMPOSE) up -d --build credits-service
	@$(call printSuccess,Service credits reloaded!)

reload-ai:
	@$(call printInfo,Reloading AI service ...)
	$(DOCKER_COMPOSE) up -d --build ai-service
	@$(call printSuccess,Service AI reloaded!)

reload-chromadb:
	@$(call printInfo,Reloading chromaDB service ...)
	$(DOCKER_COMPOSE) up -d --build chromadb-service
	@$(call printSuccess,Service chromaDB reloaded!)

reload-auth:
	@$(call printInfo,Reloading auth service ...)
	$(DOCKER_COMPOSE) up -d --build auth-service
	@$(call printSuccess,Service auth reloaded!)

check:
	@$(call printInfo,Docker Compose command: $(DOCKER_COMPOSE))
	@$(DOCKER_COMPOSE) version

certs:
	@$(call printInfo,Checking SSL certificates ...)
	@mkdir -p nginx/certs
	@if [ ! -f nginx/certs/server.key ] || [ ! -f nginx/certs/server.crt ]; then \
		$(call printInfo,Generating self-signed certificates ...); \
		openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
		-keyout nginx/certs/server.key \
		-out nginx/certs/server.crt \
		-subj "/C=MG/ST=Antananarivo/L=Antananarivo/O=TrustEstate/OU=Dev/CN=localhost" 2>/dev/null; \
		$(call printSuccess,Certificates generated in nginx/certs/); \
	else \
		$(call printSuccess,Certificates already exist.); \
	fi

generate-certs:
	chmod +x script/secret.generator.sh
	./script/secret.generator.sh

run-no-ai:
	DOCKER_BUILDKIT=0 docker compose up -d --build nginx auth-service listings-service reservations-service db credits-service
