'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter, useSearchParams } from 'next/navigation';
import * as React from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

import { signinSchema, type SigninFormData } from '../schema/signin.schema';

import { useSigninMutation } from './use-signin-mutation';

import { ApiError } from '@/lib/api-client';

export function useSignin() {
  const [showPassword, setShowPassword] = React.useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get('redirect') || '/';

  const signinMutation = useSigninMutation();

  const form = useForm<SigninFormData>({
    resolver: zodResolver(signinSchema),
    mode: 'onTouched',
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: SigninFormData) => {
    try {
      const response = await signinMutation.mutateAsync({ data });
      toast.success('Signed in successfully!', {
        description: `Welcome back, ${response.user.fullName || 'User'}!`,
      });
      router.push(redirectUrl);
    } catch (error) {
      if (error instanceof ApiError) {
        if (error.status === 401 || error.code === 'INVALID_CREDENTIALS') {
          form.setError('password', {
            type: 'manual',
            message: 'Invalid email or password.',
          });
          form.setError('email', {
            type: 'manual',
            message: 'Invalid email or password.',
          });
          toast.error('Sign in failed', {
            description: 'Invalid email or password. Please check your credentials.',
          });
          return;
        }

        // Map backend validation errors to form fields if present
        if (
          error.details &&
          typeof error.details === 'object' &&
          'properties' in error.details &&
          error.details.properties &&
          typeof error.details.properties === 'object'
        ) {
          const properties = error.details.properties as Record<
            string,
            { errors?: string[]; message?: string }
          >;
          for (const [field, fieldError] of Object.entries(properties)) {
            const errorMsg = fieldError?.errors?.[0] || fieldError?.message;
            if (field in form.getValues() && errorMsg) {
              form.setError(field as keyof SigninFormData, {
                type: 'manual',
                message: errorMsg,
              });
            }
          }
        }

        toast.error('Sign in failed', {
          description: error.message,
        });
        return;
      }

      const message = error instanceof Error ? error.message : 'Something went wrong.';
      toast.error('Sign in failed', {
        description: message,
      });
    }
  };

  const togglePasswordVisibility = () => setShowPassword((prev) => !prev);

  return {
    form,
    showPassword,
    togglePasswordVisibility,
    onSubmit: form.handleSubmit(onSubmit),
    isSubmitting: form.formState.isSubmitting || signinMutation.isPending,
  };
}
