import { ArrowLeft, ArrowRight } from 'lucide-react';
import Link from 'next/link';

import { customerOrdersHref } from '../utils/customer-orders-href';

import type { CustomerOrderQuery } from '../schemas/customer-order-filters.schema';
import type { CustomerOrderList } from '../types/customer-order.types';

import { Button } from '@/components/ui/button';

export function CustomerOrdersPagination({
  query,
  pagination,
}: {
  query: CustomerOrderQuery;
  pagination: CustomerOrderList['pagination'];
}) {
  const { page, limit, total, totalPages } = pagination;
  const pages = [...new Set([1, page - 1, page, page + 1, totalPages])]
    .filter((value) => value >= 1 && value <= totalPages)
    .sort((a, b) => a - b);
  const linkClass =
    'inline-flex h-10 min-w-10 items-center justify-center gap-2 rounded-lg border border-border-control px-3 text-sm transition-colors hover:bg-surface-hover focus-visible:outline-2 focus-visible:outline-border-focus';
  return (
    <div className="mt-auto flex flex-wrap items-center justify-between gap-4 border-t border-border-control pt-5">
      <p className="text-sm text-text-secondary tabular-nums">
        Showing {(page - 1) * limit + 1}&ndash;{Math.min(page * limit, total)} of {total}{' '}
        {total === 1 ? 'order' : 'orders'}
      </p>
      <nav aria-label="Order pages" className="flex flex-wrap items-center gap-2">
        {page > 1 ? (
          <Link
            aria-label="Previous page"
            className={linkClass}
            href={customerOrdersHref({ ...query, page: page - 1 })}
          >
            <ArrowLeft className="h-4 w-4" strokeWidth={1.5} aria-hidden="true" />
            <span className="sr-only sm:not-sr-only">Previous</span>
          </Link>
        ) : (
          <Button variant="outline" disabled aria-label="Previous page">
            <ArrowLeft className="h-4 w-4" strokeWidth={1.5} aria-hidden="true" />
            <span className="sr-only sm:not-sr-only">Previous</span>
          </Button>
        )}
        {pages.map((value, index) => (
          <span className="inline-flex items-center gap-2" key={value}>
            {index > 0 && value - pages[index - 1] > 1 && (
              <span aria-hidden="true" className="px-1 text-text-tertiary">
                &hellip;
              </span>
            )}
            <Link
              aria-label={`Page ${value}`}
              aria-current={value === page ? 'page' : undefined}
              href={customerOrdersHref({ ...query, page: value })}
              className={`${linkClass} ${value === page ? 'bg-surface-active font-medium text-text-primary' : 'text-text-secondary'}`}
            >
              {value}
            </Link>
          </span>
        ))}
        {page < totalPages ? (
          <Link
            aria-label="Next page"
            className={linkClass}
            href={customerOrdersHref({ ...query, page: page + 1 })}
          >
            <span className="sr-only sm:not-sr-only">Next</span>
            <ArrowRight className="h-4 w-4" strokeWidth={1.5} aria-hidden="true" />
          </Link>
        ) : (
          <Button variant="outline" disabled aria-label="Next page">
            <span className="sr-only sm:not-sr-only">Next</span>
            <ArrowRight className="h-4 w-4" strokeWidth={1.5} aria-hidden="true" />
          </Button>
        )}
      </nav>
    </div>
  );
}
