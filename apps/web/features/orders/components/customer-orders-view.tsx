'use client';

import { Package } from 'lucide-react';
import Link from 'next/link';

import { useCustomerOrders } from '../hooks/use-customer-orders';
import { formatCheckoutPrice } from '../utils/checkout-price';
import { customerOrdersHref } from '../utils/customer-orders-href';

import { CheckoutErrorPanel } from './checkout-error-panel';
import { CheckoutItemImage } from './checkout-item-image';
import { CustomerOrderFilters } from './customer-order-filters';
import { CustomerOrderStatusBadge } from './customer-order-status';
import { CustomerOrdersPagination } from './customer-orders-pagination';
import { CustomerSession } from './customer-session';

import type { CustomerOrderQuery } from '../schemas/customer-order-filters.schema';
import type { CustomerOrder } from '../types/customer-order.types';

export function CustomerOrdersView({ query }: { query: CustomerOrderQuery }) {
  return (
    <div className="mx-auto flex w-full flex-1 flex-col gap-8 px-4 py-8 sm:px-6 sm:py-10 lg:max-w-11/12 lg:px-8">
      <header className="space-y-3">
        <h1 className="text-3xl font-semibold">Your orders</h1>
        <p className="text-sm text-text-secondary">Review your purchases and order status</p>
      </header>
      <CustomerSession returnTo={customerOrdersHref(query)}>
        {(userId) => <OrderHistory key={userId} userId={userId} query={query} />}
      </CustomerSession>
    </div>
  );
}

function OrderHistory({ userId, query }: { userId: string | number; query: CustomerOrderQuery }) {
  const orders = useCustomerOrders(userId, query);
  return (
    <>
      <div className="flex flex-1 flex-col gap-8 lg:flex-row lg:items-stretch">
        <CustomerOrderFilters query={query} />
        <section aria-label="Order results" className="flex min-w-0 flex-1 flex-col gap-8">
          <OrderResults orders={orders} query={query} />
          {!orders.isError && !!orders.data?.items.length && (
            <CustomerOrdersPagination query={query} pagination={orders.data.pagination} />
          )}
        </section>
      </div>
    </>
  );
}

function OrderResults({
  orders,
  query,
}: {
  orders: ReturnType<typeof useCustomerOrders>;
  query: CustomerOrderQuery;
}) {
  if (orders.isPending)
    return (
      <p role="status" className="py-8 text-sm text-text-secondary">
        Loading orders...
      </p>
    );
  if (orders.isError)
    return (
      <CheckoutErrorPanel
        message="Could not load your orders. Try again."
        onRetry={() => void orders.refetch()}
      />
    );
  const { items } = orders.data;
  const filtered = !!(query.status || query.orderedFrom || query.orderedTo);
  if (!items.length)
    return (
      <section className="space-y-4 border-y border-border-control py-8">
        <Package className="h-6 w-6 text-text-tertiary" strokeWidth={1.5} aria-hidden="true" />
        <h2 className="text-xl font-semibold">
          {query.page > 1
            ? 'No orders on this page'
            : filtered
              ? 'No orders match these filters'
              : 'No orders here yet'}
        </h2>
        <p className="text-sm text-text-secondary">
          {query.page > 1
            ? 'Return to your latest orders to continue browsing'
            : filtered
              ? 'Try another status or date range'
              : 'Your placed orders will appear here'}
        </p>
        <Link
          href={
            query.page > 1
              ? customerOrdersHref({ ...query, page: 1 })
              : filtered
                ? '/orders'
                : '/cart'
          }
          className="inline-flex min-h-10 items-center text-sm font-medium text-accent underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-border-focus"
        >
          {query.page > 1 ? 'Back to latest orders' : filtered ? 'Clear filters' : 'Go to cart'}
        </Link>
      </section>
    );
  return (
    <>
      <table className="w-full table-fixed text-left text-sm">
        <caption className="sr-only">Your orders</caption>
        <thead className="hidden bg-border-strong text-sm font-medium text-text-primary sm:table-header-group">
          <tr className="border-b border-border-control">
            <th scope="col" className="w-5/12 px-4 py-3 font-medium">
              Order
            </th>
            <th scope="col" className="w-1/6 px-3 py-3 font-medium">
              Placed
            </th>
            <th scope="col" className="w-1/6 px-3 py-3 font-medium">
              Status
            </th>
            <th scope="col" className="w-1/4 px-4 py-3 text-right font-medium">
              Total
            </th>
          </tr>
        </thead>
        <tbody className="block sm:table-row-group">
          {items.map((order) => (
            <OrderRow key={order.orderId} order={order} />
          ))}
        </tbody>
      </table>
    </>
  );
}

function OrderRow({ order }: { order: CustomerOrder }) {
  const itemCount = order.items.reduce((sum, item) => sum + item.quantity, 0);
  const leadItem = order.items[0];
  const date = new Intl.DateTimeFormat('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: 'Asia/Kolkata',
  }).format(new Date(order.placedAt));
  return (
    <tr className="relative grid grid-cols-2 gap-3 border-b border-border-control px-4 py-3 transition-colors duration-150 hover:bg-surface-hover focus-within:bg-surface-hover sm:table-row sm:px-0 sm:py-0">
      <td className="col-span-2 min-w-0 sm:px-4 sm:py-3">
        <Link
          href={`/orders/${order.orderId}`}
          aria-label={`View order: ${leadItem?.name ?? 'Order'}, ${date}`}
          className="absolute inset-0 z-10 focus-visible:outline-2 focus-visible:outline-border-focus"
        />
        <div className="flex items-center gap-3">
          <div className="flex shrink-0 items-center gap-2">
            {order.items.slice(0, 2).map((item) => (
              <CheckoutItemImage key={item.orderItemId} src={item.imageUrl} name={item.name} />
            ))}
          </div>
          <div className="min-w-0 flex-1 space-y-1">
            {order.items.slice(0, 2).map((item) => (
              <h2
                key={item.orderItemId}
                title={item.name}
                className="truncate text-sm font-medium leading-snug"
              >
                {item.name}
              </h2>
            ))}
            {!order.items.length && <p className="text-sm text-text-secondary">Your order</p>}
            <p className="text-xs text-text-secondary">
              {itemCount} {itemCount === 1 ? 'item' : 'items'}
            </p>
          </div>
        </div>
      </td>
      <td className="align-middle sm:px-3 sm:py-3">
        <span className="mb-2 block text-xs text-text-secondary sm:hidden">Placed</span>
        <time dateTime={order.placedAt}>{date}</time>
      </td>
      <td className="text-right align-middle sm:px-3 sm:py-3 sm:text-left">
        <span className="mb-2 block text-xs text-text-secondary sm:hidden">Status</span>
        <CustomerOrderStatusBadge status={order.status} />
      </td>
      <td className="col-span-2 font-medium tabular-nums sm:px-4 sm:py-3 sm:text-right">
        <span className="mr-3 text-xs font-normal text-text-secondary sm:hidden">Total</span>
        {formatCheckoutPrice(order.total)}
      </td>
    </tr>
  );
}
