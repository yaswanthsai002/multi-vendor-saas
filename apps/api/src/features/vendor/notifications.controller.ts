import { AppError } from '../../shared/errors/AppError.js';

import {
  orderNotificationParamsSchema,
  orderNotificationReadSchema,
  emptyNotificationInputSchema,
  notificationListQuerySchema,
  notificationParamsSchema,
} from './notifications.schema.js';
import {
  readOrderNotifications,
  deleteNotification,
  listNotifications,
  readNotification,
} from './notifications.service.js';

import type { VendorRequest } from './vendor.middleware.js';
import type { NextFunction, Response } from 'express';

export async function getNotifications(req: VendorRequest, res: Response, next: NextFunction) {
  try {
    if (!req.vendor) throw new AppError(403, 'FORBIDDEN', 'Vendor profile required.');
    res.json({
      success: true,
      data: await listNotifications(
        req.vendor.vendorId,
        notificationListQuerySchema.parse(req.query),
      ),
    });
  } catch (error) {
    next(error);
  }
}

export async function markNotificationRead(req: VendorRequest, res: Response, next: NextFunction) {
  try {
    if (!req.vendor) throw new AppError(403, 'FORBIDDEN', 'Vendor profile required.');
    const { notificationId } = notificationParamsSchema.parse(req.params);
    emptyNotificationInputSchema.parse(req.body ?? {});
    emptyNotificationInputSchema.parse(req.query);
    await readNotification(req.vendor.vendorId, notificationId);
    res.status(204).end();
  } catch (error) {
    next(error);
  }
}

export async function removeNotification(req: VendorRequest, res: Response, next: NextFunction) {
  try {
    if (!req.vendor) throw new AppError(403, 'FORBIDDEN', 'Vendor profile required.');
    const { notificationId } = notificationParamsSchema.parse(req.params);
    emptyNotificationInputSchema.parse(req.body ?? {});
    emptyNotificationInputSchema.parse(req.query);
    await deleteNotification(req.vendor.vendorId, notificationId);
    res.status(204).end();
  } catch (error) {
    next(error);
  }
}

export async function markOrderNotificationsRead(
  req: VendorRequest,
  res: Response,
  next: NextFunction,
) {
  try {
    if (!req.vendor) throw new AppError(403, 'FORBIDDEN', 'Vendor profile required.');
    const { vendorOrderId } = orderNotificationParamsSchema.parse(req.params);
    const { status } = orderNotificationReadSchema.parse(req.body);
    emptyNotificationInputSchema.parse(req.query);
    const changed = await readOrderNotifications(req.vendor.vendorId, vendorOrderId, status);
    res.json({ success: true, data: { vendorId: req.vendor.vendorId, changed } });
  } catch (error) {
    next(error);
  }
}
