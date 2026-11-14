'use client';

import { ArrowRight } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

import { Button } from '@/components/ui/button';

import { useHomeCategories } from '../hooks/use-homepage-data';

export default function ShopbyCategory() {
  const { data, isLoading, isError, refetch } = useHomeCategories();
  const categories = data?.filter((category) => !category.parentCategoryId) ?? [];

  if (isLoading) {
    return (
      <section
        aria-label="Loading categories"
        className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8"
      >
        <div className="h-6 w-48 animate-pulse rounded bg-surface-subtle" />
        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-6">
          {Array.from({ length: 6 }, (_, index) => (
            <div key={index} className="h-28 animate-pulse rounded-xl bg-surface-subtle" />
          ))}
        </div>
      </section>
    );
  }

  if (isError) {
    return (
      <section className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8" aria-live="polite">
        <p className="text-sm text-text-secondary">Categories couldn’t load.</p>
        <Button variant="outline" size="sm" onClick={() => refetch()} className="mt-3">
          Try again
        </Button>
      </section>
    );
  }

  if (!categories.length) return null;

  return (
    <section
      id="shop-categories"
      aria-labelledby="shop-categories-title"
      className="bg-background py-8 sm:py-10"
    >
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-5 flex items-end justify-between gap-4">
          <div>
            <h2
              id="shop-categories-title"
              className="text-xl font-bold tracking-tight text-text-primary sm:text-2xl"
            >
              Shop by category
            </h2>
            <p className="mt-1 text-sm text-text-secondary">Browse the marketplace by category.</p>
          </div>
          <Link
            href="/products"
            className="inline-flex items-center gap-1 text-sm font-semibold text-accent hover:underline"
          >
            All products <ArrowRight size={16} aria-hidden="true" />
          </Link>
        </div>

        <div className="-mx-4 flex gap-3 overflow-x-auto px-4 pb-2 sm:mx-0 sm:grid sm:grid-cols-4 sm:px-0 lg:grid-cols-6">
          {categories.map((category) => (
            <Link
              key={category.categoryId}
              href={`/category/${category.slug}`}
              className="group min-w-36 overflow-hidden rounded-xl border border-border-default bg-surface-raised transition-colors hover:border-border-strong focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus sm:min-w-0"
            >
              <div className="relative aspect-video bg-surface-subtle">
                {category.imageUrl ? (
                  <Image
                    src={category.imageUrl}
                    alt=""
                    fill
                    sizes="(max-width: 640px) 144px, 20vw"
                    className="object-cover transition-transform group-hover:scale-105 motion-reduce:transition-none"
                  />
                ) : (
                  <div
                    className="flex h-full items-center justify-center text-text-tertiary"
                    aria-hidden="true"
                  >
                    <ArrowRight size={20} />
                  </div>
                )}
              </div>
              <div className="flex items-center justify-between gap-2 p-3">
                <span className="truncate text-sm font-semibold text-text-primary">
                  {category.name}
                </span>
                <ArrowRight size={15} className="shrink-0 text-text-tertiary" aria-hidden="true" />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
