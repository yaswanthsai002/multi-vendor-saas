import { z } from 'zod';

export const notificationParamsSchema = z.object({ notificationId: z.uuid() }).strict();
export const emptyNotificationInputSchema = z.object({}).strict();
export const notificationCursorSchema = z
  .object({ createdAt: z.iso.datetime({ precision: 3 }), notificationId: z.uuid() })
  .strict();
export const notificationListQuerySchema = z
  .object({
    limit: z.coerce.number().int().min(1).max(50).default(20),
    cursor: z
      .string()
      .min(1)
      .max(512)
      .regex(/^[A-Za-z0-9_-]+$/)
      .transform((value, ctx) => {
        try {
          return notificationCursorSchema.parse(
            JSON.parse(Buffer.from(value, 'base64url').toString('utf8')),
          );
        } catch {
          ctx.addIssue({ code: 'custom', message: 'Invalid notification cursor.' });
          return z.NEVER;
        }
      })
      .optional(),
  })
  .strict();

export type NotificationListQuery = z.infer<typeof notificationListQuerySchema>;

export const orderNotificationParamsSchema = z.object({ vendorOrderId: z.uuid() }).strict();
export const orderNotificationReadSchema = z
  .object({ status: z.enum(['pending', 'processing', 'completed', 'cancelled']) })
  .strict();
