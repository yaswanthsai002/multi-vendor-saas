'use client';

import { useInfiniteQuery, useQueryClient } from '@tanstack/react-query';
import { ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import * as React from 'react';

import { useCatalogProduct } from '../../hooks/use-catalog';
import { useWishlist } from '../../hooks/use-wishlist';

import { ProductDetailContent } from './product-detail-content';
import { ProductDetailGallery } from './product-detail-gallery';
import { ProductDetailPurchase } from './product-detail-purchase';
import { SellerProducts } from './seller-products';

import type { ReviewPage } from './product-review.types';
import type { CatalogProductDetail } from '../../types/catalog.types';

import { Button } from '@/components/ui/button';
import { ApiError, makeApiRequest } from '@/lib/api-client';
import { API_ENDPOINTS } from '@/lib/api-endpoints';
import { broadcastCartChange } from '@/lib/cart-sync';
import { queryKeys } from '@/lib/query-keys';

export function ProductDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data, error, isLoading, isError, refetch } = useCatalogProduct(slug);
  const [image, setImage] = React.useState<string | null>(null);
  const [quantity, setQuantity] = React.useState(1);
  const [purchaseIntent, setPurchaseIntent] = React.useState<'cart' | 'buyNow' | null>(null);
  const [cartError, setCartError] = React.useState('');
  const [cartMessage, setCartMessage] = React.useState('');
  const wishlist = useWishlist();
  const reviews = useInfiniteQuery({
    queryKey: [...queryKeys.catalog.detail(slug), 'reviews'],
    initialPageParam: 1,
    queryFn: ({ pageParam }) =>
      makeApiRequest<ReviewPage>({
        url: API_ENDPOINTS.catalog.productReviews(slug),
        method: 'GET',
        params: { page: pageParam, limit: 3 },
      }),
    getNextPageParam: (last) => (last.pagination.hasMore ? last.pagination.page + 1 : undefined),
  });

  async function addToCart(product: CatalogProductDetail, buyNow = false) {
    setPurchaseIntent(buyNow ? 'buyNow' : 'cart');
    setCartError('');
    setCartMessage('');
    try {
      await makeApiRequest({
        url: API_ENDPOINTS.cart.items,
        method: 'POST',
        data: { productId: product.productId, quantity },
      });
      setQuantity(1);
      setCartMessage('Added to cart.');
      if (!broadcastCartChange()) {
        await queryClient.invalidateQueries({ queryKey: ['cart'] });
      }
      if (buyNow) router.push('/cart');
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        router.push(`/signin?redirect=${encodeURIComponent(`/products/${slug}`)}`);
      } else {
        setCartError('Could not add this item. Check your connection and try again.');
      }
    } finally {
      setPurchaseIntent(null);
    }
  }

  function toggleWishlist(productId: string) {
    if (!wishlist.userId) {
      router.push(`/signin?redirect=${encodeURIComponent(`/products/${slug}`)}`);
      return;
    }
    wishlist.toggle(productId);
  }

  if (isLoading) return <ProductDetailSkeleton />;
  if (isError)
    return (
      <main className="mx-auto w-full max-w-7xl px-4 py-16 text-center sm:px-6">
        <h1 className="text-xl font-semibold">
          {error instanceof ApiError && error.status === 404
            ? 'Product unavailable'
            : 'Could not load this product'}
        </h1>
        <Button className="mt-4" onClick={() => void refetch()}>
          Try again
        </Button>
      </main>
    );

  const product = data?.product;
  if (!product)
    return (
      <main className="mx-auto w-full max-w-7xl px-4 py-16 text-center text-text-secondary sm:px-6">
        Product unavailable.
      </main>
    );

  const category = product.categories[0];
  const images = Array.from(
    new Set(
      [product.primaryImage, ...product.gallery.map((item) => item.url)].filter(
        (url): url is string => Boolean(url),
      ),
    ),
  );

  return (
    <main className="mx-auto w-full max-w-7xl space-y-10 px-4 py-6 sm:px-6 sm:py-8 lg:space-y-14">
      <nav
        aria-label="Breadcrumb"
        className="flex min-w-0 items-center gap-2 text-sm text-text-secondary"
      >
        <Link href="/products" className="shrink-0 hover:text-text-primary">
          Shop
        </Link>
        <ChevronRight className="h-4 w-4 shrink-0" aria-hidden="true" />
        {category && (
          <>
            <Link
              href={`/products?category=${encodeURIComponent(category.slug)}`}
              className="shrink-0 truncate hover:text-text-primary"
            >
              {category.name}
            </Link>
            <ChevronRight className="h-4 w-4 shrink-0" aria-hidden="true" />
          </>
        )}
        <span className="truncate text-text-primary" aria-current="page">
          {product.name}
        </span>
      </nav>

      <section className="grid items-start gap-6 lg:grid-cols-2 lg:gap-10">
        <ProductDetailGallery
          images={images}
          productName={product.name}
          selectedImage={image}
          onSelectImage={setImage}
          isWishlisted={wishlist.productIds.has(product.productId)}
          wishlistDisabled={
            wishlist.isUserLoading || wishlist.wishlist.isLoading || wishlist.mutation.isPending
          }
          onWishlistToggle={() => toggleWishlist(product.productId)}
        />
        <ProductDetailPurchase
          product={product}
          isWishlisted={wishlist.productIds.has(product.productId)}
          wishlistDisabled={
            wishlist.isUserLoading || wishlist.wishlist.isLoading || wishlist.mutation.isPending
          }
          onWishlistToggle={() => toggleWishlist(product.productId)}
          rating={reviews.data?.pages[0]?.averageRating ?? null}
          ratingCount={
            reviews.isLoading || reviews.isError ? null : (reviews.data?.pages[0]?.ratingCount ?? 0)
          }
          quantity={quantity}
          onQuantityChange={setQuantity}
          onAddToCart={() => void addToCart(product)}
          onBuyNow={() => void addToCart(product, true)}
          purchaseIntent={purchaseIntent}
          cartError={cartError}
          cartMessage={cartMessage}
        />
      </section>

      <ProductDetailContent product={product} reviews={reviews} />
      <SellerProducts product={product} />
    </main>
  );
}

function ProductDetailSkeleton() {
  return (
    <main
      className="mx-auto w-full max-w-7xl space-y-10 px-4 py-8 sm:px-6"
      role="status"
      aria-label="Loading product details"
    >
      <div className="grid gap-8 lg:grid-cols-2">
        <div className="aspect-square animate-pulse rounded-xl bg-surface-subtle" />
        <div className="space-y-5 rounded-xl border border-border-subtle p-6">
          <div className="h-4 w-28 animate-pulse rounded bg-surface-subtle" />
          <div className="h-9 w-3/4 animate-pulse rounded bg-surface-subtle" />
          <div className="h-5 w-40 animate-pulse rounded bg-surface-subtle" />
          <div className="h-10 w-36 animate-pulse rounded bg-surface-subtle" />
          <div className="h-12 w-full animate-pulse rounded bg-surface-subtle" />
        </div>
      </div>
      <div className="h-48 animate-pulse rounded-xl bg-surface-subtle" />
    </main>
  );
}
