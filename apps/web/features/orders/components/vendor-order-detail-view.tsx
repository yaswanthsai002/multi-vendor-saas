'use client';

import { ArrowLeft, Ban, CheckCircle2, PackageCheck } from 'lucide-react';
import Link from 'next/link';
import * as React from 'react';

import { useUpdateOrderStatus, useVendorOrderDetail } from '../hooks/use-orders';

import { OrderActionDialog } from './order-action-dialog';
import { OrderCustomerCard } from './order-customer-card';
import { OrderDeliveryCard } from './order-delivery-card';
import { OrderItemsTable } from './order-items-table';
import { OrderStatusBadge } from './order-status-badge';
import { OrderStepper } from './order-stepper';
import { OrderSummaryCard } from './order-summary-card';

interface VendorOrderDetailViewProps {
  vendorOrderId: string;
}

export function VendorOrderDetailView({ vendorOrderId }: VendorOrderDetailViewProps) {
  const { data: order, isLoading, error } = useVendorOrderDetail(vendorOrderId);
  const updateStatusMutation = useUpdateOrderStatus();

  const [activeDialog, setActiveDialog] = React.useState<'process' | 'complete' | 'cancel' | null>(
    null,
  );

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-6 w-32 bg-surface-subtle rounded-md" />
        <div className="h-12 w-64 bg-surface-subtle rounded-xl" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="h-40 bg-surface-subtle rounded-2xl" />
            <div className="h-64 bg-surface-subtle rounded-2xl" />
          </div>
          <div className="space-y-6">
            <div className="h-48 bg-surface-subtle rounded-2xl" />
            <div className="h-48 bg-surface-subtle rounded-2xl" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="rounded-2xl border border-border-default bg-surface-raised dark:bg-surface-raised p-12 text-center shadow-xs">
        <h3 className="text-base font-bold text-text-primary">Order Not Found</h3>
        <p className="text-xs sm:text-sm text-text-secondary mt-1 max-w-sm mx-auto">
          The requested vendor order does not exist or you do not have permission to view it.
        </p>
        <Link
          href="/vendor/orders"
          className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-accent text-on-accent hover:bg-accent/90 shadow-xs transition-colors cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to orders</span>
        </Link>
      </div>
    );
  }

  const { allowedActions } = order.fulfillment;

  const handleConfirmStatusChange = (data: {
    status: 'processing' | 'completed' | 'cancelled';
    cancellationReason?: string;
  }) => {
    updateStatusMutation.mutate(
      {
        vendorOrderId,
        data,
      },
      {
        onSettled: () => {
          setActiveDialog(null);
        },
      },
    );
  };

  const formattedPlacedDate = new Date(order.order.placedAt).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });

  return (
    <div className="space-y-6">
      {/* 1. Back Navigation & Header */}
      <div>
        <Link
          href="/vendor/orders"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-text-tertiary hover:text-text-primary transition-colors mb-3 cursor-pointer"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Back to All Orders</span>
        </Link>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl sm:text-3xl font-bold font-mono tracking-tight text-text-primary">
                {order.order.orderNumber}
              </h1>
              <OrderStatusBadge status={order.fulfillment.status} />
            </div>
            <p className="text-xs sm:text-sm text-text-secondary mt-1">
              Placed on {formattedPlacedDate}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5">
            {allowedActions.includes('process') && (
              <button
                type="button"
                onClick={() => setActiveDialog('process')}
                disabled={updateStatusMutation.isPending}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-accent text-on-accent hover:bg-accent/90 shadow-xs transition-colors cursor-pointer"
              >
                <PackageCheck className="h-4 w-4" />
                <span>Start Processing</span>
              </button>
            )}

            {allowedActions.includes('complete') && (
              <button
                type="button"
                onClick={() => setActiveDialog('complete')}
                disabled={updateStatusMutation.isPending}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-emerald-600 text-white hover:bg-emerald-700 shadow-xs transition-colors cursor-pointer"
              >
                <CheckCircle2 className="h-4 w-4" />
                <span>Mark as Completed</span>
              </button>
            )}

            {allowedActions.includes('cancel') && (
              <button
                type="button"
                onClick={() => setActiveDialog('cancel')}
                disabled={updateStatusMutation.isPending}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-medium border border-rose-200/80 dark:border-rose-900/40 bg-rose-50/50 dark:bg-rose-950/20 text-rose-700 dark:text-rose-400 hover:bg-rose-100/70 transition-colors cursor-pointer"
              >
                <Ban className="h-3.5 w-3.5" />
                <span>Cancel Order</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 2. Main 2-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (Fulfillment Stepper + Items Table + Summary) */}
        <div className="lg:col-span-2 space-y-6">
          <OrderStepper
            status={order.fulfillment.status}
            cancellationReason={order.fulfillment.cancellationReason}
          />

          <OrderItemsTable items={order.items} />

          <OrderSummaryCard itemCount={order.summary.itemCount} total={order.summary.total} />
        </div>

        {/* Right Column (Customer Card + Delivery Address) */}
        <div className="space-y-6">
          <OrderCustomerCard
            name={order.customer.name}
            email={order.customer.email}
            phone={order.customer.phone}
          />

          <OrderDeliveryCard address={order.deliveryAddress} />
        </div>
      </div>

      {/* 3. Action Dialog */}
      <OrderActionDialog
        isOpen={Boolean(activeDialog)}
        action={activeDialog}
        onClose={() => setActiveDialog(null)}
        onConfirm={handleConfirmStatusChange}
        isLoading={updateStatusMutation.isPending}
      />
    </div>
  );
}
