import { LockKeyhole, Package } from 'lucide-react';
import Image from 'next/image';

import { formatOrderDateTime, formatOrderMoney } from '../lib/order-format';

import { AdminOrderStatus } from './admin-order-status';

import type { AdminOrderDetail } from '../schemas/admin-order.schema';

export function AdminOrderFulfillment({
  portion,
}: {
  portion: AdminOrderDetail['fulfillments'][number];
}) {
  return (
    <article className="border-t border-border-control pt-6">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold">{portion.vendorName}</h2>
          <p className="mt-1 text-sm text-text-secondary">
            {portion.items.length} {portion.items.length === 1 ? 'product' : 'products'}
          </p>
        </div>
        <AdminOrderStatus status={portion.status} />
      </header>
      {portion.completedAt && (
        <p className="mt-3 text-sm text-text-secondary">
          Marked complete by the seller /{' '}
          <time dateTime={portion.completedAt}>{formatOrderDateTime(portion.completedAt)}</time>
        </p>
      )}
      {portion.cancellation && (
        <div className="mt-5 rounded-lg border border-danger/30 bg-danger-subtle/40 p-4">
          <h3 className="text-sm font-medium text-danger">
            Cancelled by {portion.cancellation.source === 'customer' ? 'customer' : 'vendor'}
          </h3>
          <p className="mt-2 text-sm text-text-primary">{portion.cancellation.reason}</p>
          {portion.cancellation.cancelledAt && (
            <time
              dateTime={portion.cancellation.cancelledAt}
              className="mt-2 block text-xs text-text-secondary"
            >
              {formatOrderDateTime(portion.cancellation.cancelledAt)}
            </time>
          )}
        </div>
      )}
      <ul className="mt-3 divide-y divide-border-default">
        {portion.items.map((item) => (
          <li key={item.orderItemId} className="py-5">
            <div className="flex items-start gap-4">
              <div className="relative flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-border-default bg-surface-raised">
                {item.imageUrl ? (
                  <Image
                    src={item.imageUrl}
                    alt={item.productName}
                    fill
                    sizes="64px"
                    className="object-contain p-1"
                  />
                ) : (
                  <Package className="h-6 w-6 text-text-tertiary" strokeWidth={1.5} aria-hidden />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="text-sm font-medium leading-relaxed">{item.productName}</h3>
                <p className="mt-2 text-sm text-text-secondary">
                  {formatOrderMoney(item.unitPrice)} each
                </p>
                <p className="mt-1 text-sm text-text-secondary">Quantity: {item.quantity}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium tabular-nums">
                  {formatOrderMoney(item.subtotal)}
                </p>
                <p className="mt-1 text-xs text-text-tertiary">Subtotal</p>
              </div>
            </div>
            {item.cancellationReturnedQuantity !== null && (
              <dl
                aria-label={`Cancellation quantities for ${item.productName}`}
                className="mt-4 grid grid-cols-2 gap-4 rounded-lg border border-border-default bg-surface p-4 sm:grid-cols-4"
              >
                {[
                  { label: 'Ordered', value: item.quantity },
                  { label: 'Returned to stock', value: item.cancellationReturnedQuantity },
                  { label: 'Damaged', value: item.cancellationDamagedQuantity },
                  { label: 'Missing', value: item.cancellationMissingQuantity },
                ].map((record) => (
                  <div key={record.label}>
                    <dt className="text-xs text-text-secondary">{record.label}</dt>
                    <dd className="mt-1 text-sm font-medium tabular-nums">
                      {record.value ?? 'Not recorded'}
                    </dd>
                  </div>
                ))}
              </dl>
            )}
          </li>
        ))}
      </ul>
      <dl className="flex items-center justify-between gap-3 border-t border-border-default py-4 text-sm font-medium">
        <dt>Vendor portion total</dt>
        <dd className="tabular-nums">{formatOrderMoney(portion.total)}</dd>
      </dl>
      {portion.cancellation && (
        <section
          aria-label={`Internal cancellation record for ${portion.vendorName}`}
          className="mt-2 rounded-lg border border-border-control bg-surface p-4"
        >
          <h3 className="flex items-center gap-2 text-sm font-medium">
            <LockKeyhole className="h-4 w-4 text-text-secondary" aria-hidden />
            Internal cancellation record
          </h3>
          <p className="mt-2 text-xs text-text-secondary">Administrator access only</p>
          <dl className="mt-4 space-y-3 text-sm">
            <div>
              <dt className="text-xs text-text-secondary">Actor user ID</dt>
              <dd className="mt-1 break-all font-mono text-xs">
                {portion.cancelledByUserId || 'Not recorded'}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-text-secondary">Additional details</dt>
              <dd className="mt-1 whitespace-pre-wrap break-words leading-relaxed">
                {portion.cancellationDetails || 'No additional details provided'}
              </dd>
            </div>
          </dl>
          <p className="mt-4 text-xs text-text-secondary">
            These quantities record this cancellation. They are not a current damaged-stock balance.
          </p>
        </section>
      )}
    </article>
  );
}
