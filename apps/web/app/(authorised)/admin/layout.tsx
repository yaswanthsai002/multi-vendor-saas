import type { Metadata } from 'next';
import type { ReactNode } from 'react';

import { AdminSidebar } from '@/features/admin/components/admin-sidebar';
import { AdminTopNav } from '@/features/admin/components/admin-top-nav';

export const metadata: Metadata = {
  title: 'Admin Console | Perigee',
  description: 'Marketplace platform administration, moderation, and operations on Perigee.',
};

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex-1 flex w-full min-h-screen bg-background text-text-primary">
      {/* Persistent Desktop Sidebar */}
      <AdminSidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <AdminTopNav />
        <main className="flex-1 p-6 sm:p-8 lg:p-10 w-full max-w-7xl mx-auto">{children}</main>
      </div>
    </div>
  );
}
