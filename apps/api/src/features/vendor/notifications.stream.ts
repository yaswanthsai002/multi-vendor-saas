import { AppError } from '../../shared/errors/AppError.js';
import {
  notificationChannel,
  notificationEventSchema,
  type NotificationEvent,
} from '../../shared/orders/order-notification-events.js';
import { redis } from '../../shared/redis/redis.client.js';

import { emptyNotificationInputSchema } from './notifications.schema.js';
import { requireVendorProfile, type VendorRequest } from './vendor.middleware.js';

import type { NextFunction, Response } from 'express';

export async function streamNotifications(req: VendorRequest, res: Response, next: NextFunction) {
  const vendorId = req.vendor?.vendorId;
  const expiresAt = req.user?.exp;
  try {
    emptyNotificationInputSchema.parse(req.query);
    if (
      !vendorId ||
      typeof expiresAt !== 'number' ||
      !Number.isFinite(expiresAt) ||
      expiresAt * 1000 <= Date.now()
    )
      throw new AppError(401, 'AUTH_TOKEN_INVALID', 'A valid expiring session is required.');
  } catch (error) {
    next(error);
    return;
  }

  const subscriber = redis.duplicate();
  let heartbeat: ReturnType<typeof setInterval> | undefined;
  let expiry: ReturnType<typeof setTimeout> | undefined;
  let subscriptionTimeout: ReturnType<typeof setTimeout> | undefined;
  let closed = false;
  let active = false;
  let pendingRefresh = false;
  function close() {
    if (closed) return;
    closed = true;
    clearInterval(heartbeat);
    clearTimeout(expiry);
    clearTimeout(subscriptionTimeout);
    subscriber.removeListener('message', onMessage);
    subscriber.removeListener('end', onDisconnect);
    subscriber.removeListener('close', onDisconnect);
    subscriber.disconnect();
    res.removeListener('close', close);
    if (res.headersSent) res.end();
  }
  function onDisconnect() {
    close();
  }
  function write(frame: string) {
    if (!closed && !res.write(frame)) close();
  }
  async function send(event?: NotificationEvent | 'refresh') {
    if (closed || !res.headersSent) return;
    if (active) {
      pendingRefresh = true;
      return;
    }
    active = true;
    try {
      await new Promise<void>((resolve, reject) => {
        void requireVendorProfile(req, res, (error?: unknown) =>
          error ? reject(error) : resolve(),
        );
      });
      if (
        req.vendor?.vendorId !== vendorId ||
        typeof expiresAt !== 'number' ||
        expiresAt * 1000 <= Date.now()
      ) {
        close();
        return;
      }
      if (event === 'refresh') write('event: refresh\ndata: {}\n\n');
      else if (event) write(`event: notification\ndata: ${JSON.stringify(event)}\n\n`);
      else write(': heartbeat\n\n');
    } catch {
      close();
    } finally {
      active = false;
      if (pendingRefresh && !closed) {
        pendingRefresh = false;
        void send('refresh');
      }
    }
  }
  function onMessage(channel: string, raw: string) {
    if (channel !== notificationChannel(vendorId!)) return;
    try {
      const event = notificationEventSchema.safeParse(JSON.parse(raw));
      if (event.success) void send(event.data);
    } catch {
      /* Malformed transport messages never reach the browser. */
    }
  }
  subscriber.on('message', onMessage);
  subscriber.on('error', () => {
    console.warn(JSON.stringify({ event: 'order_notification_subscription_failed', vendorId }));
    close();
  });
  subscriber.on('end', onDisconnect);
  subscriber.on('close', onDisconnect);
  res.on('close', close);
  try {
    await Promise.race([
      subscriber.subscribe(notificationChannel(vendorId!)),
      new Promise<never>((_, reject) => {
        subscriptionTimeout = setTimeout(() => reject(new Error('Subscription timed out')), 1000);
      }),
    ]);
    clearTimeout(subscriptionTimeout);
    if (closed)
      throw new AppError(500, 'NOTIFICATION_STREAM_UNAVAILABLE', 'Live alerts are unavailable.');
    res.set({
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
      'X-Accel-Buffering': 'no',
    });
    res.flushHeaders();
    write('event: ready\ndata: {}\n\n');
    heartbeat = setInterval(() => {
      void send();
    }, 15000);
    expiry = setTimeout(close, Math.min(Math.max(0, expiresAt! * 1000 - Date.now()), 2147483647));
  } catch (error) {
    if (!res.headersSent) {
      close();
      next(error);
    } else close();
  }
}
