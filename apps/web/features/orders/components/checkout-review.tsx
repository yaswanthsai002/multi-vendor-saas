'use client';

import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { Controller } from 'react-hook-form';

import { useCheckout } from '../hooks/use-checkout';
import { formatCheckoutPrice } from '../utils/checkout-price';

import { CheckoutAddress } from './checkout-address';
import { CheckoutErrorPanel } from './checkout-error-panel';
import { CheckoutItems } from './checkout-items';
import { CustomerSession } from './customer-session';

import { Button } from '@/components/ui/button';

export function CheckoutReviewPage() {
  return (
    <main className="mx-auto max-w-6xl space-y-6 px-4 py-8 text-text-primary sm:px-6 sm:py-10">
      <CustomerSession returnTo="/checkout">
        {(userId) => <CheckoutReviewForm key={userId} userId={userId} />}
      </CustomerSession>
    </main>
  );
}

function CheckoutReviewForm({ userId }: { userId: string | number }) {
  const { review, data, place, form, addressId, pending, ready, storageError, conflicts, confirm } =
    useCheckout(userId);
  const quantity = data?.lines.reduce((sum, line) => sum + line.quantity, 0) ?? 0;
  const invalidReview =
    !data?.lines.length ||
    data.lines.length > 200 ||
    data.lines.some((line) => !line.available) ||
    data.addresses.find((address) => address.addressId === addressId)?.country !== 'IN';
  return (
    <>
      <header>
        <Link
          href="/cart"
          className="inline-flex items-center gap-2 text-sm text-text-secondary transition-colors hover:text-text-primary"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Back to cart
        </Link>
        <h1 className="mt-4 text-2xl font-semibold sm:text-3xl">Review your order</h1>
        <p className="mt-2 text-sm text-text-secondary">
          Check your delivery address and items before placing your order
        </p>
      </header>
      {!data && review.isPending ? (
        <p role="status">Loading checkout...</p>
      ) : !data && review.isError ? (
        <CheckoutErrorPanel
          message="Could not load checkout. Your cart is saved."
          onRetry={() => void review.refetch()}
        />
      ) : (
        data && (
          <form
            className="grid items-start gap-6 lg:grid-cols-3"
            onSubmit={(event) => {
              if (pending) {
                event.preventDefault();
                void confirm({ addressId: pending.request.addressId });
              } else void form.handleSubmit(confirm)(event);
            }}
          >
            <fieldset
              disabled={place.isPending || Boolean(pending)}
              className="min-w-0 space-y-6 lg:col-span-2"
            >
              <legend className="sr-only">Order review</legend>
              <Controller
                name="addressId"
                control={form.control}
                render={({ field }) => (
                  <CheckoutAddress
                    addresses={data.addresses}
                    value={field.value}
                    onChange={field.onChange}
                    error={form.formState.errors.addressId?.message}
                    retrying={Boolean(pending)}
                  />
                )}
              />
              <CheckoutItems lines={data.lines} conflicts={conflicts} />
            </fieldset>
            <aside className="min-w-0 rounded-xl border border-border-subtle bg-surface-raised p-5 sm:p-6 lg:sticky lg:top-24">
              <h2 className="text-lg font-semibold">Order summary</h2>
              <dl className="mt-5 space-y-4 text-sm">
                <div className="flex items-center justify-between gap-4 text-text-secondary">
                  <dt>Items ({quantity})</dt>
                  <dd className="tabular-nums">{formatCheckoutPrice(data.total)}</dd>
                </div>
                <div className="flex items-baseline justify-between gap-4 border-t border-border-default pt-4">
                  <dt className="font-medium">Subtotal</dt>
                  <dd className="text-xl font-semibold tabular-nums sm:text-2xl">
                    {formatCheckoutPrice(data.total)}
                  </dd>
                </div>
              </dl>
              <Button
                type="submit"
                size="lg"
                className="mt-6 w-full"
                disabled={
                  !ready ||
                  storageError ||
                  place.isPending ||
                  (!pending && (review.isFetching || Boolean(invalidReview)))
                }
                isLoading={place.isPending}
              >
                {place.isPending ? 'Placing order...' : 'Place order'}
              </Button>
              <p className="mt-3 text-center text-xs leading-relaxed text-text-tertiary">
                No payment is collected for this order
              </p>
            </aside>
          </form>
        )
      )}
    </>
  );
}
