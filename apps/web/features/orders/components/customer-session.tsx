'use client';

import Link from 'next/link';

import { CheckoutErrorPanel } from './checkout-error-panel';

import type { ReactNode } from 'react';

import { useCurrentUser } from '@/shared/hooks/use-current-user';

export function CustomerSession({
  returnTo,
  children,
}: {
  returnTo: string;
  children: (userId: string | number) => ReactNode;
}) {
  const current = useCurrentUser();
  if (current.isLoading) return <p role="status">Loading your account…</p>;
  if (current.isError)
    return (
      <CheckoutErrorPanel
        message="Could not load your account. Try again."
        onRetry={() => void current.refetch()}
      />
    );
  const userId = current.data?.user?.userId;
  if (!userId)
    return (
      <section>
        <h1 className="text-2xl font-semibold">Sign in to continue</h1>
        <Link
          className="text-accent underline"
          href={`/signin?redirect=${encodeURIComponent(returnTo)}`}
        >
          Sign in
        </Link>
      </section>
    );
  return children(userId);
}
