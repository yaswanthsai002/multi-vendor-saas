import { beforeEach, describe, expect, it, vi } from 'vitest';

import { makeApiRequest } from '@/lib/api-client';

import {
  fetchVendorOrderDetail,
  fetchVendorOrders,
  updateVendorOrderStatus,
} from './order.service';

vi.mock('@/lib/api-client', async (original) => ({
  ...(await original<object>()),
  makeApiRequest: vi.fn(),
}));

const detail = {
  order: { orderNumber: 'PG-1', placedAt: '2026-11-19T00:00:00Z', overallStatus: 'pending' },
  fulfillment: {
    vendorOrderId: 'portion',
    status: 'pending',
    updatedAt: '2026-11-19T00:00:00Z',
    completedAt: null,
    cancellation: null,
    allowedActions: ['process', 'cancel'],
  },
  customer: { name: 'Customer', email: 'customer@example.com', phone: null },
  deliveryAddress: null,
  items: [],
  summary: { itemCount: 0, total: '0.00' },
};

describe('vendor order response boundary', () => {
  beforeEach(() => vi.resetAllMocks());
  it('unwraps and validates detail and mutation envelopes', async () => {
    vi.mocked(makeApiRequest).mockResolvedValue({ success: true, data: detail });
    expect(await fetchVendorOrderDetail('portion')).toEqual(detail);
    expect(await updateVendorOrderStatus('portion', { status: 'processing' })).toEqual(detail);
    expect(makeApiRequest).toHaveBeenLastCalledWith(
      expect.objectContaining({ method: 'POST', data: { status: 'processing' } }),
    );
  });
  it('unwraps the list envelope', async () => {
    const list = {
      items: [],
      pagination: { page: 1, limit: 20, total: 0, totalPages: 0 },
      statusCounts: { all: 0, pending: 0, processing: 0, completed: 0, cancelled: 0 },
    };
    vi.mocked(makeApiRequest).mockResolvedValue({ success: true, data: list });
    expect(await fetchVendorOrders()).toEqual(list);
  });
  it('rejects malformed data and preserves request failures', async () => {
    vi.mocked(makeApiRequest).mockResolvedValue(detail);
    await expect(fetchVendorOrderDetail('portion')).rejects.toMatchObject({
      code: 'INVALID_RESPONSE',
      status: 502,
    });
    const error = new Error('Request failed');
    vi.mocked(makeApiRequest).mockRejectedValue(error);
    await expect(fetchVendorOrders()).rejects.toBe(error);
  });
});
