import { AdminOrderDetail } from '@/features/admin/components/admin-order-detail';

import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Order details | Perigee Admin',
  description: 'Inspect vendor outcomes and cancellation evidence.',
};

export default async function AdminOrderDetailPage({
  params,
}: {
  params: Promise<{ orderId: string }>;
}) {
  const { orderId } = await params;
  return <AdminOrderDetail orderId={orderId} />;
}
