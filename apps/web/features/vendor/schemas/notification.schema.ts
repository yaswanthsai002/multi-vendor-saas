import { z } from 'zod';

export const notificationEventSchema = z
  .object({
    notificationId: z.uuid(),
    vendorOrderId: z.uuid(),
    type: z.enum(['new_order', 'customer_cancelled']),
  })
  .strict();
export const notificationSchema = notificationEventSchema.extend({
  orderNumber: z.string(),
  summary: z.object({
    items: z.array(z.object({ name: z.string(), quantity: z.number().int().nonnegative() })).max(2),
    itemCount: z.number().int().nonnegative(),
    productCount: z.number().int().nonnegative(),
  }),
  createdAt: z.iso.datetime(),
  readAt: z.iso.datetime().nullable(),
});
export const notificationInboxSchema = z.object({
  vendorId: z.uuid(),
  items: z.array(notificationSchema),
  unreadCount: z.number().int().nonnegative().safe(),
  nextCursor: z.string().nullable(),
});
export const notificationResponseSchema = z.object({
  success: z.literal(true),
  data: notificationInboxSchema,
});
export const notificationTabMessageSchema = z
  .object({ type: z.literal('changed'), vendorId: z.uuid() })
  .strict();
export const notificationRefreshSchema = z.object({}).strict();
export type VendorNotification = z.infer<typeof notificationSchema>;
export type NotificationInbox = z.infer<typeof notificationInboxSchema>;
