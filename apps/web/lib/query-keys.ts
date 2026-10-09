/**
 * Centralized React Query keys registry.
 * Adheres to AGENTS.md §13 — namespaced tuples for cache invalidation & query keys.
 */
export const queryKeys = {
  auth: {
    all: () => ['auth'] as const,
    me: () => ['auth', 'me'] as const,
    verificationStatus: (token?: string) =>
      ['auth', 'verification-status', token ?? 'current'] as const,
  },
  media: {
    all: () => ['vendor', 'media'] as const,
    list: (filters?: unknown) => ['vendor', 'media', 'list', filters] as const,
    detail: (id: string) => ['vendor', 'media', 'detail', id] as const,
  },
  products: {
    all: () => ['vendor', 'products'] as const,
    list: (filters?: unknown) => ['vendor', 'products', 'list', filters] as const,
    detail: (id: string) => ['vendor', 'products', 'detail', id] as const,
  },
  orders: {
    all: () => ['vendor', 'orders'] as const,
    list: (filters?: unknown) => ['vendor', 'orders', 'list', filters] as const,
    detail: (id: string) => ['vendor', 'orders', 'detail', id] as const,
  },
  categories: {
    all: () => ['categories'] as const,
    list: (parentCategoryId?: string) =>
      ['categories', 'list', parentCategoryId ?? 'root'] as const,
    detail: (id: string) => ['categories', 'detail', id] as const,
  },
  bulkImports: {
    all: () => ['vendor', 'bulk-imports'] as const,
    active: () => ['vendor', 'bulk-imports', 'active'] as const,
  },
} as const;
