'use client';

import { useQuery } from '@tanstack/react-query';

import { getCurrentUser } from '@/lib/auth/current-user';
import { queryKeys } from '@/lib/query-keys';

export function useCurrentUser() {
  return useQuery({
    queryKey: queryKeys.auth.me(),
    queryFn: ({ signal }) => getCurrentUser(signal),
    retry: false,
    staleTime: 5 * 60 * 1000,
  });
}
