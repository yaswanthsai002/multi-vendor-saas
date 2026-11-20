export const NOTIFICATION_CHANNEL = 'perigee-vendor-notifications';

export const NOTIFICATION_CHANGED_EVENT = 'perigee-vendor-notifications-changed';

export function notifyNotificationTabs(vendorId: string) {
  if (typeof window !== 'undefined') window.dispatchEvent(new Event(NOTIFICATION_CHANGED_EVENT));
  if (typeof BroadcastChannel === 'undefined') return;
  let channel: BroadcastChannel | undefined;
  try {
    channel = new BroadcastChannel(NOTIFICATION_CHANNEL);
    channel.postMessage({ type: 'changed', vendorId });
  } catch {
    /* Periodic recovery also works when browser messaging is unavailable. */
  } finally {
    channel?.close();
  }
}
