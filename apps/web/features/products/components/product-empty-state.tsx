'use client';

import { PackageOpen, Plus, SearchX, UploadCloud } from 'lucide-react';
import Link from 'next/link';

interface ProductEmptyStateProps {
  isFiltered?: boolean;
  onClearFilters?: () => void;
}

export function ProductEmptyState({ isFiltered = false, onClearFilters }: ProductEmptyStateProps) {
  if (isFiltered) {
    return (
      <div className="flex flex-col items-center justify-center p-12 sm:p-16 text-center rounded-2xl border border-dashed border-border-default bg-surface/50 dark:bg-surface-subtle/30">
        <div className="flex items-center justify-center h-14 w-14 rounded-2xl bg-surface-subtle dark:bg-surface border border-border-default text-text-tertiary mb-4">
          <SearchX className="h-7 w-7 stroke-[1.75]" />
        </div>
        <h3 className="text-base sm:text-lg font-semibold text-text-primary tracking-tight">
          No products found
        </h3>
        <p className="text-xs sm:text-sm text-text-secondary max-w-sm mt-1.5 mb-6">
          No products match your current search query or applied filters. Try adjusting or clearing
          them.
        </p>
        {onClearFilters ? (
          <button
            type="button"
            onClick={onClearFilters}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-medium border border-border-default bg-surface dark:bg-surface-subtle hover:bg-surface-hover text-text-primary transition-colors cursor-pointer"
          >
            Clear filters
          </button>
        ) : null}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center p-12 sm:p-16 text-center rounded-2xl border border-dashed border-border-default bg-surface/50 dark:bg-surface-subtle/30">
      <div className="flex items-center justify-center h-14 w-14 rounded-2xl bg-surface-subtle dark:bg-surface border border-border-default text-text-tertiary mb-4">
        <PackageOpen className="h-7 w-7 stroke-[1.75]" />
      </div>
      <h3 className="text-base sm:text-lg font-semibold text-text-primary tracking-tight">
        No products yet
      </h3>
      <p className="text-xs sm:text-sm text-text-secondary max-w-sm mt-1.5 mb-6">
        Start building your store catalog by creating your first product or uploading an existing
        inventory sheet.
      </p>
      <div className="flex items-center gap-3 flex-wrap justify-center">
        <Link
          href="/vendor/products/bulk-upload"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-medium border border-border-default bg-surface dark:bg-surface-subtle hover:bg-surface-hover text-text-primary transition-colors cursor-pointer"
        >
          <UploadCloud className="h-4 w-4 text-text-secondary" />
          <span>Bulk upload products</span>
        </Link>
        <Link
          href="/vendor/products/new"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-accent text-on-accent hover:bg-accent/90 transition-colors shadow-xs cursor-pointer"
        >
          <Plus className="h-4 w-4 stroke-[2.5]" />
          <span>Create product</span>
        </Link>
      </div>
    </div>
  );
}
