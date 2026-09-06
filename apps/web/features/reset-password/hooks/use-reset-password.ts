'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import * as React from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

import { resetPasswordSchema, type ResetPasswordFormData } from '../schema/reset-password.schema';

import { useResetPasswordMutation } from './use-reset-password-mutation';

import { ApiError } from '@/lib/api-client';

export function useResetPassword() {
  const router = useRouter();
  const [showPassword, setShowPassword] = React.useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);

  const mutation = useResetPasswordMutation();

  const form = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    mode: 'onTouched',
    defaultValues: {
      newPassword: '',
      confirmNewPassword: '',
    },
  });

  const onSubmit = async (data: ResetPasswordFormData) => {
    try {
      await mutation.mutateAsync({ data });
      toast.success('Password reset successfully!', {
        description: 'You can now sign in with your new password.',
      });
      router.push('/signin');
    } catch (error) {
      if (error instanceof ApiError) {
        if (error.code === 'INVALID_RESET_TOKEN' || error.status === 400) {
          toast.error('Session expired', {
            description: 'Your password reset session has expired. Please request a new code.',
          });
          router.push('/forgot-password');
          return;
        }

        toast.error('Password reset failed', {
          description: error.message,
        });
        return;
      }

      const message = error instanceof Error ? error.message : 'Something went wrong.';
      toast.error('Password reset failed', {
        description: message,
      });
    }
  };

  const togglePasswordVisibility = () => setShowPassword((prev) => !prev);
  const toggleConfirmPasswordVisibility = () => setShowConfirmPassword((prev) => !prev);

  return {
    form,
    showPassword,
    showConfirmPassword,
    togglePasswordVisibility,
    toggleConfirmPasswordVisibility,
    onSubmit: form.handleSubmit(onSubmit),
    isSubmitting: form.formState.isSubmitting || mutation.isPending,
  };
}
