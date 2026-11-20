import { afterEach, describe, expect, it, vi } from 'vitest';

import { notificationEventSchema, publishOrderNotifications } from './order-notification-events.js';

const mocks = vi.hoisted(() => ({ publish: vi.fn(), disconnect: vi.fn() }));
vi.mock('../redis/redis.client.js', () => ({
  redis: {
    duplicate: () => ({
      status: 'ready',
      publish: mocks.publish,
      disconnect: mocks.disconnect,
      on: vi.fn(),
    }),
  },
}));
const signal = {
  vendorId: '11111111-1111-4111-8111-111111111111',
  event: {
    notificationId: '22222222-2222-4222-8222-222222222222',
    vendorOrderId: '33333333-3333-4333-8333-333333333333',
    type: 'new_order' as const,
  },
};
afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
  vi.clearAllMocks();
});
describe('post-commit notification signals', () => {
  it('publishes only fixed committed identifiers', async () => {
    mocks.publish.mockResolvedValue(1);
    await publishOrderNotifications([signal]);
    expect(mocks.publish).toHaveBeenCalledWith(
      `vendor:${signal.vendorId}:order-notifications`,
      JSON.stringify(signal.event),
    );
    expect(mocks.disconnect).toHaveBeenCalledOnce();
    expect(
      notificationEventSchema.safeParse({ ...signal.event, cancellationDetails: 'private' })
        .success,
    ).toBe(false);
  });
  it('does not fail the caller after Redis rejects', async () => {
    mocks.publish.mockRejectedValue(new Error('Private transport internals'));
    const log = vi.spyOn(console, 'warn').mockImplementation(() => {});
    await expect(publishOrderNotifications([signal])).resolves.toBeUndefined();
    expect(log.mock.calls.flat().join(' ')).not.toContain('Private transport internals');
  });
  it('bounds a stalled publication and releases its connection', async () => {
    vi.useFakeTimers();
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    mocks.publish.mockImplementation(() => new Promise(() => {}));
    const result = publishOrderNotifications([signal]);
    await vi.advanceTimersByTimeAsync(1000);
    await expect(result).resolves.toBeUndefined();
    expect(mocks.disconnect).toHaveBeenCalledOnce();
    expect(vi.getTimerCount()).toBe(0);
  });
});
