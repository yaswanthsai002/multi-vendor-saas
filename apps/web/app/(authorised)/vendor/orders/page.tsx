import { Suspense } from 'react';

import type { Metadata } from 'next';

import { OrdersTableSkeleton } from '@/features/orders/components/orders-table-skeleton';
import { VendorOrdersView } from '@/features/orders/components/vendor-orders-view';

export const metadata: Metadata = {
  title: 'Orders | Vendor Portal | Perigee',
  description: 'Manage, search, filter, and fulfill customer orders on Perigee.',
};

export default function VendorOrdersPage() {
  return (
    <Suspense
      fallback={
        <div className="space-y-6 animate-pulse">
          <div className="h-10 w-48 bg-surface-subtle rounded-xl" />
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-28 bg-surface-subtle rounded-2xl" />
            ))}
          </div>
          <OrdersTableSkeleton rows={8} />
        </div>
      }
    >
      <VendorOrdersView />
    </Suspense>
  );
}
