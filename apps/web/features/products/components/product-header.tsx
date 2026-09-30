'use client';

import { Plus, UploadCloud } from 'lucide-react';
import Link from 'next/link';

export function ProductHeader() {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-text-primary">Products</h1>
        <p className="text-sm text-text-secondary mt-1">
          Manage your product catalog and inventory.
        </p>
      </div>

      <div className="flex items-center gap-3 shrink-0">
        <Link
          href="/vendor/products/bulk-upload"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-medium border border-border-default bg-surface dark:bg-surface-subtle hover:bg-surface-hover text-text-primary shadow-xs transition-colors cursor-pointer"
        >
          <UploadCloud className="h-4 w-4 text-text-secondary" />
          <span>Bulk upload products</span>
        </Link>

        <Link
          href="/vendor/products/new"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-accent text-on-accent hover:bg-accent/90 shadow-xs transition-colors cursor-pointer"
        >
          <Plus className="h-4 w-4 stroke-[2.5]" />
          <span>Create product</span>
        </Link>
      </div>
    </div>
  );
}
