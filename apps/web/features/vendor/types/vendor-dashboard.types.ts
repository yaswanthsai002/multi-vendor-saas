export interface VendorProfile {
  vendorId: string;
  name: string;
  slug: string;
  logoUrl?: string | null;
}

export interface MetricItem {
  value: number;
  changePercentage: number;
}

export interface VendorDashboardMetrics {
  sales: MetricItem;
  orders: MetricItem;
  unitsSold: MetricItem;
  avgOrderValue: MetricItem;
}

export interface ChartDataPoint {
  label: string;
  date: string;
  sales: number;
}

export type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';

export interface RecentOrder {
  vendorOrderId: string;
  orderId: string;
  orderNumber: string;
  itemsCount: number;
  amount: number;
  status: OrderStatus;
  thumbnailUrl?: string | null;
  createdAt: string;
}

export interface TopProduct {
  productId: string;
  name: string;
  category: string;
  thumbnailUrl?: string | null;
  unitsSold: number;
  sales: number;
  stock: number;
}

export interface VendorDashboardData {
  vendor: VendorProfile;
  metrics: VendorDashboardMetrics;
  chart: ChartDataPoint[];
  recentOrders: RecentOrder[];
  topProducts: TopProduct[];
}

export type TimeframePeriod = '7d' | '30d' | '90d';
