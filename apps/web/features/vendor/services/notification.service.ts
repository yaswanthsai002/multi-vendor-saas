import { ApiError, makeApiRequest } from '@/lib/api-client';
import { API_ENDPOINTS } from '@/lib/api-endpoints';

import { notificationResponseSchema } from '../schemas/notification.schema';

export async function fetchNotifications(cursor?: string, signal?: AbortSignal) {
  const body = await makeApiRequest<unknown>({
    url: API_ENDPOINTS.vendor.notifications.list,
    method: 'GET',
    params: { limit: 20, cursor },
    signal,
  });
  const parsed = notificationResponseSchema.safeParse(body);
  if (!parsed.success)
    throw new ApiError(502, 'INVALID_RESPONSE', 'Could not read notifications. Please try again.');
  return parsed.data.data;
}
export async function markNotificationRead(notificationId: string) {
  await makeApiRequest<void>({
    url: API_ENDPOINTS.vendor.notifications.read(notificationId),
    method: 'PUT',
  });
}
export async function deleteNotification(notificationId: string) {
  await makeApiRequest<void>({
    url: API_ENDPOINTS.vendor.notifications.remove(notificationId),
    method: 'DELETE',
  });
}
