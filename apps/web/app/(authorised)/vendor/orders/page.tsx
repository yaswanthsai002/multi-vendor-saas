import { Suspense } from 'react';

import { OrdersTableSkeleton } from '@/features/orders/components/orders-table-skeleton';
import { VendorOrdersView } from '@/features/orders/components/vendor-orders-view';

import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Orders | Vendor Portal | Perigee',
  description: 'Manage, search, filter, and fulfill customer orders on Perigee.',
};

export default function VendorOrdersPage() {
  return (
    <Suspense fallback={<OrdersTableSkeleton rows={5} />}>
      <VendorOrdersView />
    </Suspense>
  );
}
