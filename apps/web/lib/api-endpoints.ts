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
} as const;
