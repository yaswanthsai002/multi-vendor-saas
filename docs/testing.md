# Testing and verification

## Workspace checks

From the repository root:

```sh
pnpm test
pnpm lint
pnpm typecheck
pnpm build
pnpm check
```

`pnpm check` runs configured formatting, lint, and type checks. `pnpm build` builds web and API. Run the narrowest relevant package checks while iterating.

## Package checks

```sh
pnpm --filter api test
pnpm --filter api lint
pnpm --filter api typecheck

pnpm --filter web test
pnpm --filter web lint
pnpm --filter web typecheck

pnpm --filter @repo/db lint
pnpm --filter @repo/db typecheck
```

The DB package has no test script; schema and migration behavior should be checked against a disposable PostgreSQL database when changing persistence behavior. Do not use production or user data for verification.

## API contract checks

API tests use Vitest and Supertest. OpenAPI is served at `/api/docs.json`; `apps/api/src/docs/swagger.test.ts` checks documentation availability and key response contracts. Endpoint changes must include request validation, authorization cases where applicable, response-shape assertions, and synchronized OpenAPI documentation.

## Web and browser checks

Web unit/component tests use Vitest, Testing Library, and jsdom. For a browser-level check, start the required services and apps as described in [local development](local-development.md), then use Playwright against the local web app. The web package currently has no dedicated Playwright test script/configuration, so browser scenarios are run through the available Playwright tooling rather than `pnpm test`.

For UI changes, cover loading, empty, error, success, keyboard interaction, and responsive behavior where those states apply. For auth, ownership, and money paths, include rejection and boundary cases, not only the happy path.
