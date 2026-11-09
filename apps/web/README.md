# Web application

## Overview

Next.js storefront plus authenticated vendor and admin experiences. Browser-facing code calls the API; it does not access `@repo/db`.

## Interface

- `app/`: App Router pages and layouts. Public routes include home, catalog, product detail, brands, account, wishlist, and cart. Authenticated vendor/admin routes are grouped under `app/(authorised)`.
- `features/`: domain-specific UI, hooks, schemas, types, and API services.
- `shared/`: domain-agnostic components and hooks.
- `components/ui/`: Perigee shared controls; use these before native controls or feature-specific replacements.
- `lib/api-client.ts`, `lib/api-endpoints.ts`, and `lib/query-keys.ts`: API requests, endpoint registry, and shared query key registry.
- `providers/query-provider.tsx`: React Query and session-change synchronization.
- `app/index.css` and root `DESIGN.md`: semantic theme tokens and design rules.

## Invariants

- Follow `app → features → shared → lib`; features do not import from `app` or other features.
- Use `makeApiRequest` and `API_ENDPOINTS` for API calls. Normalize errors before presenting them.
- Server components are default. Add client boundaries only for interaction, browser APIs, state/lifecycle hooks, or client-only dependencies.
- Use React Query for server state, typed Redux hooks for cross-feature client state, and React Hook Form + Zod for forms.
- Auth-sensitive caches must be scoped to the current user and cleared on account/session changes.
- Interactive controls must meet keyboard and accessibility requirements and use design tokens from `DESIGN.md`.

## Side Effects

- Makes HTTP requests to the API using configured `NEXT_PUBLIC_API_URL`.
- Uses browser APIs for session synchronization, cart synchronization, and interactive UI behavior.
- Reads session state in server-side helpers and client providers; never treat client state as authorization.

## Verification

- `pnpm --filter web test`
- `pnpm --filter web lint`
- `pnpm --filter web typecheck`
- `pnpm --filter web build`
- Browser-level verification uses Playwright against a running local app; see [`../../docs/testing.md`](../../docs/testing.md).
