FROM node:22-alpine AS base
RUN corepack enable

FROM base AS deps
WORKDIR /app
RUN apk add --no-cache git
COPY package.json yarn.lock .yarnrc.yml ./
RUN yarn install --immutable && yarn allow-scripts run

FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
RUN yarn prisma generate && yarn build

FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Standalone output bundles only the required node_modules
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
# Prisma generated client lives outside node_modules — copy it explicitly
COPY --from=builder --chown=nextjs:nodejs /app/generated ./generated

USER nextjs

EXPOSE 3000

CMD ["node", "server.js"]
