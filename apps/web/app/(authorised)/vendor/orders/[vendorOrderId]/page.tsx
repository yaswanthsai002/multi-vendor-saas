import { Suspense } from 'react';

import { VendorOrderDetailView } from '@/features/orders/components/vendor-order-detail-view';

import type { Metadata } from 'next';

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
        <p role="status" className="py-12 text-sm text-text-secondary">
          Loading order...
        </p>
      }
    >
      <VendorOrderDetailView vendorOrderId={vendorOrderId} />
    </Suspense>
  );
}
