'use client';

import { Dialog } from '@base-ui-components/react/dialog';
import { ArrowLeft, CircleCheck, CircleX } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { toast } from 'sonner';

import { useCancelCustomerOrder, useCustomerOrder } from '../hooks/use-customer-orders';
import { formatCheckoutPrice } from '../utils/checkout-price';

import { CheckoutErrorPanel } from './checkout-error-panel';
import { CustomerOrderItems } from './customer-order-items';
import { CustomerOrderProgress } from './customer-order-progress';
import { CustomerSession } from './customer-session';

import { Button } from '@/components/ui/button';
import { ApiError } from '@/lib/api-client';

export function CustomerOrderDetail({
  orderId,
  confirmed = false,
}: {
  orderId: string;
  confirmed?: boolean;
}) {
  return (
    <div className="mx-auto w-full space-y-8 px-4 py-8 sm:px-6 sm:py-10 lg:max-w-11/12 lg:px-8">
      <Link
        href="/orders"
        className="inline-flex items-center gap-2 text-sm text-text-secondary transition-colors hover:text-text-primary focus-visible:outline-2 focus-visible:outline-border-focus"
      >
        <ArrowLeft className="h-4 w-4" strokeWidth={1.5} aria-hidden="true" />
        Back to orders
      </Link>
      <CustomerSession returnTo={`/orders/${orderId}`}>
        {(userId) => (
          <OrderDetail key={userId} userId={userId} orderId={orderId} confirmed={confirmed} />
        )}
      </CustomerSession>
    </div>
  );
}

function OrderDetail({
  userId,
  orderId,
  confirmed,
}: {
  userId: string | number;
  orderId: string;
  confirmed: boolean;
}) {
  const query = useCustomerOrder(userId, orderId);
  const cancel = useCancelCustomerOrder(userId);
  const [open, setOpen] = useState(false);
  if (query.isPending) return <p role="status">Loading order…</p>;
  if (query.isError)
    return (
      <CheckoutErrorPanel
        message="Could not load this order. It may be unavailable or belong to another account."
        onRetry={() => void query.refetch()}
        backHref="/orders"
        backLabel="Back to orders"
      />
    );
  const order = query.data;
  const itemCount = order.items.reduce((count, item) => count + item.quantity, 0);
  return (
    <Dialog.Root
      open={open}
      onOpenChange={(value) => {
        if (!cancel.isPending) {
          setOpen(value);
          if (value) cancel.reset();
        }
      }}
    >
      <header className="space-y-4 border-b border-border-control pb-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0 space-y-3">
            <h1 className="text-2xl font-semibold text-text-primary sm:text-3xl">Order details</h1>
            <p className="break-all text-sm text-text-secondary">
              Order ID <span className="font-mono text-text-primary">{order.orderNumber}</span>
            </p>
          </div>
          {order.canCancel && (
            <Dialog.Trigger
              render={
                <Button
                  variant="outline"
                  className="gap-2 border-danger/30 text-danger hover:bg-danger-subtle focus-visible:outline-2 focus-visible:outline-border-focus"
                />
              }
            >
              <CircleX className="h-4 w-4" strokeWidth={1.5} aria-hidden="true" />
              Cancel whole order
            </Dialog.Trigger>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-x-6 gap-y-3 text-sm">
          <p className="text-text-secondary">
            Order date{' '}
            <time className="font-medium text-text-primary" dateTime={order.placedAt}>
              {new Intl.DateTimeFormat('en-IN', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              }).format(new Date(order.placedAt))}
            </time>
          </p>
          {confirmed && order.status === 'Order placed' && (
            <p role="status" className="flex items-center gap-2 text-success">
              <CircleCheck className="h-4 w-4" strokeWidth={1.5} aria-hidden="true" />
              Your order is confirmed
            </p>
          )}
        </div>
      </header>
      <div className="grid lg:grid-cols-3">
        <div className="min-w-0 lg:col-span-2 lg:pr-8">
          <section aria-labelledby="order-items-heading" className="pt-8">
            <div className="flex items-center justify-between gap-4">
              <h2 id="order-items-heading" className="text-lg font-medium">
                Your items
              </h2>
              <span className="text-sm text-text-tertiary">
                {itemCount} {itemCount === 1 ? 'item' : 'items'}
              </span>
            </div>
            <CustomerOrderItems items={order.items} />
          </section>
          <div className="grid gap-8 border-t border-border-control py-8 sm:grid-cols-2">
            <section aria-labelledby="delivery-address-heading" className="min-w-0 space-y-4">
              <h2 id="delivery-address-heading" className="text-lg font-medium">
                Delivery address
              </h2>
              {order.address ? (
                <address className="space-y-3 break-words text-sm leading-relaxed not-italic">
                  <p className="font-medium text-text-primary">{order.address.recipientName}</p>
                  <div className="text-text-secondary">
                    <p>{order.address.addressLine1}</p>
                    {order.address.addressLine2 && <p>{order.address.addressLine2}</p>}
                    <p>
                      {order.address.city}, {order.address.state} {order.address.postalCode}
                    </p>
                    <p>{order.address.country === 'IN' ? 'India' : order.address.country}</p>
                  </div>
                  <p className="text-text-secondary">{order.address.phone}</p>
                </address>
              ) : (
                <p className="text-sm text-text-secondary">
                  Delivery address unavailable for this order
                </p>
              )}
            </section>
            <section aria-labelledby="order-summary-heading" className="space-y-4">
              <h2 id="order-summary-heading" className="text-lg font-medium">
                Order summary
              </h2>
              <dl className="space-y-4 text-sm tabular-nums">
                <div className="flex justify-between gap-4 text-text-secondary">
                  <dt>Items</dt>
                  <dd>{itemCount}</dd>
                </div>
                <div className="flex flex-wrap items-baseline justify-between gap-3 border-t border-border-control pt-4">
                  <dt className="font-medium">Order total</dt>
                  <dd className="text-xl font-semibold">{formatCheckoutPrice(order.total)}</dd>
                </div>
              </dl>
            </section>
          </div>
        </div>
        <CustomerOrderProgress
          status={order.status}
          placedAt={order.placedAt}
          items={order.items}
        />
      </div>
      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 z-50 bg-black/50" />
        <Dialog.Popup className="fixed inset-x-4 top-1/2 z-50 mx-auto max-w-md -translate-y-1/2 space-y-4 rounded-xl bg-surface-raised p-6 text-text-primary shadow-xl">
          <Dialog.Title className="text-xl font-semibold">Cancel this order?</Dialog.Title>
          <Dialog.Description>
            All remaining items will be cancelled. Cancellation is unavailable if any vendor has
            completed its portion.
          </Dialog.Description>
          {cancel.isError && (
            <p role="alert" className="text-danger">
              {cancel.error instanceof ApiError
                ? cancel.error.message
                : 'Could not cancel this order. Try again or refresh order details.'}
            </p>
          )}
          <div className="flex flex-wrap gap-3">
            <Dialog.Close disabled={cancel.isPending} render={<Button variant="outline" />}>
              Keep order
            </Dialog.Close>
            <Button
              disabled={cancel.isPending}
              onClick={async () => {
                try {
                  await cancel.mutateAsync(orderId);
                  setOpen(false);
                  toast.success('Order cancelled.');
                } catch {
                  /* Keep the dialog and safe error visible for another attempt. */
                }
              }}
            >
              {cancel.isPending ? 'Cancelling…' : 'Confirm cancellation'}
            </Button>
          </div>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
