'use client';

import { useQuery } from '@tanstack/react-query';

import { makeApiRequest } from '@/lib/api-client';
import { API_ENDPOINTS } from '@/lib/api-endpoints';
import { queryKeys } from '@/lib/query-keys';

export interface CurrentUserData {
  userId: string | number;
  fullName?: string;
  email: string;
  roles?: string[];
  avatarUrl?: string;
  emailVerifiedAt?: string | null;
}

interface CurrentUserResponse {
  user?: CurrentUserData | null;
}

export function useCurrentUser() {
  return useQuery<CurrentUserResponse>({
    queryKey: queryKeys.auth.me(),
    queryFn: ({ signal }) =>
      makeApiRequest<CurrentUserResponse>({
        url: API_ENDPOINTS.auth.me,
        method: 'GET',
        signal,
      }),
    retry: false,
    staleTime: 5 * 60 * 1000,
  });
}
