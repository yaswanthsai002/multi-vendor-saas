import { BrandDirectory } from '@/features/brands/components/brand-directory';

export default async function BrandsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; search?: string }>;
}) {
  const params = await searchParams;
  const requestedPage = Number(params.page ?? 1);
  const initialPage = Number.isInteger(requestedPage) && requestedPage > 0 ? requestedPage : 1;
  const initialSearch = (params.search ?? '').trim().slice(0, 100);

  return <BrandDirectory initialPage={initialPage} initialSearch={initialSearch} />;
}
