'use client';

import { Dialog } from '@base-ui-components/react/dialog';
import { Package, Plus, X } from 'lucide-react';
import Image from 'next/image';
import * as React from 'react';

import { Button } from '@/components/ui/button';
import { FormField } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAdminProducts, useToggleProductFeature } from '@/features/admin/hooks/use-admin';

export function MerchandisingFeaturedProducts() {
  const [page, setPage] = React.useState(1);
  const [search, setSearch] = React.useState('');
  const [pickerOpen, setPickerOpen] = React.useState(false);
  const [pickerPage, setPickerPage] = React.useState(1);
  const [pickerSearch, setPickerSearch] = React.useState('');
  const [debouncedPickerSearch, setDebouncedPickerSearch] = React.useState('');

  React.useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedPickerSearch(pickerSearch.trim()), 300);
    return () => window.clearTimeout(timer);
  }, [pickerSearch]);

  const featuredQuery = useAdminProducts({
    page,
    limit: 20,
    search: search.trim() || undefined,
    isFeatured: 'true',
  });
  const pickerQuery = useAdminProducts(
    {
      page: pickerPage,
      limit: 20,
      search: debouncedPickerSearch || undefined,
      moderationStatus: 'approved',
      published: 'true',
      isFeatured: 'false',
    },
    pickerOpen,
  );
  const toggleFeature = useToggleProductFeature();
  const products = featuredQuery.data?.products ?? [];
  const candidates = pickerQuery.data?.products ?? [];
  const totalPages = featuredQuery.data?.pagination.totalPages ?? 1;
  const pickerTotalPages = pickerQuery.data?.pagination.totalPages ?? 1;

  return (
    <section className="overflow-hidden rounded-xl border border-border-default bg-surface-raised dark:bg-surface">
      <div className="flex flex-col gap-3 border-b border-border-subtle p-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="font-semibold text-text-primary">Featured products</h2>
          <p className="mt-1 text-sm text-text-secondary">
            Manage products highlighted across the marketplace.
          </p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <FormField name="merchandising-product-search" className="w-full sm:w-56">
            <Label htmlFor="merchandising-product-search" className="sr-only">
              Search featured products
            </Label>
            <Input
              id="merchandising-product-search"
              aria-label="Search featured products"
              type="search"
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setPage(1);
              }}
              placeholder="Search products"
              className="cursor-text ml-auto"
            />
          </FormField>
          <Button
            type="button"
            onClick={() => {
              setPickerPage(1);
              setPickerOpen(true);
            }}
          >
            <Plus className="h-4 w-4" aria-hidden="true" /> Feature product
          </Button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-162 text-left text-xs sm:text-sm">
          <thead>
            <tr className="border-b border-border-subtle text-text-tertiary">
              <th scope="col" className="px-4 py-3 font-semibold">
                Product
              </th>
              <th scope="col" className="px-4 py-3 font-semibold">
                Seller
              </th>
              <th scope="col" className="px-4 py-3 font-semibold">
                Status
              </th>
              <th scope="col" className="px-4 py-3 text-right font-semibold">
                Price
              </th>
              <th scope="col" className="px-4 py-3 text-right font-semibold">
                Action
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-subtle">
            {featuredQuery.isLoading ? (
              <tr>
                <td colSpan={5} className="py-12 text-center text-text-tertiary">
                  Loading featured products…
                </td>
              </tr>
            ) : featuredQuery.isError ? (
              <tr>
                <td colSpan={5} className="py-12 text-center">
                  <p className="text-text-secondary">Featured products couldn’t load.</p>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="mt-3"
                    onClick={() => void featuredQuery.refetch()}
                  >
                    Try again
                  </Button>
                </td>
              </tr>
            ) : products.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-12 text-center">
                  <p className="font-medium text-text-primary">No featured products yet</p>
                  <p className="mt-1 text-sm text-text-secondary">
                    Feature a product to highlight it across the marketplace.
                  </p>
                </td>
              </tr>
            ) : (
              products.map((product) => {
                const pending =
                  toggleFeature.isPending &&
                  toggleFeature.variables?.productId === product.productId;
                return (
                  <tr key={product.productId} className="hover:bg-surface-hover/50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-md border border-border-subtle bg-surface-subtle">
                          {product.imageUrl ? (
                            <Image
                              src={product.imageUrl}
                              alt=""
                              width={40}
                              height={40}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <Package className="h-4 w-4 text-text-tertiary" aria-hidden="true" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="truncate font-medium text-text-primary">{product.name}</p>
                          <p className="truncate text-xs text-text-tertiary">/{product.slug}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-text-secondary">{product.vendor.name}</td>
                    <td className="px-4 py-3 capitalize text-text-secondary">
                      {product.moderationStatus}
                      {product.published ? ' · Published' : ' · Draft'}
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums text-text-primary">
                      ₹{Number(product.price).toLocaleString('en-IN')}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Button
                        type="button"
                        size="sm"
                        variant="secondary"
                        disabled={toggleFeature.isPending}
                        isLoading={pending}
                        aria-label={`Remove ${product.name} from featured products`}
                        onClick={() =>
                          toggleFeature.mutate({ productId: product.productId, isFeatured: false })
                        }
                      >
                        Remove
                      </Button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
      <div className="flex items-center justify-between gap-3 border-t border-border-subtle p-3">
        <p className="text-xs text-text-secondary" aria-live="polite">
          Page {page} of {totalPages}
          {featuredQuery.data?.pagination.total !== undefined
            ? ` · ${featuredQuery.data.pagination.total} featured`
            : ''}
        </p>
        <div className="flex gap-2">
          <Button
            type="button"
            size="sm"
            variant="secondary"
            disabled={page <= 1 || featuredQuery.isLoading}
            onClick={() => setPage((current) => current - 1)}
          >
            Previous
          </Button>
          <Button
            type="button"
            size="sm"
            variant="secondary"
            disabled={page >= totalPages || featuredQuery.isLoading}
            onClick={() => setPage((current) => current + 1)}
          >
            Next
          </Button>
        </div>
      </div>

      <Dialog.Root open={pickerOpen} onOpenChange={setPickerOpen}>
        <Dialog.Portal>
          <Dialog.Backdrop className="fixed inset-0 z-50 bg-black/55" />
          <Dialog.Popup className="fixed inset-x-3 top-1/2 z-50 mx-auto flex max-h-[90vh] w-auto max-w-4xl -translate-y-1/2 flex-col overflow-hidden rounded-xl border border-border-default bg-surface-raised text-text-primary shadow-xl sm:inset-x-6">
            <header className="flex items-start justify-between gap-4 border-b border-border-subtle p-4 sm:p-6">
              <div>
                <Dialog.Title className="text-lg font-semibold">Feature a product</Dialog.Title>
                <Dialog.Description className="mt-1 text-sm text-text-secondary">
                  Choose a published, approved product to feature.
                </Dialog.Description>
              </div>
              <Dialog.Close
                aria-label="Close product picker"
                className="rounded-md p-2 text-text-secondary hover:bg-surface-hover"
              >
                <X size={18} aria-hidden="true" />
              </Dialog.Close>
            </header>
            <div className="border-b border-border-subtle px-4 py-3 sm:px-6">
              <FormField name="product-picker-search" className="w-full max-w-sm ml-auto">
                <Label htmlFor="product-picker-search" className="sr-only">
                  Search products
                </Label>
                <Input
                  id="product-picker-search"
                  aria-label="Search products"
                  type="search"
                  value={pickerSearch}
                  onChange={(event) => {
                    setPickerSearch(event.target.value);
                    setPickerPage(1);
                  }}
                  placeholder="Search products"
                  className="cursor-text"
                />
              </FormField>
            </div>
            <div className="min-h-0 flex-1 overflow-auto">
              <table className="w-full min-w-140 text-left text-sm">
                <thead>
                  <tr className="border-b border-border-subtle text-text-tertiary">
                    <th className="px-4 py-3">Product</th>
                    <th className="px-4 py-3">Seller</th>
                    <th className="px-4 py-3 text-right">Price</th>
                    <th className="px-4 py-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-subtle">
                  {pickerQuery.isLoading ? (
                    <tr>
                      <td colSpan={4} className="py-10 text-center text-text-secondary">
                        Loading products…
                      </td>
                    </tr>
                  ) : pickerQuery.isError ? (
                    <tr>
                      <td colSpan={4} className="py-10 text-center">
                        <p className="text-text-secondary">Products couldn’t load.</p>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="mt-3"
                          onClick={() => void pickerQuery.refetch()}
                        >
                          Try again
                        </Button>
                      </td>
                    </tr>
                  ) : candidates.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="py-10 text-center text-text-secondary">
                        No eligible products found.
                      </td>
                    </tr>
                  ) : (
                    candidates.map((product) => (
                      <tr key={product.productId}>
                        <td className="px-4 py-3 font-medium text-text-primary">{product.name}</td>
                        <td className="px-4 py-3 text-text-secondary">{product.vendor.name}</td>
                        <td className="px-4 py-3 text-right tabular-nums">
                          ₹{Number(product.price).toLocaleString('en-IN')}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <Button
                            type="button"
                            size="sm"
                            disabled={toggleFeature.isPending}
                            isLoading={
                              toggleFeature.isPending &&
                              toggleFeature.variables?.productId === product.productId
                            }
                            onClick={() =>
                              toggleFeature.mutate({
                                productId: product.productId,
                                isFeatured: true,
                              })
                            }
                          >
                            Feature
                          </Button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            <footer className="flex items-center justify-between gap-3 border-t border-border-subtle p-4">
              <span className="text-xs text-text-secondary">
                Page {pickerPage} of {pickerTotalPages}
              </span>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  disabled={pickerPage <= 1 || pickerQuery.isLoading}
                  onClick={() => setPickerPage((current) => current - 1)}
                >
                  Previous
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  disabled={pickerPage >= pickerTotalPages || pickerQuery.isLoading}
                  onClick={() => setPickerPage((current) => current + 1)}
                >
                  Next
                </Button>
              </div>
            </footer>
          </Dialog.Popup>
        </Dialog.Portal>
      </Dialog.Root>
    </section>
  );
}
