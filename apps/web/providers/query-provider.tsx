'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import * as React from 'react';

import { ApiError } from '@/lib/api-client';
import { clearAuthSessionCache, getRemoteAuthSessionChange } from '@/lib/auth/session-cache';

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000,
        refetchOnWindowFocus: false,
        retry: (failureCount, error) => {
          if (error instanceof ApiError && error.status >= 400 && error.status < 500) {
            return false;
          }
          return failureCount < 2;
        },
      },
      mutations: {
        retry: false,
      },
    },
  });
}

let browserQueryClient: QueryClient | undefined = undefined;

function getQueryClient() {
  if (typeof window === 'undefined') {
    // Server: always make a new query client
    return makeQueryClient();
  } else {
    // Browser: make a new query client if we don't already have one
    // This ensures data is not shared across users/requests on SSR while avoiding re-instantiation on client renders
    if (!browserQueryClient) {
      browserQueryClient = makeQueryClient();
    }
    return browserQueryClient;
  }
}

export function QueryProvider({ children }: { children: React.ReactNode }) {
  const queryClient = getQueryClient();

  React.useEffect(() => {
    const url = new URL(window.location.href);
    if (url.searchParams.get('auth_session_changed') !== '1') return;

    url.searchParams.delete('auth_session_changed');
    window.history.replaceState(window.history.state, '', url);
    clearAuthSessionCache(queryClient, 'session-changed');
  }, [queryClient]);

  React.useEffect(() => {
    if (typeof BroadcastChannel === 'undefined') return;
    const channel = new BroadcastChannel('perigee-cart');
    channel.onmessage = () => {
      void queryClient.invalidateQueries({ queryKey: ['cart'] });
    };
    return () => channel.close();
  }, [queryClient]);

  React.useEffect(() => {
    if (typeof BroadcastChannel === 'undefined') return;
    const channel = new BroadcastChannel('perigee-auth-session');
    channel.onmessage = ({ data }: MessageEvent<unknown>) => {
      const change = getRemoteAuthSessionChange(data);

      if (change === 'signed-out') {
        queryClient.clear();
        window.location.replace('/signin');
      } else if (change === 'session-changed') {
        queryClient.clear();
        window.location.reload();
      }
    };
    return () => channel.close();
  }, [queryClient]);

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
