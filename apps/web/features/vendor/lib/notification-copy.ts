import type { VendorNotification } from '../schemas/notification.schema';

export function notificationDescription(summary: VendorNotification['summary']) {
  const names = summary.items.map((item) => `${item.name} × ${item.quantity}`).join(' · ');
  const remaining = Math.max(0, summary.productCount - summary.items.length);
  return (
    `${names}${remaining ? ` · +${remaining} more ${remaining === 1 ? 'product' : 'products'}` : ''}` ||
    'Open the order to review its items'
  );
}
