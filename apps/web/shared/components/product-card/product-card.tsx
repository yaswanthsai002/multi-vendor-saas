'use client';

import { Heart, ShoppingBag, Star } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';

import type { ProductCardProps } from './product-card.types';

import { Button } from '@/components/ui/button';

export function ProductCard({
  product,
  className = '',
  onWishlistToggle,
  onAddToCart,
}: ProductCardProps) {
  const [isWishlisted, setIsWishlisted] = useState(product.isWishlisted ?? false);

  const productSlug =
    product.slug ??
    (product.name
      ? product.name
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)+/g, '')
      : 'product');

  const productHref = `/products/${productSlug}`;

  const ratingValue = Number(product.rating ?? 0);
  const reviewsCount = product.reviewsCount ?? product.reviews ?? 0;
  const originalPrice = product.oldPrice ?? product.originalPrice;

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsWishlisted((prev) => !prev);
    onWishlistToggle?.(product);
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onAddToCart?.(product);
  };

  return (
    <article
      className={`group relative flex flex-col overflow-hidden rounded-lg border border-border-subtle bg-surface-raised p-2.5 transition-[box-shadow,border-color] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] hover:border-border-default hover:shadow-md dark:hover:border-border-strong sm:p-3 ${className}`}
    >
      {/* Media container */}
      <div className="relative aspect-square w-full overflow-hidden rounded-md bg-surface-subtle">
        <Link
          href={productHref}
          tabIndex={-1}
          aria-hidden="true"
          className="relative block h-full w-full"
        >
          <Image
            src={product.image}
            alt={product.name}
            fill
            sizes="
              (max-width: 639px) 43vw,
              (max-width: 767px) 30vw,
              (max-width: 1023px) 22vw,
              180px
            "
            className="transform-gpu object-cover transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] will-change-transform group-hover:scale-105 motion-reduce:transition-none motion-reduce:group-hover:scale-100"
          />
        </Link>

        {/* Top-Left Floating Badge */}
        {product.badge && (
          <div className="pointer-events-none absolute left-2 top-2 z-10">
            <span
              className={`inline-flex items-center rounded-xs px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider shadow-xs sm:text-[10px] ${
                product.badge.variant === 'warning'
                  ? 'bg-warning text-white'
                  : product.badge.variant === 'success'
                    ? 'bg-success text-white'
                    : product.badge.variant === 'neutral'
                      ? 'bg-surface-raised/90 text-text-primary backdrop-blur-xs'
                      : 'bg-accent text-on-accent'
              }`}
            >
              {product.badge.text}
            </span>
          </div>
        )}

        {/* Top-Right Floating Action Stack */}
        <div className="absolute right-2 top-2 z-10 flex flex-col gap-1.5 transition-opacity duration-300 ease-out focus-within:opacity-100 md:opacity-0 md:group-hover:opacity-100">
          {/* Wishlist Button */}
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
            onClick={handleWishlist}
            className="h-7 w-7 rounded-full border-border-default bg-surface-raised/95 p-0 text-text-secondary shadow-xs backdrop-blur-xs transition-[transform,color,background-color] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] hover:scale-110 hover:text-accent active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus sm:h-8 sm:w-8"
          >
            <Heart
              size={14}
              strokeWidth={1.75}
              className={isWishlisted ? 'fill-accent text-accent' : ''}
            />
          </Button>

          {/* Add to Cart Button */}
          {onAddToCart && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              aria-label={`Add ${product.name} to cart`}
              onClick={handleAddToCart}
              className="h-7 w-7 rounded-full border-border-default bg-surface-raised/95 p-0 text-text-secondary shadow-xs backdrop-blur-xs transition-[transform,color,background-color] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] hover:scale-110 hover:text-accent active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus sm:h-8 sm:w-8"
            >
              <ShoppingBag size={14} strokeWidth={1.75} />
            </Button>
          )}
        </div>
      </div>

      {/* Content & Metadata */}
      <div className="flex flex-1 flex-col pt-2 sm:pt-2.5">
        {/* Brand label */}
        <p className="truncate text-[10px] font-semibold uppercase tracking-wider text-text-tertiary sm:text-xs">
          {product.brand}
        </p>

        {/* Product title */}
        <h3 className="mt-0.5 line-clamp-2 min-h-8 text-xs font-medium leading-snug text-text-primary sm:min-h-9 sm:text-sm">
          <Link
            href={productHref}
            className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus focus-visible:ring-offset-2"
          >
            {product.name}
          </Link>
        </h3>

        {/* Rating summary */}
        {ratingValue > 0 && (
          <div className="mt-1 flex items-center gap-1 sm:mt-1.5">
            <div className="flex items-center gap-px" aria-label={`${ratingValue} out of 5 stars`}>
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  size={10}
                  strokeWidth={1.5}
                  fill={star <= Math.round(ratingValue) ? 'currentColor' : 'none'}
                  className={
                    star <= Math.round(ratingValue) ? 'text-warning' : 'text-border-strong'
                  }
                />
              ))}
            </div>

            <span className="text-[10px] font-medium leading-none text-text-secondary sm:text-xs">
              {ratingValue.toFixed(1)}
              {reviewsCount > 0 && <span className="text-text-tertiary"> ({reviewsCount})</span>}
            </span>
          </div>
        )}

        {/* Pricing information */}
        <div className="mt-auto flex items-center gap-1.5 pt-2 sm:gap-2 sm:pt-2.5">
          <span className="text-xs font-semibold leading-none text-text-primary sm:text-sm">
            {product.price}
          </span>

          {originalPrice && (
            <span className="text-[10px] leading-none text-text-tertiary line-through sm:text-xs">
              {originalPrice}
            </span>
          )}

          {product.discount && (
            <span className="rounded-xs bg-accent-subtle px-1 py-0.5 text-[9px] font-medium leading-none text-accent sm:text-[10px]">
              {product.discount}
            </span>
          )}
        </div>
      </div>
    </article>
  );
}
