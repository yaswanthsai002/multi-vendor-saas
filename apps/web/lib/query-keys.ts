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
  profile: {
    all: () => ['vendor', 'profile'] as const,
  },
  categories: {
    all: () => ['categories'] as const,
    list: (parentCategoryId?: string, all?: boolean) =>
      ['categories', 'list', parentCategoryId ?? 'root', all ? 'all' : 'filtered'] as const,
    detail: (id: string) => ['categories', 'detail', id] as const,
  },
  catalog: {
    all: () => ['catalog'] as const,
    list: (filters?: unknown) => ['catalog', 'list', filters] as const,
    facets: () => ['catalog', 'facets'] as const,
    detail: (slug: string) => ['catalog', 'detail', slug] as const,
  },
  bulkImports: {
    all: () => ['vendor', 'bulk-imports'] as const,
    active: () => ['vendor', 'bulk-imports', 'active'] as const,
  },
  admin: {
    dashboard: {
      metrics: () => ['admin', 'dashboard', 'metrics'] as const,
      performance: (days?: number) => ['admin', 'dashboard', 'performance', days ?? 7] as const,
      topProducts: () => ['admin', 'dashboard', 'top-products'] as const,
      recentOrders: () => ['admin', 'dashboard', 'recent-orders'] as const,
    },
    users: {
      all: () => ['admin', 'users'] as const,
      list: (filters?: unknown) => ['admin', 'users', 'list', filters] as const,
      detail: (id: string) => ['admin', 'users', 'detail', id] as const,
    },
    vendors: {
      all: () => ['admin', 'vendors'] as const,
      list: (filters?: unknown) => ['admin', 'vendors', 'list', filters] as const,
      detail: (id: string) => ['admin', 'vendors', 'detail', id] as const,
    },
    products: {
      all: () => ['admin', 'products'] as const,
      list: (filters?: unknown) => ['admin', 'products', 'list', filters] as const,
      detail: (id: string) => ['admin', 'products', 'detail', id] as const,
    },
    orders: {
      all: () => ['admin', 'orders'] as const,
      list: (filters?: unknown) => ['admin', 'orders', 'list', filters] as const,
      detail: (id: string) => ['admin', 'orders', 'detail', id] as const,
    },
    merchandising: {
      overview: () => ['admin', 'merchandising', 'overview'] as const,
    },
  },
} as const;
