'use client';

import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

import { Button } from '@/components/ui/button';

import { useAdminOrderDetail } from '../hooks/use-admin';
import { formatOrderDateTime, formatOrderMoney } from '../lib/order-format';

import { AdminOrderFulfillment } from './admin-order-fulfillment';
import { AdminOrderStatus } from './admin-order-status';

export function AdminOrderDetail({ orderId }: { orderId: string }) {
  const query = useAdminOrderDetail(orderId);
  if (query.isPending)
    return (
      <p role="status" className="py-12 text-sm text-text-secondary">
        Loading order...
      </p>
    );
  if (query.isError)
    return (
      <div role="alert" className="space-y-4 py-12">
        <h1 className="text-xl font-semibold">Could not load this order</h1>
        <p className="text-sm text-text-secondary">{query.error.message || 'Please try again'}</p>
        <div className="flex gap-4">
          <Button variant="outline" onClick={() => void query.refetch()}>
            Try again
          </Button>
          <Link href="/admin/orders" className="self-center text-sm text-accent underline">
            Back to orders
          </Link>
        </div>
      </div>
    );
  const order = query.data;
  return (
    <div className="space-y-8">
      <header className="space-y-5 border-b border-border-control pb-6">
        <Link
          href="/admin/orders"
          className="inline-flex items-center gap-2 text-sm text-text-secondary hover:text-text-primary"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to orders
        </Link>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0 space-y-3">
            <h1 className="text-2xl font-semibold sm:text-3xl">Order details</h1>
            <p className="break-all font-mono text-xs text-text-secondary">{order.orderNumber}</p>
            <p className="text-sm text-text-secondary">
              Placed <time dateTime={order.createdAt}>{formatOrderDateTime(order.createdAt)}</time>
            </p>
          </div>
          <div className="space-y-2">
            <p className="text-xs text-text-secondary">Order status</p>
            <AdminOrderStatus status={order.status} />
          </div>
        </div>
        <dl className="grid grid-cols-2 gap-6 pt-2 sm:grid-cols-3">
          <div className="col-span-2 sm:col-span-1">
            <dt className="text-xs text-text-secondary">Recorded order total</dt>
            <dd className="mt-2 text-2xl font-semibold tabular-nums">
              {formatOrderMoney(order.summary.total)}
            </dd>
            {order.summary.cancelledVendorCount > 0 && (
              <p className="mt-1 text-xs text-text-secondary">
                Original value, including cancelled items
              </p>
            )}
          </div>
          <div>
            <dt className="text-xs text-text-secondary">Items</dt>
            <dd className="mt-2 text-xl font-medium tabular-nums">{order.summary.itemCount}</dd>
          </div>
          <div>
            <dt className="text-xs text-text-secondary">Vendors</dt>
            <dd className="mt-2 text-xl font-medium tabular-nums">{order.summary.vendorCount}</dd>
          </div>
        </dl>
      </header>
      <div className="grid gap-10 lg:grid-cols-3">
        <section className="min-w-0 space-y-8 lg:col-span-2" aria-label="Vendor fulfillments">
          <div>
            <h2 className="text-base font-semibold">Vendor fulfillment</h2>
            <p className="mt-2 text-sm text-text-secondary">
              Each vendor manages its own portion of this order
            </p>
          </div>
          {order.fulfillments.length ? (
            order.fulfillments.map((portion) => (
              <AdminOrderFulfillment key={portion.vendorOrderId} portion={portion} />
            ))
          ) : (
            <p className="text-sm text-text-secondary">No vendor fulfillment record is available</p>
          )}
        </section>
        <aside className="space-y-8 lg:border-l lg:border-border-default lg:pl-8">
          <section>
            <h2 className="text-base font-semibold">Customer</h2>
            {order.customer ? (
              <>
                <p className="mt-4 text-sm font-medium">{order.customer.name}</p>
                <p className="mt-2 break-all text-sm text-text-secondary">{order.customer.email}</p>
              </>
            ) : (
              <p className="mt-3 text-sm text-text-secondary">Customer record unavailable</p>
            )}
          </section>
          <section className="border-t border-border-default pt-6">
            <h2 className="text-base font-semibold">Delivery address</h2>
            {order.deliveryAddress ? (
              <address className="mt-4 space-y-1 text-sm not-italic leading-relaxed text-text-secondary">
                <p className="font-medium text-text-primary">
                  {order.deliveryAddress.recipientName}
                </p>
                <p>{order.deliveryAddress.addressLine1}</p>
                {order.deliveryAddress.addressLine2 && <p>{order.deliveryAddress.addressLine2}</p>}
                <p>
                  {order.deliveryAddress.city}, {order.deliveryAddress.state}{' '}
                  {order.deliveryAddress.postalCode}
                </p>
                <p>{order.deliveryAddress.country}</p>
                <p className="pt-2">{order.deliveryAddress.phone}</p>
              </address>
            ) : (
              <p className="mt-3 text-sm text-text-secondary">No delivery address recorded</p>
            )}
          </section>
        </aside>
      </div>
    </div>
  );
}
