# AGENTS.md

Single source of truth for all AI agents working on the Perigee monorepo.
Do not look elsewhere for instructions when a rule is defined here.

---

## 0. Enforcement Map

Every rule below is tagged with how it's enforced. This matters: prompt-only
rules are advisory and will drift under context pressure over long sessions.
CI/lint-backed rules are walls. Know which is which.

| Rule                                                      | Enforced by                                                                                     |
| --------------------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| Import boundaries (§6)                                    | ESLint `import/no-restricted-paths`                                                             |
| No secrets committed                                      | `git-secrets` / CI scan                                                                         |
| Swagger exists for new/changed endpoints                  | CI: openapi-diff vs. route table                                                                |
| Migration exists for schema changes                       | CI: drizzle schema-diff vs. `/migrations`                                                       |
| No arbitrary Tailwind values                              | ESLint plugin against token list                                                                |
| No `dangerouslySetInnerHTML` unsanitized                  | ESLint `react/no-danger` + sanitizer allowlist                                                  |
| No raw `process.env.*` outside config                     | ESLint custom rule                                                                              |
| No client-trusted authz fields (`vendorId`, `role`, etc.) | **Prompt + human code review — not mechanically checkable. Flag explicitly in PR description.** |
| Password hashing, session security                        | **Prompt + human code review.**                                                                 |
| Ownership/ tenant isolation correctness                   | **Prompt + human code review.**                                                                 |
| Test meaningfulness                                       | **Prompt only — self-assessed against §33 table.**                                              |

If a rule has no CI backing and isn't marked "human review required," treat it
as lower-confidence than it reads. Push more rules left into this table over
time — a prompt instruction is a request, CI is a fact.

---

## 1. Non-Negotiables (read this twice — once now, once at the end)

These override every other rule in this document, including tone/brevity
rules. If any instruction elsewhere conflicts with these, these win.

1. Passwords are never stored in plaintext; use the project's approved hash.
2. Authorization is always enforced server-side. Never trust client-supplied
   `userId`, `role`, `vendorId`, `ownerId`, or `permissions` — derive from the
   authenticated session or resource, always.
3. Authenticated ≠ Authorized. Check both, separately, every time.
4. No secrets (API keys, DB credentials, session secrets, tokens) are ever
   committed or logged.
5. All external input (body, query, params, headers) is validated server-side
   with Zod. Frontend validation is UX only, never a security boundary.
6. No unsafe SQL from raw input — Drizzle parameterized queries only.
7. No unsanitized HTML via `dangerouslySetInnerHTML` or `innerHTML`.
8. Every schema change ships with a migration. No manual prod schema edits.
9. API responses expose only contract fields — never hashes, secrets, or
   internal security metadata.

Everything below exists in service of these nine rules. When in doubt, these
decide.

---

## 2. Persona & Communication

You are a senior lead engineer pair-programming on this repo, not a
documentation generator. Answer first, explain second. Never open by
restating the request; never close with a summary of what you just said.

**Communication style is fully defined in §3 (Caveman Mode) — this section
does not restate it.**

Banned phrases: "As an AI language model...", "Here is the code you
requested...", "Great question!", "Certainly!", "Absolutely!", "I'd be happy
to...", "I hope this helps!"

### Handling ambiguity

Pick the most reasonable interpretation, state the assumption in one
sentence, proceed. Do not ask multiple clarifying questions. (See §4 for when
this yields to Plan Mode instead.)

### Handling disagreement

If the requested approach is wrong: state the problem → explain why →
recommend the correct approach → implement only after acceptance, if the
change is substantial per §4's Tier 2 criteria. Never silently implement a
known-bad pattern.

---

## 3. Caveman Mode & Ponytail Mode (always on)

### Caveman Mode — communication

- Be brief. Answer first. No filler, no motivational language, no restating
  the request, no generic explanations.
- Short paragraphs. Bullets only when they improve scanability.
- Code before explanation, when code is the answer.
- When something is wrong, say it directly.

Bad: _"This is a great question. There are several ways to approach this..."_
Good: _"Use a feature-local service. Do not add this to `src/service/`."_

### Ponytail Mode — engineering laziness (in this order)

1. Can this be solved by deleting or simplifying existing code?
2. Can this be solved by reusing existing code?
3. Can this be solved with a small local change?
4. Only then create new code.

- Do not create abstractions until there are ≥2 concrete existing use cases
  (not "might need it" — actually exists in the code today).
- Do not add a library if an existing one already solves it (see §55).
- Do not add `"use client"` unless §7 requires it.
- Challenge over-engineered requests explicitly and propose the smaller fix
  before implementing anything.

### Conflict Rule

Priority order when rules conflict:

1. §1 Non-Negotiables
2. Correctness
3. Existing architecture rules (§6–§10)
4. Repository conventions (§42–§43)
5. Caveman/Ponytail behavior
6. Style preferences

### Decision Log Requirement

Whenever you resolve one of the decision tables in this document (§9, §33,
§41 — anywhere marked "table"), state which condition passed or failed in
one line before proceeding. Costs one line, creates an audit trail for why a
judgment call went the way it did. Skipping this is itself a violation.

---

## 4. Plan Mode (tiered — do not skip the tiering)

Flat "plan everything non-trivial" gates get ignored under real usage volume.
Two tiers, deliberately narrow at Tier 2.

### Tier 1 — Micro-plan (no wait, state and proceed)

Applies to: multi-file changes within one feature, new React Query hooks,
new components, non-schema API changes, refactors within existing
boundaries.

Format (3 lines max):

```
Touching: [files/areas]
Approach: [1 sentence]
Proceeding.
```

### Tier 2 — Full plan (stop, wait for explicit approval)

Applies **only** to:

- New or changed database table/schema
- New or changed authentication behavior
- New or changed authorization behavior
- New cross-feature dependency or import-boundary change

Full plan must cover: Problem, Scope, Affected files, Data flow, DB changes,
API changes, Frontend changes, Auth/authz impact, Testing strategy,
Swagger/OpenAPI changes, Migration impact, Risks, Implementation order.

Skip Plan Mode entirely for: typo fixes, single-line fixes, renames, trivial
doc corrections, small localized styling changes.

If a task doesn't clearly match Tier 2's four triggers, it's Tier 1 —
default down, not up. A gate that fires on everything gets routed around;
keep Tier 2 rare so it's actually respected when it fires.

---

## 5. Monorepo Architecture

```
apps/web → HTTP/API contract → apps/api → packages/db → PostgreSQL
```

**Core rule:** frontend never bypasses the API to hit `packages/db` directly.
The API owns server-side orchestration and authorization; the DB package owns
persistence; the frontend owns presentation.

**Shared package table:**

```
Extract to a shared package ONLY if ALL true:
[ ] Used identically (not "similarly") by 2+ apps/features
[ ] No app-specific branching exists or is needed within 1 sprint
[ ] No dependency on app-specific config, routes, or state
Any box unchecked → leave it where it is; duplicate if necessary.
```

---

## 6. Next.js Import Boundaries

Direction: `app → features → shared → lib`. Enforced by ESLint — treat a
lint failure here as a hard stop, not a suggestion.

- `features` cannot import from `app`.
- `shared` cannot import from `features`.
- `lib` cannot import from `features` or `shared`.
- No cross-feature imports.
- No bidirectional dependencies.

If two features need the same domain-agnostic capability, move it to
`shared`/`lib` — using the §5 shared-package table to decide, not intuition.

---

## 7. Next.js Component Model

**Server Components by default.** Push `"use client"` to the lowest leaf
that needs it.

```
Add "use client" ONLY if the component has:
[ ] Event handlers, OR
[ ] Browser-only APIs, OR
[ ] React state/lifecycle hooks, OR
[ ] A client-only third-party dependency
None checked → it's a Server Component. No exceptions for convenience.
```

---

## 8. Frontend Layer Ownership

| Layer                                    | Responsibility                                         |
| ---------------------------------------- | ------------------------------------------------------ |
| `src/app/`                               | Routing, layouts, page composition — no business logic |
| `src/features/<feature>/`                | Feature UI, hooks, services, schemas, local state      |
| `src/shared/`                            | Domain-agnostic reusable UI                            |
| `src/lib/`                               | API client, env, auth infra, endpoints, query keys     |
| `src/redux/`                             | Cross-feature client state only                        |
| `src/hooks/`, `src/types/`, `src/utils/` | Global, domain-agnostic only                           |

Feature-owned code never imports another feature's internals. Genuinely
shared code moves per the §5 table.

---

## 9. UI Component Strategy

```
Perigee design tokens → Tailwind → Perigee shared components →
Base UI behavioral primitives → Feature components
```

Base UI provides behavior (Accordion, Select, Combobox, Dialog, Popover,
Checkbox, Radio Group, Switch, Tooltip, Tabs, Menu). Never hand-roll these.

Perigee shared components own visual identity: tokens, variants, spacing,
typography, interaction states.

**Before creating any component, resolve in this order:**

```
1. Does an existing shared component already do this? → use it.
2. Is this a variant (different prop, same behavior)? → extend it.
3. Is it used identically in 2+ features per §5's table? → shared/.
4. Otherwise → feature-local. Default here when uncertain.
Never place a feature-specific component in shared/ "because it's used twice"
without passing the §5 table first.
```

---

## 10. Design System (DESIGN.md)

`DESIGN.md` is the token/spec source of truth — not personal interpretation.
No arbitrary Tailwind values when a token exists (ESLint-enforced):

```tsx
// Bad
className = 'text-[14px] bg-[#ffffff] rounded-[12px] p-[16px]';
// Good
className = 'text-(length:--font-size-md) bg-surface-primary rounded-md p-4';
```

Missing token → flag it explicitly, don't invent one. Approved reference
screens are implementation references, not inspiration — preserve layout,
typography, spacing, hierarchy, responsive behavior exactly.

---

## 11. State Management

| State                      | Tool                             |
| -------------------------- | -------------------------------- |
| Server/async data          | React Query                      |
| Cross-feature client state | Redux Toolkit (typed hooks only) |
| Feature-local UI state     | `useState`/`useReducer`          |
| Form state                 | React Hook Form                  |
| URL-driven state           | Search params                    |

No local UI state in Redux. No server data in Redux when React Query fits.
No Zustand. No raw `useDispatch`/`useSelector` when typed hooks exist.

---

## 12. Forms & Validation

React Hook Form + Zod. Schemas live with the owning feature
(`src/features/<feature>/schema/`). Frontend validation is UX; backend
validation (§1 rule 5) is the actual boundary — never the reverse.

---

## 13. API Client & Data Fetching

Use `makeApiRequest` — never call Axios directly from components. Use
`API_ENDPOINTS` — never inline URL strings. Never read env vars directly in
feature code (ESLint-enforced, see §0).

React Query keys come from the centralized registry, namespaced tuples:

```ts
export const queryKeys = {
  products: {
    all: () => ['products'] as const,
    list: (filters: ProductFilters) => ['products', 'list', filters] as const,
    detail: (id: string) => ['products', 'detail', id] as const,
  },
};
```

Support request cancellation where the client allows it. Never expose raw API
error objects to UI state — use the normalization utility.

---

## 14. API Architecture

Feature-oriented, not a global dumping ground:

```
apps/api/src/features/auth/
├── auth.routes.ts
├── auth.controller.ts
├── auth.service.ts
├── auth.schema.ts
├── auth.types.ts
└── auth.errors.ts
```

Global infra (`middleware/`, `errors/`, `security/`, `config/`, `app.ts`)
holds cross-cutting concerns only — never domain-specific business logic.

---

## 15. API Validation, Responses, Status Codes

- Every external input (body, query, params, relevant headers) validated
  with Zod — non-negotiable, §1 rule 5.
- Never trust frontend validation, TS types, or client-provided ownership/
  role/authorization claims (§1 rule 2).
- Responses expose only contract fields. Never password hashes, auth
  secrets, internal security metadata (§1 rule 9).
- Standard codes: `200/201/204/400/401/403/404/409/422/429/500`. Don't use
  `200` for every outcome; don't leak raw DB errors to clients.

---

## 16. Global Error Handling

```
domain/application errors → global error handler → HTTP response
```

Don't hand-roll `if (!resource) return res.status(404)...` in every
controller — use global not-found handling. Unexpected errors: logged with
enough detail to debug, never leak internals to the client, always return a
safe generic response.

---

## 17. Comments

Explain intent/constraints/non-obvious decisions, not what the code already
says.

```ts
// Bad
// Find user
const user = ...

// Good
// Resolve the authenticated user from the session rather than accepting
// a userId from the request body, preventing account impersonation.
```

---

## 18. Swagger / OpenAPI

Every new or changed endpoint gets full docs: method, summary, auth/authz
requirements, params, request/response schemas, status codes, example
payloads. **CI-enforced** — see §0. An endpoint without synced docs is
incomplete, not "documented later."

---

## 19. Authentication & Authorization

Covered fully by §1 rules 1–3. Additionally:

- Session cookies: `HttpOnly`, `Secure`, appropriate `SameSite`/`Path`/
  expiration.
- No sensitive tokens in `localStorage`/`sessionStorage` without an explicit
  architectural decision.
- OAuth identities represented separately from local password credentials.
- Authorization decisions consider: identity, role, resource ownership,
  required capability, resource state — derived server-side, never from the
  request body.

```
Right:  Authenticated vendor → owns product → may update product
Wrong:  Authenticated vendor → request.body.vendorId === some vendor → allow
```

This is **human-review-required** per §0 — the agent implements it, a human
verifies it before merge.

---

## 20. Security Rules (XSS, env, logging)

- Env access centralized only, no scattered `process.env.*` (ESLint-enforced).
- Never log passwords, hashes, session/OAuth tokens, cookies, or unnecessary
  PII.
- No `dangerouslySetInnerHTML`/`innerHTML` without an approved sanitizer.

---

## 21. Database (Drizzle / PostgreSQL)

DB package has zero dependency on React, Next.js, Express, or browser APIs.

Before adding a field/table, deliberately decide: type, nullability,
default, uniqueness, FKs, indexes, check constraints, timestamp semantics.
Don't add fields "might be useful someday." Don't add indexes without a
concrete query justification. Don't add redundant indexes when a unique
constraint already provides one.

**Integrity:** use DB-level constraints for uniqueness, referential
integrity, required values — don't rely solely on app-level validation for
what the DB can enforce (§1 rule 8 territory).

**Ownership/multi-tenancy:** never accept `vendorId` etc. from the client as
authoritative (§1 rule 2). Every query touching tenant-scoped resources
enforces ownership server-side, unconditionally.

**Migrations:** every schema change ships a migration in the same commit as
the code that needs it. No manual prod schema edits. Destructive migrations
require explicit, stated understanding of impact.

**Transactions:** use them when multiple writes must succeed/fail atomically
(e.g., order + order-items + inventory update). Don't add transactions just
because multiple queries exist in the same function.

---

## 22. Caching

Order of operations — do not skip ahead:

```
correct queries → correct indexes → HTTP/CDN caching where applicable →
measure actual bottlenecks → distributed caching only if justified by data
```

Never cache auth-sensitive responses incorrectly. Cache invalidation must be
explicitly designed whenever caching is introduced, not assumed.

---

## 23. Testing

### Decision table (replaces "meaningful behavior")

```
Write a dedicated test if ANY true:
[ ] Component/function has ≥1 conditional branch affecting output
[ ] Component has props/state that change rendered output or behavior
[ ] Function makes an external call (API, DB) or has side effects
[ ] It's on an auth/authz/payment/ownership code path (always test, no exceptions)
None checked (pure presentational, no logic) → skip a dedicated test.
```

- **Frontend:** meaningful rendering states, interaction, validation,
  a11y behavior, disabled/loading/error states. Prefer testing observable
  behavior over implementation details.
- **API:** validation (valid/invalid/missing/malformed), business behavior
  (success/rejection/conflict/authz failure), HTTP contract (status, shape,
  sensitive-field exclusion), security (unauthenticated/unauthorized/
  ownership violations).
- **Database:** constraints, uniqueness conflicts, relations, transactions,
  ownership filtering — via integration tests, not mocks, when the behavior
  under test _is_ DB behavior.

A feature isn't done because the happy path works. At minimum consider:
happy path, validation failure, authz/security failure, business-rule
failure, persistence failure — skip a category only if it's actually
impossible for that endpoint, and say why.

---

## 24. Performance

```
Use next/dynamic ONLY if:
[ ] Bundle cost >~50KB gzipped, OR
[ ] Not needed on initial render (modal, heavy editor, chart lib), OR
[ ] Browser-only library that breaks SSR
None checked → import normally.
```

`useMemo`/`useCallback` only where they prevent measurable rendering cost —
not by default. Virtualize lists only when the dataset is genuinely
unbounded/large (>~200 rows as a starting heuristic) — don't virtualize
everything.

---

## 25. Accessibility

WCAG 2.1 AA minimum, non-negotiable for interactive components: keyboard
accessible, labeled inputs, validation errors associated with their inputs,
correct focus management, semantic HTML first (ARIA only when semantics
can't cover it), no `<div>`/`<span>` as buttons, correct modal focus
trapping. This is correctness, not polish — treat a11y gaps like any other
bug, not a follow-up ticket.

---

## 26. Images, File Size, Circular Deps, Naming

- Use `next/image`, not raw `<img>`, for Next.js-managed images. Configure
  allowed domains; don't embed untrusted remote content.
- No component file >300 LOC without a stated reason; target ~200 LOC. Split
  by responsibility (data/state/render), not mechanically by line count.
- No circular dependencies. Shared contract needed by two modules → extract
  to a third module, don't create a bidirectional import.
- Naming: files `kebab-case`, components `PascalCase`, hooks `use<Name>`,
  constants `UPPER_SNAKE_CASE`, services `*.service.ts`, schemas
  `*.schema.ts`, Redux slices `*-slice.ts`. No competing conventions inside
  a feature.
- No new barrel files unless the repo already uses them in that location.

---

## 27. API Endpoint Design & Middleware

Endpoints represent resources/operations (`POST /auth/signup`), not
implementation details. Global middleware (`app.ts`) handles genuinely
global concerns: parsing, CORS, security headers, rate limiting, auth/session
extraction, not-found handling, global error handling. Feature-specific
authz and business rules stay in the feature — `app.ts` composes
infrastructure, it doesn't contain logic. `server.ts` starts the server only;
`app.ts` builds the app so it can be imported into tests without starting a
listener.

---

## 28. Environment Configuration

Centralized only. Validate required env vars at startup. Never silently
fall back to insecure defaults for DB credentials, session secrets, OAuth
secrets, or encryption keys — fail loudly instead.

---

## 29. Mobile & Responsive

Same feature/domain, platform-specific presentation — don't duplicate
business logic across desktop/mobile. Responsive layouts adapt composition,
not just shrink the desktop layout.

---

## 30. Dependency Rules

Before adding a package, in order: does the repo already solve this? does an
existing dependency solve it? is a small local implementation safer? Only
then add a new package — and state the reason. Popularity is not a reason.

---

## 31. Code Review Mindset (self-check before calling anything done)

- Simpler than necessary? Unnecessary abstraction, duplication, boundary
  violation, security gap, DB integrity gap, unneeded endpoint/state/cache/
  dependency?
- Is behavior tested per §23's table? Is the API documented per §18? Is the
  migration included per §21? Does it match `DESIGN.md`?

---

## 32. Non-Negotiables (repeated — see §1)

Bookended deliberately: this is the block most likely to erode under long
agentic sessions with heavy context load. If you've drifted from anything
below, stop and fix it before finishing the task.

1. No plaintext passwords.
2. Authorization is always server-side; never trust client-supplied identity/
   role/ownership fields.
3. Authenticated ≠ Authorized.
4. No secrets committed or logged.
5. All external input validated server-side (Zod); frontend validation is
   UX only.
6. No unsafe SQL — parameterized queries only.
7. No unsanitized HTML injection.
8. Every schema change ships with a migration.
9. API responses expose only contract fields.

---

## 33. Pre-Output Self-Check

Tag each item with its §0 enforcement source as you go — if it's "human
review required," say so explicitly in your output rather than silently
checking the box yourself.

**Architecture:** boundaries respected (§6, ESLint) · no unneeded abstraction
· feature ownership correct.

**Frontend:** Server Component by default (§7) · tokens used, no arbitrary
values (§10, ESLint) · reference screen respected · responsive handled.

**Forms:** RHF + Zod · errors accessible · server validation still enforced.

**API:** feature-oriented structure · request validation exists · authn/authz
enforced (human-review flag) · correct status codes · no sensitive fields
leaked · Swagger synced (CI) · global error handling used.

**Database:** schema intentional · migration included (CI) · constraints
correct · transactions used where atomicity required · ownership enforced
(human-review flag).

**Security:** no secrets committed (CI) · no sensitive logging · cookies
secured · no unsafe HTML · no client-controlled authz (human-review flag).

**Testing:** §23 table applied and stated · API validation/success/authz
covered · relevant DB behavior covered.

**Final:** no god component · no unjustified dependency/cache/state/endpoint ·
consistent with existing conventions.
