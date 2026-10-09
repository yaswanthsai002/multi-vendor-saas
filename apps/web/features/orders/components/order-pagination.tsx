'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import * as React from 'react';

import type { VendorOrdersPagination } from '../types/order.types';

interface OrderPaginationProps {
  pagination: VendorOrdersPagination;
  onPageChange: (page: number) => void;
}

export function OrderPagination({ pagination, onPageChange }: OrderPaginationProps) {
  const { page, totalPages, total, limit } = pagination;

  if (total === 0) return null;

  const startItem = (page - 1) * limit + 1;
  const endItem = Math.min(page * limit, total);

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 py-3 px-1 text-xs sm:text-sm text-text-secondary">
      <div>
        Showing <span className="font-semibold text-text-primary">{startItem}</span> to{' '}
        <span className="font-semibold text-text-primary">{endItem}</span> of{' '}
        <span className="font-semibold text-text-primary">{total}</span> orders
      </div>

      <div className="flex items-center gap-1.5">
        <button
          type="button"
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          aria-label="Previous Page"
          className="p-1.5 rounded-lg border border-border-default bg-surface-raised dark:bg-surface-raised text-text-primary disabled:opacity-40 disabled:cursor-not-allowed hover:bg-surface-hover transition-colors cursor-pointer"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>

        <span className="px-3 py-1 text-xs font-semibold text-text-primary">
          Page {page} of {totalPages}
        </span>

        <button
          type="button"
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
          aria-label="Next Page"
          className="p-1.5 rounded-lg border border-border-default bg-surface-raised dark:bg-surface-raised text-text-primary disabled:opacity-40 disabled:cursor-not-allowed hover:bg-surface-hover transition-colors cursor-pointer"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
