import { type getDb } from '@repo/db';
import { vendorOrderNotifications } from '@repo/db/schema';

import type { NotificationEvent, NotificationSignal } from './order-notification-events.js';

type Transaction = Parameters<Parameters<ReturnType<typeof getDb>['transaction']>[0]>[0];

export async function saveOrderNotification(
  tx: Transaction,
  portion: { vendorOrderId: string; vendorId: string },
  type: NotificationEvent['type'],
): Promise<NotificationSignal> {
  const [record] = await tx
    .insert(vendorOrderNotifications)
    .values({ vendorOrderId: portion.vendorOrderId, type })
    .returning({
      notificationId: vendorOrderNotifications.notificationId,
      vendorOrderId: vendorOrderNotifications.vendorOrderId,
      type: vendorOrderNotifications.type,
    });
  return { vendorId: portion.vendorId, event: record };
}
