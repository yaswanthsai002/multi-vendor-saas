'use client';

import { CatalogEmptyState } from './catalog-empty-state';

import type { CatalogProduct } from '../types/catalog.types';
import type { Product } from '@/shared/components/product-card/product-card.types';

import { ProductCard } from '@/shared/components/product-card/product-card';

interface CatalogProductGridProps {
  products: CatalogProduct[];
  isLoading: boolean;
  hasFilters: boolean;
  onResetFilters: () => void;
  onWishlistToggle?: (product: Product) => void;
  onAddToCart?: (product: Product) => void;
}

export function CatalogProductGrid({
  products,
  isLoading,
  hasFilters,
  onResetFilters,
  onWishlistToggle,
  onAddToCart,
}: CatalogProductGridProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, idx) => (
          <div
            key={idx}
            className="flex flex-col rounded-lg border border-border-subtle bg-surface-raised p-3 animate-pulse"
          >
            <div className="aspect-square w-full rounded-md bg-surface-subtle mb-3" />
            <div className="h-3 w-16 bg-surface-subtle rounded mb-2" />
            <div className="h-4 w-full bg-surface-subtle rounded mb-1" />
            <div className="h-4 w-3/4 bg-surface-subtle rounded mb-3" />
            <div className="h-5 w-24 bg-surface-subtle rounded mt-auto" />
          </div>
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return <CatalogEmptyState hasFilters={hasFilters} onResetFilters={onResetFilters} />;
  }

  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4">
      {products.map((product) => {
        const discountPct =
          product.compareAtPrice && Number(product.compareAtPrice) > Number(product.price)
            ? Math.round(
                ((Number(product.compareAtPrice) - Number(product.price)) /
                  Number(product.compareAtPrice)) *
                  100,
              )
            : null;

        const cardProduct: Product = {
          id: product.productId,
          slug: product.slug,
          name: product.name,
          brand: product.vendor.name,
          price: `₹${Number(product.price).toLocaleString('en-IN')}`,
          oldPrice: product.compareAtPrice
            ? `₹${Number(product.compareAtPrice).toLocaleString('en-IN')}`
            : undefined,
          discount: discountPct ? `-${discountPct}%` : undefined,
          image: product.imageUrl || '/assets/products/product.png',
          badge: product.isFeatured
            ? { text: 'Featured', variant: 'accent' }
            : product.stock <= 5 && product.stock > 0
              ? { text: `Only ${product.stock} Left`, variant: 'warning' }
              : undefined,
        };

        return (
          <ProductCard
            key={product.productId}
            product={cardProduct}
            onWishlistToggle={onWishlistToggle}
            onAddToCart={onAddToCart}
          />
        );
      })}
    </div>
  );
}
