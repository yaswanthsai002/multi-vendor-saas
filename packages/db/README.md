# Database package

## Overview

Drizzle ORM schema and PostgreSQL connection package shared with the API. This package does not contain HTTP, UI, or domain orchestration.

## Interface

- `src/index.ts`: exports lazy `getDb()` database access.
- `src/schema/index.ts`: exports table definitions for users/auth accounts, vendors, catalog, carts, orders, reviews, campaigns, media, addresses, and wishlists.
- `drizzle/`: committed PostgreSQL migration SQL and Drizzle metadata.
- `drizzle.config.ts`: schema/migration configuration; reads root `.env` `DATABASE_URL`.

## Invariants

- Keep database package free of React, Next.js, Express, and browser dependencies.
- Add a migration with every schema change; review generated SQL before applying it.
- Encode durable integrity rules in PostgreSQL constraints and foreign keys, not only application checks.
- Preserve tenant ownership and referential integrity in schema relations; API services still enforce authorization.
- Use timezone-aware timestamps for persisted instants and numeric columns for monetary values.

## Side Effects

- `getDb()` creates a PostgreSQL client connection on first use; query execution reads/writes the configured database.
- Drizzle migration commands connect to the target database when applying migrations.

## Verification

- `pnpm --filter @repo/db typecheck`
- `pnpm --filter @repo/db lint`
- `pnpm --filter @repo/db generate` to generate a migration after an intentional schema change; inspect output and commit it with the schema.
- `pnpm --filter @repo/db migrate` applies migrations to `DATABASE_URL`.
