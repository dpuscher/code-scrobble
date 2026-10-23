# AGENTS.md

Guidance for coding agents (Claude Code, Codex, Gemini CLI, Cursor, ...) working in this repository.

CodeScrobble: scan a CD/vinyl barcode with the phone camera, look the release up on Discogs, scrobble its tracks to Last.fm. Next.js 16 (App Router, Turbopack, standalone output), React 19, TypeScript 6, Postgres via Drizzle ORM, Tailwind CSS 4. Node 24, Yarn 4 (`nodeLinker: node-modules`, install scripts disabled, packages must be at least 3 days old).

## Commands

```sh
make up                 # whole stack in Docker: production image + Postgres + mock APIs + seed data, http://localhost:3000
make reset              # wipe local data and re-seed;  make down / make logs
yarn dev                # from source; needs `docker compose up -d postgres` and real API keys in .env
yarn lint && yarn typecheck
yarn test               # Vitest (watch); `yarn test run` once
yarn test run src/server/releases.test.ts      # one file
yarn test run -t 'auto-scrobbles'              # by test name
yarn test --project server                     # or: client
yarn test:e2e           # Playwright: builds, then runs the standalone server on :3100
yarn test:e2e e2e/scan.spec.ts                 # one spec; E2E_SKIP_BUILD=1 reuses the last build
yarn screenshots        # every screen at phone + desktop size into test-results/screens (SHOT_DIR overrides)
yarn db:generate        # after editing src/server/db/schema.ts; commit the SQL in drizzle/
```

E2E needs the compose Postgres (database `codescrobble_e2e`, override with `E2E_DATABASE_URL`).

## Architecture

**Server code lives in `src/server/`, not in `src/app/`.** Routes in `src/app/` are thin:
- Pages (`page.tsx`) are server components. They check the login with `requireUser()` (`src/server/session.ts`; checked per page, not in a layout, as layouts do not re-render on navigation), load their data from `src/server/`, and render a client component next to them (`Detected.tsx`, `Scrobbled.tsx`). The session reaches client components through `SessionProvider` (`src/lib/session.tsx`), set per page.
- Mutations are server actions in `src/app/actions.ts` (Next.js checks Origin/Host for them).
- Route handlers in `src/app/api/**` serve what the client fetches (search, versions, session) and the login/logout/health URLs; authenticated ones use `authenticated()` (`src/server/api.ts`: session lookup, Origin/Host check, 401/500).
- Page params arrive URL-encoded (decode them), route handler params decoded.

**Legacy URLs are rewrites** in `next.config.ts` (`/auth/lastfm`, `/auth/lastfm/callback`, `/logout`, `/health` → `/api/...`). The Last.fm callback URL is registered with Last.fm, so these paths must not change.

**Database.** `src/server/db/schema.ts` (snake_case casing). Migrations run at startup from `src/instrumentation.ts` → `src/server/startup.ts` → `runStartupTasks()` under a Postgres advisory lock; startup failure exits the process. `releases` is a local cache of Discogs releases (refreshed after 7 days); `barcode_lookups` caches barcode→release including misses; `search_cache` caches searches. `scrobbles` is the per-user history, trimmed to 20 entries.

**Legacy MongoDB import.** While `MONGODB_URI` is set, startup imports CodeScrobble 1.x data once (`src/server/legacy-import.ts`, single transaction, recorded in `app_meta`). Production holds real user data: back up on the server (`ssh hetzner2`) before any schema or data change.

**Sessions** are DB-backed: cookie `sid` holds a random token, only its SHA-256 is stored (`sessions` table), rolling 30 days. Pages cannot set cookies, so `src/proxy.ts` renews the cookie on page requests and `findSessionUser()` the database expiry. Logout is a POST form.

**Scrobbling** (`src/server/lastfm.ts`): one scrobble per track, starting now and spaced forward by track durations (future timestamps are intended and work on Last.fm). Only sent when `NODE_ENV=production` and `LASTFM_SCROBBLING` is not `off`; otherwise logged. Last.fm error 9 (revoked session) logs the user out and the client goes to the login page.

**External APIs are overridable** for tests: `LASTFM_API_URL`, `LASTFM_AUTH_URL`, `DISCOGS_API_URL` (`src/server/config.ts`, read lazily so `next build` needs no secrets). `e2e/mock-server.ts` implements both APIs; with `MOCK_CATALOG=dev` it also serves the made-up records of `dev/catalog.ts` and a barcode page. The e2e fixtures (`e2e/fixtures.ts`, user `e2e-listener`) and the dev catalog (user `vinyl-fan`) are separate.

**CSP** is set per request with a nonce in `src/proxy.ts` (Next 16's middleware); Next.js applies it to its scripts while rendering. That needs every page rendered per request, which the root layout ensures by reading the request headers. Production allows no inline `<style>`/`<script>` without the nonce; only style attributes are inline. E2E tests fail on any console error, which includes CSP violations and hydration mismatches.

**Client.** Pages get their data from the server; only the release search fetches on the client (SWR hooks in `src/lib/api.ts`). The barcode scanner (`src/components/scanner/Scanner.tsx`) uses the browser's `BarcodeDetector` where it reads EAN-13 (Chrome on Android), otherwise ZXing (`zxing-wasm`) in a Web Worker; the `.wasm` is served by the app, hence `'wasm-unsafe-eval'` in the CSP. EAN-8/EAN-13, UPC-A becomes EAN-13 with a leading zero. `CircleLayout` is the app shell (round content area). The old service worker files in `public/` only unregister themselves.

**Styling.** Tailwind utilities inline in the components; the theme in `src/styles/globals.css` is limited to the brand palette (`yellow`, `silver`, `grey`, `dark`, `lastfm`, plus white/black). Default Tailwind colors are disabled. Layout values mostly use exact pixel values from the original design; keep the look when changing styles and compare with `yarn screenshots`.

## Tests

- Server tests (`src/server/*.test.ts`) run against an in-process PGlite database per file (`src/test/db.ts`); outgoing HTTP is mocked via `src/test/fetch.ts`, data factories in `src/test/factories.ts`. `next/headers` is replaced by `src/test/next.ts` (request cookies via `startRequest()`, or `loggedInUser()` from `src/test/auth.ts`), so server actions and pages' server functions can be called directly; `callRoute()` in `src/test/http.ts` calls route handlers.
- E2E (`e2e/`) runs the standalone build like the Docker image, against real Postgres and the mock server. Chromium's fake camera plays a generated EAN-13 video (`e2e/support/barcode-video.ts`), so scanning is tested for real. Import `test`/`expect` from `e2e/support/test.ts`; it resets per-user data and the mock's scrobble log before each test.

## Deployment

Pushing to `staging` or `production` runs `.github/workflows/deploy.yml`: CI (`ci.yml`), native amd64/arm64 image builds to `ghcr.io/dpuscher/code-scrobble:<branch>` and `:<branch>-<sha>`, a Dokploy deploy via API, then a wait until `/health` reports the new revision. A successful staging deploy keeps a "Staging to Production" PR open; merging it releases. Work happens on `staging`. Do not commit or push unless asked; pushing deploys staging.

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
