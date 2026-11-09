# API package

## Overview

Express API and BullMQ worker for marketplace requests and asynchronous bulk imports. The API is the boundary for validation, authorization, and domain orchestration.

## Interface

- `src/server.ts`: starts the HTTP server; `src/app.ts`: composes middleware and exports the app for tests.
- `src/routes.ts`: mounts feature routers under `/api`.
- `src/docs/openapi.ts`: OpenAPI 3.1 contract; `/api/docs/` serves Swagger UI and `/api/docs.json` serves JSON.
- `src/features/*`: feature routes, controllers, Zod schemas, and services. Current feature groups include auth, catalog, cart, customer, vendor, media, merchandising, admin, and wishlist.
- `src/worker.ts`: starts the BullMQ bulk-import worker.
- Persistence is accessed through `@repo/db`; migrations live in `packages/db/drizzle`.

## Invariants

- Parse external request input with feature Zod schemas before domain use.
- Derive identity/role from the authenticated session. Enforce role, vendor ownership, and resource state server-side.
- Keep response fields aligned with documented API contracts; do not expose persistence-only or security-sensitive data.
- Keep feature rules in feature services/middleware, shared concerns in `src/shared`, and API documentation in sync with route changes.
- Use transactions where related writes must succeed or fail together.

## Side Effects

- Reads/writes PostgreSQL through `@repo/db`.
- Uses Redis and BullMQ for bulk-import jobs.
- Uses object storage for media and import files; image/video processors may use native tools.
- Sets and clears session cookies in auth flows; sends external OAuth requests when Google sign-in is used.

## Verification

- `pnpm --filter api test`
- `pnpm --filter api lint`
- `pnpm --filter api typecheck`
- `pnpm --filter api build`
