# CodeScrobble Modernization Plan (Next.js App Router + RSC, Latest-Stable Policy)

## Summary

Modernize CodeScrobble incrementally to a current mainstream stack while preserving user-visible behavior and URLs.

Core decisions locked:

1. Migrate to Next.js App Router incrementally (hybrid migration).
2. Use React Server Components by default, with Client Components only where browser APIs/interactivity are required.
3. Move from Jest to Vitest first.
4. Enforce latest stable versions for all kept dependencies.
5. Migrate backend data/auth to PostgreSQL + Prisma, with Better Auth evaluation and Last.fm compatibility validation.
6. Replace Redux-thunk patterns with TanStack Query (server state) and Zustand (UI state).
7. Replace styled-components with Tailwind + UI primitives.

## Current Baseline (Repo-Verified)

1. Next.js Pages Router is primary (`/Users/dpuscher/Documents/Projects/code-scrobble/pages`), with middleware already present.
2. Legacy Redux architecture is active (`/Users/dpuscher/Documents/Projects/code-scrobble/client/reduxStore.ts`).
3. `connect`/class components are still used in critical flows (`/Users/dpuscher/Documents/Projects/code-scrobble/pages/detected/[barcode].tsx`, `/Users/dpuscher/Documents/Projects/code-scrobble/pages/scrobbled/[barcode].tsx`).
4. Styling is largely `styled-components`.
5. API layer is in `pages/api/*`.
6. Tests are Jest-based with 7 spec files and Jest-specific mocking setup.

## Scope

1. In scope:

- Router/rendering migration to App Router + selective RSC.
- Test runner migration to Vitest.
- Dependency currency and governance.
- Data/auth modernization to Prisma + PostgreSQL + Better Auth evaluation.
- State and styling modernization.

2. Out of scope:

- Product feature redesign.
- URL changes.
- Breaking public API contracts during transition.

## Architecture Decisions

## App Router and RSC Policy

1. App Router adoption strategy: incremental by route cluster.
2. RSC policy: server-first by default.
3. Client-only islands (must remain `"use client"`):

- Scanner and camera integrations (`navigator`, Quagga): `/Users/dpuscher/Documents/Projects/code-scrobble/components/scanner/Scanner.tsx`.
- Highly interactive detected/scrobble flow components.
- Local UI state controls and browser-event-heavy widgets.

4. Good first RSC targets:

- Legal/privacy pages.
- Login shell.
- Profile page server data shell with client subcomponents as needed.

## Route Migration Order

1. Static/legal cluster:

- `/legal`, `/privacy`.

2. Auth/session cluster:

- login + session checks + middleware compatibility.

3. Scan flow cluster together (single batch to avoid cross-router hard navigations):

- `/` (scan entry), `/detected/[barcode]`, `/scrobbled/[barcode]`.

4. Profile cluster:

- `/profile` + dependent API flows.

## API/Data Strategy

1. Migrate `pages/api/*` to App Router route handlers while preserving endpoint paths and response shapes.
2. Introduce shared Zod contracts for request/response payloads.
3. Replace MongoDB models with Prisma models on PostgreSQL.
4. Better Auth evaluation with Last.fm integration compatibility spike before cutover.
5. For initial migration, do not introduce Redis-based release caching or Redis performance optimizations. Keep PostgreSQL as the only source for release reads/writes, then evaluate Redis later based on measured bottlenecks.

## Pre-Deployment Data Migration Gate (Required Before Deploy)

1. Deployment to production is blocked until MongoDB -> PostgreSQL migration is validated and signed off.
2. Define and document canonical field mappings before coding migration scripts:

- `users` (profile fields + Last.fm key fields),
- `releases` (Discogs metadata),
- `history` (ordered scrobble history),
- `instantScrobbles` (auto-scrobble references).

3. Implement migration in three explicit stages:

- Full backfill from MongoDB snapshot into PostgreSQL.
- Incremental delta sync from MongoDB changes since snapshot time.
- Dual-write period where new writes are persisted to both MongoDB and PostgreSQL.

4. Add automated parity checks that compare MongoDB and PostgreSQL for:

- row/document counts by entity,
- required field non-null rates,
- random-sample record equality by business key,
- history ordering and referential integrity.

5. Add operational migration artifacts:

- dry-run script for staging with production-like snapshot,
- production runbook with exact command order and timing,
- rollback runbook to revert reads back to MongoDB if parity or runtime checks fail.

6. Cutover sequence must be explicit:

- enable PostgreSQL reads behind feature flag in staging,
- validate parity + smoke tests,
- schedule production cutover window,
- switch reads to PostgreSQL,
- keep dual-write for a soak period,
- disable MongoDB writes only after soak exit criteria pass.

7. Exit criteria for this gate:

- parity checks pass with zero critical mismatches,
- migration dry-run and production rehearsal logs are archived,
- rollback path is tested and documented,
- stakeholder sign-off completed before release approval.

## Concrete Mapping Rules from Real MongoDB User Document

1. Preserve legacy MongoDB IDs as canonical identifiers during migration to avoid breaking references:

- `user._id` (ObjectId hex string) -> `users.id` (text/varchar(24)),
- `history[].id` (release ObjectId hex string) must continue to match `releases.id`,
- `history[]._id` (embedded event ObjectId hex string) -> `scrobble_history.id` (text/varchar(24)).

2. Map user profile and Last.fm fields directly:

- `name` -> `users.name`,
- `key` -> `users.lastfm_session_key` (encrypted at rest; never logged),
- `url` -> `users.lastfm_url`,
- `image` -> `users.image_small`,
- `imageLarge` -> `users.image_large`,
- `imageXLarge` -> `users.image_xlarge`.

3. `__v` is not part of domain behavior and is excluded from runtime schema. Keep it only in an optional audit column (for migration diagnostics) if needed.
4. Normalize `instantScrobbles` array into a join table `user_instant_scrobbles(user_id, release_id)` with `PRIMARY KEY (user_id, release_id)` to enforce deduplication.
5. Normalize `history` array into `scrobble_history` rows:

- `id`: legacy embedded history `_id`,
- `user_id`: user `_id`,
- `release_id`: release reference from `history[].id`,
- `scrobbled_at`: `history[].time`,
- `legacy_array_index`: original array index from MongoDB snapshot.

6. Preserve behavior shown in the sample:

- duplicate `release_id` values in history are valid and must be retained,
- ordering is critical and must remain stable.

7. Ordering rule after migration:

- default query order must be `scrobbled_at DESC, id DESC`,
- parity validation must confirm this order matches legacy API output.

8. History-size invariant:

- legacy app keeps the most recent 20 entries,
- write path in PostgreSQL must enforce the same cap transactionally (`append new entry`, then `delete older rows beyond top 20`).

9. Session compatibility rule:

- existing session payloads containing legacy `userId` strings must continue to resolve users after cutover.

10. Add explicit migration checks based on this schema:

- every `history.release_id` exists in `releases`,
- every `user_instant_scrobbles.release_id` exists in `releases`,
- per-user history count and top-20 order parity between MongoDB and PostgreSQL.

## Concrete Mapping Rules from Real MongoDB Release Document

1. Preserve both release identifiers with distinct semantics:

- `release._id` (ObjectId hex string) -> `releases.id` (text/varchar(24), primary key for backward compatibility),
- `release.id` (Discogs numeric ID, e.g. `460996`) -> `releases.discogs_id` (integer/bigint, unique index).

2. Map top-level release fields directly:

- `artist` -> `releases.artist`,
- `title` -> `releases.title`,
- `image` -> `releases.image_url`,
- `url` -> `releases.discogs_url`,
- `year` -> `releases.release_year` (string to preserve existing behavior),
- `barcode` -> `releases.barcode`,
- `createdAt` / `updatedAt` -> `releases.created_at` / `releases.updated_at`.

3. `__v` is excluded from runtime schema and optionally stored in audit metadata only for migration diagnostics.
4. Normalize embedded `tracks[]` into `release_tracks`:

- `tracks[]._id` -> `release_tracks.id` (text/varchar(24), preserve legacy embedded IDs),
- parent relation: `release_tracks.release_id` -> `releases.id`,
- `title` -> `release_tracks.title`,
- `trackNumber` -> `release_tracks.track_number`,
- `duration` -> `release_tracks.duration_seconds`.

5. Preserve track ordering exactly:

- canonical order is ascending `track_number`,
- for ties or missing values, fallback secondary order by legacy `release_tracks.id`,
- parity checks must validate exact ordered sequence equality, not only set equality.

6. Duration/data integrity rules:

- `duration_seconds` must be non-negative integer,
- `0` remains valid when source duration is empty/unknown after normalization,
- migration must preserve very short tracks (e.g. 11s intros/interludes).

7. Unicode and text fidelity:

- track and release titles must preserve UTF-8 characters exactly (for example `Könnten Sie Mich Kurz Küssen?`).

8. Add explicit migration checks for releases/tracks:

- every migrated release has the same track count as MongoDB source,
- sum of track durations per release is unchanged,
- uniqueness of `discogs_id` is enforced without losing legacy `releases.id` compatibility,
- every history or instant-scrobble release reference resolves to an existing `releases.id`.

## Target PostgreSQL Schema

1. `users`

- `id varchar(24)` primary key (legacy Mongo `_id`),
- `name text not null`,
- `lastfm_session_key text not null` (encrypted at rest),
- `lastfm_url text`,
- `image_small text`,
- `image_large text`,
- `image_xlarge text`,
- `created_at timestamptz not null default now()`,
- `updated_at timestamptz not null default now()`.

2. `releases`

- `id varchar(24)` primary key (legacy Mongo `_id`),
- `discogs_id bigint not null unique`,
- `barcode text`,
- `artist text not null`,
- `title text not null`,
- `image_url text`,
- `discogs_url text`,
- `release_year text`,
- `created_at timestamptz not null`,
- `updated_at timestamptz not null`.

3. `release_tracks`

- `id varchar(24)` primary key (legacy embedded track `_id`),
- `release_id varchar(24) not null references releases(id) on delete cascade`,
- `track_number integer not null`,
- `title text not null`,
- `duration_seconds integer not null check (duration_seconds >= 0)`.

4. `scrobble_history`

- `id varchar(24)` primary key (legacy embedded history `_id`),
- `user_id varchar(24) not null references users(id) on delete cascade`,
- `release_id varchar(24) not null references releases(id)`,
- `scrobbled_at timestamptz not null`,
- `legacy_array_index integer`.

5. `user_instant_scrobbles`

- `user_id varchar(24) not null references users(id) on delete cascade`,
- `release_id varchar(24) not null references releases(id)`,
- `primary key (user_id, release_id)`.

6. Better Auth tables

- managed in PostgreSQL via Better Auth + Prisma,
- linked to domain users via stable `users.id`,
- auth internals are isolated from domain tables.

7. Compatibility and data-shape requirements

- preserve legacy ObjectId strings for all externally referenced IDs at initial cutover,
- preserve duplicate history entries and ordering semantics,
- keep `release_year` as text for behavior compatibility.

## Performance Guardrails

1. Baseline indexes required before production cutover:

- `users(id)` primary key,
- `releases(id)` primary key,
- unique `releases(discogs_id)`,
- index `releases(barcode)`,
- `release_tracks(release_id, track_number)`,
- `scrobble_history(user_id, scrobbled_at DESC, id DESC)`,
- `scrobble_history(release_id)`,
- `user_instant_scrobbles(user_id, release_id)` primary key.

2. Query-shape validation is required for critical paths:

- release lookup by barcode/Discogs ID,
- scrobble write path with top-20 history cap enforcement,
- profile history read path with join to releases,
- auto-scrobble fetch/delete path.

3. Run `EXPLAIN (ANALYZE, BUFFERS)` for critical queries on production-like data and archive plans in migration artifacts.
4. Endpoint performance targets in staging before deploy approval:

- p95 and p99 latency for critical API endpoints must be at or better than pre-migration baseline,
- no unresolved sequential scans on high-cardinality tables for hot queries.

5. Optimization order is fixed:

- first tune SQL query shape,
- then add/adjust indexes,
- then adjust transaction boundaries and write patterns,
- only evaluate Redis caching after PostgreSQL tuning is exhausted.

6. Monitoring guardrails after cutover:

- enable query-level monitoring and slow query logs for PostgreSQL,
- track endpoint latency and error rates during soak window,
- block final MongoDB write disable until guardrails remain stable through soak period.

## Target Database Structure Validation Against App Logic (Required Before Deploy)

1. Validate the target PostgreSQL schema against real read/write paths in the app before production deployment:

- release lookup path (`/Users/dpuscher/Documents/Projects/code-scrobble/pages/api/barcode/[id].ts`),
- scrobble write path (`/Users/dpuscher/Documents/Projects/code-scrobble/pages/api/scrobble.ts`),
- history read path (`/Users/dpuscher/Documents/Projects/code-scrobble/pages/api/user/history.ts`),
- auto-scrobble read/write path (`/Users/dpuscher/Documents/Projects/code-scrobble/pages/api/user/autoscrobbles.ts`),
- search path (`/Users/dpuscher/Documents/Projects/code-scrobble/pages/api/search/[query].ts`).

2. Final schema and indexes are not considered complete until these query patterns are replayed against PostgreSQL using production-like data volumes.
3. Required baseline indexes for first cutover:

- `users(id)` primary key,
- `releases(id)` primary key,
- unique `releases(discogs_id)`,
- index `releases(barcode)`,
- `release_tracks(release_id, track_number)`,
- `scrobble_history(user_id, scrobbled_at DESC, id DESC)`,
- `scrobble_history(release_id)`,
- `user_instant_scrobbles(user_id, release_id)` primary key.

4. Run `EXPLAIN (ANALYZE, BUFFERS)` for all critical queries and record plans in migration artifacts.
5. Define optimization decision gates:

- if history/profile queries regress versus baseline, add/adjust composite indexes first,
- if write latency rises due to history cap enforcement, optimize transaction shape before adding new infrastructure,
- only consider Redis after SQL/index tuning and query-shape fixes are exhausted.

6. Deploy gate for structure/performance validation:

- schema-review checklist approved,
- critical query plans reviewed,
- p95 and p99 latency targets for critical endpoints met in staging,
- no unresolved sequential-scan hotspots on high-cardinality tables.

## Dependency Policy (Latest Stable)

1. Rule: every kept dependency must be on npm `latest` stable tag.
2. No prerelease/canary unless explicitly approved.
3. Add CI freshness gate (`deps:check-latest`) that fails when kept dependencies lag stable.
4. Add Renovate for continuous updates.

## Kept/Removed/Additions (Target)

1. Keep (updated to latest stable): Next.js, React, React DOM, TypeScript, ESLint stack, Redis client, Discogs/Last.fm client libs where still required.
2. Remove during migration: Redux stack (`redux`, `react-redux`, `redux-thunk`, `next-redux-wrapper`, redux devtools extension), styled-components stack, Jest stack.
3. Add:

- Testing: `vitest`, `@vitest/coverage-v8`, `jsdom`.
- Data/state: `@tanstack/react-query`, `zustand`.
- Styling/UI: `tailwindcss`, `class-variance-authority`, `tailwind-merge`, chosen primitives set.
- Backend/auth: `prisma`, `@prisma/client`, `better-auth`, `zod`, `react-hook-form`.

## Implementation Phases

## Phase 0: Dependency and Test Foundation

1. Create dependency policy file.
2. Upgrade kept dependencies to latest stable.
3. Migrate Jest to Vitest:

- Replace Jest config with `vitest.config.ts`.
- Migrate setup from `jest-fetch-mock` to Vitest-compatible fetch mocks.
- Convert `jest.mock` to `vi.mock`.

4. Acceptance criteria:

- All existing tests pass on Vitest.
- No Jest packages remain.
- `deps:check-latest` passes.

## Phase 1: App Router Skeleton and Shared Contracts

1. Add `app/` route shells for first migration cluster.
2. Establish layout/metadata conventions.
3. Add shared Zod DTO contracts.
4. Acceptance criteria:

- Migrated routes render under App Router with parity behavior.
- Contract tests pass for unchanged API outputs.

## Phase 2: RSC Adoption by Cluster

1. Move static/legal pages to pure RSC.
2. Move login/profile shells to RSC with client islands only where needed.
3. Move scan cluster together; keep scanner/detected interaction components client-side.
4. Acceptance criteria:

- No user-visible regressions.
- No cross-router hard-navigation issues in migrated clusters.

## Phase 3: PostgreSQL + Prisma Migration

1. Define Prisma schema for users/releases/history/autoscrobble/auth entities.
2. Build migration scripts from Mongo to PostgreSQL.
3. Enable parity checks and staged read cutover.
4. Acceptance criteria:

- Record parity checks pass.
- PostgreSQL authoritative in staging.
- Production deployment blocked until the "Pre-Deployment Data Migration Gate" exit criteria are met.
- Legacy ID compatibility is preserved (`userId`, `releaseId`, and history event IDs continue to resolve).
- Target database structure is validated against app logic and performance gates in "Target Database Structure Validation Against App Logic".
- Target schema in "Target PostgreSQL Schema" is implemented and validated.
- Performance criteria in "Performance Guardrails" are met before deployment approval.

## Phase 4: Better Auth Evaluation and Cutover

1. Build Last.fm provider compatibility spike with Better Auth.
2. Validate callback/session/logout/protected-route behavior parity.
3. If spike passes, switch auth/session source; if not, keep temporary compatibility layer and continue other phases.
4. Acceptance criteria:

- End-to-end auth flows pass under Better Auth path.

## Phase 5: State and Styling Modernization

1. Replace Redux-thunk with TanStack Query hooks for server state.
2. Use Zustand for local UI state only.
3. Migrate styled-components to Tailwind + primitives route-by-route.
4. Acceptance criteria:

- No runtime Redux/styled-components dependencies.
- UI behavior parity and accessibility checks pass.

## Phase 6: Cleanup and Hardening

1. Remove Pages Router leftovers and legacy files.
2. Tighten TypeScript (`strict` and `strictNullChecks`).
3. Final dependency freshness check and documentation update.
4. Acceptance criteria:

- Production build green.
- E2E and regression suite green.
- All kept dependencies on latest stable.

## Public Interfaces / Types / Contracts

1. URLs remain unchanged.
2. API endpoint paths remain unchanged during transition.
3. New shared DTO schemas added for:

- session,
- release,
- history item,
- auto-scrobble item,
- standard error response envelope.

4. Middleware auth semantics remain equivalent.

## Test Plan

1. Unit:

- reducers/action creators until removed,
- cache/client adapters,
- schema validation logic.

2. Integration:

- route handlers,
- auth/session lifecycle,
- release lookup and scrobble flow.

3. E2E:

- login/logout,
- scan->detected->scrobbled,
- profile history/autoscrobble.

4. Non-functional:

- bundle/regression checks,
- route-level performance smoke checks.

## Risks and Mitigations

1. Risk: Better Auth + Last.fm provider mismatch.

- Mitigation: explicit spike gate before auth cutover.

2. Risk: Router-boundary hard navigations during mixed mode.

- Mitigation: migrate related route clusters together.

3. Risk: Data migration correctness.

- Mitigation: parity checks, staged cutover, rollback window.

4. Risk: Dependency major upgrades introducing regressions.

- Mitigation: latest-stable gate + phased upgrades + CI enforcement.

## Assumptions and Defaults

1. Latest means npm `latest` stable tag only.
2. Existing local uncommitted change in `/Users/dpuscher/Documents/Projects/code-scrobble/pages/profile.tsx` is ignored for planning scope.
3. Node 22 baseline remains.
4. Redis-based performance optimization is intentionally deferred for the initial migration; revisit only after PostgreSQL query/index profiling.
5. No URL-level product changes are required.

## Planned Output Artifact

1. Write this plan to:

- `/Users/dpuscher/Documents/Projects/code-scrobble/docs/modernization-plan.md`

2. This markdown is intended as direct input for an AI coding tool with implementation-ready phase sequencing and acceptance criteria.
