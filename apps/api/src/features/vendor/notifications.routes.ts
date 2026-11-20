import { Router } from 'express';

import {
  getNotifications,
  markOrderNotificationsRead,
  markNotificationRead,
  removeNotification,
} from './notifications.controller.js';
import { streamNotifications } from './notifications.stream.js';

export const notificationsRouter = Router();
notificationsRouter.put('/orders/:vendorOrderId/read', markOrderNotificationsRead);
notificationsRouter.get('/events', streamNotifications);
notificationsRouter.get('/', getNotifications);
notificationsRouter.put('/:notificationId/read', markNotificationRead);
notificationsRouter.delete('/:notificationId', removeNotification);
