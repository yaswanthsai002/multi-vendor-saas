'use client';

import { Dialog } from '@base-ui-components/react/dialog';
import { Check, Search, X } from 'lucide-react';
import { useEffect, useState } from 'react';

import { useAdminProducts } from '../hooks/use-admin';

import { PromotionProductPickerResults } from './promotion-product-picker-results';

import type { AdminProductItem } from '../services/admin.service';

import { Button } from '@/components/ui/button';
import { FormField } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export const MAX_PROMOTION_PRODUCTS = 50;

export interface PromotionProductSelection {
  productId: string;
  name: string;
  price: string;
  dealPrice: string;
  imageUrl?: string | null;
  vendorName?: string;
}

interface PromotionProductPickerProps {
  open: boolean;
  selected: PromotionProductSelection[];
  onOpenChange: (open: boolean) => void;
  onApply: (selected: PromotionProductSelection[]) => void;
}

function toSelection(product: AdminProductItem): PromotionProductSelection {
  return {
    productId: product.productId,
    name: product.name,
    price: product.price,
    dealPrice: '',
    imageUrl: product.imageUrl,
    vendorName: product.vendor.name,
  };
}

function pageProductIds(products: AdminProductItem[]) {
  return products.map((product) => product.productId);
}

export function PromotionProductPicker({
  open,
  selected,
  onOpenChange,
  onApply,
}: PromotionProductPickerProps) {
  const [draft, setDraft] = useState(selected);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage] = useState(1);
  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedSearch(search), 300);
    return () => window.clearTimeout(timer);
  }, [search]);

  const { data, isLoading, isError, refetch } = useAdminProducts(
    {
      page,
      limit: 20,
      search: debouncedSearch || undefined,
      published: 'true',
      moderationStatus: 'approved',
    },
    open,
  );
  const products = data?.products ?? [];
  const selectedIds = new Set(draft.map((product) => product.productId));
  const newOnPageCount = products.filter((product) => !selectedIds.has(product.productId)).length;
  const selectedEntirePage = products.length > 0 && newOnPageCount === 0;
  const canSelectPage =
    selectedEntirePage || draft.length + newOnPageCount <= MAX_PROMOTION_PRODUCTS;

  const setProductSelected = (product: AdminProductItem, checked: boolean) => {
    setDraft((current) => {
      if (!checked) return current.filter((item) => item.productId !== product.productId);
      if (current.some((item) => item.productId === product.productId)) return current;
      if (current.length >= MAX_PROMOTION_PRODUCTS) return current;
      return [...current, toSelection(product)];
    });
  };

  const togglePage = () => {
    if (selectedEntirePage) {
      setDraft((current) =>
        current.filter((item) => !pageProductIds(products).includes(item.productId)),
      );
      return;
    }
    setDraft((current) => {
      const byId = new Map(current.map((item) => [item.productId, item]));
      products.forEach((product) => {
        if (byId.size < MAX_PROMOTION_PRODUCTS)
          byId.set(product.productId, byId.get(product.productId) ?? toSelection(product));
      });
      return [...byId.values()];
    });
  };

  return (
    <Dialog.Root
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) onOpenChange(false);
      }}
    >
      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 z-50 bg-black/55" />
        <Dialog.Popup className="fixed inset-x-3 top-1/2 z-50 mx-auto flex max-h-[90vh] w-auto max-w-5xl -translate-y-1/2 flex-col overflow-hidden rounded-xl border border-border-default bg-surface-raised text-text-primary shadow-xl sm:inset-x-6">
          <header className="flex items-start justify-between gap-4 border-b border-border-subtle p-4 sm:p-6">
            <div>
              <Dialog.Title className="text-lg font-semibold">Choose products</Dialog.Title>
              <Dialog.Description className="mt-1 text-sm text-text-secondary">
                Search published products and select up to {MAX_PROMOTION_PRODUCTS}.
              </Dialog.Description>
            </div>
            <Dialog.Close
              aria-label="Close product picker"
              className="rounded-md p-2 text-text-secondary hover:bg-surface-hover hover:text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus"
            >
              <X size={18} aria-hidden="true" />
            </Dialog.Close>
          </header>

          <div className="flex flex-wrap items-end justify-between gap-3 border-b border-border-subtle p-4 sm:px-6">
            <FormField name="promotion-product-search" className="w-full max-w-md">
              <Label htmlFor="promotion-product-search" className="cursor-pointer">
                Search products
              </Label>
              <Input
                id="promotion-product-search"
                type="search"
                value={search}
                rightElement={<Search size={16} aria-hidden="true" />}
                onChange={(event) => {
                  setSearch(event.target.value);
                  setPage(1);
                }}
                placeholder="Product name"
                className="cursor-text"
              />
            </FormField>
            <p className="text-sm font-medium text-text-secondary" aria-live="polite">
              {draft.length} of {MAX_PROMOTION_PRODUCTS} selected
            </p>
          </div>

          <div className="min-h-0 flex-1 overflow-auto p-4 sm:px-6">
            <PromotionProductPickerResults
              products={products}
              selectedIds={selectedIds}
              selectedCount={draft.length}
              maxSelected={MAX_PROMOTION_PRODUCTS}
              isLoading={isLoading}
              isError={isError}
              canSelectPage={canSelectPage}
              selectedEntirePage={selectedEntirePage}
              onRetry={() => void refetch()}
              onProductToggle={setProductSelected}
              onTogglePage={togglePage}
            />
          </div>

          <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-border-subtle p-4 sm:px-6">
            <div className="flex items-center gap-3">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                disabled={page <= 1 || isLoading}
                onClick={() => setPage((current) => current - 1)}
              >
                Previous
              </Button>
              <span className="text-xs text-text-secondary">
                Page {page} of {data?.pagination.totalPages ?? 1}
              </span>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                disabled={page >= (data?.pagination.totalPages ?? 1) || isLoading}
                onClick={() => setPage((current) => current + 1)}
              >
                Next
              </Button>
            </div>
            <div className="flex items-center gap-2">
              <Button type="button" variant="secondary" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button
                type="button"
                onClick={() => {
                  onApply(draft);
                  onOpenChange(false);
                }}
              >
                <Check size={16} aria-hidden="true" />
                Add selected products
              </Button>
            </div>
          </footer>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
