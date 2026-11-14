import { CustomerOrdersView } from '@/features/orders/components/customer-orders-view';
import { customerOrderListQuerySchema } from '@/features/orders/schemas/customer-order-filters.schema';

export default async function OrdersPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const parsed = customerOrderListQuerySchema.safeParse(await searchParams);
  return <CustomerOrdersView query={parsed.success ? parsed.data : { page: 1 }} />;
}
