import type { CustomerOrderQuery } from '../schemas/customer-order-filters.schema';
import type { PendingCheckout } from '../schemas/customer-order.schema';
import type {
  CheckoutReview,
  CustomerOrder,
  CustomerOrderList,
} from '../types/customer-order.types';

import { makeApiRequest } from '@/lib/api-client';
import { API_ENDPOINTS } from '@/lib/api-endpoints';

export function fetchCheckoutReview(addressId?: string, signal?: AbortSignal) {
  return makeApiRequest<CheckoutReview>({
    method: 'GET',
    url: API_ENDPOINTS.customerOrders.review,
    params: { addressId },
    signal,
  });
}
export function placeCustomerOrder(pending: PendingCheckout) {
  return makeApiRequest<CustomerOrder>({
    method: 'POST',
    url: API_ENDPOINTS.customerOrders.list,
    headers: { 'Idempotency-Key': pending.key },
    data: pending.request,
  });
}
export function fetchCustomerOrders(query: CustomerOrderQuery, signal?: AbortSignal) {
  return makeApiRequest<CustomerOrderList>({
    method: 'GET',
    url: API_ENDPOINTS.customerOrders.list,
    params: { ...query, limit: 20 },
    signal,
  });
}
export function fetchCustomerOrder(orderId: string, signal?: AbortSignal) {
  return makeApiRequest<CustomerOrder>({
    method: 'GET',
    url: API_ENDPOINTS.customerOrders.detail(orderId),
    signal,
  });
}
export function cancelCustomerOrder(orderId: string) {
  return makeApiRequest<CustomerOrder>({
    method: 'POST',
    url: API_ENDPOINTS.customerOrders.cancel(orderId),
    data: {},
  });
}
