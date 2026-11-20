'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';

import { Button } from '@/components/ui/button';

import type { VendorOrdersPagination } from '../types/order.types';

export function OrderPagination({
  pagination,
  onPageChange,
}: {
  pagination: VendorOrdersPagination;
  onPageChange: (page: number) => void;
}) {
  const { page, totalPages, total, limit } = pagination;
  if (!total) return null;
  return (
    <nav
      aria-label="Order pages"
      className="mt-auto flex flex-wrap items-center justify-between gap-4 border-t border-border-default pt-5 text-sm text-text-secondary"
    >
      <p>
        Showing {Math.min((page - 1) * limit + 1, total)} to {Math.min(page * limit, total)} of{' '}
        {total} orders
      </p>
      <div className="flex items-center gap-3">
        <Button
          variant="outline"
          aria-label="Previous Page"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
        >
          <ChevronLeft className="h-4 w-4" />
          Previous
        </Button>
        <span className="tabular-nums">
          {page} / {totalPages}
        </span>
        <Button
          variant="outline"
          aria-label="Next Page"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
        >
          Next
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </nav>
  );
}
