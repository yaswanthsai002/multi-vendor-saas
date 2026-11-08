'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { makeApiRequest } from '@/lib/api-client';
import { API_ENDPOINTS } from '@/lib/api-endpoints';
import { clearAuthSessionCache } from '@/lib/auth/session-cache';

export function useSignOut() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () =>
      makeApiRequest<{ message: string }>({
        url: API_ENDPOINTS.auth.signout,
        method: 'POST',
      }),
    onSuccess: () => {
      clearAuthSessionCache(queryClient, 'signed-out');
      window.location.replace('/signin');
    },
    onError: () => toast.error('Could not sign out. Please try again.'),
  });
}
