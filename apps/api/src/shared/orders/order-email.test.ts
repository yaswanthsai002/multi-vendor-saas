import { beforeEach, describe, expect, it, vi } from 'vitest';

import { sendEmail } from '../email/email.service.js';

import { sendOrderEmail } from './order-email.js';

const { order, customer, items } = vi.hoisted(() => ({
  order: vi.fn(),
  customer: vi.fn(),
  items: vi.fn(),
}));
vi.mock('@repo/db', () => ({
  getDb: () => ({
    query: { orders: { findFirst: order }, users: { findFirst: customer } },
    select: () => ({ from: () => ({ innerJoin: () => ({ where: () => ({ orderBy: items }) }) }) }),
  }),
}));
vi.mock('../email/email.service.js', () => ({ sendEmail: vi.fn() }));
vi.mock('../config/env.js', () => ({
  getEmailConfig: () => ({ origin: 'https://perigee.example' }),
}));

beforeEach(() => {
  vi.clearAllMocks();
  order.mockResolvedValue({ userId: 'owner', orderNumber: 'PG-123' });
  customer.mockResolvedValue({ email: 'owner@example.com' });
  items.mockResolvedValue([
    {
      name: 'Lamp',
      quantity: 2,
      unitPrice: '100.10',
      subtotal: '200.20',
      total: '200.20',
      vendorOrderId: 'portion-id',
    },
  ]);
  vi.mocked(sendEmail).mockResolvedValue(undefined);
});

describe('order email', () => {
  it.each([
    ['placed', 'Your order has been placed.'],
    ['cancelled', 'Your order has been cancelled.'],
    ['processing', 'A vendor has started processing their part'],
    ['completed', 'A vendor has completed their part'],
    ['vendor_cancelled', 'A vendor has cancelled their part'],
  ] as const)('emails the persisted customer for %s', async (update, text) => {
    await sendOrderEmail('order-id', update, 'portion-id');
    expect(sendEmail).toHaveBeenCalledWith({
      to: 'owner@example.com',
      subject: expect.stringContaining('Perigee PG-123'),
      text: expect.stringContaining(text),
      html: expect.stringContaining('https://perigee.example/orders/order-id'),
    });
  });

  it('marks only the affected vendor portion and includes original snapshot total', async () => {
    items.mockResolvedValueOnce([
      {
        name: 'Lamp',
        quantity: 2,
        unitPrice: '100.10',
        subtotal: '200.20',
        total: '250.20',
        vendorOrderId: 'portion-id',
      },
      {
        name: 'Book',
        quantity: 1,
        unitPrice: '50.00',
        subtotal: '50.00',
        total: '250.20',
        vendorOrderId: 'other-portion',
      },
    ]);
    await sendOrderEmail('order-id', 'processing', 'portion-id');
    const message = vi.mocked(sendEmail).mock.calls[0][0];
    expect(message.text).toContain(
      'Lamp — 2 × ₹100.10 — Subtotal ₹200.20 — affected by this update',
    );
    expect(message.text).toContain('Book — 1 × ₹50.00 — Subtotal ₹50.00');
    expect(message.text).toContain('Original order total: ₹250.20');
    expect(message.text).not.toContain('Book — 1 × ₹50.00 — Subtotal ₹50.00 — affected');
  });

  it.each(['order', 'customer', 'smtp'])(
    'keeps committed operation successful on %s failure',
    async (failure) => {
      const log = vi.spyOn(console, 'error').mockImplementation(() => {});
      if (failure === 'order') order.mockRejectedValueOnce(new Error('DB private details'));
      if (failure === 'customer') customer.mockResolvedValueOnce(undefined);
      if (failure === 'smtp')
        vi.mocked(sendEmail).mockRejectedValueOnce(new Error('SMTP private details'));
      await expect(sendOrderEmail('order-id', 'placed')).resolves.toBeUndefined();
      expect(log).toHaveBeenCalledWith(
        JSON.stringify({ event: 'order_email_failed', orderId: 'order-id', update: 'placed' }),
      );
      log.mockRestore();
    },
  );
});
