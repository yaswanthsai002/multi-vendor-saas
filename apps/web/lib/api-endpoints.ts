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
  },
} as const;
