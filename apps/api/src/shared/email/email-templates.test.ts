import nodemailer from 'nodemailer';
import { describe, expect, it } from 'vitest';

import { emailBrandAttachments } from './email-assets.js';
import { renderEmailTemplate } from './email-template.js';
import { renderOrderEmail, type OrderEmailUpdate } from './order-email-template.js';
import { renderOtpEmail } from './otp-email.js';

const order = {
  orderNumber: 'PG-2026-1042',
  orderUrl: 'https://perigee.example/orders/123',
  items: [{ name: 'Lamp', quantity: 2, unitPrice: '100.10', subtotal: '200.20', affected: true }],
  total: '200.20',
};

describe('transactional email templates', () => {
  it.each(['email_verification', 'password_reset'] as const)(
    'renders complete %s email without code in preview text',
    (purpose) => {
      const email = renderOtpEmail({ purpose, otp: 'AB12CD' });
      expect(email.html).toContain('AB12CD');
      expect(email.text).toContain('AB12CD');
      expect(email.text).toContain('5 minutes');
      expect(email.html).toContain('Keep this code private.');
      expect(email.subject).not.toContain('AB12CD');
      expect(email.html.match(/<div\s+aria-hidden="true"[^>]*>(.*?)<\/div>/s)?.[1]).not.toContain(
        'AB12CD',
      );
    },
  );

  it('keeps account verification and password reset copy distinct', () => {
    const templates = (['email_verification', 'password_reset'] as const).map((purpose) =>
      renderOtpEmail({ purpose, otp: 'AB12CD' }),
    );
    expect(new Set(templates.map((email) => email.subject)).size).toBe(2);
    expect(templates[1].text).toContain('Your password has not changed.');
  });

  it.each<[OrderEmailUpdate, string]>([
    ['placed', 'Your order has been placed.'],
    ['cancelled', 'Your order has been cancelled.'],
    ['processing', 'A vendor has started processing their part'],
    ['completed', 'Other parts of your order may still be in progress.'],
    ['vendor_cancelled', 'Other parts of your order may continue.'],
  ])('renders %s with matching plain text, order reference and actionable link', (update, copy) => {
    const email = renderOrderEmail({ ...order, update });
    expect(email.html).toContain(copy);
    expect(email.text).toContain(copy);
    expect(email.html).toContain(order.orderNumber);
    expect(email.html).toContain(`href="${order.orderUrl}"`);
    expect(email.text).toContain(order.orderUrl);
    expect(email.html).toContain('Reply to this email');
    expect(email.subject).toContain(order.orderNumber);
  });

  it('escapes dynamic HTML and attribute content', () => {
    const malicious = `<img src=x onerror="alert('x')"> & order`;
    const email = renderOrderEmail({
      ...order,
      orderNumber: malicious,
      update: 'placed',
      orderUrl: `${order.orderUrl}?a=1&b=2`,
    });
    expect(email.html).not.toContain('<img src=x');
    expect(email.html).toContain(
      '&lt;img src=x onerror=&quot;alert(&#39;x&#39;)&quot;&gt; &amp; order',
    );
    expect(email.html).toContain('?a=1&amp;b=2');
    expect(email.text).toContain(malicious);
    expect(renderOtpEmail({ purpose: 'email_verification', otp: malicious }).html).not.toContain(
      '<img src=x',
    );
  });

  it('includes escaped item snapshots and exact monetary totals in both formats', () => {
    const email = renderOrderEmail({
      ...order,
      update: 'processing',
      items: [
        {
          name: '<b>Table</b>',
          quantity: 2,
          unitPrice: '9999999999.99',
          subtotal: '19999999999.98',
          affected: true,
        },
      ],
      total: '19999999999.98',
    });
    expect(email.html).toContain('&lt;b&gt;Table&lt;/b&gt;');
    expect(email.html).not.toContain('<b>Table</b>');
    for (const text of [email.html, email.text]) {
      expect(text).toContain('9999999999.99');
      expect(text).toContain('19999999999.98');
      expect(text).toContain('affected by this update');
      expect(text).toContain('Original order total');
    }
  });

  it('provides fallback layout, accessible text and progressive dark styling with embedded brand assets', () => {
    const email = renderOrderEmail({ ...order, update: 'completed' });
    expect(email.html).toContain('lang="en"');
    expect(email.html).toContain('role="presentation"');
    expect(email.html).toMatch(/max-width:\s*600px/);
    expect(email.html).toContain('<!--[if mso]>');
    expect(email.html).toContain('prefers-color-scheme: dark');
    expect(email.html).toContain('[data-ogsc]');
    expect(email.html).not.toMatch(/<script|<link|display:\s*(flex|grid)/i);
    expect(Buffer.byteLength(email.html)).toBeLessThan(30_000);
  });

  it('rejects missing fields and never evaluates interpolated template syntax', () => {
    expect(() => renderEmailTemplate('email-verification', {})).toThrow(
      'Missing email template field: otp',
    );
    const email = renderOtpEmail({
      purpose: 'email_verification',
      otp: '{{category}}<script>bad</script>',
    });
    expect(email.html).toContain('{{category}}&lt;script&gt;bad&lt;/script&gt;');
    expect(email.html).not.toContain('<script>bad');
  });

  it('composes real multipart email with HTML and plain-text alternatives', async () => {
    const transport = nodemailer.createTransport({ streamTransport: true, buffer: true });
    const email = renderOtpEmail({ purpose: 'password_reset', otp: 'AB12CD' });
    const result = await transport.sendMail({
      from: 'sender@example.com',
      to: 'customer@example.com',
      ...email,
      attachments: emailBrandAttachments,
    });
    const mime = result.message.toString();
    expect(mime).toContain('Content-Type: multipart/alternative;');
    expect(mime).toContain('Content-Type: text/plain; charset=utf-8');
    expect(mime).toContain('Content-Type: text/html; charset=utf-8');
    expect(mime).toContain('AB12CD');
    expect(mime).toContain('Content-Type: multipart/related;');
    for (const image of emailBrandAttachments) {
      expect(mime).toContain(`Content-ID: <${image.cid}>`);
      expect(mime).toContain('Content-Type: image/png;');
      expect(image.content.subarray(0, 8).toString('hex')).toBe('89504e470d0a1a0a');
      expect(email.html).toContain(`cid:${image.cid}`);
    }
  });
});
