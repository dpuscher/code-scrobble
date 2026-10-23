# syntax=docker/dockerfile:1

# Tooling for the local stack in docker-compose.yml: the mock Last.fm and
# Discogs APIs and the seed script. Not part of the production image.
FROM node:24-alpine
WORKDIR /app
RUN corepack enable
COPY package.json yarn.lock .yarnrc.yml ./
RUN --mount=type=cache,target=/root/.yarn/berry/cache \
    yarn install --immutable
COPY drizzle ./drizzle
COPY src/server/db/schema.ts ./src/server/db/
COPY e2e/fixtures.ts e2e/mock-server.ts ./e2e/
COPY e2e/support/barcode-video.ts ./e2e/support/
COPY dev ./dev
USER node
