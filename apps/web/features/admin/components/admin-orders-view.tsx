'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { ChevronLeft, ChevronRight, Package, Search } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';

import { useAdminOrders } from '../hooks/use-admin';
import { adminOrderQuerySchema, type AdminOrderQuery } from '../schemas/admin-order.schema';

import { AdminOrdersTable } from './admin-orders-table';

const STATUS_OPTIONS: { value: AdminOrderQuery['status']; label: string }[] = [
  { value: 'all', label: 'All statuses' },
  { value: 'pending', label: 'Placed' },
  { value: 'confirmed', label: 'In progress' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
];

export function AdminOrdersView({ query }: { query: AdminOrderQuery }) {
  const router = useRouter();
  const result = useAdminOrders({
    page: query.page,
    limit: 20,
    search: query.search || undefined,
    status: query.status,
  });
  const form = useForm({
    resolver: zodResolver(adminOrderQuerySchema.pick({ search: true })),
    values: { search: query.search },
  });
  const filtered = Boolean(query.search || query.status !== 'all');
  const update = (changes: Partial<AdminOrderQuery>) => {
    const next = { ...query, ...changes };
    const params = new URLSearchParams();
    if (next.search) params.set('search', next.search);
    if (next.status !== 'all') params.set('status', next.status);
    if (next.page > 1) params.set('page', String(next.page));
    router.push(`/admin/orders${params.size ? `?${params}` : ''}`);
  };
  const data = result.data;
  return (
    <div className="flex min-h-144 flex-col gap-6">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold sm:text-3xl">Orders</h1>
        <p className="text-sm text-text-secondary">
          Review customer orders and the vendors responsible for each item
        </p>
      </header>
      <div className="flex flex-wrap items-end gap-4">
        <form
          role="search"
          aria-label="Search orders"
          onSubmit={form.handleSubmit(({ search }) => update({ search, page: 1 }))}
          className="min-w-48 flex-1"
        >
          <label
            htmlFor="admin-order-search"
            className="mb-2 block text-xs font-medium text-text-secondary"
          >
            Order or customer
          </label>
          <div className="flex gap-2">
            <div className="relative min-w-0 flex-1">
              <Search
                className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-text-tertiary"
                aria-hidden
              />
              <Input
                id="admin-order-search"
                type="search"
                maxLength={200}
                placeholder="Search order number, name or email"
                className="pl-9"
                {...form.register('search')}
              />
            </div>
            <Button type="submit" variant="outline">
              Search
            </Button>
          </div>
        </form>
        <div>
          <p className="mb-2 text-xs font-medium text-text-secondary">Order status</p>
          <Select
            aria-label="Order status"
            value={query.status}
            options={STATUS_OPTIONS}
            onValueChange={(status) => update({ status, page: 1 })}
            triggerClassName="h-10 min-w-40 text-sm"
          />
        </div>
        {filtered && (
          <Button variant="ghost" onClick={() => update({ search: '', status: 'all', page: 1 })}>
            Clear filters
          </Button>
        )}
      </div>
      {result.isError && (
        <div
          role="alert"
          className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border-control p-4 text-sm"
        >
          <p>
            Could not load orders
            {data
              ? '. The rows below are from the last successful request.'
              : '. Please try again.'}
          </p>
          <Button variant="outline" onClick={() => void result.refetch()}>
            Try again
          </Button>
        </div>
      )}
      <div className="flex-1" aria-busy={result.isFetching}>
        {result.isPending ? (
          <p
            role="status"
            className="border-y border-border-default py-12 text-center text-sm text-text-secondary"
          >
            Loading orders...
          </p>
        ) : data && !data.orders.length ? (
          <div className="border-y border-border-default py-16 text-center">
            <Package className="mx-auto mb-4 h-6 w-6 text-text-tertiary" strokeWidth={1.5} />
            <h2 className="text-base font-medium">No orders found</h2>
            <p className="mt-2 text-sm text-text-secondary">
              {filtered
                ? 'Change your search or clear the filters to see more orders'
                : 'Orders will appear here after checkout is complete'}
            </p>
          </div>
        ) : (
          data && (
            <>
              <p role="status" className="mb-3 text-sm text-text-secondary">
                {data.pagination.total.toLocaleString('en-IN')} {filtered ? 'matching ' : ''}
                {data.pagination.total === 1 ? 'order' : 'orders'}
              </p>
              <AdminOrdersTable orders={data.orders} />
            </>
          )
        )}
      </div>
      {data && data.pagination.total > 0 && (
        <nav
          aria-label="Order pages"
          className="flex flex-wrap items-center justify-between gap-4 border-t border-border-default pt-5 text-sm text-text-secondary"
        >
          <p>
            Showing{' '}
            {Math.min(
              (data.pagination.page - 1) * data.pagination.limit + 1,
              data.pagination.total,
            )}{' '}
            to {Math.min(data.pagination.page * data.pagination.limit, data.pagination.total)} of{' '}
            {data.pagination.total} orders
          </p>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              disabled={data.pagination.page <= 1 || result.isFetching}
              onClick={() => update({ page: data.pagination.page - 1 })}
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>
            <span className="tabular-nums">
              {data.pagination.page} / {data.pagination.totalPages}
            </span>
            <Button
              variant="outline"
              disabled={data.pagination.page >= data.pagination.totalPages || result.isFetching}
              onClick={() => update({ page: data.pagination.page + 1 })}
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </nav>
      )}
    </div>
  );
}
