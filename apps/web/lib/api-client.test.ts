import { describe, it, expect, vi, beforeEach } from 'vitest';

import { ApiError, makeApiRequest, axiosInstance } from './api-client';

import type { InternalAxiosRequestConfig } from 'axios';

describe('API Client (api-client.ts)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('ApiError class', () => {
    it('should correctly instantiate with status, code, message and details', () => {
      const error = new ApiError(409, 'EMAIL_IN_USE', 'Account exists', { field: 'email' });
      expect(error).toBeInstanceOf(Error);
      expect(error.name).toBe('ApiError');
      expect(error.status).toBe(409);
      expect(error.code).toBe('EMAIL_IN_USE');
      expect(error.message).toBe('Account exists');
      expect(error.details).toEqual({ field: 'email' });
      expect(error.isCanceled).toBe(false);
    });

    it('should correctly flag canceled requests', () => {
      const error = new ApiError(0, 'REQUEST_ABORTED', 'Request was cancelled', undefined, true);
      expect(error.isCanceled).toBe(true);
      expect(error.code).toBe('REQUEST_ABORTED');
    });
  });

  describe('makeApiRequest', () => {
    it('should return response data on success', async () => {
      const mockData = { user: { id: '1', name: 'Alice' } };
      vi.spyOn(axiosInstance, 'request').mockResolvedValueOnce({
        data: mockData,
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as InternalAxiosRequestConfig,
      });

      const result = await makeApiRequest<{ user: { id: string; name: string } }>({
        url: '/api/auth/me',
        method: 'GET',
      });

      expect(result).toEqual(mockData);
    });
  });
});
