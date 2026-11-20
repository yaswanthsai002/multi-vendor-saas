import { EventEmitter } from 'node:events';

import express from 'express';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { streamNotifications } from './notifications.stream.js';

import type { VendorRequest } from './vendor.middleware.js';
import type { NextFunction, Response } from 'express';

const mocks = vi.hoisted(() => ({ duplicate: vi.fn(), check: vi.fn() }));
vi.mock('../../shared/redis/redis.client.js', () => ({ redis: { duplicate: mocks.duplicate } }));
vi.mock('./vendor.middleware.js', () => ({ requireVendorProfile: mocks.check }));
const vendorId = '11111111-1111-4111-8111-111111111111';
const event = {
  notificationId: '22222222-2222-4222-8222-222222222222',
  vendorOrderId: '33333333-3333-4333-8333-333333333333',
  type: 'new_order',
};
function createSubscriber() {
  return Object.assign(new EventEmitter(), {
    subscribe: vi.fn().mockResolvedValue(1),
    disconnect: vi.fn(),
  });
}
let subscriber: ReturnType<typeof createSubscriber>;

async function withStream(
  run: (url: string) => Promise<void>,
  exp = Math.floor(Date.now() / 1000) + 3600,
) {
  const app = express();
  app.get('/', (req: VendorRequest, res, next) => {
    req.user = { sub: vendorId, exp };
    req.vendor = {
      vendorId,
      userId: vendorId,
      status: 'suspended',
      name: 'Vendor',
      slug: 'vendor',
    };
    void streamNotifications(req, res, next);
  });
  app.use((_error: unknown, _req: VendorRequest, res: Response, _next: NextFunction) =>
    res.status(500).json({ message: 'Unavailable' }),
  );
  const server = app.listen(0, '127.0.0.1');
  if (!server.listening) await new Promise<void>((resolve) => server.once('listening', resolve));
  const address = server.address();
  if (!address || typeof address === 'string') throw new Error('Test server address unavailable.');
  try {
    await run(`http://127.0.0.1:${address.port}`);
  } finally {
    server.closeAllConnections();
    await new Promise<void>((resolve) => server.close(() => resolve()));
  }
}

beforeEach(() => {
  subscriber = createSubscriber();
  mocks.duplicate.mockReset().mockReturnValue(subscriber);
  mocks.check
    .mockReset()
    .mockImplementation((_req: VendorRequest, _res: Response, next: NextFunction) => next());
});
describe('vendor notification SSE', () => {
  it('sends ready after subscription and rechecks access before forwarding a valid event', async () => {
    await withStream(async (url) => {
      const response = await fetch(url);
      expect(response.headers.get('content-type')).toContain('text/event-stream');
      const reader = response.body!.getReader();
      expect(new TextDecoder().decode((await reader.read()).value)).toContain('event: ready');
      expect(subscriber.subscribe).toHaveBeenCalledWith(`vendor:${vendorId}:order-notifications`);
      subscriber.emit('message', `vendor:${vendorId}:order-notifications`, JSON.stringify(event));
      const frame = new TextDecoder().decode((await reader.read()).value);
      expect(frame).toContain('event: notification');
      expect(frame).toContain(event.notificationId);
      expect(mocks.check).toHaveBeenCalledOnce();
      await reader.cancel();
      await vi.waitFor(() => expect(subscriber.disconnect).toHaveBeenCalledOnce());
    });
  });
  it('ignores malformed messages and closes on lost authorization', async () => {
    await withStream(async (url) => {
      const response = await fetch(url);
      const reader = response.body!.getReader();
      await reader.read();
      subscriber.emit(
        'message',
        `vendor:${vendorId}:order-notifications`,
        JSON.stringify({ ...event, cancellationDetails: 'private' }),
      );
      subscriber.emit('message', `vendor:${vendorId}:order-notifications`, 'not json');
      expect(mocks.check).not.toHaveBeenCalled();
      mocks.check.mockImplementation((_req: VendorRequest, _res: Response, next: NextFunction) =>
        next(new Error('Access removed')),
      );
      subscriber.emit('message', `vendor:${vendorId}:order-notifications`, JSON.stringify(event));
      expect((await reader.read()).done).toBe(true);
      expect(subscriber.disconnect).toHaveBeenCalledOnce();
    });
  });
  it('returns a safe error when subscription fails before headers', async () => {
    subscriber.subscribe.mockRejectedValue(new Error('Internal Redis details'));
    await withStream(async (url) => {
      const response = await fetch(url);
      expect(response.status).toBe(500);
      expect(await response.text()).not.toContain('Internal Redis details');
    });
    expect(subscriber.disconnect).toHaveBeenCalledOnce();
  });
});
