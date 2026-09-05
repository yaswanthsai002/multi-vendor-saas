import axios, { type AxiosRequestConfig, type AxiosError } from 'axios';

/**
 * Standard normalized API error used across apps/web.
 * Prevents raw Axios/fetch error objects from leaking to UI state.
 */
export class ApiError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
    public details?: Record<string, unknown> | unknown,
    public isCanceled = false,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

/**
 * Shared Axios instance preconfigured for the Perigee API.
 */
export const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000',
  timeout: 15000,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

axiosInstance.interceptors.response.use(
  (response) => response,
  (error: AxiosError<{ message?: string; error?: string; code?: string; details?: unknown }>) => {
    // 1. Request cancelled via AbortController
    if (axios.isCancel(error)) {
      return Promise.reject(
        new ApiError(0, 'REQUEST_ABORTED', 'Request was cancelled', undefined, true),
      );
    }

    // 2. Server responded with an HTTP error code (4xx, 5xx)
    if (error.response) {
      const status = error.response.status;
      const data = error.response.data;
      const code = data?.code || (data?.error ? 'VALIDATION_ERROR' : `HTTP_${status}`);

      // Extract specific validation message if available
      let message = data?.message;
      if (!message && data?.details && typeof data.details === 'object') {
        const detailsObj = data.details as {
          errors?: string[];
          properties?: Record<string, { errors?: string[]; message?: string }>;
        };
        if (
          Array.isArray(detailsObj.errors) &&
          detailsObj.errors.length > 0 &&
          detailsObj.errors[0]
        ) {
          message = detailsObj.errors[0];
        } else if (detailsObj.properties && typeof detailsObj.properties === 'object') {
          for (const prop of Object.values(detailsObj.properties)) {
            if (Array.isArray(prop?.errors) && prop.errors.length > 0 && prop.errors[0]) {
              message = prop.errors[0];
              break;
            }
            if (prop?.message) {
              message = prop.message;
              break;
            }
          }
        }
      }

      if (!message) {
        message =
          (typeof data?.error === 'string' && data.error !== 'Validation Error'
            ? data.error
            : null) ||
          error.message ||
          'An unexpected error occurred.';
      }

      return Promise.reject(new ApiError(status, code, message, data?.details));
    }

    // 3. Request timed out
    if (error.code === 'ECONNABORTED') {
      return Promise.reject(
        new ApiError(408, 'TIMEOUT', 'Request timed out. Please check your internet connection.'),
      );
    }

    // 4. Network or connectivity errors
    return Promise.reject(
      new ApiError(
        0,
        'NETWORK_ERROR',
        'Unable to reach the server. Please check your internet connection.',
      ),
    );
  },
);

/**
 * Primary HTTP request helper conforming to AGENTS.md §13.
 * Feature services must call makeApiRequest instead of raw Axios.
 */
export async function makeApiRequest<T>(config: AxiosRequestConfig): Promise<T> {
  const response = await axiosInstance.request<T>(config);
  return response.data;
}
