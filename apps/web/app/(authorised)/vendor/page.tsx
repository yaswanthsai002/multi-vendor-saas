import { Suspense } from 'react';

import type { Metadata } from 'next';

import { VendorDashboardOverview } from '@/features/vendor/components/vendor-dashboard-overview';

export const metadata: Metadata = {
  title: 'Vendor Overview | Perigee',
  description: 'Track your store metrics, sales performance, and active orders.',
};

export default function VendorDashboardPage() {
  return (
    <Suspense
      fallback={
        <div className="space-y-6 animate-pulse">
          <div className="h-10 w-48 bg-surface-subtle rounded-lg" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-32 bg-surface-subtle rounded-xl" />
            ))}
          </div>
          <div className="h-64 bg-surface-subtle rounded-xl" />
        </div>
      }
    >
      <VendorDashboardOverview />
    </Suspense>
  );
}
