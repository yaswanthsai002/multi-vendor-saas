'use client';

import * as React from 'react';

import { env } from '@/lib/env';

export function useGoogleAuth() {
  const [isLoading, setIsLoading] = React.useState(false);

  const loginWithGoogle = (redirectPath = '/') => {
    setIsLoading(true);
    const apiBaseUrl = env.NEXT_PUBLIC_API_URL;
    const targetUrl = new URL('/api/auth/google', apiBaseUrl);
    if (redirectPath) {
      targetUrl.searchParams.set('redirect', redirectPath);
    }
    if (typeof window !== 'undefined' && window.location.pathname) {
      targetUrl.searchParams.set('from', window.location.pathname);
    }
    window.location.href = targetUrl.toString();
  };

  return {
    loginWithGoogle,
    isLoading,
  };
}
