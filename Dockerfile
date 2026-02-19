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
RUN yarn build

FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

COPY --from=deps /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/app ./app
COPY --from=builder /app/lib ./lib
COPY package.json ./

USER nextjs

EXPOSE 3000

CMD ["node_modules/.bin/next", "start"]
