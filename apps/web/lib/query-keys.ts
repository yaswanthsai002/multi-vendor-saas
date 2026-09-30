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
} as const;
