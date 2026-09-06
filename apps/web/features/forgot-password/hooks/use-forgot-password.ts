'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

import {
  forgotPasswordSchema,
  type ForgotPasswordFormData,
} from '../schema/forgot-password.schema';

import { useForgotPasswordMutation } from './use-forgot-password-mutation';

import { ApiError } from '@/lib/api-client';

export function useForgotPassword() {
  const router = useRouter();
  const mutation = useForgotPasswordMutation();

  const form = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    mode: 'onTouched',
    defaultValues: {
      email: '',
    },
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    try {
      await mutation.mutateAsync({ data });
      toast.success('Verification code sent', {
        description: 'Please check your email for the verification code.',
      });
      router.push('/verify-email');
    } catch (error) {
      if (error instanceof ApiError) {
        toast.error('Request failed', {
          description: error.message,
        });
        return;
      }

      const message = error instanceof Error ? error.message : 'Something went wrong.';
      toast.error('Request failed', {
        description: message,
      });
    }
  };

  return {
    form,
    onSubmit: form.handleSubmit(onSubmit),
    isSubmitting: form.formState.isSubmitting || mutation.isPending,
  };
}
