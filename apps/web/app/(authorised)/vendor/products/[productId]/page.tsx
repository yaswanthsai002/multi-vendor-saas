import { redirect } from 'next/navigation';

interface ProductPageProps {
  params: Promise<{ productId: string }>;
}

export default async function ProductDetailPage({ params }: ProductPageProps) {
  const { productId } = await params;
  redirect(`/vendor/products/${productId}/edit`);
}
