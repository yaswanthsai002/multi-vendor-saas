import { readFileSync } from 'node:fs';

import { z } from 'zod';

const templateNameSchema = z.enum([
  'email-verification',
  'password-reset',
  'order-placed',
  'order-cancelled',
  'order-processing',
  'order-completed',
  'order-vendor-cancelled',
]);
type TemplateName = z.infer<typeof templateNameSchema>;
const directory = new URL('../../../src/shared/email/templates/', import.meta.url);
const metadata = z
  .record(
    templateNameSchema,
    z.object({
      subject: z.string(),
      preheader: z.string(),
      category: z.string(),
      title: z.string().optional(),
      intro: z.string().optional(),
      next: z.string().optional(),
      safety: z.string().optional(),
    }),
  )
  .parse(JSON.parse(readFileSync(new URL('metadata.json', directory), 'utf8')));
const otpText = readFileSync(new URL('otp.txt', directory), 'utf8');
const orderText = readFileSync(new URL('order.txt', directory), 'utf8');
const templates = new Map(
  ['email-verification', 'password-reset', 'order'].map((name) => [
    name,
    {
      html: readFileSync(new URL(`${name}.html`, directory), 'utf8'),
      text: name === 'order' ? orderText : otpText,
    },
  ]),
);
const layout = readFileSync(new URL('layout.html', directory), 'utf8').split('{{content}}');
const itemTemplate = readFileSync(new URL('order-item.html', directory), 'utf8');
const itemListTemplate = readFileSync(new URL('order-items.html', directory), 'utf8').split(
  '{{rows}}',
);
if (layout.length !== 2) throw new Error('Email layout must contain one content slot.');
if (itemListTemplate.length !== 2) throw new Error('Order template must contain one rows slot.');

export type EmailOrderItem = {
  name: string;
  quantity: number;
  unitPrice: string;
  subtotal: string;
  affected: boolean;
};

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (character) => {
    switch (character) {
      case '&':
        return '&amp;';
      case '<':
        return '&lt;';
      case '>':
        return '&gt;';
      case '"':
        return '&quot;';
      default:
        return '&#39;';
    }
  });
}

function interpolate(template: string, values: Record<string, string>, html = false): string {
  return template.replace(/{{([a-zA-Z][a-zA-Z0-9]*)}}/g, (_match, key: string) => {
    const value = values[key];
    if (typeof value !== 'string') throw new Error(`Missing email template field: ${key}`);
    return html ? escapeHtml(value) : value;
  });
}

export function renderEmailTemplate(
  name: TemplateName,
  values: Record<string, string>,
  order?: { items: EmailOrderItem[]; total: string },
) {
  const template = templates.get(name.startsWith('order-') ? 'order' : name);
  if (!template) throw new Error('Unknown email template.');
  const meta = metadata[name];
  const subject = interpolate(meta.subject, values);
  const templateFields: Record<string, string> = {
    ...values,
    subject,
    preheader: meta.preheader,
    category: meta.category,
  };
  if (meta.title !== undefined) templateFields.title = meta.title;
  if (meta.intro !== undefined) templateFields.intro = meta.intro;
  if (meta.next !== undefined) templateFields.next = meta.next;
  if (meta.safety !== undefined) templateFields.safety = meta.safety;
  const htmlParts = template.html.split('{{items}}');
  const textParts = template.text.split('{{items}}');
  if (
    (htmlParts.length > 1 || textParts.length > 1) &&
    (!order || htmlParts.length !== 2 || textParts.length !== 2)
  ) {
    throw new Error('Order email requires items and one items slot per template.');
  }
  const itemValues =
    order?.items.map((item) => ({
      ...item,
      quantity: String(item.quantity),
      affected: item.affected ? ' — affected by this update' : '',
    })) ?? [];
  const rows = itemValues.map((item) => interpolate(itemTemplate, item, true)).join('');
  const listFields = { total: order?.total ?? '' };
  const itemsHtml = order
    ? interpolate(itemListTemplate[0], listFields, true) +
      rows +
      interpolate(itemListTemplate[1], listFields, true)
    : '';
  const itemsText = order
    ? itemValues
        .map(
          (item) =>
            `${item.name} — ${item.quantity} × ₹${item.unitPrice} — Subtotal ₹${item.subtotal}${item.affected}`,
        )
        .join('\n') + `\nOriginal order total: ₹${order.total}`
    : '';
  // Only local template markup enters the layout slot; every interpolated HTML value is escaped.
  const html =
    interpolate(layout[0], templateFields, true) +
    htmlParts.map((part) => interpolate(part, templateFields, true)).join(itemsHtml) +
    interpolate(layout[1], templateFields, true);
  return {
    subject,
    html,
    text: textParts.map((part) => interpolate(part, templateFields)).join(itemsText),
  };
}
