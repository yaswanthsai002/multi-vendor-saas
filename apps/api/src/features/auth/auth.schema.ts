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

    confirmPassword: z.string(),
  })
  .refine(({ password, confirmPassword }) => password === confirmPassword, {
    path: ['confirmPassword'],
    message: 'Passwords do not match.',
  });

export const signInSchema = z.object({
  email: z.email('Enter a valid email address.').trim().toLowerCase(),
  password: z.string().min(1, 'Password is required'),
});

export const sendOtpSchema = z.object({
  email: z.email('Enter a valid email address.').trim().toLowerCase(),
  purpose: z.enum(['signin', 'password_reset', 'email_verification']).default('email_verification'),
});

export const verifyOtpSchema = z.object({
  email: z.email('Enter a valid email address.').trim().toLowerCase(),
  otp: z
    .string()
    .trim()
    .length(6, 'OTP must be exactly 6 characters.')
    .regex(/^[0-9A-Z]+$/, 'OTP must be alphanumeric.')
    .toUpperCase(),
  purpose: z.enum(['signin', 'password_reset', 'email_verification']).default('email_verification'),
});

export const resetPasswordSchema = z
  .object({
    resetToken: z.string().optional(),
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

export const updateMeSchema = z
  .object({
    fullName: z
      .string()
      .trim()
      .min(2, 'Full name must be at least 2 characters.')
      .max(100, 'Full name must not exceed 100 characters.')
      .optional(),
    avatarUrl: z.string().url('Must be a valid URL.').nullable().optional(),
  })
  .refine((data) => data.fullName !== undefined || data.avatarUrl !== undefined, {
    message: 'At least one field (fullName or avatarUrl) must be provided.',
  });

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required.'),
    newPassword: z
      .string()
      .min(8, 'New password must be at least 8 characters.')
      .max(128, 'New password must not exceed 128 characters.'),
    confirmNewPassword: z.string(),
  })
  .refine(({ newPassword, confirmNewPassword }) => newPassword === confirmNewPassword, {
    path: ['confirmNewPassword'],
    message: 'Passwords do not match.',
  });

export const initiateAvatarUploadSchema = z.object({
  fileName: z.string().min(1, 'File name is required.'),
  mimeType: z.enum(['image/jpeg', 'image/png', 'image/webp'], {
    message: 'Only JPEG, PNG, and WebP images are allowed.',
  }),
  fileSizeBytes: z
    .number()
    .positive('File size must be positive.')
    .max(5 * 1024 * 1024, 'Image size must not exceed 5MB.'),
});

export type SignupInput = z.infer<typeof signupSchema>;
export type SignInInput = z.infer<typeof signInSchema>;
export type SendOtpInput = z.infer<typeof sendOtpSchema>;
export type VerifyOtpInput = z.infer<typeof verifyOtpSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
export type UpdateMeInput = z.infer<typeof updateMeSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
export type InitiateAvatarUploadInput = z.infer<typeof initiateAvatarUploadSchema>;
