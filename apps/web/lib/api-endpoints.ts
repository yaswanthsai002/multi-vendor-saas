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
  },
  categories: {
    list: '/api/categories',
    create: '/api/categories',
    detail: (id: string) => `/api/categories/${id}` as const,
  },
  vendor: {
    dashboard: '/api/vendor/dashboard',
    products: '/api/vendor/products',
    productDetail: (id: string) => `/api/vendor/products/${id}` as const,
    productArchive: (id: string) => `/api/vendor/products/${id}/archive` as const,
    productRestore: (id: string) => `/api/vendor/products/${id}/restore` as const,
    productsBulk: '/api/vendor/products/bulk',
    media: '/api/vendor/media',
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
} as const;
