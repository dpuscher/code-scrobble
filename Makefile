.PHONY: up down restart build logs logs-app shell \
        install test lint lint-fix format \
        migrate migrate-deploy migrate-reset generate studio

# ─── Docker Compose ──────────────────────────────────────────────────────────

up:        ## Start all services in the background
	docker compose up -d

down:      ## Stop and remove containers
	docker compose down

restart:   ## Restart all services
	docker compose restart

build:     ## Rebuild Docker images
	docker compose build

logs:      ## Follow logs for all services
	docker compose logs -f

logs-app:  ## Follow logs for the app service only
	docker compose logs -f app

shell:     ## Open a shell inside the running app container
	docker compose exec app sh

# ─── Yarn ────────────────────────────────────────────────────────────────────

install:   ## Install dependencies inside the app container
	docker compose exec app yarn install

test:      ## Run tests
	yarn test

test-watch: ## Run tests in watch mode
	yarn test:watch

lint:      ## Lint the codebase
	yarn lint

lint-fix:  ## Lint and auto-fix
	yarn lint:fix

format:    ## Format all files with Prettier
	yarn format

# ─── Prisma (runs inside the app container) ──────────────────────────────────

migrate:   ## Create and apply a migration (usage: make migrate name=your_migration_name)
ifeq ($(name),)
	docker compose exec app yarn prisma migrate dev
else
	docker compose exec app yarn prisma migrate dev --name $(name)
endif

migrate-deploy: ## Apply pending migrations (production)
	docker compose exec app yarn prisma migrate deploy

migrate-reset: ## Reset the database and re-apply all migrations (destructive!)
	docker compose exec app yarn prisma migrate reset

generate:  ## Regenerate the Prisma client
	docker compose exec app yarn prisma generate

studio:    ## Open Prisma Studio (requires port 5555 exposed in docker-compose.yml)
	docker compose exec app yarn prisma studio --port 5555 --browser none

# ─── Help ────────────────────────────────────────────────────────────────────

help:      ## Show this help message
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | \
		awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-18s\033[0m %s\n", $$1, $$2}'

.DEFAULT_GOAL := help
