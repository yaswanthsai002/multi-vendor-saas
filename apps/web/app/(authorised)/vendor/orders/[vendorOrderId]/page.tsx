import { Suspense } from 'react';

import type { Metadata } from 'next';

import { VendorOrderDetailView } from '@/features/orders/components/vendor-order-detail-view';

export const metadata: Metadata = {
  title: 'Order Details | Vendor Portal | Perigee',
  description: 'View and fulfill customer order details on Perigee.',
};

export default async function VendorOrderDetailPage({
  params,
}: {
  params: Promise<{ vendorOrderId: string }>;
}) {
  const { vendorOrderId } = await params;

  return (
    <Suspense
      fallback={
        <div className="space-y-6 animate-pulse">
          <div className="h-6 w-32 bg-surface-subtle rounded-md" />
          <div className="h-10 w-64 bg-surface-subtle rounded-xl" />
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
      }
    >
      <VendorOrderDetailView vendorOrderId={vendorOrderId} />
    </Suspense>
  );
}
