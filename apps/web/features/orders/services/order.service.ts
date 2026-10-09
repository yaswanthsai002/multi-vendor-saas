import type {
  UpdateOrderStatusInput,
  VendorOrderDetail,
  VendorOrdersFilters,
  VendorOrdersListResponse,
} from '../types/order.types';

import { makeApiRequest } from '@/lib/api-client';
import { API_ENDPOINTS } from '@/lib/api-endpoints';

export async function fetchVendorOrders(
  filters: VendorOrdersFilters = {},
): Promise<VendorOrdersListResponse> {
  return makeApiRequest<VendorOrdersListResponse>({
    url: API_ENDPOINTS.vendor.orders,
    method: 'GET',
    params: filters,
  });
}

export async function fetchVendorOrderDetail(vendorOrderId: string): Promise<VendorOrderDetail> {
  return makeApiRequest<VendorOrderDetail>({
    url: API_ENDPOINTS.vendor.orderDetail(vendorOrderId),
    method: 'GET',
  });
}

export async function updateVendorOrderStatus(
  vendorOrderId: string,
  data: UpdateOrderStatusInput,
): Promise<VendorOrderDetail> {
  return makeApiRequest<VendorOrderDetail>({
    url: API_ENDPOINTS.vendor.orderStatus(vendorOrderId),
    method: 'POST',
    data,
  });
}
