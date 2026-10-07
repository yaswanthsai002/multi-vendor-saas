FROM node:22-alpine AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable && corepack prepare pnpm@11.5.3 --activate

WORKDIR /app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/api/package.json ./apps/api/
COPY packages/db/package.json ./packages/db/

# Install workspace dependencies
RUN pnpm install --frozen-lockfile

# Copy source
COPY packages/db ./packages/db
COPY apps/api ./apps/api

EXPOSE 4000

CMD ["pnpm", "--filter", "api", "dev"]
