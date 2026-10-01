import { ProductForm } from '@/features/products/components/product-form';

export const metadata = {
  title: 'Create Product | Perigee',
  description: 'Add a new product to your vendor catalog.',
};

export default function CreateProductPage() {
  return <ProductForm mode="create" />;
}
