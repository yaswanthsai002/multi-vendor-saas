import { Heart, Share2, Star } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import * as React from 'react';

import type { CatalogProductDetail } from '../../types/catalog.types';

import { Button } from '@/components/ui/button';

interface ProductDetailPurchaseProps {
  product: CatalogProductDetail;
  isWishlisted: boolean;
  wishlistDisabled: boolean;
  onWishlistToggle: () => void;
  rating: number | null;
  ratingCount: number | null;
  quantity: number;
  onQuantityChange: (quantity: number) => void;
  onAddToCart: () => void;
  onBuyNow: () => void;
  purchaseIntent: 'cart' | 'buyNow' | null;
  cartError: string;
  cartMessage: string;
}

export function ProductDetailPurchase({
  product,
  isWishlisted,
  wishlistDisabled,
  onWishlistToggle,
  rating,
  ratingCount,
  quantity,
  onQuantityChange,
  onAddToCart,
  onBuyNow,
  purchaseIntent,
  cartError,
  cartMessage,
}: ProductDetailPurchaseProps) {
  const [shareMessage, setShareMessage] = React.useState('');
  const price = Number(product.price);
  const mrp = Number(product.mrp);
  const discount = mrp > price ? Math.round(((mrp - price) / mrp) * 100) : 0;
  const maxQuantity = Math.min(product.stock, 999);

  async function shareProduct() {
    const url = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({ title: product.name, url });
        return;
      }
      await navigator.clipboard.writeText(url);
      setShareMessage('Product link copied.');
    } catch (error) {
      if (error instanceof Error && error.name !== 'AbortError') {
        setShareMessage('Could not share this product.');
      }
    }
  }

  return (
    <section className="rounded-xl border border-border-subtle bg-surface-raised p-5 shadow-sm sm:p-7">
      <div className="space-y-5">
        <div className="space-y-3">
          <div className="flex items-center justify-between gap-3">
            <Link
              href={`/products?vendor=${product.vendor.slug}`}
              className="text-sm font-medium text-text-secondary hover:text-accent hover:underline"
            >
              {product.vendor.name}
            </Link>
            <div className="flex items-center gap-1">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                disabled={wishlistDisabled}
                aria-label={
                  isWishlisted ? 'Remove product from wishlist' : 'Add product to wishlist'
                }
                aria-pressed={isWishlisted}
                onClick={onWishlistToggle}
                className="shrink-0 px-2 text-text-secondary"
              >
                <Heart
                  className={`mr-1 h-4 w-4 ${isWishlisted ? 'fill-accent text-accent' : ''}`}
                  aria-hidden="true"
                />
                Save
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => void shareProduct()}
                className="shrink-0 px-2 text-text-secondary"
              >
                <Share2 className="mr-1 h-4 w-4" aria-hidden="true" />
                Share
              </Button>
            </div>
          </div>
          <h1 className="text-2xl font-semibold leading-tight tracking-tight text-text-primary sm:text-3xl">
            {product.name}
          </h1>
          {ratingCount === null ? (
            <p
              className="h-5 animate-pulse rounded bg-surface-subtle text-transparent"
              aria-label="Loading rating"
            >
              Loading ratings
            </p>
          ) : ratingCount > 0 ? (
            <div className="flex items-center gap-2 text-sm">
              <span className="inline-flex items-center gap-1 font-semibold text-text-primary">
                {rating?.toFixed(1) ?? '—'}
                <Star className="h-4 w-4 fill-warning text-warning" aria-hidden="true" />
              </span>
              <span className="text-text-tertiary">·</span>
              <span className="text-text-secondary">{ratingCount} ratings</span>
            </div>
          ) : (
            <p className="text-sm text-text-secondary">No ratings yet</p>
          )}
        </div>

        {product.shortDescription && (
          <p className="max-w-prose text-sm leading-relaxed text-text-secondary">
            {product.shortDescription}
          </p>
        )}

        <div className="border-y border-border-subtle py-5">
          <p className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <span className="text-3xl font-bold tracking-tight text-text-primary sm:text-4xl">
              ₹{price.toLocaleString('en-IN')}
            </span>
            {discount > 0 && (
              <>
                <span className="text-sm text-text-tertiary">
                  MRP <del>₹{mrp.toLocaleString('en-IN')}</del>
                </span>
                <span className="rounded-sm bg-accent-subtle px-2 py-1 text-sm font-semibold text-accent">
                  {discount}% off
                </span>
              </>
            )}
          </p>
          <p className="mt-1 text-xs text-text-secondary">Inclusive of all taxes</p>
          <span
            className={`mt-4 inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${product.stock > 0 ? 'bg-success-subtle text-success' : 'bg-danger-subtle text-danger'}`}
          >
            <span
              aria-hidden="true"
              className={`h-1.5 w-1.5 rounded-full ${product.stock > 0 ? 'bg-success' : 'bg-danger'}`}
            />
            {product.stock > 0 ? 'Available' : 'Out of stock'}
          </span>
        </div>

        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-3">
            <label className="text-sm font-medium text-text-primary" htmlFor="product-quantity">
              Quantity
            </label>
            <div className="inline-flex h-10 items-center rounded-md border border-border-control bg-surface">
              <Button
                type="button"
                variant="ghost"
                aria-label="Decrease quantity"
                disabled={quantity <= 1 || !product.stock || purchaseIntent !== null}
                onClick={() => onQuantityChange(Math.max(1, quantity - 1))}
                className="h-9 w-9 px-0"
              >
                −
              </Button>
              <input
                id="product-quantity"
                type="number"
                inputMode="numeric"
                min={1}
                max={maxQuantity}
                value={quantity}
                disabled={!product.stock || purchaseIntent !== null}
                onChange={(event) => {
                  const value = Number(event.target.value);
                  if (Number.isInteger(value)) {
                    onQuantityChange(Math.max(1, Math.min(maxQuantity, value)));
                  }
                }}
                className="product-quantity-input w-12 bg-transparent text-center text-sm font-medium text-text-primary outline-none disabled:opacity-50"
              />
              <Button
                type="button"
                variant="ghost"
                aria-label="Increase quantity"
                disabled={quantity >= maxQuantity || purchaseIntent !== null}
                onClick={() => onQuantityChange(Math.min(maxQuantity, quantity + 1))}
                className="h-9 w-9 px-0"
              >
                +
              </Button>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Button
              type="button"
              size="lg"
              disabled={!product.stock || purchaseIntent !== null}
              isLoading={purchaseIntent === 'cart'}
              onClick={onAddToCart}
              className="w-full px-4 py-2"
            >
              Add to Cart
            </Button>
            <Button
              type="button"
              variant="outline"
              size="lg"
              disabled={!product.stock || purchaseIntent !== null}
              isLoading={purchaseIntent === 'buyNow'}
              onClick={onBuyNow}
              className="w-full px-3 outline-2 outline-text-primary"
            >
              Buy Now
            </Button>
          </div>
          {cartError && (
            <p role="alert" className="text-sm text-danger">
              {cartError}
            </p>
          )}
          {cartMessage && (
            <p role="status" className="text-sm text-success">
              {cartMessage}
            </p>
          )}
          {shareMessage && (
            <p role="status" className="text-sm text-text-secondary">
              {shareMessage}
            </p>
          )}
        </div>

        <div className="flex items-center gap-3 rounded-lg bg-surface-subtle p-3">
          {product.vendor.logoUrl ? (
            <Image
              src={product.vendor.logoUrl}
              alt=""
              width={40}
              height={40}
              className="h-10 w-10 rounded-md object-cover"
            />
          ) : (
            <span
              aria-hidden="true"
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-surface-raised text-sm font-semibold text-accent"
            >
              {product.vendor.name.slice(0, 1).toUpperCase()}
            </span>
          )}
          <div className="min-w-0 flex-1">
            <p className="text-xs text-text-secondary">Sold by</p>
            <Link
              href={`/products?vendor=${product.vendor.slug}`}
              className="block truncate text-sm font-semibold text-text-primary hover:text-accent hover:underline"
            >
              {product.vendor.name}
            </Link>
            {product.vendor.tagline && (
              <p className="truncate text-xs text-text-secondary">{product.vendor.tagline}</p>
            )}
          </div>
          <Link
            href={`/products?vendor=${product.vendor.slug}`}
            className="shrink-0 text-xs font-semibold text-accent hover:underline"
          >
            View store
          </Link>
        </div>
      </div>
    </section>
  );
}
