import { getDb } from '@repo/db';
import { orderItems, orders, users, vendorOrders } from '@repo/db/schema';
import { asc, eq, sql } from 'drizzle-orm';

import { getEmailConfig } from '../config/env.js';
import { sendEmail } from '../email/email.service.js';
import { renderOrderEmail, type OrderEmailUpdate } from '../email/order-email-template.js';

export async function sendOrderEmail(
  orderId: string,
  update: OrderEmailUpdate,
  affectedVendorOrderId?: string,
) {
  // shortcut: best-effort after commit; use a transactional outbox when guaranteed delivery is required.
  try {
    const db = getDb();
    const order = await db.query.orders.findFirst({
      where: eq(orders.orderId, orderId),
      columns: { userId: true, orderNumber: true },
    });
    if (!order) throw new Error('Order not found');
    const customer = await db.query.users.findFirst({
      where: eq(users.userId, order.userId),
      columns: { email: true },
    });
    if (!customer) throw new Error('Customer not found');
    const items = await db
      .select({
        name: orderItems.productNameSnapshot,
        quantity: orderItems.productQuantity,
        unitPrice: orderItems.productPriceSnapshot,
        subtotal: sql<string>`(${orderItems.productPriceSnapshot} * ${orderItems.productQuantity})::numeric(22,2)::text`,
        total: sql<string>`(sum(${orderItems.productPriceSnapshot} * ${orderItems.productQuantity}) over ())::numeric(24,2)::text`,
        vendorOrderId: vendorOrders.vendorOrderId,
      })
      .from(orderItems)
      .innerJoin(vendorOrders, eq(vendorOrders.vendorOrderId, orderItems.vendorOrderId))
      .where(eq(vendorOrders.orderId, orderId))
      .orderBy(asc(orderItems.orderItemId));
    if (!items.length) throw new Error('Order has no items');
    await sendEmail({
      to: customer.email,
      ...renderOrderEmail({
        orderNumber: order.orderNumber,
        update,
        orderUrl: new URL(`/orders/${encodeURIComponent(orderId)}`, getEmailConfig().origin).href,
        items: items.map((item) => ({
          ...item,
          affected: Boolean(affectedVendorOrderId && item.vendorOrderId === affectedVendorOrderId),
        })),
        total: items[0].total,
      }),
    });
  } catch {
    // Never turn a committed order into an API failure or log SMTP details.
    console.error(JSON.stringify({ event: 'order_email_failed', orderId, update }));
  }
}
