'use client';

import { ArrowRight } from 'lucide-react';
import Link from 'next/link';

import { useHomeProducts } from '../hooks/use-homepage-data';

import { Button } from '@/components/ui/button';
import { ProductCard } from '@/shared/components/product-card/product-card';

function formatPrice(value: string) {
  return `₹${Number(value).toLocaleString('en-IN')}`;
}

export default function NewArrivals() {
  const { data, isLoading, isError, refetch } = useHomeProducts({ sortBy: 'newest', limit: 8 });
  const products = (data?.items ?? []).filter((product) => product.imageUrl && product.stock > 0);

  if (isLoading) {
    return (
      <section
        aria-label="Loading new arrivals"
        className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8"
      >
        <div className="h-6 w-40 animate-pulse rounded bg-surface-subtle" />
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {Array.from({ length: 4 }, (_, index) => (
            <div key={index} className="aspect-square animate-pulse rounded-xl bg-surface-subtle" />
          ))}
        </div>
      </section>
    );
  }

  if (isError) {
    return (
      <section className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8" aria-live="polite">
        <p className="text-sm text-text-secondary">New arrivals couldn’t load.</p>
        <Button variant="outline" size="sm" onClick={() => refetch()} className="mt-3">
          Try again
        </Button>
      </section>
    );
  }

  if (!products.length) return null;

  return (
    <section
      id="new-arrivals"
      aria-labelledby="new-arrivals-title"
      className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8"
    >
      <div className="mb-5 flex items-end justify-between gap-4">
        <div>
          <h2
            id="new-arrivals-title"
            className="text-xl font-bold tracking-tight text-text-primary sm:text-2xl"
          >
            New arrivals
          </h2>
          <p className="mt-1 text-sm text-text-secondary">
            Recently added products from active sellers.
          </p>
        </div>
        <Link
          href="/products?sortBy=newest"
          className="inline-flex items-center gap-1 text-sm font-semibold text-accent hover:underline"
        >
          Browse all <ArrowRight size={16} aria-hidden="true" />
        </Link>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
        {products.map((product) => {
          const price = Number(product.price);
          const mrp = Number(product.mrp);
          const discount = mrp > price ? Math.round((1 - price / mrp) * 100) : 0;
          return (
            <ProductCard
              key={product.productId}
              product={{
                id: product.productId,
                slug: product.slug,
                name: product.name,
                brand: product.vendor.name,
                price: formatPrice(product.price),
                oldPrice: mrp > price ? formatPrice(product.mrp) : undefined,
                discount: discount > 0 ? `-${discount}%` : undefined,
                rating: product.rating ?? undefined,
                reviewsCount: product.ratingCount,
                image: product.imageUrl!,
                badge: product.isFeatured ? { text: 'Featured', variant: 'accent' } : undefined,
              }}
            />
          );
        })}
      </div>
    </section>
  );
}
