import { z } from 'zod';

import { ApiError, makeApiRequest } from '@/lib/api-client';
import { API_ENDPOINTS } from '@/lib/api-endpoints';

import { vendorOrderDetailSchema, vendorOrdersListSchema } from '../schemas/vendor-order.schema';

import type {
  VendorOrderStatus,
  UpdateOrderStatusInput,
  VendorOrderDetail,
  VendorOrdersFilters,
  VendorOrdersListResponse,
} from '../types/order.types';

export async function fetchVendorOrders(
  filters: VendorOrdersFilters = {},
): Promise<VendorOrdersListResponse> {
  const body = await makeApiRequest<unknown>({
    url: API_ENDPOINTS.vendor.orders,
    method: 'GET',
    params: filters,
  });
  const result = z
    .object({ success: z.literal(true), data: vendorOrdersListSchema })
    .safeParse(body);
  if (!result.success)
    throw new ApiError(
      502,
      'INVALID_RESPONSE',
      'Could not read the order response. Please try again.',
    );
  return result.data.data;
}

export async function fetchVendorOrderDetail(vendorOrderId: string): Promise<VendorOrderDetail> {
  const body = await makeApiRequest<unknown>({
    url: API_ENDPOINTS.vendor.orderDetail(vendorOrderId),
    method: 'GET',
  });
  const result = z
    .object({ success: z.literal(true), data: vendorOrderDetailSchema })
    .safeParse(body);
  if (!result.success)
    throw new ApiError(
      502,
      'INVALID_RESPONSE',
      'Could not read the order response. Please try again.',
    );
  return result.data.data;
}

export async function updateVendorOrderStatus(
  vendorOrderId: string,
  data: UpdateOrderStatusInput,
): Promise<VendorOrderDetail> {
  const body = await makeApiRequest<unknown>({
    url: API_ENDPOINTS.vendor.orderStatus(vendorOrderId),
    method: 'POST',
    data,
  });
  const result = z
    .object({ success: z.literal(true), data: vendorOrderDetailSchema })
    .safeParse(body);
  if (!result.success)
    throw new ApiError(
      502,
      'INVALID_RESPONSE',
      'Could not read the order response. Please try again.',
    );
  return result.data.data;
}

export async function markVendorOrderNotificationsRead({
  vendorOrderId,
  status,
}: {
  vendorOrderId: string;
  status: VendorOrderStatus;
}) {
  const body = await makeApiRequest<unknown>({
    url: API_ENDPOINTS.vendor.notifications.readOrder(vendorOrderId),
    method: 'PUT',
    data: { status },
  });
  const result = z
    .object({
      success: z.literal(true),
      data: z.object({ vendorId: z.uuid(), changed: z.boolean() }),
    })
    .safeParse(body);
  if (!result.success)
    throw new ApiError(502, 'INVALID_RESPONSE', 'Could not update notification read status.');
  return result.data.data;
}
