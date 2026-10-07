'use client';

import { ArrowRight, CheckCircle2, RotateCcw } from 'lucide-react';
import Link from 'next/link';

import type { BulkImportState } from '../../types/bulk-import.types';

interface BulkUploadCompletedProps {
  state: BulkImportState;
  onReset: () => void;
}

export function BulkUploadCompleted({ state, onReset }: BulkUploadCompletedProps) {
  return (
    <div className="flex flex-col items-center justify-center p-8 sm:p-12 rounded-2xl border border-border-default bg-surface dark:bg-surface-subtle text-center space-y-6 shadow-xs animate-in zoom-in-95 duration-200">
      <div className="h-20 w-20 rounded-full bg-success-subtle flex items-center justify-center text-success border border-success/30">
        <CheckCircle2 className="h-10 w-10" />
      </div>

      <div className="space-y-2 max-w-md">
        <h3 className="text-2xl font-bold tracking-tight text-text-primary">
          Bulk Import Completed!
        </h3>
        <p className="text-sm text-text-secondary">
          Successfully imported{' '}
          <strong className="text-text-primary font-bold">
            {state.importedRows.toLocaleString()} products
          </strong>{' '}
          into your catalog as drafts. You can now add images, edit pricing, or publish them.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-3">
        <Link
          href="/vendor/products"
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs sm:text-sm font-semibold bg-accent text-on-accent hover:bg-accent-hover shadow-xs transition-colors cursor-pointer"
        >
          <span>View Products</span>
          <ArrowRight className="h-4 w-4" />
        </Link>

        <button
          type="button"
          onClick={onReset}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-medium border border-border-default bg-surface hover:bg-surface-hover text-text-secondary hover:text-text-primary shadow-xs transition-colors cursor-pointer"
        >
          <RotateCcw className="h-4 w-4 text-text-tertiary" />
          <span>Upload Another File</span>
        </button>
      </div>
    </div>
  );
}
