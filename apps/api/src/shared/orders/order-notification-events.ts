import { z } from 'zod';

import { redis } from '../redis/redis.client.js';

export const notificationEventSchema = z
  .object({
    notificationId: z.uuid(),
    vendorOrderId: z.uuid(),
    type: z.enum(['new_order', 'customer_cancelled']),
  })
  .strict();
export type NotificationEvent = z.infer<typeof notificationEventSchema>;
export type NotificationSignal = { vendorId: string; event: NotificationEvent };
export const notificationChannel = (vendorId: string) => `vendor:${vendorId}:order-notifications`;

export async function publishOrderNotifications(signals: NotificationSignal[]) {
  if (!signals.length) return;
  const publisher = redis.duplicate({
    enableOfflineQueue: false,
    maxRetriesPerRequest: 0,
    retryStrategy: () => null,
  });
  publisher.on('error', () => {});
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    const publish = async () => {
      if (publisher.status === 'wait') await publisher.connect();
      else if (publisher.status !== 'ready')
        await new Promise<void>((resolve, reject) => {
          publisher.once('ready', resolve);
          publisher.once('error', reject);
        });
      await Promise.all(
        signals.map(({ vendorId, event }) =>
          publisher.publish(
            notificationChannel(vendorId),
            JSON.stringify(notificationEventSchema.parse(event)),
          ),
        ),
      );
    };
    await Promise.race([
      publish(),
      new Promise<never>((_, reject) => {
        timer = setTimeout(() => reject(new Error('Publication timed out')), 1000);
      }),
    ]);
  } catch {
    for (const { vendorId, event } of signals)
      console.warn(
        JSON.stringify({
          event: 'order_notification_publish_failed',
          vendorId,
          notificationId: event.notificationId,
          type: event.type,
        }),
      );
  } finally {
    clearTimeout(timer);
    publisher.disconnect();
  }
}
