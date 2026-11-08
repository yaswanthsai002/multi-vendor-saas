'use client';

import { ArrowRight, Search, Store, X } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

import { useBrands } from '../hooks/use-brands';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Pagination } from '@/shared/components/pagination/pagination';

function BrandSkeleton() {
  return (
    <div
      aria-hidden="true"
      className="h-72 overflow-hidden rounded-xl border border-border-default bg-surface-raised"
    >
      <div className="h-24 bg-surface-subtle" />
      <div className="flex h-48 flex-col gap-3 p-4">
        <div className="flex items-center gap-3">
          <div className="h-14 w-14 rounded-lg bg-surface-subtle" />
          <div className="h-6 w-2/3 rounded bg-surface-subtle" />
        </div>
        <div className="h-4 w-full rounded bg-surface-subtle" />
        <div className="mt-auto h-4 w-full rounded bg-surface-subtle" />
      </div>
    </div>
  );
}

export function BrandDirectory({
  initialPage,
  initialSearch,
}: {
  initialPage: number;
  initialSearch: string;
}) {
  const router = useRouter();
  const searchInput = useRef<HTMLInputElement>(null);
  const [search, setSearch] = useState(initialSearch);
  const [debouncedSearch, setDebouncedSearch] = useState(initialSearch);

  useEffect(() => {
    const timeout = window.setTimeout(() => setDebouncedSearch(search.trim()), 300);
    return () => window.clearTimeout(timeout);
  }, [search]);

  useEffect(() => {
    if (debouncedSearch === initialSearch) return;
    const params = new URLSearchParams({ page: '1' });
    if (debouncedSearch) params.set('search', debouncedSearch);
    router.replace(`/brands?${params.toString()}`, { scroll: false });
  }, [debouncedSearch, initialSearch, router]);

  const page = debouncedSearch === initialSearch ? initialPage : 1;
  const { data, isLoading, isError, refetch } = useBrands({
    page,
    limit: 24,
    search: debouncedSearch || undefined,
  });

  function navigate(page: number, searchTerm: string) {
    const params = new URLSearchParams();
    params.set('page', String(page));
    if (searchTerm) params.set('search', searchTerm);
    router.push(`/brands?${params.toString()}`);
  }

  return (
    <main className="mx-auto flex-1 w-full max-w-screen-2xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
      <header className="flex flex-col gap-6 border-b border-border-subtle pb-8 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium text-text-secondary">Perigee marketplace</p>
          <h1 className="mt-2 text-3xl font-semibold text-text-primary sm:text-4xl">
            Shop by brand
          </h1>
          <p className="mt-2 max-w-xl text-sm leading-6 text-text-secondary">
            Find a seller and browse products currently available in their store.
          </p>
        </div>
        <div className="w-full sm:max-w-lg" role="search">
          <label className="sr-only" htmlFor="brand-search">
            Search brands
          </label>
          <Input
            ref={searchInput}
            id="brand-search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Find a brand"
            rightElement={
              search ? (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  aria-label="Clear brand search"
                  onClick={() => {
                    setSearch('');
                    searchInput.current?.focus();
                  }}
                >
                  <X size={16} aria-hidden="true" />
                </Button>
              ) : (
                <Search size={16} aria-hidden="true" />
              )
            }
            maxLength={100}
          />
        </div>
      </header>

      <section
        aria-label="Brand directory"
        aria-live="polite"
        aria-busy={isLoading}
        className="pt-6"
      >
        {isLoading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 6 }, (_, index) => (
              <BrandSkeleton key={index} />
            ))}
          </div>
        ) : isError ? (
          <div
            role="alert"
            className="rounded-xl border border-border-default bg-surface-raised p-6"
          >
            <h2 className="font-medium text-text-primary">Could not load brands</h2>
            <p className="mt-1 text-sm text-text-secondary">Check your connection and try again.</p>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => void refetch()}
              className="mt-4"
            >
              Try again
            </Button>
          </div>
        ) : !data?.items.length ? (
          <div className="rounded-xl border border-dashed border-border-default px-6 py-16 text-center">
            <Store className="mx-auto h-7 w-7 text-text-tertiary" aria-hidden="true" />
            <h2 className="mt-3 font-medium text-text-primary">No brands found</h2>
            <p className="mt-1 text-sm text-text-secondary">
              {debouncedSearch
                ? 'Try another name or check the spelling.'
                : 'Stores will appear here when they have products available.'}
            </p>
          </div>
        ) : (
          <>
            <div className="mb-4 flex items-center justify-between gap-4">
              <p className="text-sm text-text-secondary">
                {data.pagination.total.toLocaleString('en-IN')}{' '}
                {data.pagination.total === 1 ? 'brand' : 'brands'}
              </p>
              <span className="h-px flex-1 bg-border-subtle" aria-hidden="true" />
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {data.items.map((brand) => (
                <Link
                  key={brand.vendorId}
                  href={`/products?vendor=${encodeURIComponent(brand.slug)}`}
                  className="group relative flex h-72 flex-col overflow-hidden rounded-xl border border-border-default bg-surface-raised transition-colors hover:border-border-strong focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus"
                >
                  <div className="relative h-24 shrink-0 bg-surface-subtle">
                    {brand.bannerUrl ? (
                      <Image
                        src={brand.bannerUrl}
                        alt=""
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center bg-surface-subtle text-text-tertiary">
                        <Store size={28} aria-hidden="true" />
                      </div>
                    )}
                  </div>
                  <div className="flex min-h-0 flex-1 flex-col p-4">
                    <div className="flex min-w-0 items-center gap-4">
                      <div className="relative flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-border-subtle bg-surface-subtle text-base font-medium text-text-secondary">
                        {brand.logoUrl ? (
                          <Image
                            src={brand.logoUrl}
                            alt=""
                            fill
                            sizes="56px"
                            className="object-cover"
                          />
                        ) : (
                          brand.name.slice(0, 2).toUpperCase()
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <h2 className="truncate text-xl font-semibold text-text-primary group-hover:text-accent">
                          {brand.name}
                        </h2>
                      </div>
                    </div>
                    {brand.tagline || brand.description ? (
                      <p className="mt-3 line-clamp-2 text-sm leading-5 text-text-secondary">
                        {brand.tagline || brand.description}
                      </p>
                    ) : null}
                    <div className="mt-auto flex items-center justify-between gap-2 border-t border-border-subtle pt-3">
                      <span className="tabular-nums text-xs text-text-tertiary">
                        {brand.productCount.toLocaleString('en-IN')}{' '}
                        {brand.productCount === 1 ? 'product' : 'products'}
                      </span>
                      <span className="inline-flex items-center gap-1 text-sm font-medium text-accent">
                        Shop <ArrowRight size={16} aria-hidden="true" />
                      </span>
                    </div>
                    {brand.isFeatured && (
                      <span className="absolute right-4 top-4 z-10 rounded-md border border-border-default bg-surface-raised px-3 py-1.5 text-xs font-semibold text-accent">
                        Featured
                      </span>
                    )}
                  </div>
                </Link>
              ))}
            </div>
            <Pagination
              page={data.pagination.page}
              totalPages={data.pagination.totalPages}
              totalItems={data.pagination.total}
              limit={data.pagination.limit}
              onPageChange={(page) => navigate(page, debouncedSearch)}
            />
          </>
        )}
      </section>
    </main>
  );
}
