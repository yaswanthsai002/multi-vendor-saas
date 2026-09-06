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
} as const;
