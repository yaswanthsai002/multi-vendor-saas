# multi-vendor-saas

A multi-vendor commerce platform designed to allow vendors to create and operate stores while customers can discover products and place orders.

## Overview

This repository is structured as a pnpm workspace and organized into separate application layers to keep the codebase maintainable and scalable:

- Web app: Next.js storefront / frontend experience
- API: Express-based backend for application logic and routes
- Database: PostgreSQL powered by Drizzle ORM

The project is designed as a clean starting point for building a SaaS product with a strong frontend, typed backend, and reliable database tooling.

## Architecture

- Frontend: Next.js 16, React 19, Tailwind CSS
- Backend: Express, TypeScript
- Database: PostgreSQL
- ORM: Drizzle
- Package manager: pnpm
- Local infrastructure: Docker Compose

## Project Structure

```text
multi-vendor-saas/
├── apps/
│   ├── api/
│   │   ├── src/
│   │   ├── package.json
│   │   └── tsconfig.json
│   └── web/
│       ├── app/
│       ├── package.json
│       └── tsconfig.json
├── packages/
│   └── db/
│       ├── src/
│       ├── drizzle/
│       ├── drizzle.config.ts
│       └── package.json
├── compose.yml
├── package.json
├── pnpm-workspace.yaml
├── README.md
├── eslint.config.mjs
├── prettier.config.mjs
├── commitlint.config.mjs
└── ...
```

## Tech Stack

- [apps/web](apps/web) — Next.js frontend
- [apps/api](apps/api) — Express API
- [packages/db](packages/db) — Drizzle-based database package

## Prerequisites

Before proceeding, make sure the following are installed:

- Node.js 20+
- pnpm
- Docker Desktop or Docker Engine with Compose
- Git

## Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/yaswanthsai002/multi-vendor-saas
   cd multi-vendor-saas
   ```

2. Install project dependencies:

   ```bash
   pnpm install
   ```

3. Start PostgreSQL with Docker Compose:

   ```bash
   docker compose up -d postgres
   ```

4. Create a root environment file:

   ```bash
   touch .env
   ```

   Add the following environment variable:

   ```env
   DATABASE_URL=postgres://username:password@localhost:5432/multi_vendor_saas
   ```

   Replace `username` and `password` with your PostgreSQL credentials.

## Running the Application

Start the backend:

```bash
pnpm dev:api
```

Start the frontend:

```bash
pnpm dev:web
```

The app will be available at:

- Frontend: <http://localhost:3000>
- API: <http://localhost:4000>

## Database Setup

This project uses Drizzle ORM with PostgreSQL.

Generate migrations:

```bash
pnpm --filter @repo/db generate
```

Apply migrations:

```bash
pnpm --filter @repo/db migrate
```

## Available Scripts

From the repository root:

```bash
pnpm dev:web
pnpm dev:api
pnpm build
pnpm lint
pnpm lint:fix
pnpm typecheck
pnpm check
pnpm format
pnpm format:check
```

## Development Workflow

A standard local workflow looks like this:

1. Install dependencies with `pnpm install`
2. Start PostgreSQL with `docker compose up -d postgres`
3. Confirm the `.env` file is configured correctly
4. Run database migrations
5. Start the API and web app
6. Build features and fix issues
7. Validate formatting, linting, and type safety
8. Commit and push only after checks pass

## Before Committing and Pushing

Run the following checks before every commit and push to keep the repository clean and production-ready:

```bash
pnpm format:check
pnpm lint
pnpm typecheck
pnpm check
```

If the check output reports formatting or lint issues, fix them before continuing:

```bash
pnpm format
pnpm lint:fix
```

Then re-run the project validation:

```bash
pnpm check
```

Before pushing, verify the branch is ready:

```bash
git status
git add .
git commit -m "feat: your commit message"
git push origin <your-branch-name>
```

For a complete pre-push sequence, use:

```bash
pnpm check
git status
git add .
git commit -m "feat: your commit message"
git push origin <your-branch-name>
```

## Notes

This repository provides a solid monorepo foundation for a SaaS application and is ready to be extended with authentication, tenant management, billing, dashboards, and deployment configuration.

## License

ISC
