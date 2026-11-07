'use client';

import { useQuery } from '@tanstack/react-query';
import { Heart, Star } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import type { CatalogProduct, CatalogProductDetail } from '../../types/catalog.types';

import { Button } from '@/components/ui/button';
import { useWishlist } from '@/features/catalog/hooks/use-wishlist';
import { makeApiRequest } from '@/lib/api-client';
import { API_ENDPOINTS } from '@/lib/api-endpoints';
import { queryKeys } from '@/lib/query-keys';

export function SellerProducts({ product }: { product: CatalogProductDetail }) {
  const router = useRouter();
  const wishlist = useWishlist();
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: [...queryKeys.catalog.all(), 'seller', product.vendor.slug],
    queryFn: () =>
      makeApiRequest<{ items: CatalogProduct[] }>({
        url: API_ENDPOINTS.catalog.products,
        method: 'GET',
        params: { vendor: product.vendor.slug, limit: 9 },
      }),
  });
  const others =
    data?.items.filter((item) => item.productId !== product.productId).slice(0, 8) ?? [];

  return (
    <section aria-labelledby="seller-products-title" className="space-y-5">
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-text-tertiary">
            From this seller
          </p>
          <h2 id="seller-products-title" className="mt-1 text-xl font-semibold text-text-primary">
            More from {product.vendor.name}
          </h2>
        </div>
        <Link
          href={`/products?vendor=${product.vendor.slug}`}
          className="shrink-0 text-sm font-semibold text-accent hover:underline"
        >
          View all
        </Link>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {[0, 1, 2, 3].map((item) => (
            <div key={item} className="aspect-square animate-pulse rounded-xl bg-surface-subtle" />
          ))}
        </div>
      ) : isError ? (
        <div role="alert" className="rounded-lg border border-border-subtle p-4">
          <p className="text-sm text-text-secondary">
            Couldn&apos;t load more products from this seller.
          </p>
          <Button size="sm" variant="outline" className="mt-3" onClick={() => void refetch()}>
            Try again
          </Button>
        </div>
      ) : others.length === 0 ? (
        <p className="text-sm text-text-secondary">No other products from this seller yet.</p>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 xl:grid-cols-5">
          {others.map((item) => (
            <SellerProductCard
              key={item.productId}
              product={item}
              isWishlisted={wishlist.productIds.has(item.productId)}
              wishlistDisabled={
                wishlist.isUserLoading || wishlist.wishlist.isLoading || wishlist.mutation.isPending
              }
              onWishlistToggle={() => {
                if (!wishlist.userId) {
                  router.push(
                    `/signin?redirect=${encodeURIComponent(`/products/${product.slug}`)}`,
                  );
                } else {
                  wishlist.toggle(item.productId);
                }
              }}
            />
          ))}
        </div>
      )}
    </section>
  );
}

function SellerProductCard({
  product,
  isWishlisted,
  wishlistDisabled,
  onWishlistToggle,
}: {
  product: CatalogProduct;
  isWishlisted: boolean;
  wishlistDisabled: boolean;
  onWishlistToggle: () => void;
}) {
  const price = Number(product.price);
  const mrp = Number(product.mrp);
  const discount = mrp > price ? Math.round(((mrp - price) / mrp) * 100) : 0;

  return (
    <article className="group overflow-hidden rounded-xl border border-border-subtle bg-surface-raised transition-[border-color,box-shadow] hover:border-border-default hover:shadow-md">
      <div className="relative aspect-square overflow-hidden bg-surface-subtle">
        <Link
          href={`/products/${product.slug}`}
          aria-label={product.name}
          className="absolute inset-0 z-0"
        >
          {product.imageUrl ? (
            <Image
              src={product.imageUrl}
              alt={product.name}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
              className="object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <span className="flex h-full items-center justify-center text-xs text-text-secondary">
              Image unavailable
            </span>
          )}
        </Link>
        <Button
          type="button"
          variant="outline"
          size="sm"
          aria-label={
            isWishlisted
              ? `Remove ${product.name} from wishlist`
              : `Add ${product.name} to wishlist`
          }
          aria-pressed={isWishlisted}
          disabled={wishlistDisabled}
          onClick={onWishlistToggle}
          className="absolute right-2 top-2 z-10 h-8 w-8 rounded-full bg-surface-raised/95 p-0 shadow-xs"
        >
          <Heart
            className={`h-4 w-4 ${isWishlisted ? 'fill-accent text-accent' : ''}`}
            aria-hidden="true"
          />
        </Button>
      </div>
      <Link
        href={`/products/${product.slug}`}
        className="block p-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus sm:p-4"
      >
        <p className="truncate text-xs text-text-tertiary">{product.vendor.name}</p>
        <p className="mt-1 line-clamp-2 min-h-9 text-xs font-medium leading-4 text-text-primary sm:text-sm">
          {product.name}
        </p>
        <div className="mt-2 flex items-center gap-1 text-xs">
          <Star
            className={`h-3.5 w-3.5 ${product.ratingCount ? 'fill-warning text-warning' : 'text-text-tertiary'}`}
            aria-hidden="true"
          />
          <span
            className={`font-medium ${product.ratingCount ? 'text-text-primary' : 'text-text-tertiary'}`}
          >
            {product.ratingCount ? (product.rating?.toFixed(1) ?? '—') : 'No ratings'}
          </span>
          {product.ratingCount ? (
            <span className="text-text-tertiary">({product.ratingCount})</span>
          ) : null}
        </div>
        <div className="mt-2 flex flex-wrap items-baseline gap-x-2 gap-y-1">
          <span className="text-xs font-bold text-text-primary sm:text-sm">
            ₹{price.toLocaleString('en-IN')}
          </span>
          {discount > 0 && (
            <>
              <del className="text-xs text-text-tertiary">₹{mrp.toLocaleString('en-IN')}</del>
              <span className="text-xs font-semibold text-accent">{discount}% off</span>
            </>
          )}
        </div>
      </Link>
    </article>
  );
}
