'use client';

import { AlertCircle, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { use } from 'react';

import { ProductForm } from '@/features/products/components/product-form';
import { useProductDetail } from '@/features/products/hooks/use-products';

interface EditProductPageProps {
  params: Promise<{ productId: string }>;
}

export default function EditProductPage({ params }: EditProductPageProps) {
  const { productId } = use(params);
  const { data, isLoading, isError } = useProductDetail(productId);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-text-tertiary">
        <Loader2 className="h-8 w-8 animate-spin mb-3 text-text-secondary" />
        <p className="text-sm">Loading product details...</p>
      </div>
    );
  }

  if (isError || !data?.product) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center p-8 bg-surface dark:bg-surface-subtle rounded-2xl border border-border-default max-w-md mx-auto my-12">
        <div className="h-12 w-12 rounded-full bg-red-100 dark:bg-red-950/40 flex items-center justify-center text-red-600 dark:text-red-400 mb-4">
          <AlertCircle className="h-6 w-6" />
        </div>
        <h2 className="text-lg font-semibold text-text-primary mb-1">Product not found</h2>
        <p className="text-sm text-text-secondary mb-6">
          The product you are trying to edit does not exist or you do not have permission to access
          it.
        </p>
        <Link
          href="/vendor/products"
          className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium rounded-xl bg-accent text-on-accent hover:bg-accent/90 transition-colors shadow-xs"
        >
          Return to Products
        </Link>
      </div>
    );
  }

  return <ProductForm key={data.product.productId} mode="edit" initialData={data.product} />;
}
