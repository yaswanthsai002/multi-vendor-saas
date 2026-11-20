import { Inbox } from 'lucide-react';
import Link from 'next/link';

import { Button } from '@/components/ui/button';

import { formatCheckoutPrice } from '../utils/checkout-price';

import { OrderStatusBadge } from './order-status-badge';

import type { VendorOrderListItem } from '../types/order.types';

export function OrdersTable({
  orders,
  onResetFilters,
  hasFilters,
}: {
  orders: VendorOrderListItem[];
  onResetFilters?: () => void;
  hasFilters?: boolean;
}) {
  if (!orders.length)
    return (
      <div className="border-y border-border-default py-16 text-center">
        <Inbox className="mx-auto mb-4 h-6 w-6 text-text-tertiary" strokeWidth={1.5} />
        <h2 className="text-base font-medium">No orders found</h2>
        <p className="mt-2 text-sm text-text-secondary">
          {hasFilters
            ? 'Change your search or clear the filters to see more orders'
            : 'Customer orders will appear here when checkout is complete'}
        </p>
        {hasFilters && (
          <Button variant="outline" onClick={onResetFilters} className="mt-5">
            Reset filters
          </Button>
        )}
      </div>
    );
  return (
    <table className="w-full table-fixed text-left text-sm">
      <caption className="sr-only">Vendor orders</caption>
      <thead className="border-y border-border-control bg-surface-active text-text-secondary">
        <tr>
          <th scope="col" className="w-3/5 px-4 py-4 font-medium sm:w-2/5">
            Order
          </th>
          <th scope="col" className="hidden px-4 py-4 font-medium lg:table-cell">
            Customer
          </th>
          <th scope="col" className="hidden px-4 py-4 font-medium sm:table-cell">
            Placed
          </th>
          <th scope="col" className="hidden px-4 py-4 font-medium sm:table-cell">
            Status
          </th>
          <th scope="col" className="px-4 py-4 text-right font-medium">
            Total
          </th>
        </tr>
      </thead>
      <tbody className="divide-y divide-border-default">
        {orders.map((order) => (
          <tr
            key={order.vendorOrderId}
            className="group relative transition-colors hover:bg-surface-active focus-within:bg-surface-active"
          >
            <td className="px-4 py-4 align-top">
              <Link
                href={`/vendor/orders/${order.vendorOrderId}`}
                className="font-medium text-text-primary outline-none after:absolute after:inset-0 focus-visible:after:ring-2 focus-visible:after:ring-border-focus"
                aria-label={`View order ${order.orderNumber}`}
              >
                <span className="line-clamp-2 break-words">
                  {order.summary.items.map((item) => item.name).join(', ') || 'Order items'}
                </span>
              </Link>
              <p className="mt-1 text-xs text-text-secondary">
                {order.itemCount} {order.itemCount === 1 ? 'item' : 'items'}
                {order.summary.productCount > 2
                  ? ` / +${order.summary.productCount - 2} more products`
                  : ''}
              </p>
              <p className="mt-2 font-mono text-xs text-text-tertiary" title={order.orderNumber}>
                #{order.orderNumber.replace(/^PG-/, '').slice(0, 8).toUpperCase()}
              </p>
              <div className="mt-2 sm:hidden">
                <OrderStatusBadge status={order.status} />
              </div>
            </td>
            <td className="hidden px-4 py-4 align-top lg:table-cell">
              <p className="truncate font-medium">{order.customer.name || 'Customer'}</p>
              <p className="mt-1 truncate text-xs text-text-secondary">{order.customer.email}</p>
            </td>
            <td className="hidden px-4 py-4 align-top text-text-secondary sm:table-cell">
              <time dateTime={order.placedAt}>
                {new Date(order.placedAt).toLocaleDateString('en-IN', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                })}
              </time>
            </td>
            <td className="hidden px-4 py-4 align-top sm:table-cell">
              <OrderStatusBadge status={order.status} />
            </td>
            <td className="break-words px-4 py-4 text-right align-top font-medium tabular-nums">
              {formatCheckoutPrice(order.total)}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
