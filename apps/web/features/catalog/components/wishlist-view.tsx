'use client';

import { Heart } from 'lucide-react';
import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { useWishlist } from '@/features/catalog/hooks/use-wishlist';
import { ProductCard } from '@/shared/components/product-card/product-card';

export function WishlistView() {
  const router = useRouter();
  const wishlist = useWishlist();

  if (wishlist.isUserLoading) return <WishlistSkeleton />;
  if (!wishlist.userId) {
    return (
      <main className="mx-auto w-full max-w-6xl px-4 py-16 text-center sm:px-6">
        <Heart className="mx-auto h-10 w-10 text-text-tertiary" aria-hidden="true" />
        <h1 className="mt-4 text-2xl font-semibold text-text-primary">Your wishlist</h1>
        <p className="mt-2 text-sm text-text-secondary">Sign in to save products for later.</p>
        <Button className="mt-5" onClick={() => router.push('/signin?redirect=%2Fwishlist')}>
          Sign in
        </Button>
      </main>
    );
  }

  if (wishlist.wishlist.isLoading) return <WishlistSkeleton />;
  if (wishlist.wishlist.isError) {
    return (
      <main className="mx-auto w-full max-w-6xl px-4 py-16 text-center sm:px-6">
        <h1 className="text-xl font-semibold text-text-primary">Could not load your wishlist</h1>
        <p className="mt-2 text-sm text-text-secondary">Your saved products are safe. Try again.</p>
        <Button className="mt-5" onClick={() => void wishlist.wishlist.refetch()}>
          Try again
        </Button>
      </main>
    );
  }

  const items = wishlist.wishlist.data?.items ?? [];
  return (
    <main className="mx-auto w-full max-w-7xl space-y-6 px-4 py-8 sm:px-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-text-primary sm:text-3xl">
          Your wishlist
        </h1>
        <p className="mt-1 text-sm text-text-secondary">
          {items.length} saved {items.length === 1 ? 'product' : 'products'}
        </p>
      </div>
      {items.length === 0 ? (
        <section className="rounded-xl border border-border-subtle bg-surface-raised px-6 py-14 text-center">
          <Heart className="mx-auto h-10 w-10 text-text-tertiary" aria-hidden="true" />
          <h2 className="mt-4 text-lg font-semibold text-text-primary">No saved products yet</h2>
          <p className="mt-2 text-sm text-text-secondary">
            Tap the heart on a product to save it here.
          </p>
          <Button className="mt-5 px-4 py-2" onClick={() => router.push('/products')}>
            Browse products
          </Button>
        </section>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
          {items.map((item) => {
            const price = Number(item.price);
            const mrp = Number(item.mrp);
            const discount = mrp > price ? Math.round(((mrp - price) / mrp) * 100) : 0;
            return (
              <ProductCard
                key={item.productId}
                product={{
                  id: item.productId,
                  wishlistProductId: item.productId,
                  isWishlisted: true,
                  slug: item.slug,
                  name: item.name,
                  brand: item.vendorName,
                  price: `₹${price.toLocaleString('en-IN')}`,
                  oldPrice: discount ? `₹${mrp.toLocaleString('en-IN')}` : undefined,
                  discount: discount ? `${discount}% off` : undefined,
                  image: item.imageUrl || '/assets/products/product.png',
                }}
                onWishlistToggle={() => wishlist.remove(item.productId)}
                wishlistDisabled={wishlist.mutation.isPending}
              />
            );
          })}
        </div>
      )}
    </main>
  );
}

function WishlistSkeleton() {
  return (
    <main
      className="mx-auto w-full max-w-7xl space-y-6 px-4 py-8 sm:px-6"
      role="status"
      aria-label="Loading wishlist"
    >
      <div className="h-9 w-56 animate-pulse rounded bg-surface-subtle" />
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
        {Array.from({ length: 4 }, (_, index) => (
          <div key={index} className="aspect-square animate-pulse rounded-xl bg-surface-subtle" />
        ))}
      </div>
    </main>
  );
}
