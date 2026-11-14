import type { CustomerOrderQuery } from '../schemas/customer-order-filters.schema';

export function customerOrdersHref(query: CustomerOrderQuery) {
  const params = new URLSearchParams({ page: String(query.page) });
  if (query.status) params.set('status', query.status);
  if (query.orderedFrom) params.set('orderedFrom', query.orderedFrom);
  if (query.orderedTo) params.set('orderedTo', query.orderedTo);
  return `/orders?${params.toString()}`;
}
