# Codebase map for AI agents and developers

Use this page to find the owning boundary first. Read only the relevant feature contract and implementation, then follow imports/callers where behavior crosses boundaries. This map is a navigation aid, not a substitute for checking current code.

## Read in this order

1. [`AGENTS.md`](../AGENTS.md) for security, architecture, testing, and change rules.
2. [Repository README](../README.md) for runtime setup and monorepo boundaries.
3. The relevant package contract: [`apps/web`](../apps/web/README.md), [`apps/api`](../apps/api/README.md), or [`packages/db`](../packages/db/README.md).
4. [Domain flows](domain-flows.md) and [architecture](architecture.md) for cross-feature behavior.
5. Source, tests, schemas, migrations, and OpenAPI for exact current behavior.

If documentation and code disagree, verify the runtime path and update the documentation in the same change. Never infer authorization, states, or API behavior from filenames alone.

## Where to start

| Task                              | Start here                                                     | Follow through                                                                                 |
| --------------------------------- | -------------------------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| Web route/page composition        | `apps/web/app/`                                                | Feature UI/hooks under `apps/web/features/`; shared components under `apps/web/components/ui/` |
| Web API calls and query state     | `apps/web/features/<feature>/services/`, `hooks/`              | `apps/web/lib/api-endpoints.ts`, `query-keys.ts`, `api-client.ts`                              |
| Browser auth/session behavior     | `apps/web/lib/auth/`, `apps/web/providers/query-provider.tsx`  | Auth feature hooks and API auth routes/services                                                |
| API endpoint                      | `apps/api/src/features/<feature>/<feature>.routes.ts`          | Controller -> schema -> service -> tests; router registration in `apps/api/src/routes.ts`      |
| API auth and role checks          | Feature route middleware                                       | `apps/api/src/shared/middleware/`; ownership checks in the owning service                      |
| Database table or query           | `packages/db/src/schema/`                                      | `apps/api` service usage and `packages/db/drizzle/` migration                                  |
| OpenAPI contract                  | `apps/api/src/docs/openapi.ts`                                 | Route, Zod schema, controller/service response, and API contract tests                         |
| Background import/job             | `apps/api/src/shared/queue/`, `apps/api/src/worker.ts`         | `apps/api/src/features/bulk-import/`, `apps/api/src/worker/`, web bulk-import feature          |
| Media upload/storage              | `apps/api/src/features/media/`, `apps/api/src/shared/storage/` | `apps/web/features/media/`; campaign banner flow is owned by merchandising                     |
| Product catalog, pricing, reviews | `apps/api/src/features/catalog/`                               | Catalog web feature, shared pricing module, product/review schema and tests                    |
| Cart or wishlist                  | Matching API feature directory                                 | Matching web feature; cart tab sync also uses `apps/web/lib/cart-sync.ts` and `QueryProvider`  |
| Campaigns/homepage merchandising  | `apps/api/src/features/merchandising/`                         | Admin merchandising web feature, homepage feature, `campaigns` schema                          |
| Vendor fulfillment                | `apps/api/src/features/vendor/order.*`                         | Orders web feature and vendor-order schema                                                     |
| Visual tokens/components          | [`DESIGN.md`](../DESIGN.md), `apps/web/app/index.css`          | `apps/web/components/ui/` and owning feature component                                         |

Feature directories usually contain their route/controller/schema/service/tests together. Use the exact route registration and imports to confirm where a behavior is wired.

## Fast repository searches

```sh
# Find the definition and all call sites of a symbol or endpoint
rg -n "symbolName|/api/route" apps packages

# List one feature's files without scanning generated output
rg --files apps/api/src/features/catalog apps/web/features/catalog

# Check what is already staged and unstaged before editing
git status --short
git diff --stat
git diff --cached --stat
```

Search for callers before changing shared helpers, query keys, endpoint contracts, or state transitions. Read focused files and tests rather than bulk-opening the repository.

## Contract and verification sources

- API route contracts: `apps/api/src/docs/openapi.ts` and the feature Zod schemas. OpenAPI is required for endpoint changes.
- Persistence contracts: Drizzle schema under `packages/db/src/schema/` plus committed migrations under `packages/db/drizzle/`.
- Web behavior: route composition under `apps/web/app/`, feature-owned UI/hooks/services under `apps/web/features/`, and existing Vitest tests beside the owning feature.
- Checks and local runtime: [testing](testing.md) and [local development](local-development.md).
- Cross-boundary behavior: [architecture diagrams](architecture.md) and [domain flow diagrams](domain-flows.md).

Run the narrow package checks while iterating, then the relevant API/web contract checks. For schema and authorization changes, follow the human-review requirements in `AGENTS.md` and use isolated PostgreSQL for database behavior.

## Current scope versus planned work

[Domain flows](domain-flows.md) marks implemented flows separately from planned follow-ups. Do not implement a planned item as though its API, lifecycle, or authorization rules already exist; inspect the current schema and route table and define the missing contract first.
