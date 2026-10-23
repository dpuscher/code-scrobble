# Local stack in Docker (see docker-compose.yml): the production image with
# Postgres, seed data and mock Last.fm/Discogs APIs. Needs only Docker.

.PHONY: up down reset logs ps test e2e screenshots

## up: build and start everything, then open http://localhost:3000
up:
	docker compose up --build --detach --wait
	@echo
	@echo "  App:       http://localhost:3000  (log in: the mock approves instantly)"
	@echo "  Barcodes:  http://localhost:4011/barcodes"
	@echo "  Logs:      make logs    Stop: make down    Fresh data: make reset"

## down: stop everything (keeps the database)
down:
	docker compose down

## reset: delete all local data and seed again
reset:
	docker compose run --rm --build seed node dev/seed.ts --reset

logs:
	docker compose logs --follow app mock

ps:
	docker compose ps

test:
	yarn lint && yarn typecheck && yarn test run

e2e:
	yarn test:e2e

screenshots:
	yarn screenshots
