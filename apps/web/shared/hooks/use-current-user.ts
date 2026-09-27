'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';

import { getCurrentUser } from '@/lib/auth/current-user';
import { queryKeys } from '@/lib/query-keys';

export function useCurrentUser() {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleAuthExpired = () => {
      queryClient.setQueryData(queryKeys.auth.me(), { user: null });
    };

    window.addEventListener('perigee:auth-expired', handleAuthExpired);
    return () => {
      window.removeEventListener('perigee:auth-expired', handleAuthExpired);
    };
  }, [queryClient]);

  return useQuery({
    queryKey: queryKeys.auth.me(),
    queryFn: ({ signal }) => getCurrentUser(signal),
    retry: false,
    staleTime: 60 * 1000,
    refetchOnWindowFocus: true,
  });
}
