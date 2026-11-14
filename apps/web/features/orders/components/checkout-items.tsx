import Link from 'next/link';

import { formatCheckoutPrice } from '../utils/checkout-price';

import { CheckoutItemImage } from './checkout-item-image';

import type { CheckoutLine } from '../types/customer-order.types';

export function CheckoutItems({
  lines,
  conflicts,
}: {
  lines: CheckoutLine[];
  conflicts: string[];
}) {
  const quantity = lines.reduce((sum, line) => sum + line.quantity, 0);
  return (
    <section
      aria-labelledby="checkout-items-heading"
      className="rounded-xl border border-border-subtle bg-surface-raised p-5 sm:p-6"
    >
      <div className="flex items-center justify-between gap-4">
        <h2 id="checkout-items-heading" className="text-lg font-semibold text-text-primary">
          Your items{' '}
          <span className="ml-1 text-sm font-normal text-text-tertiary">({quantity})</span>
        </h2>
        <Link
          href="/cart"
          className="text-sm text-text-secondary underline underline-offset-4 hover:text-text-primary"
        >
          Edit cart
        </Link>
      </div>
      {lines.length > 200 && (
        <p role="alert" className="mt-4 text-sm text-danger">
          Checkout supports up to 200 different products. Return to cart and remove extra products
          before placing this order.
        </p>
      )}
      {!lines.length && (
        <p className="mt-5 text-sm text-text-secondary">
          Your cart is empty.{' '}
          <Link href="/products" className="text-accent underline">
            Browse products
          </Link>
        </p>
      )}
      <ul className="mt-2 divide-y divide-border-subtle">
        {lines.map((line) => (
          <li key={line.productId} className="flex gap-4 py-5 last:pb-0 sm:gap-5">
            <CheckoutItemImage src={line.imageUrl} name={line.name} />
            <div className="min-w-0 flex-1">
              <h3 className="text-sm font-medium leading-relaxed text-text-primary sm:text-base">
                {line.name}
              </h3>
              <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-3 text-sm sm:grid-cols-3">
                <div>
                  <dt className="text-xs text-text-tertiary">Quantity</dt>
                  <dd className="mt-1 tabular-nums text-text-primary">{line.quantity}</dd>
                </div>
                <div className="text-right sm:text-left">
                  <dt className="text-xs text-text-tertiary">Unit price</dt>
                  <dd className="mt-1 tabular-nums text-text-secondary">
                    {formatCheckoutPrice(line.unitPrice)}
                  </dd>
                </div>
                <div className="col-span-2 flex items-baseline justify-between gap-2 sm:col-span-1 sm:block sm:text-right">
                  <dt className="text-xs text-text-tertiary">Subtotal</dt>
                  <dd className="mt-1 font-medium tabular-nums text-text-primary">
                    {formatCheckoutPrice(line.subtotal)}
                  </dd>
                </div>
              </dl>
              {!line.available && (
                <p className="mt-3 text-sm text-danger">
                  Only {line.stock} available. Update quantity in your cart.
                </p>
              )}
              {conflicts.includes(line.productId) && (
                <p className="mt-3 text-sm text-warning">
                  Price or availability changed. Review these details before placing your order
                  again.
                </p>
              )}
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
