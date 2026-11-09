# Local development

## Requirements

- Node.js `22.x` for the host-run web app. Root and package manifests declare this range; API and web Docker images use `node:22-alpine`.
- pnpm `11.5.3` (declared in the root `devEngines` and web package).
- Docker Compose for local PostgreSQL and Redis.

## Environment

Copy `.env.example` to the repository root as `.env`. Replace placeholders with local values; do not commit secrets. Compose reads this root file. Set `NEXT_PUBLIC_API_URL=http://localhost/api` in the environment used to start Next.js (or in `apps/web/.env.local`) and set `WEB_ORIGIN=http://localhost:3000` for API CORS. Other settings are described by `.env.example`; current usage is visible in `apps/api/src/shared/config/env.ts`, `apps/web/lib/env.ts`, and `packages/db/drizzle.config.ts`.

Common settings include `DATABASE_URL`, `POSTGRES_*`, `REDIS_URL` or `REDIS_HOST`/`REDIS_PORT`, `NEXT_PUBLIC_API_URL`, `WEB_ORIGIN`, JWT settings, Google OAuth settings, and R2 storage settings. Some features require working OAuth or R2 credentials; local core catalog work still requires PostgreSQL, and background jobs require Redis.

## Default development setup

Run PostgreSQL, Redis, API, bulk-import worker, and nginx in Docker. Run only the web app on the host:

```sh
pnpm install
docker compose up -d
pnpm dev:web
```

Compose exposes nginx on port 80. Nginx forwards requests to the API container, so the browser uses `http://localhost/api`; the API container port 4000 is not published directly. The web app runs at `http://localhost:3000`. `compose.yml` defines source sync/restart behavior; use `docker compose up --watch` when developing API or DB source.

Apply migrations through the running API container, which already has the workspace and internal database URL:

```sh
docker compose exec api pnpm --filter @repo/db migrate
```

Useful container commands:

```sh
docker compose ps
docker compose logs -f api worker
```

If you intentionally run API or worker on the host instead, use `pnpm dev:api` and `pnpm --filter api worker` with host-reachable database/Redis URLs. This is an alternate setup; default workflow keeps those processes in Docker.

## Useful endpoints

- Liveness: `GET /api/health/live`
- Readiness: `GET /api/health/ready`
- Swagger UI: `http://localhost/api/docs/`
- OpenAPI JSON: `http://localhost/api/docs.json`

## Database changes

Edit Drizzle schema under `packages/db/src/schema`, generate a migration with `pnpm --filter @repo/db generate`, review the generated SQL, then apply it through the running API container as shown above. Commit schema and migration together. Never make an undocumented manual schema change.

## Troubleshooting

- **API cannot connect to PostgreSQL:** confirm `.env` `DATABASE_URL` uses Compose service host `postgres` and that migrations have been applied.
- **API cannot connect to Redis / jobs stay queued:** confirm `REDIS_URL` uses Compose service host `redis` and check `docker compose ps`.
- **Browser requests fail:** check `NEXT_PUBLIC_API_URL`, `WEB_ORIGIN`, and that the API is listening on the expected port.
- **OAuth or media operations fail:** configure the matching Google OAuth or R2 credentials; these integrations cannot be exercised with placeholder values.
- **Worker behavior differs from API:** run the worker separately with `pnpm --filter api worker`, or inspect the Compose `worker` service logs.
