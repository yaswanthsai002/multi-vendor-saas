'use client';

import { ArrowLeft, ImagePlus, PackagePlus, Trash2 } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { FormField } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

import type { PromotionProductSelection } from './promotion-product-picker';

export function PromotionEditorHeading({ isEditing }: { isEditing: boolean }) {
  return (
    <div className="flex items-end justify-between gap-4">
      <div>
        <nav
          aria-label="Breadcrumb"
          className="mb-3 flex items-center gap-2 text-sm text-text-secondary"
        >
          <Link
            href="/admin/campaigns"
            className="inline-flex cursor-pointer items-center gap-2 hover:text-text-primary"
          >
            <ArrowLeft size={16} aria-hidden="true" />
            Campaigns
          </Link>
          <span aria-hidden="true">/</span>
          <span className="text-text-primary">
            {isEditing ? 'Edit campaign' : 'Create campaign'}
          </span>
        </nav>
        <h1 className="text-3xl font-semibold text-text-primary">
          {isEditing ? 'Edit campaign' : 'Create campaign'}
        </h1>
        <p className="mt-1 text-sm text-text-secondary">
          Set the banner, products, and schedule for your marketplace promotion.
        </p>
      </div>
      <span className="mb-1 inline-flex shrink-0 items-center gap-2 rounded-md border border-border-default bg-surface-raised px-3 py-2 text-sm text-text-secondary">
        <span className="h-2 w-2 rounded-full bg-warning" aria-hidden="true" />
        Draft
      </span>
    </div>
  );
}

export function PromotionEditorLoadError({ onRetry }: { onRetry: () => void }) {
  return (
    <section className="rounded-xl border border-border-default bg-surface-raised p-6">
      <p role="alert" className="text-sm text-danger">
        Promotion couldn’t load.
      </p>
      <Button type="button" variant="outline" size="sm" className="mt-3" onClick={onRetry}>
        Try again
      </Button>
    </section>
  );
}

export function PromotionSelectedProducts({
  products,
  onChange,
}: {
  products: PromotionProductSelection[];
  onChange: (products: PromotionProductSelection[]) => void;
}) {
  if (!products.length) {
    return (
      <div className="flex items-start gap-3 rounded-lg border border-dashed border-border-strong bg-surface-subtle px-4 py-5">
        <PackagePlus size={18} className="mt-0.5 shrink-0 text-text-secondary" aria-hidden="true" />
        <div>
          <p className="font-medium text-text-primary">No products selected</p>
          <p className="mt-1 text-sm text-text-secondary">
            Add products to this campaign and set a deal price for each one.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-border-default">
      {products.map((product) => (
        <div
          key={product.productId}
          className="flex flex-wrap items-center gap-3 border-b border-border-subtle p-3 last:border-0 sm:gap-4 sm:p-4"
        >
          <div className="relative flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-md bg-surface-subtle">
            {product.imageUrl ? (
              <Image src={product.imageUrl} alt="" fill sizes="48px" className="object-cover" />
            ) : (
              <ImagePlus size={18} className="text-text-tertiary" aria-hidden="true" />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-text-primary">{product.name}</p>
            <p className="mt-1 text-xs text-text-secondary">
              {product.vendorName ? `${product.vendorName} · ` : ''}Current price ₹
              {Number(product.price).toLocaleString('en-IN')}
            </p>
          </div>
          <FormField name={`promotion-deal-price-${product.productId}`} className="w-36">
            <Label htmlFor={`deal-price-${product.productId}`} className="cursor-pointer">
              Deal price
            </Label>
            <Input
              id={`deal-price-${product.productId}`}
              type="number"
              className="cursor-text"
              min="0.01"
              step="0.01"
              value={product.dealPrice}
              onChange={(event) =>
                onChange(
                  products.map((item) =>
                    item.productId === product.productId
                      ? { ...item, dealPrice: event.target.value }
                      : item,
                  ),
                )
              }
            />
          </FormField>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            aria-label={`Remove ${product.name}`}
            onClick={() =>
              onChange(products.filter((item) => item.productId !== product.productId))
            }
          >
            <Trash2 size={16} aria-hidden="true" />
          </Button>
        </div>
      ))}
    </div>
  );
}
