import Link from 'next/link';

import { formatCheckoutPrice } from '../utils/checkout-price';

import { CheckoutItemImage } from './checkout-item-image';
import { CustomerOrderStatusBadge } from './customer-order-status';

import type { CustomerOrder, CustomerOrderStatus } from '../types/customer-order.types';

const itemStatuses = {
  pending: 'Order placed',
  processing: 'In progress',
  completed: 'Completed',
  cancelled: 'Cancelled',
} satisfies Record<CustomerOrder['items'][number]['status'], CustomerOrderStatus>;

export function CustomerOrderItems({ items }: { items: CustomerOrder['items'] }) {
  return (
    <div className="divide-y divide-border-control">
      {items.map((item) => (
        <article key={item.orderItemId} className="group relative flex gap-4 py-6 sm:gap-5 sm:py-8">
          {item.productSlug && (
            <Link
              href={`/products/${encodeURIComponent(item.productSlug)}`}
              aria-label={`View product: ${item.name}`}
              className="absolute inset-0 z-10 rounded-md focus-visible:outline-2 focus-visible:outline-border-focus"
            />
          )}
          <CheckoutItemImage src={item.imageUrl} name={item.name} />
          <div className="min-w-0 flex-1 space-y-4">
            <div className="flex flex-wrap items-start justify-between gap-x-5 gap-y-3">
              <div className="min-w-0 flex-1 space-y-3">
                <h3
                  className={`text-base font-medium leading-relaxed text-text-primary ${item.productSlug ? 'underline-offset-4 group-hover:underline group-focus-within:underline' : ''}`}
                >
                  {item.name}
                </h3>
                <CustomerOrderStatusBadge status={itemStatuses[item.status]} />
              </div>
              <dl className="w-full space-y-1 tabular-nums sm:w-auto sm:text-right">
                <dt className="text-xs text-text-tertiary">Subtotal</dt>
                <dd className="font-medium">{formatCheckoutPrice(item.subtotal)}</dd>
              </dl>
            </div>
            <dl className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-text-secondary tabular-nums">
              <div className="flex gap-2">
                <dt>Quantity</dt>
                <dd className="text-text-primary">{item.quantity}</dd>
              </div>
              <div className="flex flex-wrap gap-x-2">
                <dt>Unit price</dt>
                <dd className="text-text-primary">{formatCheckoutPrice(item.unitPrice)}</dd>
              </div>
            </dl>
          </div>
        </article>
      ))}
    </div>
  );
}
