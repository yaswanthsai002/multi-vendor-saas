'use client';

import { ArrowLeft, Check, CircleX, PackageCheck } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

import { Button } from '@/components/ui/button';

import {
  useReadOpenedOrderNotifications,
  useUpdateOrderStatus,
  useVendorOrderDetail,
} from '../hooks/use-orders';

import { OrderActionDialog } from './order-action-dialog';
import { OrderCustomerCard } from './order-customer-card';
import { OrderDeliveryCard } from './order-delivery-card';
import { OrderItemsTable } from './order-items-table';
import { OrderStatusBadge } from './order-status-badge';
import { OrderStepper } from './order-stepper';
import { OrderSummaryCard } from './order-summary-card';
import { VendorCancellationSummary } from './vendor-cancellation-summary';

import type { UpdateOrderStatusInput } from '../types/order.types';

export function VendorOrderDetailView({ vendorOrderId }: { vendorOrderId: string }) {
  const query = useVendorOrderDetail(vendorOrderId);
  const update = useUpdateOrderStatus();
  useReadOpenedOrderNotifications(
    vendorOrderId,
    query.isSuccess ? query.data.fulfillment.status : undefined,
  );
  const [action, setAction] = useState<'cancel' | null>(null);
  if (query.isPending)
    return (
      <p role="status" className="py-12 text-sm text-text-secondary">
        Loading order...
      </p>
    );
  if (query.isError || !query.data)
    return (
      <div role="alert" className="space-y-4 py-12">
        <h1 className="text-xl font-semibold">Could not load this order</h1>
        <p className="text-sm text-text-secondary">
          {query.error?.message || 'This order is unavailable'}
        </p>
        <div className="flex gap-4">
          <Button variant="outline" onClick={() => void query.refetch()}>
            Try again
          </Button>
          <Link href="/vendor/orders" className="self-center text-sm text-accent underline">
            Back to orders
          </Link>
        </div>
      </div>
    );
  const order = query.data;
  const confirm = (data: UpdateOrderStatusInput) =>
    update.mutate({ vendorOrderId, data }, { onSuccess: () => setAction(null) });
  return (
    <div className="space-y-8">
      <header className="space-y-5 border-b border-border-control pb-6">
        <Link
          href="/vendor/orders"
          className="inline-flex items-center gap-2 text-sm text-text-secondary hover:text-text-primary"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to orders
        </Link>
        <div className="flex flex-wrap items-start justify-between gap-5">
          <div className="min-w-0 space-y-3">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-2xl font-semibold sm:text-3xl">Order details</h1>
              <OrderStatusBadge status={order.fulfillment.status} />
            </div>
            <p className="text-sm text-text-secondary">
              <span className="font-mono" title={order.order.orderNumber}>
                #{order.order.orderNumber.replace(/^PG-/, '').slice(0, 8).toUpperCase()}
              </span>
              <span className="mx-2">&middot;</span>
              <time dateTime={order.order.placedAt}>
                {new Date(order.order.placedAt).toLocaleDateString('en-IN', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
              </time>
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            {order.fulfillment.allowedActions.includes('process') && (
              <Button
                disabled={update.isPending}
                isLoading={update.isPending && update.variables?.data.status === 'processing'}
                onClick={() => confirm({ status: 'processing' })}
              >
                <PackageCheck className="h-4 w-4" />
                Start processing
              </Button>
            )}
            {order.fulfillment.allowedActions.includes('complete') && (
              <Button
                disabled={update.isPending}
                isLoading={update.isPending && update.variables?.data.status === 'completed'}
                onClick={() => confirm({ status: 'completed' })}
              >
                <Check className="h-4 w-4" />
                Mark complete
              </Button>
            )}
            {order.fulfillment.allowedActions.includes('cancel') && (
              <Button
                variant="outline"
                disabled={update.isPending}
                onClick={() => setAction('cancel')}
                className="gap-2 border-danger/30 text-danger hover:bg-danger-subtle focus-visible:outline-2 focus-visible:outline-border-focus"
              >
                <CircleX className="h-4 w-4" strokeWidth={1.5} />
                Cancel order
              </Button>
            )}
          </div>
        </div>
      </header>
      <div className="grid gap-10 lg:grid-cols-3">
        <div className="min-w-0 space-y-8 lg:col-span-2">
          <OrderStepper
            status={order.fulfillment.status}
            cancellationReason={order.fulfillment.cancellation?.reason}
          />
          <OrderItemsTable items={order.items} />
          <OrderSummaryCard itemCount={order.summary.itemCount} total={order.summary.total} />
          <VendorCancellationSummary order={order} />
        </div>
        <aside className="space-y-8 lg:border-l lg:border-border-default lg:pl-8">
          <OrderCustomerCard
            name={order.customer.name}
            email={order.customer.email}
            phone={order.customer.phone}
          />
          <OrderDeliveryCard address={order.deliveryAddress} />
        </aside>
      </div>
      <OrderActionDialog
        key={action || 'closed'}
        items={order.items}
        isOpen={Boolean(action)}
        action={action}
        onClose={() => setAction(null)}
        onConfirm={confirm}
        isLoading={update.isPending}
      />
    </div>
  );
}
