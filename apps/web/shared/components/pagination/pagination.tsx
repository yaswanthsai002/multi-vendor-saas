'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import * as React from 'react';

export interface PaginationProps {
  page: number;
  totalPages: number;
  totalItems?: number;
  limit?: number;
  onPageChange: (page: number) => void;
  showItemCount?: boolean;
  className?: string;
}

// ponytail: compute clean page number sequence with ellipsis for >7 total pages
function getPageNumbers(current: number, total: number): (number | 'ellipsis')[] {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  if (current <= 4) {
    return [1, 2, 3, 4, 5, 'ellipsis', total];
  }

  if (current >= total - 3) {
    return [1, 'ellipsis', total - 4, total - 3, total - 2, total - 1, total];
  }

  return [1, 'ellipsis', current - 1, current, current + 1, 'ellipsis', total];
}

export function Pagination({
  page,
  totalPages,
  totalItems,
  limit = 20,
  onPageChange,
  showItemCount = true,
  className = '',
}: PaginationProps) {
  if (totalPages <= 1 && (!totalItems || totalItems <= limit)) {
    return null;
  }

  const pageNumbers = getPageNumbers(page, totalPages);
  const startItem = (page - 1) * limit + 1;
  const endItem = totalItems !== undefined ? Math.min(page * limit, totalItems) : page * limit;

  return (
    <nav
      role="navigation"
      aria-label="Pagination Navigation"
      className={`flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-border-default text-xs text-text-secondary ${className}`}
    >
      {/* Item summary counter */}
      {showItemCount && totalItems !== undefined ? (
        <div>
          Showing <span className="font-medium text-text-primary">{startItem}</span> to{' '}
          <span className="font-medium text-text-primary">{endItem}</span> of{' '}
          <span className="font-medium text-text-primary">{totalItems}</span> items
        </div>
      ) : (
        <div />
      )}

      {/* Page navigation controls */}
      <div className="flex items-center gap-1.5 sm:gap-2">
        {/* Previous page */}
        <button
          type="button"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
          aria-label="Previous page"
          className="p-1.5 rounded-lg border border-border-default bg-surface dark:bg-surface-subtle hover:bg-surface-hover text-text-secondary hover:text-text-primary disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>

        {/* Numbered page buttons */}
        {totalPages > 1 ? (
          <div className="flex items-center gap-1">
            {pageNumbers.map((p, idx) => {
              if (p === 'ellipsis') {
                return (
                  <span
                    key={`ellipsis-${idx}`}
                    className="px-2 py-1 text-xs text-text-tertiary select-none"
                    aria-hidden="true"
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
                  className={`min-w-8 h-8 px-2 flex items-center justify-center rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                    isActive
                      ? 'bg-surface-raised dark:bg-surface-raised text-text-primary border border-border-default shadow-xs'
                      : 'text-text-secondary hover:text-text-primary hover:bg-surface-hover'
                  }`}
                >
                  {p}
                </button>
              );
            })}
          </div>
        ) : null}

        {/* Next page */}
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
    </nav>
  );
}
