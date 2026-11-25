# syntax=docker/dockerfile:1

FROM node:26-alpine AS base
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1
RUN corepack enable

# Dependencies change far less often than the source, so they get their own
# layer (plus a BuildKit cache mount for the Yarn download cache).
FROM base AS deps
COPY package.json yarn.lock .yarnrc.yml ./
RUN --mount=type=cache,target=/root/.yarn/berry/cache \
    yarn install --immutable

FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN yarn build

# The runtime image only carries Next.js' standalone output: the traced
# subset of node_modules plus the compiled app, no Yarn and no dev tooling.
FROM node:26-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=3000 \
    HOSTNAME=0.0.0.0

COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public
# SQL migrations, applied on startup (see src/instrumentation.ts).
COPY --from=builder /app/drizzle ./drizzle

# Reported by /health so the deploy workflow can tell when the new version
# is live.
ARG REVISION=unknown
ENV APP_REVISION=$REVISION

# Drop root: nothing here needs it. Next.js may write its cache here.
RUN mkdir -p .next/cache && chown node:node .next/cache
USER node

EXPOSE 3000

# Probes /health, which also checks the database connection. The long start
# period covers the one-time MongoDB import on the first boot after the
# Postgres migration.
HEALTHCHECK --interval=30s --timeout=5s --start-period=120s --retries=3 \
  CMD node -e "fetch('http://localhost:'+process.env.PORT+'/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

CMD ["node", "server.js"]
