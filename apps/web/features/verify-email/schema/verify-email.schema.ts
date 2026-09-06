import { z } from 'zod';

export const verifyEmailSchema = z.object({
  email: z.string().email('Enter a valid email address.').trim().toLowerCase(),
  otp: z
    .string()
    .trim()
    .length(6, 'Please enter all 6 characters.')
    .regex(/^[0-9A-Za-z]{6}$/, 'Code must be alphanumeric.'),
  purpose: z.enum(['email_verification', 'password_reset', 'signin']).default('email_verification'),
});

export type VerifyEmailFormData = z.infer<typeof verifyEmailSchema>;
