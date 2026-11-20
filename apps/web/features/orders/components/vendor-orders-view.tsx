'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import * as React from 'react';

import { Button } from '@/components/ui/button';

import { useVendorOrders } from '../hooks/use-orders';

import { OrderPagination } from './order-pagination';
import { OrdersFilters } from './orders-filters';
import { OrdersHeader } from './orders-header';
import { OrdersTable } from './orders-table';
import { OrdersTableSkeleton } from './orders-table-skeleton';
import { OrdersTabs } from './orders-tabs';

import type { OrderSortOption, OrderStatusFilter, VendorOrdersFilters } from '../types/order.types';

export function VendorOrdersView() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Read state from URL query params
  const statusParam = (searchParams.get('status') as OrderStatusFilter) || 'all';
  const pageParam = parseInt(searchParams.get('page') || '1', 10);
  const searchParam = searchParams.get('search') || '';
  const dateFromParam = searchParams.get('dateFrom') || undefined;
  const dateToParam = searchParams.get('dateTo') || undefined;
  const sortParam = (searchParams.get('sort') as OrderSortOption) || 'newest';

  const [search, setSearch] = React.useState(searchParam);

  const updateQuery = React.useCallback(
    (newParams: Partial<VendorOrdersFilters>) => {
      const params = new URLSearchParams(searchParams.toString());

      Object.entries(newParams).forEach(([key, val]) => {
        if (
          val === undefined ||
          val === null ||
          val === '' ||
          (key === 'status' && val === 'all')
        ) {
          params.delete(key);
        } else {
          params.set(key, String(val));
        }
      });

      router.push(`/vendor/orders?${params.toString()}`);
    },
    [router, searchParams],
  );

  // Debounce search update to URL
  React.useEffect(() => {
    const timer = setTimeout(() => {
      if (search !== searchParam) {
        updateQuery({ search: search || undefined, page: 1 });
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [search, searchParam, updateQuery]);

  const queryFilters: VendorOrdersFilters = {
    page: pageParam,
    limit: 20,
    status: statusParam,
    search: searchParam || undefined,
    dateFrom: dateFromParam,
    dateTo: dateToParam,
    sort: sortParam,
  };

  const { data, isLoading, isError, refetch } = useVendorOrders(queryFilters);

  const hasActiveFilters = Boolean(
    statusParam !== 'all' || searchParam || dateFromParam || dateToParam || sortParam !== 'newest',
  );

  const handleResetFilters = () => {
    setSearch('');
    router.push('/vendor/orders');
  };

  return (
    <div className="space-y-6">
      <OrdersHeader />
      <OrdersTabs
        activeTab={statusParam}
        counts={data?.statusCounts}
        onTabChange={(newTab) => updateQuery({ status: newTab, page: 1 })}
      >
        <OrdersFilters
          search={search}
          onSearchChange={setSearch}
          dateFrom={dateFromParam}
          dateTo={dateToParam}
          onDateChange={({ dateFrom, dateTo }) => updateQuery({ dateFrom, dateTo, page: 1 })}
          sort={sortParam}
          onSortChange={(newSort) => updateQuery({ sort: newSort, page: 1 })}
          onReset={handleResetFilters}
          hasActiveFilters={hasActiveFilters}
        />
        {isError && (
          <div
            role="alert"
            className="flex items-center justify-between gap-4 border border-border-control p-4 text-sm"
          >
            <p>Could not load orders. Please try again.</p>
            <Button variant="outline" onClick={() => void refetch()}>
              Try again
            </Button>
          </div>
        )}
        {isLoading ? (
          <OrdersTableSkeleton rows={8} />
        ) : isError && !data ? null : (
          <>
            <div className="flex-1">
              <OrdersTable
                orders={data?.items ?? []}
                onResetFilters={handleResetFilters}
                hasFilters={hasActiveFilters}
              />
            </div>

            {data?.pagination && (
              <OrderPagination
                pagination={data.pagination}
                onPageChange={(newPage) => updateQuery({ page: newPage })}
              />
            )}
          </>
        )}
      </OrdersTabs>
    </div>
  );
}
