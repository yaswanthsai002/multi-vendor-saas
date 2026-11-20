import { Package } from 'lucide-react';
import Image from 'next/image';

import { formatCheckoutPrice } from '../utils/checkout-price';

import type { OrderItemDetail } from '../types/order.types';

export function OrderItemsTable({ items }: { items: OrderItemDetail[] }) {
  return (
    <section aria-label="Order items">
      <div className="flex items-center justify-between border-b border-border-control pb-4">
        <h2 className="text-base font-semibold">Items</h2>
        <span className="text-sm text-text-secondary">
          {items.length} {items.length === 1 ? 'product' : 'products'}
        </span>
      </div>
      <ul className="divide-y divide-border-default">
        {items.map((item) => (
          <li key={item.orderItemId} className="flex items-start gap-4 py-5">
            <div className="relative flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-border-default bg-surface-raised">
              {item.productImageUrl ? (
                <Image
                  src={item.productImageUrl}
                  alt={item.productName}
                  fill
                  sizes="64px"
                  className="object-contain p-1"
                />
              ) : (
                <Package className="h-6 w-6 text-text-tertiary" strokeWidth={1.5} />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="text-sm font-medium leading-relaxed">{item.productName}</h3>
              <p className="mt-2 text-sm text-text-secondary">
                {formatCheckoutPrice(item.unitPrice)} each
              </p>
              <p className="mt-1 text-sm text-text-secondary">Quantity: {item.quantity}</p>
            </div>
            <div className="shrink-0 text-right">
              <p className="text-sm font-medium tabular-nums">
                {formatCheckoutPrice(item.subtotal)}
              </p>
              <p className="mt-1 text-xs text-text-tertiary">Subtotal</p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
