import { Package } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

import { formatOrderDate, formatOrderMoney, shortOrderReference } from '../lib/order-format';

import { AdminOrderStatus } from './admin-order-status';

import type { AdminOrderItem } from '../schemas/admin-order.schema';

export function AdminOrdersTable({ orders }: { orders: AdminOrderItem[] }) {
  return (
    <table className="w-full table-fixed text-left text-sm">
      <caption className="sr-only">Marketplace orders</caption>
      <thead className="border-y border-border-control bg-surface-active text-text-secondary">
        <tr>
          <th scope="col" className="w-3/5 px-4 py-4 font-medium md:w-2/5">
            Order
          </th>
          <th scope="col" className="hidden px-4 py-4 font-medium lg:table-cell">
            Customer
          </th>
          <th scope="col" className="hidden px-4 py-4 font-medium md:table-cell">
            Placed
          </th>
          <th scope="col" className="hidden px-4 py-4 font-medium md:table-cell">
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
            key={order.orderId}
            className="relative transition-colors hover:bg-surface-active focus-within:bg-surface-active"
          >
            <td className="px-4 py-4 align-top">
              <div className="flex items-start gap-3">
                <div className="hidden shrink-0 gap-2 sm:flex">
                  {order.summary.previews.map((item, index) => (
                    <div
                      key={index}
                      className="relative flex h-10 w-10 items-center justify-center overflow-hidden rounded-md border border-border-default bg-surface-raised"
                    >
                      {item.imageUrl ? (
                        <Image
                          src={item.imageUrl}
                          alt={item.name}
                          fill
                          sizes="40px"
                          className="object-contain p-1"
                        />
                      ) : (
                        <Package
                          className="h-4 w-4 text-text-tertiary"
                          strokeWidth={1.5}
                          aria-hidden
                        />
                      )}
                    </div>
                  ))}
                </div>
                <div className="min-w-0">
                  <Link
                    href={`/admin/orders/${order.orderId}`}
                    aria-label={`View order ${order.orderNumber}`}
                    className="font-medium outline-none after:absolute after:inset-0 focus-visible:after:ring-2 focus-visible:after:ring-border-focus"
                  >
                    <span className="line-clamp-2 break-words">
                      {order.summary.previews.map((item) => item.name).join(', ') || 'Order items'}
                    </span>
                  </Link>
                  <p className="mt-1 text-xs text-text-secondary">
                    {order.summary.itemCount} {order.summary.itemCount === 1 ? 'item' : 'items'} /{' '}
                    {order.summary.vendorCount}{' '}
                    {order.summary.vendorCount === 1 ? 'vendor' : 'vendors'}
                    {order.summary.cancelledVendorCount > 0 &&
                      ` / ${order.summary.cancelledVendorCount} cancelled`}
                  </p>
                  <p
                    className="mt-2 font-mono text-xs text-text-tertiary"
                    title={order.orderNumber}
                  >
                    {shortOrderReference(order.orderNumber)}
                  </p>
                  <p className="mt-2 truncate text-xs text-text-secondary lg:hidden">
                    {order.customer.name}
                  </p>
                  <div className="mt-2 md:hidden">
                    <AdminOrderStatus status={order.status} />
                  </div>
                </div>
              </div>
            </td>
            <td className="hidden px-4 py-4 align-top lg:table-cell">
              <p className="truncate font-medium">{order.customer.name}</p>
              <p className="mt-1 truncate text-xs text-text-secondary">{order.customer.email}</p>
            </td>
            <td className="hidden px-4 py-4 align-top text-text-secondary md:table-cell">
              <time dateTime={order.createdAt}>{formatOrderDate(order.createdAt)}</time>
            </td>
            <td className="hidden px-4 py-4 align-top md:table-cell">
              <AdminOrderStatus status={order.status} />
            </td>
            <td className="px-4 py-4 text-right align-top font-medium tabular-nums">
              {formatOrderMoney(order.summary.total)}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
