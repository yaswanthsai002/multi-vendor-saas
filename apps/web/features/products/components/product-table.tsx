'use client';

import { Switch } from '@base-ui-components/react/switch';
import { ChevronLeft, ChevronRight, Package, Star } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import * as React from 'react';

import { ProductTableActionsMenu } from './product-table-actions-menu';

import type { ProductItem, ProductTab } from '../types/product.types';

interface ProductTableProps {
  products: ProductItem[];
  total: number;
  page: number;
  limit: number;
  activeTab: ProductTab;
  selectedIds: string[];
  onToggleSelect: (productId: string) => void;
  onToggleSelectAll: () => void;
  onPageChange: (page: number) => void;
  onTogglePublish: (productId: string, nextPublished: boolean) => void;
  onArchive: (productId: string) => void;
  onRestore: (productId: string) => void;
  onDelete: (product: ProductItem) => void;
  isPublishPendingId?: string | null;
}

function formatPriceINR(price: string | number): string {
  const num = typeof price === 'string' ? parseFloat(price) : price;
  if (isNaN(num)) return '₹0';
  return `₹${Math.round(num).toLocaleString('en-IN')}`;
}

export function ProductTable({
  products,
  total,
  page,
  limit,
  activeTab,
  selectedIds,
  onToggleSelect,
  onToggleSelectAll,
  onPageChange,
  onTogglePublish,
  onArchive,
  onRestore,
  onDelete,
  isPublishPendingId,
}: ProductTableProps) {
  // Master checkbox indeterminate state
  const checkboxRef = React.useRef<HTMLInputElement>(null);
  const allOnPageSelected =
    products.length > 0 && products.every((p) => selectedIds.includes(p.productId));
  const someOnPageSelected =
    products.some((p) => selectedIds.includes(p.productId)) && !allOnPageSelected;

  React.useEffect(() => {
    if (checkboxRef.current) {
      checkboxRef.current.indeterminate = someOnPageSelected;
    }
  }, [someOnPageSelected]);

  // Broken image fallback tracker
  const [imgErrors, setImgErrors] = React.useState<Record<string, boolean>>({});

  // Pagination calculation
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const from = total === 0 ? 0 : (page - 1) * limit + 1;
  const to = Math.min(page * limit, total);

  // Generate pagination page numbers
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (page <= 4) {
        pages.push(1, 2, 3, 4, 5, '...', totalPages);
      } else if (page >= totalPages - 3) {
        pages.push(
          1,
          '...',
          totalPages - 4,
          totalPages - 3,
          totalPages - 2,
          totalPages - 1,
          totalPages,
        );
      } else {
        pages.push(1, '...', page - 1, page, page + 1, '...', totalPages);
      }
    }
    return pages;
  };

  const isArchivedTab = activeTab === 'archived';

  return (
    <div className="w-full rounded-2xl border border-border-default bg-surface dark:bg-surface-subtle overflow-hidden shadow-xs">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-sm">
          <thead>
            <tr className="border-b border-border-subtle bg-surface-subtle/50 dark:bg-surface/50 text-xs font-semibold text-text-tertiary uppercase tracking-wider">
              {/* Select All Checkbox */}
              <th className="py-3.5 pl-4 pr-2 w-10">
                <input
                  ref={checkboxRef}
                  type="checkbox"
                  checked={allOnPageSelected}
                  onChange={onToggleSelectAll}
                  aria-label="Select all products on page"
                  className="h-4 w-4 rounded-md border-border-strong text-accent focus:ring-accent cursor-pointer"
                />
              </th>

              {/* Product Header */}
              <th className="py-3.5 px-4 min-w-65">Product</th>

              {/* Categories Header */}
              <th className="py-3.5 px-4 min-w-50">Categories</th>

              {/* Price Header */}
              <th className="py-3.5 px-4 min-w-27">Price</th>

              {/* Stock Header */}
              <th className="py-3.5 px-4 min-w-25">Stock</th>

              {/* Rating Header */}
              <th className="py-3.5 px-4 min-w-22">Rating</th>

              {/* Published Switch Header */}
              <th className="py-3.5 px-4 min-w-25">Published</th>

              {/* Actions Header */}
              <th className="py-3.5 pl-4 pr-6 w-14 text-right">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-border-subtle">
            {products.map((product) => {
              const isSelected = selectedIds.includes(product.productId);
              const isUpdatingPublish = isPublishPendingId === product.productId;
              const hasBrokenImg = Boolean(imgErrors[product.productId]);
              const thumbnailUrl =
                product.primaryImage?.variants?.thumbnail ||
                product.primaryImage?.variants?.medium ||
                product.primaryImage?.poster ||
                product.primaryImage?.original;
              const subtitle =
                product.shortDescription ||
                (product.categories && product.categories[0] ? product.categories[0].name : '');

              return (
                <tr
                  key={product.productId}
                  className={`group transition-colors ${
                    isSelected ? 'bg-sky-50/60 dark:bg-sky-950/20' : 'hover:bg-surface-hover/70'
                  }`}
                >
                  {/* Row Checkbox */}
                  <td className="py-3.5 pl-4 pr-2">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => onToggleSelect(product.productId)}
                      aria-label={`Select ${product.name}`}
                      className="h-4 w-4 rounded-md border-border-strong text-accent focus:ring-accent cursor-pointer"
                    />
                  </td>

                  {/* Product Thumbnail + Name + Subtitle */}
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-3">
                      <div className="relative h-12 w-12 rounded-xl overflow-hidden bg-surface-subtle dark:bg-surface border border-border-default/80 shrink-0 flex items-center justify-center">
                        {thumbnailUrl && !hasBrokenImg ? (
                          <Image
                            src={thumbnailUrl}
                            alt={product.name}
                            fill
                            sizes="48px"
                            className="object-cover"
                            onError={() =>
                              setImgErrors((prev) => ({ ...prev, [product.productId]: true }))
                            }
                          />
                        ) : (
                          <Package className="h-5 w-5 text-text-tertiary" />
                        )}
                      </div>

                      <div className="min-w-0 max-w-55 sm:max-w-xs">
                        <Link
                          href={`/vendor/products/${product.productId}/edit`}
                          className="font-semibold text-text-primary hover:text-accent truncate block transition-colors tracking-tight text-sm"
                        >
                          {product.name}
                        </Link>
                        {subtitle ? (
                          <p className="text-xs text-text-secondary truncate mt-0.5">{subtitle}</p>
                        ) : null}
                      </div>
                    </div>
                  </td>

                  {/* Categories */}
                  <td className="py-3.5 px-4">
                    <div className="flex flex-wrap items-center gap-1.5">
                      {product.categories && product.categories.length > 0 ? (
                        <>
                          {product.categories.slice(0, 2).map((cat) => (
                            <span
                              key={cat.categoryId}
                              className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-300 border border-sky-200/60 dark:border-sky-800/60 whitespace-nowrap"
                            >
                              {cat.name}
                            </span>
                          ))}
                          {product.categories.length > 2 ? (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-surface-subtle text-text-secondary border border-border-default whitespace-nowrap">
                              +{product.categories.length - 2}
                            </span>
                          ) : null}
                        </>
                      ) : (
                        <span className="text-xs text-text-tertiary italic">None</span>
                      )}
                    </div>
                  </td>

                  {/* Price */}
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <span className="font-medium text-text-primary">
                      {formatPriceINR(product.price)}
                    </span>
                  </td>

                  {/* Stock */}
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    {product.stock === 0 ? (
                      <span className="font-semibold text-danger-500">0</span>
                    ) : (
                      <span className="font-medium text-text-primary">{product.stock}</span>
                    )}
                  </td>

                  {/* Rating */}
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    {product.rating !== null && product.rating !== undefined ? (
                      <div className="inline-flex items-center gap-1">
                        <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                        <span className="font-semibold text-text-primary text-xs">
                          {product.rating.toFixed(1)}
                        </span>
                      </div>
                    ) : (
                      <span className="text-text-tertiary font-medium">—</span>
                    )}
                  </td>

                  {/* Published Toggle Switch */}
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <Switch.Root
                      checked={product.published}
                      disabled={isUpdatingPublish || product.isSoftDeleted}
                      onCheckedChange={(checked) => onTogglePublish(product.productId, checked)}
                      aria-label={`Toggle published status for ${product.name}`}
                      className="relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden focus-visible:ring-2 focus-visible:ring-accent data-checked:bg-sky-600 data-unchecked:bg-slate-300 dark:data-unchecked:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Switch.Thumb className="pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out data-checked:translate-x-5 data-unchecked:translate-x-0" />
                    </Switch.Root>
                  </td>

                  {/* Actions Dropdown */}
                  <td className="py-3.5 pl-4 pr-6 text-right whitespace-nowrap">
                    <ProductTableActionsMenu
                      product={product}
                      isArchivedTab={isArchivedTab}
                      onArchive={onArchive}
                      onRestore={onRestore}
                      onDelete={onDelete}
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-5 py-3.5 border-t border-border-default bg-surface-subtle/40 dark:bg-surface/60">
        <span className="text-xs sm:text-sm text-text-secondary">
          Showing{' '}
          <span className="font-medium text-text-primary">
            {from}–{to}
          </span>{' '}
          of <span className="font-medium text-text-primary">{total}</span> products
        </span>

        <div className="flex items-center gap-2">
          <span className="text-xs text-text-tertiary">
            Page {page} of {totalPages}
          </span>

          <div className="flex items-center gap-1">
            {/* Prev Page Button */}
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => onPageChange(page - 1)}
              aria-label="Previous page"
              className="p-1.5 rounded-lg border border-border-default bg-surface dark:bg-surface-subtle hover:bg-surface-hover text-text-secondary hover:text-text-primary disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>

            {/* Page Numbers (when multiple pages) */}
            {totalPages > 1 ? (
              <>
                {getPageNumbers().map((p, idx) => {
                  if (typeof p === 'string') {
                    return (
                      <span
                        key={`ellipsis-${idx}`}
                        className="px-2 py-1 text-xs text-text-tertiary select-none"
                      >
                        ...
                      </span>
                    );
                  }
                  const isActive = p === page;
                  return (
                    <button
                      key={p}
                      type="button"
                      onClick={() => onPageChange(p)}
                      aria-label={`Page ${p}`}
                      aria-current={isActive ? 'page' : undefined}
                      className={`min-w-8 h-8 px-2 flex items-center justify-center rounded-lg text-xs sm:text-sm font-semibold transition-colors cursor-pointer ${
                        isActive
                          ? 'bg-surface-raised dark:bg-surface-raised text-text-primary border border-border-default shadow-xs'
                          : 'text-text-secondary hover:text-text-primary hover:bg-surface-hover'
                      }`}
                    >
                      {p}
                    </button>
                  );
                })}
              </>
            ) : null}

            {/* Next Page Button */}
            <button
              type="button"
              disabled={page >= totalPages}
              onClick={() => onPageChange(page + 1)}
              aria-label="Next page"
              className="p-1.5 rounded-lg border border-border-default bg-surface dark:bg-surface-subtle hover:bg-surface-hover text-text-secondary hover:text-text-primary disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
