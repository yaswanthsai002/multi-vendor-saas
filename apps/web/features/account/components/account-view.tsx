'use client';

import { Heart, MapPin, ShoppingBag, UserRound } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { AddressBook } from './address-book';
import { ProfileForm } from './profile-form';

import { Button } from '@/components/ui/button';
import { useCurrentUser } from '@/shared/hooks/use-current-user';

export function AccountView() {
  const router = useRouter();
  const currentUser = useCurrentUser();

  if (currentUser.isLoading) {
    return (
      <main
        className="mx-auto w-full max-w-7xl space-y-5 px-4 py-8 sm:px-6"
        role="status"
        aria-label="Loading account"
      >
        <div className="h-9 w-48 animate-pulse rounded bg-surface-subtle" />
        <div className="h-64 animate-pulse rounded-xl bg-surface-subtle" />
        <div className="h-64 animate-pulse rounded-xl bg-surface-subtle" />
      </main>
    );
  }

  if (currentUser.isError) {
    return (
      <main className="mx-auto w-full max-w-7xl px-4 py-16 text-center sm:px-6">
        <h1 className="text-xl font-semibold text-text-primary">Could not load your account</h1>
        <p className="mt-2 text-sm text-text-secondary">Your account data is safe. Try again.</p>
        <Button className="mt-4" onClick={() => void currentUser.refetch()}>
          Try again
        </Button>
      </main>
    );
  }

  const user = currentUser.data?.user;
  if (!user) {
    return (
      <main className="mx-auto w-full max-w-7xl px-4 py-16 text-center sm:px-6">
        <h1 className="text-2xl font-semibold text-text-primary">Your account</h1>
        <p className="mt-2 text-sm text-text-secondary">
          Sign in to manage your profile and delivery addresses.
        </p>
        <Button className="mt-4" onClick={() => router.push('/signin?redirect=%2Faccount')}>
          Sign in
        </Button>
      </main>
    );
  }

  return (
    <main className="mx-auto w-full max-w-7xl space-y-6 px-4 py-8 sm:px-6">
      <header className="rounded-xl border border-border-subtle bg-surface-raised p-6 sm:p-8">
        <p className="text-sm font-semibold text-accent">Account</p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight text-text-primary sm:text-3xl">
          Your account
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-text-secondary">
          Keep your profile and delivery details up to date for a smoother checkout.
        </p>
      </header>
      <div className="grid gap-6 lg:grid-cols-4">
        <aside className="h-fit rounded-xl border border-border-subtle bg-surface-raised p-5 lg:sticky lg:top-24">
          <div className="flex items-center gap-3 border-b border-border-subtle pb-5">
            <div
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-accent-subtle text-lg font-semibold text-accent"
              aria-hidden="true"
            >
              {user.avatarUrl ? (
                <Image
                  src={user.avatarUrl}
                  alt=""
                  width={48}
                  height={48}
                  unoptimized
                  className="h-full w-full rounded-full object-cover"
                />
              ) : (
                user.fullName?.charAt(0).toUpperCase() || user.email.charAt(0).toUpperCase()
              )}
            </div>
            <div className="min-w-0">
              <p className="truncate font-semibold text-text-primary">
                {user.fullName || 'Welcome'}
              </p>
              <p className="truncate text-xs text-text-secondary">{user.email}</p>
            </div>
          </div>
          <nav className="mt-4 space-y-1" aria-label="Account sections">
            <a
              href="#profile"
              className="flex items-center gap-3 rounded-md bg-surface-subtle px-3 py-2.5 text-sm font-medium text-text-primary hover:bg-surface-hover"
            >
              <UserRound className="h-4 w-4 text-accent" aria-hidden="true" /> Profile
            </a>
            <a
              href="#addresses"
              className="flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium text-text-secondary hover:bg-surface-hover hover:text-text-primary"
            >
              <MapPin className="h-4 w-4" aria-hidden="true" /> Delivery addresses
            </a>
          </nav>
          <div className="mt-5 border-t border-border-subtle pt-4">
            <p className="px-3 text-xs font-semibold uppercase tracking-wide text-text-tertiary">
              Shopping
            </p>
            <Link
              href="/wishlist"
              className="mt-2 flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium text-text-secondary hover:bg-surface-hover hover:text-text-primary"
            >
              <Heart className="h-4 w-4" aria-hidden="true" /> Wishlist
            </Link>
            <Link
              href="/cart"
              className="flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium text-text-secondary hover:bg-surface-hover hover:text-text-primary"
            >
              <ShoppingBag className="h-4 w-4" aria-hidden="true" /> Shopping cart
            </Link>
          </div>
        </aside>
        <div className="min-w-0 space-y-6 lg:col-span-3">
          <ProfileForm user={user} />
          <AddressBook userId={user.userId} />
        </div>
      </div>
    </main>
  );
}
