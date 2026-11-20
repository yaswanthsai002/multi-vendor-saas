import { type z } from 'zod';

import {
  type orderItemDetailSchema,
  type deliveryAddressDetailSchema,
  type vendorOrderDetailSchema,
} from '../schemas/vendor-order.schema';

import type { VendorOrderAction } from '../schemas/vendor-order-action.schema';

export type VendorOrderStatus = 'pending' | 'processing' | 'completed' | 'cancelled';
export type OrderStatusFilter = 'all' | VendorOrderStatus;
export type OrderSortOption = 'newest' | 'oldest' | 'total_desc' | 'total_asc';

export interface VendorOrderListItem {
  vendorOrderId: string;
  orderNumber: string;
  customer: {
    name: string;
    email: string;
  };
  summary: { items: { name: string; quantity: number }[]; itemCount: number; productCount: number };
  itemCount: number;
  total: string;
  placedAt: string;
  status: VendorOrderStatus;
}

export interface VendorOrdersPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface VendorOrderStatusCounts {
  all: number;
  pending: number;
  processing: number;
  completed: number;
  cancelled: number;
}

export interface VendorOrdersListResponse {
  items: VendorOrderListItem[];
  pagination: VendorOrdersPagination;
  statusCounts: VendorOrderStatusCounts;
}

export interface VendorOrdersFilters {
  page?: number;
  limit?: number;
  status?: OrderStatusFilter;
  search?: string;
  dateFrom?: string;
  dateTo?: string;
  sort?: OrderSortOption;
}

export type OrderItemDetail = z.infer<typeof orderItemDetailSchema>;
export type DeliveryAddressDetail = z.infer<typeof deliveryAddressDetailSchema>;
export type VendorOrderDetail = z.infer<typeof vendorOrderDetailSchema>;
export type UpdateOrderStatusInput = VendorOrderAction;
