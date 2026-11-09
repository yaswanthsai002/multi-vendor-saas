# Architecture

## System boundaries

```text
Browser → apps/web → HTTP/OpenAPI contract → apps/api → @repo/db → PostgreSQL
                                                ↘ Redis / object storage
```

- `apps/web` owns route composition, UI, browser state, and API clients. It must not import database code.
- `apps/api` owns request validation, authentication/authorization, orchestration, and domain behavior.
- `packages/db` owns Drizzle schema, PostgreSQL connection setup, and migrations. It has no application or browser dependencies.
- Redis and object storage are accessed through API-owned infrastructure. Bulk import work is processed by the separate API worker process.

### Local runtime topology

```mermaid
flowchart LR
  browser[Browser]
  web[Next.js web<br/>host :3000]
  nginx[nginx<br/>Docker :80]
  api[Express API<br/>Docker :4000]
  worker[BullMQ worker<br/>Docker]
  postgres[(PostgreSQL<br/>Docker)]
  redis[(Redis<br/>Docker)]
  storage[(R2 object storage)]

  browser -->|pages| web
  browser -->|/api/*| nginx
  nginx -->|proxy, preserve path| api
  api --> postgres
  api --> redis
  api --> storage
  worker --> redis
  worker --> postgres
  worker --> storage
```

Compose runs PostgreSQL, Redis, API, worker, and nginx. Web runs on the host. Nginx publishes port 80 and proxies requests to the API container on port 4000; the API port is not directly published. Bulk import worker uses Redis/BullMQ and reads/writes object storage and PostgreSQL.

## Request flow

The API mounts feature routers under `/api` in `apps/api/src/routes.ts`. Each feature keeps routes, controllers, schemas, and services together. Routes apply authentication and role/resource middleware; controllers validate input and translate results to HTTP; services perform domain work through `@repo/db`. `apps/api/src/app.ts` owns shared middleware and global error handling.

### Public catalog read

```mermaid
sequenceDiagram
  actor Customer
  participant Web as Next.js web
  participant Proxy as nginx
  participant API as Express API
  participant Route as Catalog controller/service
  participant DB as PostgreSQL via @repo/db

  Customer->>Web: Open catalog or product page
  Web->>Proxy: GET /api/products[/{slug}]
  Proxy->>API: Forward request unchanged
  API->>Route: Public catalog route
  Route->>Route: Parse query/slug with Zod
  Route->>DB: Query available catalog data
  DB-->>Route: Rows and aggregates
  Route-->>API: Contract response
  API-->>Web: JSON
  Web-->>Customer: Render page
```

The catalog routes are public in `apps/api/src/features/catalog/catalog.routes.ts`. Request parsing occurs in `catalog.controller.ts`; catalog queries are in `catalog.service.ts`.

### Authentication and tab synchronization

```mermaid
sequenceDiagram
  actor User
  participant Tab as Current browser tab
  participant API as API via nginx
  participant Redis
  participant Google
  participant Other as Other same-profile tabs

  alt Password sign-in
    User->>Tab: Submit credentials
    Tab->>API: POST /api/auth/signin
    API->>API: Validate credentials and create JWT
    API-->>Tab: Set HttpOnly auth_token cookie
    Tab->>Tab: Clear React Query cache and broadcast session-changed
    Tab->>Other: BroadcastChannel message
    Other->>Other: Clear cache and reload
  else Google sign-in
    User->>Tab: Choose Google sign-in
    Tab->>API: GET /api/auth/google
    API->>Redis: Store one-time OAuth state with TTL
    API-->>Tab: Redirect to Google
    Tab->>Google: Authorize
    Google-->>Tab: Redirect to API callback with code and state
    Tab->>API: GET /api/auth/google/callback
    API->>Redis: Validate and consume OAuth state
    API->>Google: Exchange code and verify ID token
    API->>API: Link/create user and create JWT
    API-->>Tab: Set HttpOnly auth_token; redirect with session marker
    Tab->>Tab: Remove marker, clear cache, broadcast session-changed
    Tab->>Other: BroadcastChannel message
    Other->>Other: Clear cache and reload
  else Sign-out
    User->>Tab: Sign out
    Tab->>API: POST /api/auth/signout
    alt API succeeds
      API-->>Tab: Clear HttpOnly auth_token
      Tab->>Tab: Clear cache and broadcast signed-out
      Tab->>Other: BroadcastChannel message
      Other->>Other: Clear cache and redirect to sign-in
    else API fails
      API-->>Tab: Error
      Tab->>Tab: Keep session/cache and show retry message
    end
  end
```

Password sign-in and sign-out are handled by `auth.controller.ts`; Google OAuth uses `google.service.ts` and redirects back with `auth_session_changed=1`. `use-sign-out.ts`, `session-cache.ts`, and `QueryProvider` clear and broadcast cache changes. BroadcastChannel only reaches tabs sharing the same browser profile and origin; separate browser profiles do not share the session event.

### Account creation, verification, and password reset

```mermaid
sequenceDiagram
  actor User
  participant Web as Web auth pages
  participant API as Auth API
  participant Redis
  participant DB as PostgreSQL

  alt Create account
    User->>Web: Submit signup form
    Web->>API: POST /api/auth/signup
    API->>DB: Create unverified customer account with password hash
    API->>Redis: Store hashed email-verification OTP and pending token
    API-->>Web: Set HttpOnly pending-verification cookie; return user
    Note over Web,API: Signup response does not deliver the initial OTP
    Web-->>User: Open verification page
    User->>Web: Request resend after cooldown
    Web->>API: POST /api/auth/send-otp
    API->>Redis: Store new hashed OTP
    API-->>Web: Return OTP in response (current POC behavior)
    User->>Web: Enter OTP
    Web->>API: POST /api/auth/verify-otp
    API->>Redis: Verify OTP and consume it
    API->>DB: Set emailVerifiedAt
    API-->>Web: Verified; clear pending cookie
    Web-->>User: Continue to sign-in
  else Reset password
    User->>Web: Request reset code
    Web->>API: POST /api/auth/send-otp (password_reset)
    API->>Redis: Store hashed reset OTP and pending token
    API-->>Web: Return OTP in response (current POC behavior)
    User->>Web: Submit reset OTP
    Web->>API: POST /api/auth/verify-otp
    API->>Redis: Verify OTP; create short-lived reset token
    API-->>Web: Set HttpOnly reset-password cookie
    User->>Web: Submit new password
    Web->>API: POST /api/auth/reset-password
    API->>DB: Hash and update password
    API->>Redis: Consume reset token
    API-->>Web: Clear reset cookie; return success
  end
```

Signup creates an unverified account and stores an initial OTP, but no email/SMS delivery exists; the signup response also omits that code. The current POC returns codes from `/send-otp` responses, including password-reset requests. This is not a production delivery design. OTPs are stored hashed, expire after five minutes, and allow at most three failed checks. Resend requests have a 60-second cooldown. Password-reset tokens are short-lived and returned to the browser only through an HttpOnly cookie. See `auth.service.ts`, `otp.service.ts`, and the auth web feature hooks.

### Cart updates across tabs

```mermaid
sequenceDiagram
  actor Customer
  participant TabA as Tab with cart action
  participant API as Cart API
  participant DB as PostgreSQL
  participant Channel as BroadcastChannel perigee-cart
  participant TabB as Other same-profile tab

  Customer->>TabA: Add item, change quantity, or remove item
  TabA->>API: POST, PUT, or DELETE cart item
  API->>DB: Validate availability and persist mutation
  DB-->>API: Updated cart
  API-->>TabA: Success
  TabA->>Channel: Broadcast changed
  Channel-->>TabB: Cart changed
  TabB->>TabB: Invalidate cart query and refetch active query
```

Product detail and cart-page mutations broadcast after success. `QueryProvider` listens and invalidates cart queries in tabs sharing the same profile and origin, including the tab that sent the update. If BroadcastChannel is unavailable, the initiating page invalidates or refreshes its own query. It does not sync separate profiles or browsers. Implementation: `apps/web/lib/cart-sync.ts`, `QueryProvider`, and product-detail/cart-page components.

The API's OpenAPI specification lives in `apps/api/src/docs/openapi.ts` and is served at `/api/docs.json` and `/api/docs/`. Update it with every endpoint or response-contract change.

## Web organization

Follow the direction `app → features → shared → lib`. Routes compose feature UI; feature code owns domain UI, hooks, schemas, and API services; shared components are domain-agnostic. Keep server components by default. Use React Query for server data, Redux only for cross-feature client state, and React Hook Form with Zod for forms. See [apps/web contract](../apps/web/README.md) and [`AGENTS.md`](../AGENTS.md).

## Security and tenant boundaries

Authentication does not imply authorization. Derive identity and role from the server session, then enforce role, resource ownership, and resource state in API middleware/services. Vendor-scoped queries must use the authenticated vendor identity, never a client-supplied vendor ID. These checks require human review; see the security rules in [`AGENTS.md`](../AGENTS.md).

## Persistence and side effects

Drizzle schema is under `packages/db/src/schema`; committed migrations are under `packages/db/drizzle`. Schema changes require a migration. Use transactions when a group of related writes must succeed atomically. Redis queues coordinate asynchronous bulk import; object storage holds uploaded media and import files. See [DB contract](../packages/db/README.md) and [domain flows](domain-flows.md).

### Asynchronous bulk import

```mermaid
sequenceDiagram
  actor Vendor
  participant Web as Vendor web UI
  participant API as API container
  participant R2 as R2 object storage
  participant Redis as Redis / BullMQ
  participant Worker as Worker container
  participant DB as PostgreSQL

  Vendor->>Web: Select import file
  Web->>API: POST initiate
  API->>Redis: Create import state and vendor lock
  API->>R2: Create presigned upload URL
  API-->>Web: importId and upload URL
  Web->>R2: Upload file directly
  Web->>API: POST uploaded confirmation
  API->>Redis: Mark VALIDATING and enqueue validation job
  Redis-->>Worker: Deliver validation job
  Worker->>R2: Read uploaded file
  Worker->>Worker: Parse rows and validate fields/categories
  Worker->>Redis: Publish progress and review state
  Web->>API: Open import events stream
  API->>Redis: Subscribe to import events
  Redis-->>API: Progress/status events
  API-->>Web: SSE events
  Vendor->>Web: Start import after reviewing rows
  Web->>API: POST start
  API->>Redis: Enqueue product import job
  Redis-->>Worker: Deliver import job
  Worker->>R2: Read source file
  Worker->>DB: Insert products in transaction chunks
  Worker->>Redis: Publish completion/failure state
```

This flow is implemented by `bulk-import.routes.ts`, `bulk-import.service.ts`, `src/worker.ts`, and the validate/import processors. The UI uploads bytes directly to R2 using the presigned URL; the API coordinates state, jobs, and SSE updates.

Validation classifies rows as ready or needing attention. When rows need attention, the worker writes an `errors.csv` report to R2 and exposes a temporary download URL. The vendor can review the counts and start import; import creates only valid rows in transaction chunks. Both worker jobs retry up to three times with exponential backoff. Terminal failures set the import state to `FAILED` and publish a safe status message; detailed diagnostics stay in worker logs.

The vendor can cancel an import session, which clears its Redis state and vendor lock, deletes that import's R2 prefix, and publishes a cancellation event. Current implementation does not remove an already queued/running BullMQ job; do not interpret UI cancellation as a guaranteed worker interruption.

```mermaid
flowchart TD
  upload[Upload confirmed] --> validate[Worker validates rows]
  validate --> report{Any invalid rows?}
  report -- Yes --> csv[Write errors.csv to R2]
  report -- No --> review[NEEDS_REVIEW]
  csv --> review
  review -->|Vendor starts import| import[Worker inserts valid rows in transaction chunks]
  import --> done[COMPLETED]
  validate --> validationError{Worker attempt failed?}
  validationError -- Retry remains --> validate
  validationError -- No retries remain --> failed[FAILED with safe user message]
  import --> importError{Worker attempt failed?}
  importError -- Retry remains --> import
  importError -- No retries remain --> failed
  upload -. Vendor cancels .-> cleanup[Clear Redis state and lock; delete R2 prefix; publish cancellation event]
  validate -. Vendor cancels .-> cleanup
  review -. Vendor cancels .-> cleanup
  import -. Vendor cancels .-> cleanup
```

Cancellation clears persisted import state rather than storing a `CANCELLED` status. It also does not remove an already queued/running BullMQ job, so the event does not guarantee worker interruption.

## Design source of truth

[`DESIGN.md`](../DESIGN.md) defines visual tokens and component rules. Web implementation lives in `apps/web/app/index.css`, `apps/web/components/ui`, and feature components. Prefer existing shared controls and semantic tokens over one-off styling.
