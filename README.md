# CodeScrobble

CodeScrobble is a web application that makes it easy to scrobble your CD or vinyl records to Last.fm by scanning the barcode with your smartphone camera.

Next.js 16 (Pages Router) and React 19, Postgres via Drizzle ORM, and Tailwind CSS. Barcodes are decoded in the browser with [quagga2](https://github.com/ericblade/quagga2). Release data comes from [Discogs](https://www.discogs.com/developers), scrobbles go to [Last.fm](https://www.last.fm/api).

## Development

### Try it in Docker

Needs only Docker:

```sh
make up       # builds and starts everything, then open http://localhost:3000
make reset    # delete local data and seed again
make down     # stop (keeps the database)
```

This runs the production image against Postgres and a mock of Last.fm and Discogs (`e2e/mock-server.ts`). Logging in goes through the mock and is instant; nothing is sent to the real services. The seed data (`dev/seed.ts`) adds a user with a scrobble history and auto-scrobbles, and the mock knows a dozen made-up records (`dev/catalog.ts`). Their barcodes are at http://localhost:4011/barcodes, to scan with the camera or to open as `/detected/<barcode>`.

### Run from source

Requirements: Node.js 24 (`nvm use`), Corepack (`corepack enable`) and Docker for the database.

```sh
yarn install
docker compose up -d postgres   # Postgres on localhost:5432
cp .env.example .env            # add your Discogs and Last.fm API keys
yarn dev                        # http://localhost:3000
```

Migrations run automatically on startup. Outside production nothing is sent to Last.fm. Scrobbles are only logged.

### Environment

| Variable | Description |
| --- | --- |
| `DATABASE_URL` | Postgres connection string |
| `SERVER_URL` | Public URL; used for the Last.fm callback and secure cookies |
| `DISCOGS_KEY`, `DISCOGS_SECRET` | [Discogs application](https://www.discogs.com/settings/developers) |
| `LASTFM_KEY`, `LASTFM_SECRET` | [Last.fm API account](https://www.last.fm/api/account/create) |
| `MONGODB_URI` | Optional. Imports the CodeScrobble 1.x MongoDB data once on startup (see below) |

### Database changes

Edit `src/server/db/schema.ts`, then generate a migration with `yarn db:generate` and commit the SQL in `drizzle/`.

## Tests

```sh
yarn test           # Vitest: server code against in-process PGlite, client units
yarn test:e2e       # Playwright against the production build
yarn lint && yarn typecheck
yarn screenshots    # every screen at phone and desktop size, in test-results/screens
```

The end-to-end tests run the standalone server (as in Docker) against Postgres (`E2E_DATABASE_URL`, default: the `codescrobble_e2e` database of the compose Postgres) and a mock of the Last.fm and Discogs APIs (`e2e/mock-server.ts`). Chromium's fake camera plays a generated barcode video, so scanning is tested for real.

## Deployment

Pushing to `staging` or `production` runs `.github/workflows/deploy.yml`. It runs CI, then builds a multi-arch image (`ghcr.io/dpuscher/code-scrobble:<branch>` and `:<branch>-<sha>`) and deploys it with the Dokploy API. It then waits until `/health` reports the new revision. A successful staging deploy keeps a "Staging to Production" PR open; merging it releases to production.

The GitHub repository needs the `DOKPLOY_API_KEY` secret. On Dokploy, the apps pull the image and need the environment variables above.

### Migrating from CodeScrobble 1.x (MongoDB)

While `MONGODB_URI` is set, the first start copies users, releases, auto-scrobbles and history from MongoDB into Postgres. It runs in a single transaction and is recorded in the `app_meta` table, so it runs exactly once. MongoDB is only read. Duplicate user documents (from an old login race) are merged. Login sessions are not migrated: users log in once more. After verifying the import, remove `MONGODB_URI`, the MongoDB and Redis services, and the `mongodb` dependency.

## License

MIT, see [LICENSE.md](LICENSE.md).
