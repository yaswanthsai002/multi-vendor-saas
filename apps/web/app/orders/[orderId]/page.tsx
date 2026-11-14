import { CustomerOrderDetail } from '@/features/orders/components/customer-order-detail';

export default async function OrderPage({
  params,
  searchParams,
}: {
  params: Promise<{ orderId: string }>;
  searchParams: Promise<{ confirmed?: string }>;
}) {
  const { orderId } = await params;
  const { confirmed } = await searchParams;
  return <CustomerOrderDetail orderId={orderId} confirmed={confirmed === '1'} />;
}
