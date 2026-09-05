import { z } from 'zod';

export const signinSchema = z.object({
  email: z.email('Enter a valid email address.').trim().toLowerCase(),
  password: z.string().min(1, 'Password is required.'),
});

export type SigninFormData = z.infer<typeof signinSchema>;
