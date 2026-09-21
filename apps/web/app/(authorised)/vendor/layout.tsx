import type { Metadata } from 'next';
import type { ReactNode } from 'react';

import { VendorSidebar } from '@/features/vendor/components/vendor-sidebar';
import { VendorTopNav } from '@/features/vendor/components/vendor-top-nav';

export const metadata: Metadata = {
  title: 'Vendor Dashboard | Perigee',
  description: 'Manage your store catalog, orders, and sales performance on Perigee.',
};

export default function VendorLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex-1 flex w-full min-h-screen bg-background text-text-primary">
      {/* Desktop Persistent Sidebar */}
      <VendorSidebar />

      {/* Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <VendorTopNav />
        <div className="flex-1 p-6 sm:p-8 lg:p-10 w-full max-w-7xl mx-auto">
          {children}
        </div>
      </div>
    </div>
  );
}
