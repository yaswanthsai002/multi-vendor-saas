import { makeApiRequest } from '@/lib/api-client';
import { API_ENDPOINTS } from '@/lib/api-endpoints';

export interface DashboardMetrics {
  kpi: {
    totalCustomers: number;
    activeVendors: number;
    marketplaceProducts: number;
    totalOrders: number;
  };
  needsAttention: {
    pendingVendors: number;
  };
  merchandising: {
    featuredProducts: number;
    featuredBrands: number;
    activeDeals: number;
  };
}

export interface PerformanceDay {
  date: string;
  day: string;
  orders: number;
  gmv: number;
}

export interface TopProduct {
  rank: number;
  productId: string;
  name: string;
  vendor: string;
  unitsSold: number;
  orders: number;
  imageUrl: string | null;
}

export interface RecentOrder {
  orderId: string;
  orderNumber: string;
  customer: string;
  vendors: string;
  items: number;
  amount: number;
  status: string;
  placedAt: string;
}

export interface AdminUserItem {
  userId: string;
  fullName: string;
  email: string;
  roles: string[];
  status: 'active' | 'suspended';
  suspensionReason: string | null;
  emailVerifiedAt: string | null;
  createdAt: string;
  vendor: {
    vendorId: string;
    name: string;
    slug: string;
    status: 'pending' | 'active' | 'suspended' | 'rejected';
    logoUrl: string | null;
    isFeatured: boolean;
  } | null;
}

export interface AdminUsersResponse {
  users: AdminUserItem[];
  counts?: {
    all: number;
    active: number;
    suspended: number;
  };
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface AdminVendorItem {
  vendorId: string;
  name: string;
  slug: string;
  tagline: string | null;
  description: string | null;
  logoUrl: string | null;
  bannerUrl: string | null;
  status: 'pending' | 'active' | 'suspended' | 'rejected';
  suspensionReason: string | null;
  isFeatured: boolean;
  createdAt: string;
  productCount: number;
  owner: {
    userId: string;
    fullName: string;
    email: string;
    status: string;
  } | null;
}

export interface AdminVendorsResponse {
  vendors: AdminVendorItem[];
  counts: {
    all: number;
    pending: number;
    active: number;
    suspended: number;
    rejected: number;
  };
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface OnboardVendorInput {
  name: string;
  description?: string;
  ownerEmail: string;
  ownerFullName?: string;
  password?: string;
  isFeatured?: boolean;
}

export interface OnboardVendorResponse {
  vendor: {
    vendorId: string;
    name: string;
    slug: string;
    description: string | null;
    status: string;
    isFeatured: boolean;
    createdAt: string;
  };
  owner: {
    userId: string;
    email: string;
    fullName: string;
  };
  temporaryPassword?: string;
  isNewUser: boolean;
  message: string;
}

export interface AdminProductItem {
  productId: string;
  name: string;
  slug: string;
  price: string;
  compareAtPrice: string | null;
  stock: number;
  published: boolean;
  moderationStatus: 'approved' | 'hidden' | 'rejected';
  moderationReason: string | null;
  isFeatured: boolean;
  imageUrl: string | null;
  createdAt: string;
  vendor: {
    vendorId: string;
    name: string;
    slug: string;
    status: string;
  };
}

export interface AdminProductsResponse {
  products: AdminProductItem[];
  counts?: {
    total: number;
    approved: number;
    hidden: number;
    rejected: number;
  };
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface AdminOrderItem {
  orderId: string;
  orderNumber: string;
  status: string;
  customer: {
    name: string;
    email: string;
  };
  createdAt: string;
}

export interface AdminOrdersResponse {
  orders: AdminOrderItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface MerchandisingOverview {
  counts: {
    featuredProducts: number;
    featuredBrands: number;
    activeDeals: number;
  };
  featuredProducts: {
    productId: string;
    name: string;
    price: string;
    vendorName: string;
  }[];
  featuredBrands: {
    vendorId: string;
    name: string;
    slug: string;
    logoUrl: string | null;
    status: string;
  }[];
}

export const adminService = {
  getDashboardMetrics: (signal?: AbortSignal) =>
    makeApiRequest<DashboardMetrics>({
      url: API_ENDPOINTS.admin.dashboard.metrics,
      method: 'GET',
      signal,
    }),

  getDashboardPerformance: (days: number = 7, signal?: AbortSignal) =>
    makeApiRequest<PerformanceDay[]>({
      url: API_ENDPOINTS.admin.dashboard.performance,
      method: 'GET',
      params: { days },
      signal,
    }),

  getDashboardTopProducts: (signal?: AbortSignal) =>
    makeApiRequest<TopProduct[]>({
      url: API_ENDPOINTS.admin.dashboard.topProducts,
      method: 'GET',
      signal,
    }),

  getDashboardRecentOrders: (signal?: AbortSignal) =>
    makeApiRequest<RecentOrder[]>({
      url: API_ENDPOINTS.admin.dashboard.recentOrders,
      method: 'GET',
      signal,
    }),

  getUsers: (
    params?: { page?: number; limit?: number; role?: string; search?: string; status?: string },
    signal?: AbortSignal,
  ) =>
    makeApiRequest<AdminUsersResponse>({
      url: API_ENDPOINTS.admin.users.list,
      method: 'GET',
      params,
      signal,
    }),

  getVendors: (
    params?: {
      page?: number;
      limit?: number;
      status?: string;
      search?: string;
      isFeatured?: string;
    },
    signal?: AbortSignal,
  ) =>
    makeApiRequest<AdminVendorsResponse>({
      url: API_ENDPOINTS.admin.vendors.list,
      method: 'GET',
      params,
      signal,
    }),

  updateUserStatus: (userId: string, data: { status: 'active' | 'suspended'; reason?: string }) =>
    makeApiRequest<{ message: string }>({
      url: API_ENDPOINTS.admin.users.status(userId),
      method: 'PATCH',
      data,
    }),

  getVendorDetail: (vendorId: string, signal?: AbortSignal) =>
    makeApiRequest<Record<string, unknown>>({
      url: API_ENDPOINTS.admin.vendors.detail(vendorId),
      method: 'GET',
      signal,
    }),

  updateVendorStatus: (
    vendorId: string,
    data: { status: 'pending' | 'active' | 'suspended' | 'rejected'; reason?: string },
  ) =>
    makeApiRequest<{ message: string }>({
      url: API_ENDPOINTS.admin.vendors.status(vendorId),
      method: 'PATCH',
      data,
    }),

  onboardVendor: (data: OnboardVendorInput) =>
    makeApiRequest<OnboardVendorResponse>({
      url: API_ENDPOINTS.admin.vendors.onboard,
      method: 'POST',
      data,
    }),

  toggleVendorFeature: (vendorId: string, isFeatured: boolean) =>
    makeApiRequest<{ isFeatured: boolean }>({
      url: API_ENDPOINTS.admin.vendors.feature(vendorId),
      method: 'PATCH',
      data: { isFeatured },
    }),

  getProducts: (
    params?: {
      page?: number;
      limit?: number;
      search?: string;
      moderationStatus?: string;
      isFeatured?: string;
      published?: string;
      sortBy?: string;
      sortOrder?: string;
    },
    signal?: AbortSignal,
  ) =>
    makeApiRequest<AdminProductsResponse>({
      url: API_ENDPOINTS.admin.products.list,
      method: 'GET',
      params,
      signal,
    }),

  updateProductModeration: (
    productId: string,
    data: { status: 'approved' | 'hidden' | 'rejected'; reason?: string },
  ) =>
    makeApiRequest<{ message: string }>({
      url: API_ENDPOINTS.admin.products.moderation(productId),
      method: 'PATCH',
      data,
    }),

  toggleProductFeature: (productId: string, isFeatured: boolean) =>
    makeApiRequest<{ isFeatured: boolean }>({
      url: API_ENDPOINTS.admin.products.feature(productId),
      method: 'PATCH',
      data: { isFeatured },
    }),

  getOrders: (
    params?: { page?: number; limit?: number; search?: string; status?: string },
    signal?: AbortSignal,
  ) =>
    makeApiRequest<AdminOrdersResponse>({
      url: API_ENDPOINTS.admin.orders.list,
      method: 'GET',
      params,
      signal,
    }),

  getOrderDetail: (orderId: string, signal?: AbortSignal) =>
    makeApiRequest<Record<string, unknown>>({
      url: API_ENDPOINTS.admin.orders.detail(orderId),
      method: 'GET',
      signal,
    }),

  getMerchandisingOverview: (signal?: AbortSignal) =>
    makeApiRequest<MerchandisingOverview>({
      url: API_ENDPOINTS.admin.merchandising.overview,
      method: 'GET',
      signal,
    }),
};
