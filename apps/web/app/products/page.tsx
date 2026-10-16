import { Suspense } from 'react';

import type { Metadata } from 'next';

import { CatalogView } from '@/features/catalog/components/catalog-view';

export const metadata: Metadata = {
  title: 'Explore Products | Perigee',
  description:
    'Browse our curated collection of verified products direct from independent makers and brands.',
};

export default function ProductsPage() {
  return (
    <Suspense
      fallback={
        <div className="w-full min-h-[60vh] flex items-center justify-center py-20">
          <div className="flex flex-col items-center gap-3">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-accent border-t-transparent" />
            <p className="text-xs text-text-secondary font-medium">Loading catalog...</p>
          </div>
        </div>
      }
    >
      <CatalogView />
    </Suspense>
  );
}
