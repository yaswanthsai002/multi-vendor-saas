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

export interface OrderItemDetail {
  orderItemId: string;
  productId: string;
  productName: string;
  productImageUrl: string | null;
  unitPrice: string;
  quantity: number;
  subtotal: string;
}

export interface DeliveryAddressDetail {
  recipientName: string;
  phone: string;
  addressLine1: string;
  addressLine2: string | null;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

export interface VendorOrderDetail {
  order: {
    orderNumber: string;
    placedAt: string;
    overallStatus: string;
  };
  fulfillment: {
    vendorOrderId: string;
    status: VendorOrderStatus;
    updatedAt: string;
    completedAt: string | null;
    cancellationReason: string | null;
    allowedActions: ('process' | 'complete' | 'cancel')[];
  };
  customer: {
    name: string;
    email: string;
    phone: string | null;
  };
  deliveryAddress: DeliveryAddressDetail | null;
  items: OrderItemDetail[];
  summary: {
    itemCount: number;
    total: string;
  };
}

export interface UpdateOrderStatusInput {
  status: 'processing' | 'completed' | 'cancelled';
  cancellationReason?: string | null;
}
