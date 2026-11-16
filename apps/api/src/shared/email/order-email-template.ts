import { renderEmailTemplate, type EmailOrderItem } from './email-template.js';

const templates = {
  placed: 'order-placed',
  cancelled: 'order-cancelled',
  processing: 'order-processing',
  completed: 'order-completed',
  vendor_cancelled: 'order-vendor-cancelled',
} as const;

export type OrderEmailUpdate = keyof typeof templates;

export function renderOrderEmail({
  orderNumber,
  update,
  orderUrl,
  items,
  total,
}: {
  orderNumber: string;
  update: OrderEmailUpdate;
  orderUrl: string;
  items: EmailOrderItem[];
  total: string;
}) {
  return renderEmailTemplate(templates[update], { orderNumber, orderUrl }, { items, total });
}
