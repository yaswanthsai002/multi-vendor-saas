import { z } from 'zod';

export const resetPasswordSchema = z
  .object({
    newPassword: z
      .string()
      .min(8, 'Password must be at least 8 characters.')
      .max(128, 'Password must not exceed 128 characters.'),
    confirmNewPassword: z.string(),
  })
  .refine(({ newPassword, confirmNewPassword }) => newPassword === confirmNewPassword, {
    path: ['confirmNewPassword'],
    message: 'Passwords do not match.',
  });

export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;
