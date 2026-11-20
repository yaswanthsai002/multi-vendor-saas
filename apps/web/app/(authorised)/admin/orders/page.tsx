import { AdminOrdersView } from '@/features/admin/components/admin-orders-view';
import { adminOrderQuerySchema } from '@/features/admin/schemas/admin-order.schema';

import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Orders | Perigee Admin',
  description: 'Review marketplace orders and vendor fulfillment records.',
};

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const query = adminOrderQuerySchema.parse(await searchParams);
  return <AdminOrdersView query={query} />;
}
