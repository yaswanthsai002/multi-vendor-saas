import { Suspense } from 'react';

import type { Metadata } from 'next';

import { CatalogView } from '@/features/catalog/components/catalog-view';

interface CategoryPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { slug } = await params;
  const formattedName = slug
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

  return {
    title: `${formattedName} | Perigee`,
    description: `Shop top-rated ${formattedName} products direct from verified makers on Perigee.`,
  };
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { slug } = await params;

  return (
    <Suspense
      fallback={
        <div className="w-full min-h-[60vh] flex items-center justify-center py-20">
          <div className="flex flex-col items-center gap-3">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-accent border-t-transparent" />
            <p className="text-xs text-text-secondary font-medium">Loading category...</p>
          </div>
        </div>
      }
    >
      <CatalogView initialCategory={slug} />
    </Suspense>
  );
}
