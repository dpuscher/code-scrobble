# Better Auth Evaluation — Deferred

**Date:** 2026-02-25
**Outcome:** Skip. Keep iron-session.

## Why Better Auth Was Evaluated

Phase 4 of the modernization plan called for evaluating Better Auth as a replacement for iron-session to reduce auth boilerplate and align with the ecosystem.

## Why Better Auth Was Rejected

Last.fm uses a non-standard, non-OAuth2 auth flow:

1. Redirect user to `https://www.last.fm/api/auth/?api_key=KEY&cb=CALLBACK_URL`
2. User authenticates; Last.fm redirects back with a `token` query parameter
3. App exchanges the token for a session key via `auth.getSession` (MD5-signed, no expiry)
4. Session key is stored on the `User` model; no refresh token concept

Better Auth's design assumes OAuth2/OIDC providers that supply user emails and return `code` parameters in callbacks. Each integration point breaks:

| Requirement                       | Issue                                                                                                |
| --------------------------------- | ---------------------------------------------------------------------------------------------------- |
| Last.fm redirect + token exchange | Generic OAuth plugin expects a `code` param; Last.fm sends `token`. Custom plugin required.          |
| No user email from Last.fm        | GitHub issue #1479 — known bug, no clean resolution                                                  |
| Session key storage (no expiry)   | `additionalFields` data not available at runtime (issue #3888, closed "not planned")                 |
| Prisma 7 compatibility            | CLI generator is incompatible with Prisma 7 schema format; manual fixes required after every CLI run |

## Current State

The existing implementation is 71 lines across two files:

- `app/api/auth/lastfm/route.ts` — builds the redirect URL
- `app/api/auth/callback/lastfm/route.ts` — exchanges token, upserts user, sets session

iron-session stores a signed, encrypted cookie with `userId`, backed by `lastfmSessionKey` on the `User` model in PostgreSQL. This is simple, correct, and requires no changes.

## Recommendation

Do not adopt Better Auth for this project. Revisit if Last.fm ever adopts OAuth2 or if a different identity provider is added.
