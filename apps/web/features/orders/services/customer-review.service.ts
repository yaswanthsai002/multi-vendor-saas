import { makeApiRequest } from '@/lib/api-client';
import { API_ENDPOINTS } from '@/lib/api-endpoints';

import type { SaveCustomerReviewInput } from '../schemas/customer-review.schema';
import type { CustomerReviewState } from '../types/customer-order.types';

export function saveCustomerReview(
  orderId: string,
  orderItemId: string,
  input: SaveCustomerReviewInput,
) {
  return makeApiRequest<CustomerReviewState>({
    method: 'PUT',
    url: API_ENDPOINTS.customerOrders.itemReview(orderId, orderItemId),
    data: input,
  });
}

export function deleteCustomerReview(
  orderId: string,
  orderItemId: string,
  expectedVersion: number,
) {
  return makeApiRequest<CustomerReviewState>({
    method: 'DELETE',
    url: API_ENDPOINTS.customerOrders.itemReview(orderId, orderItemId),
    data: { expectedVersion },
  });
}
