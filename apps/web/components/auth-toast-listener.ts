'use client';

import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { useEffect } from 'react';
import { toast } from 'sonner';

const AUTH_ERRORS: Record<string, { title: string; description: string }> = {
  unauthorized: {
    title: 'Unauthorized',
    description: "You aren't authorized to access this page.",
  },
  unauthenticated: {
    title: 'Authentication Required',
    description: 'Please sign in to continue.',
  },
};

export function AuthToastListener() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const errorCode = searchParams.get('error');
    if (errorCode && errorCode in AUTH_ERRORS) {
      const { title, description } = AUTH_ERRORS[errorCode];
      toast.error(title, { description });

      const newParams = new URLSearchParams(searchParams.toString());
      newParams.delete('error');
      const query = newParams.toString() ? `?${newParams.toString()}` : '';
      router.replace(`${pathname}${query}`, { scroll: false });
    }
  }, [searchParams, pathname, router]);

  return null;
}
