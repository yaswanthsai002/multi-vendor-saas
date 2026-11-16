import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { emailBrandAttachments } from './email-assets.js';

const { sendMail, createTransport } = vi.hoisted(() => {
  const sendMail = vi.fn();
  return { sendMail, createTransport: vi.fn(() => ({ sendMail })) };
});
vi.mock('nodemailer', () => ({ default: { createTransport } }));

const message = {
  to: 'customer@example.com',
  subject: 'Verify email',
  text: 'Code: ABC123',
  html: '<p>Code: ABC123</p>',
};

beforeEach(() => {
  vi.resetModules();
  vi.clearAllMocks();
  vi.stubEnv('EMAIL_USER', 'perigee.test@gmail.com');
  vi.stubEnv('EMAIL_PASS', 'abcd efgh ijkl mnop');
  vi.stubEnv('WEB_ORIGIN', 'https://perigee.example');
  sendMail.mockResolvedValue({ accepted: [message.to], rejected: [] });
});
afterEach(() => vi.unstubAllEnvs());

describe('Gmail email sender', () => {
  it('sends from the configured account over TLS and reuses the transport', async () => {
    const { sendEmail } = await import('./email.service.js');
    await sendEmail(message);
    await sendEmail(message);
    expect(createTransport).toHaveBeenCalledTimes(1);
    expect(createTransport).toHaveBeenCalledWith(
      expect.objectContaining({
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        auth: { user: 'perigee.test@gmail.com', pass: 'abcdefghijklmnop' },
        disableFileAccess: true,
        disableUrlAccess: true,
      }),
    );
    expect(sendMail).toHaveBeenCalledWith({
      ...message,
      from: { name: 'Perigee', address: 'perigee.test@gmail.com' },
      replyTo: 'perigee.test@gmail.com',
      attachments: emailBrandAttachments,
    });
  });

  it.each(['', 'not-an-email', 'a@@example.com'])(
    'rejects invalid sender configuration',
    async (user) => {
      vi.stubEnv('EMAIL_USER', user);
      const { sendEmail } = await import('./email.service.js');
      await expect(sendEmail(message)).rejects.toThrow('Set valid EMAIL_USER and EMAIL_PASS');
      expect(sendMail).not.toHaveBeenCalled();
    },
  );

  it('rejects missing credentials without exposing values', async () => {
    vi.stubEnv('EMAIL_PASS', ' ');
    const { sendEmail } = await import('./email.service.js');
    await expect(sendEmail(message)).rejects.toThrow('Set valid EMAIL_USER and EMAIL_PASS');
    expect(sendMail).not.toHaveBeenCalled();
  });

  it('builds public links from configured website origin only', async () => {
    vi.stubEnv('WEB_ORIGIN', 'https://perigee.example/path?ignored=1#ignored');
    const { getEmailConfig } = await import('../config/env.js');
    expect(getEmailConfig().origin).toBe('https://perigee.example');
  });

  it.each(['', 'not-a-url', 'javascript:alert(1)', 'https://user:password@example.com'])(
    'rejects invalid website origin %s',
    async (origin) => {
      vi.stubEnv('WEB_ORIGIN', origin);
      const { getEmailConfig } = await import('../config/env.js');
      expect(() => getEmailConfig()).toThrow('Set WEB_ORIGIN');
    },
  );

  it.each([
    { ...message, to: 'invalid' },
    { ...message, to: 'first@example.com,second@example.com' },
    { ...message, subject: 'Subject\r\nBcc: attacker@example.com' },
  ])('rejects invalid message before SMTP', async (input) => {
    const { sendEmail } = await import('./email.service.js');
    await expect(sendEmail(input)).rejects.toThrow();
    expect(sendMail).not.toHaveBeenCalled();
  });

  it('returns a safe application error on SMTP failure', async () => {
    sendMail.mockRejectedValue(new Error('SMTP auth credentials and private message'));
    const { sendEmail } = await import('./email.service.js');
    await expect(sendEmail(message)).rejects.toMatchObject({
      statusCode: 500,
      code: 'EMAIL_DELIVERY_FAILED',
      message: 'Email could not be sent. Please try again.',
    });
  });

  it('rejects SMTP acceptance without accepted recipients', async () => {
    sendMail.mockResolvedValue({ accepted: [], rejected: [message.to] });
    const { sendEmail } = await import('./email.service.js');
    await expect(sendEmail(message)).rejects.toMatchObject({ code: 'EMAIL_DELIVERY_FAILED' });
  });
});
