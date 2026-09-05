import { z } from 'zod';

export const signupSchema = z
  .object({
    fullName: z
      .string()
      .trim()
      .min(2, 'Full name must be at least 2 characters.')
      .max(100, 'Full name must not exceed 100 characters.'),
    email: z.email('Enter a valid email address.').trim().toLowerCase(),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters.')
      .max(128, 'Password must not exceed 128 characters.'),
    confirmPassword: z.string().min(1, 'Please confirm your password.'),
  })
  .refine(({ password, confirmPassword }) => password === confirmPassword, {
    path: ['confirmPassword'],
    message: 'Passwords do not match.',
  });

export type SignupFormData = z.infer<typeof signupSchema>;
