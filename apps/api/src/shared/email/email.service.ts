import nodemailer from 'nodemailer';
import { z } from 'zod';

import { getEmailConfig } from '../config/env.js';
import { AppError } from '../errors/AppError.js';

import { emailBrandAttachments } from './email-assets.js';

const messageSchema = z.object({
  to: z.email(),
  subject: z
    .string()
    .min(1)
    .refine((value) => !/[\r\n]/.test(value)),
  text: z.string().min(1),
  html: z.string().min(1),
});

let transporter: ReturnType<typeof nodemailer.createTransport> | undefined;

export async function sendEmail(input: z.infer<typeof messageSchema>) {
  const message = messageSchema.parse(input);
  const { user, pass } = getEmailConfig();
  transporter ??= nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: { user, pass },
    connectionTimeout: 10_000,
    greetingTimeout: 10_000,
    socketTimeout: 10_000,
    disableFileAccess: true,
    disableUrlAccess: true,
  });
  try {
    const result = await transporter.sendMail({
      from: { name: 'Perigee', address: user },
      replyTo: user,
      ...message,
      attachments: emailBrandAttachments,
    });
    if (!result.accepted?.length || result.rejected?.length) throw new Error('SMTP rejected email');
  } catch {
    // SMTP errors can include credentials, recipients and message content.
    throw new AppError(500, 'EMAIL_DELIVERY_FAILED', 'Email could not be sent. Please try again.');
  }
}
