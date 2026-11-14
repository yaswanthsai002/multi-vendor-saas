'use client';

import { ArrowRight } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

import { Button } from '@/components/ui/button';

import { useFeaturedBrands } from '../hooks/use-homepage-data';

export default function FeaturedBrands() {
  const { data, isLoading, isError, refetch } = useFeaturedBrands();
  const stores = data?.items ?? [];

  if (isLoading) {
    return (
      <section
        aria-label="Loading featured brands"
        className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8"
      >
        <div className="h-6 w-44 animate-pulse rounded bg-surface-subtle" />
        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {Array.from({ length: 6 }, (_, index) => (
            <div key={index} className="h-36 animate-pulse rounded-xl bg-surface-subtle" />
          ))}
        </div>
      </section>
    );
  }

  if (isError) {
    return (
      <section className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8" aria-live="polite">
        <p role="alert" className="text-sm text-text-secondary">
          Featured brands couldn’t load.
        </p>
        <Button variant="outline" size="sm" onClick={() => void refetch()} className="mt-3">
          Try again
        </Button>
      </section>
    );
  }

  if (!stores.length) return null;

  return (
    <section aria-labelledby="featured-stores-title" className="bg-surface-subtle py-8 sm:py-10">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-5 flex items-end justify-between gap-4">
          <div>
            <h2
              id="featured-stores-title"
              className="text-xl font-bold tracking-tight text-text-primary sm:text-2xl"
            >
              Featured brands
            </h2>
            <p className="mt-1 text-sm text-text-secondary">
              Discover brands selected by our marketplace team.
            </p>
          </div>
          <Link
            href="/brands"
            className="inline-flex items-center gap-1 text-sm font-semibold text-accent hover:underline"
          >
            Browse all brands <ArrowRight size={16} aria-hidden="true" />
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {stores.map((store) => (
            <Link
              key={store.vendorId}
              href={`/products?vendor=${encodeURIComponent(store.slug)}`}
              className="group flex min-h-36 flex-col items-start justify-between rounded-xl border border-border-default bg-surface-raised p-4 transition-colors hover:border-border-strong focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus"
            >
              <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-lg bg-surface-subtle text-sm font-bold text-text-secondary">
                {store.logoUrl ? (
                  <Image
                    src={store.logoUrl}
                    alt=""
                    width={48}
                    height={48}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span aria-hidden="true">{store.name.slice(0, 2).toUpperCase()}</span>
                )}
              </div>
              <div className="mt-4 w-full">
                <h3 className="truncate text-sm font-semibold text-text-primary group-hover:text-accent">
                  {store.name}
                </h3>
                <p className="mt-1 inline-flex items-center gap-1 text-xs font-medium text-text-secondary">
                  View store <ArrowRight size={13} aria-hidden="true" />
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
