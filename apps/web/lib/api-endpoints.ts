/**
 * Centralized API endpoints registry.
 */
export const API_ENDPOINTS = {
  auth: {
    signup: '/api/auth/signup',
    signin: '/api/auth/signin',
    signout: '/api/auth/signout',
    me: '/api/auth/me',
    google: '/api/auth/google',
    sendOtp: '/api/auth/send-otp',
    verifyOtp: '/api/auth/verify-otp',
    verificationStatus: '/api/auth/verification-status',
    resetPassword: '/api/auth/reset-password',
    updateMe: '/api/auth/me',
    avatarUploadUrl: '/api/auth/avatar/upload-url',
    changePassword: '/api/auth/change-password',
  },
  categories: {
    list: '/api/categories',
    create: '/api/categories',
    detail: (id: string) => `/api/categories/${id}` as const,
  },
  catalog: {
    products: '/api/products',
    facets: '/api/products/facets',
    productDetail: (slug: string) => `/api/products/${slug}` as const,
  },
  vendor: {
    dashboard: '/api/vendor/dashboard',
    dashboardMetrics: '/api/vendor/dashboard/metrics',
    dashboardPerformance: '/api/vendor/dashboard/performance',
    dashboardRecentOrders: '/api/vendor/dashboard/recent-orders',
    dashboardTopProducts: '/api/vendor/dashboard/top-products',
    products: '/api/vendor/products',
    productDetail: (id: string) => `/api/vendor/products/${id}` as const,
    productArchive: (id: string) => `/api/vendor/products/${id}/archive` as const,
    productRestore: (id: string) => `/api/vendor/products/${id}/restore` as const,
    productsBulk: '/api/vendor/products/bulk',
    orders: '/api/vendor/orders',
    orderDetail: (id: string) => `/api/vendor/orders/${id}` as const,
    orderStatus: (id: string) => `/api/vendor/orders/${id}/status` as const,
    media: '/api/vendor/media',
    profile: '/api/vendor/profile',
    bulkImports: {
      template: '/api/vendor/products/bulk-imports/template',
      initiate: '/api/vendor/products/bulk-imports/initiate',
      active: '/api/vendor/products/bulk-imports/active',
      uploaded: (id: string) => `/api/vendor/products/bulk-imports/${id}/uploaded` as const,
      errors: (id: string) => `/api/vendor/products/bulk-imports/${id}/errors` as const,
      start: (id: string) => `/api/vendor/products/bulk-imports/${id}/start` as const,
      cancel: (id: string) => `/api/vendor/products/bulk-imports/${id}` as const,
      events: (id: string) => `/api/vendor/products/bulk-imports/${id}/events` as const,
    },
  },
  admin: {
    dashboard: {
      metrics: '/api/admin/dashboard/metrics',
      performance: '/api/admin/dashboard/performance',
      topProducts: '/api/admin/dashboard/top-products',
      recentOrders: '/api/admin/dashboard/recent-orders',
    },
    users: {
      list: '/api/admin/users',
      detail: (id: string) => `/api/admin/users/${id}` as const,
      status: (id: string) => `/api/admin/users/${id}/status` as const,
    },
    vendors: {
      list: '/api/admin/vendors',
      onboard: '/api/admin/vendors',
      detail: (id: string) => `/api/admin/vendors/${id}` as const,
      status: (id: string) => `/api/admin/vendors/${id}/status` as const,
      feature: (id: string) => `/api/admin/vendors/${id}/feature` as const,
    },
    products: {
      list: '/api/admin/products',
      detail: (id: string) => `/api/admin/products/${id}` as const,
      moderation: (id: string) => `/api/admin/products/${id}/moderation` as const,
      feature: (id: string) => `/api/admin/products/${id}/feature` as const,
    },
    orders: {
      list: '/api/admin/orders',
      detail: (id: string) => `/api/admin/orders/${id}` as const,
    },
    merchandising: {
      overview: '/api/admin/merchandising/overview',
    },
  },
} as const;
