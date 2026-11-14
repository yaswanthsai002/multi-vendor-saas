export type CustomerOrderStatus =
  | 'Order placed'
  | 'In progress'
  | 'Partially cancelled'
  | 'Partially fulfilled'
  | 'Completed'
  | 'Cancelled';
export interface CheckoutLine {
  imageUrl: string | null;
  productId: string;
  name: string;
  quantity: number;
  stock: number;
  unitPrice: string;
  subtotal: string;
  available: boolean;
}
export interface DeliveryAddress {
  recipientName: string;
  phone: string;
  addressLine1: string;
  addressLine2: string | null;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}
export interface CheckoutReview {
  lines: CheckoutLine[];
  addresses: (DeliveryAddress & { addressId: string; isDefault: boolean })[];
  addressId: string | null;
  addressEligible: boolean;
  total: string;
}
export interface CustomerOrder {
  orderId: string;
  orderNumber: string;
  placedAt: string;
  status: CustomerOrderStatus;
  items: {
    orderItemId: string;
    productSlug: string | null;
    imageUrl: string | null;
    productId: string;
    name: string;
    quantity: number;
    unitPrice: string;
    subtotal: string;
    status: 'pending' | 'processing' | 'completed' | 'cancelled';
  }[];
  address: DeliveryAddress | null;
  total: string;
  canCancel: boolean;
}
export interface CustomerOrderList {
  items: CustomerOrder[];
  pagination: { page: number; limit: number; total: number; totalPages: number };
}
