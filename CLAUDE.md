# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
yarn dev              # Start Next.js dev server
yarn build            # Production build
yarn test             # Run all tests once
yarn test:watch       # Run tests in watch mode
yarn vitest run <file> # Run a single test file
yarn lint             # ESLint check
yarn lint:fix         # ESLint auto-fix
yarn format           # Prettier format
yarn tsc --noEmit     # Type-check without emitting
```

## Architecture

**CodeScrobble** is a Next.js app (App Router) that lets users scrobble CDs and vinyl records to Last.fm by scanning barcodes with a smartphone camera.

### Request flow

1. User scans a barcode → `GET /api/barcode/[id]` → `server/discogs.ts` looks up the release ID via Discogs API (Redis-cached)
2. User confirms release → `GET /api/search/[query]` or release fetched directly → `server/discogs.ts`
3. User scrobbles → `POST /api/scrobble` → `server/lastfm.ts` generates backward timestamps and calls Last.fm API
4. History stored in PostgreSQL via Prisma (`server/db/releaseRepository.ts`, `server/db/userRepository.ts`)

### Directory responsibilities

- **`app/`** — Next.js App Router: pages, layouts, and `app/api/` route handlers. Route handlers are thin — they delegate to `server/` modules.
- **`server/`** — Server-side business logic: Discogs/Last.fm API clients, Redis cache, Prisma repositories, domain models. Never imported by client-side code.
- **`lib/`** — Utilities usable by both client and server: auth config, Prisma singleton, DTOs, `callbackToPromise`, formatting helpers.
- **`components/`** — React components, organised by feature (`ui/`, `scrobble/`, `detected/`).

### Key files

| File | Purpose |
|------|---------|
| `lib/auth.ts` | Better-auth configuration (Last.fm OAuth plugin, session hooks) |
| `lib/prisma.ts` | Prisma client singleton |
| `lib/callbackToPromise.ts` | Type-safe callback→Promise adapters used by legacy Discogs/Last.fm SDKs |
| `server/cache.ts` | Redis wrapper — `get` returns `T \| undefined` (no rejection on miss) |
| `server/discogs.ts` | Discogs barcode lookup, search, release normalization (cached) |
| `server/lastfm.ts` | Last.fm scrobbling — timestamps calculated **backward** from now so the session ends at the current time |
| `prisma/schema.prisma` | Database schema (User, Release, ReleaseTracks, ScrobbleHistory, UserInstantScrobble) |

### Authentication

Better-auth with a Last.fm OAuth plugin. All auth routes live under `app/api/auth/[...all]/`. On session creation a hook in `lib/auth.ts` fetches and syncs the user's Last.fm profile image and URL.

### Caching

Redis (via `server/cache.ts`) caches Discogs API responses under keys like `barcode--<value>` and `search--<query>`. Default TTL is 24 hours. Cache misses resolve to `undefined`; callers check for that before hitting the API.

### Testing

Test files use the `*.test.ts(x)` suffix and live **next to the file they test** (e.g. `server/cache.test.ts` beside `server/cache.ts`). When a directory has many source files and co-location would be too noisy, use a `__tests__/` subdirectory instead (e.g. `lib/__tests__/`). The Redis mock is at `server/__mocks__/redis.ts`. Vitest globals are enabled — no need to import `describe`/`it`/`expect`.

### TypeScript paths

`@/*` resolves to the repo root, so `@/lib/foo` and `@/components/foo` work anywhere.

### Environment variables

Copy `.env.example` and fill in:
- `DISCOGS_KEY` / `DISCOGS_SECRET`
- `LASTFM_KEY` / `LASTFM_SECRET`
- `BETTER_AUTH_SECRET` (≥32 chars — generate with `openssl rand -base64 32`)
- `DATABASE_URL` (PostgreSQL)
- `BETTER_AUTH_URL` / `NEXT_PUBLIC_APP_URL`
