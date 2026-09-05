'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import * as React from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

import { signupSchema, type SignupFormData } from '../schema/signup.schema';

import { useSignupMutation } from './use-signup-mutation';

import { ApiError } from '@/lib/api-client';

export function useSignup() {
  const [showPassword, setShowPassword] = React.useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);

  const signupMutation = useSignupMutation();

  const form = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    mode: 'onBlur',
    defaultValues: {
      fullName: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  const onSubmit = async (data: SignupFormData) => {
    try {
      await signupMutation.mutateAsync({ data });
      toast.success('Account created successfully!', {
        description: 'Welcome to Perigee. You can now sign in to your account.',
      });
      form.reset();
    } catch (error) {
      if (error instanceof ApiError) {
        if (error.code === 'EMAIL_IN_USE' || error.status === 409) {
          form.setError('email', {
            type: 'manual',
            message: 'An account with this email already exists.',
          });
          toast.error('Account already exists', {
            description: 'Please sign in or use a different email address.',
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
          const properties = error.details.properties as Record<string, { message?: string }>;
          for (const [field, fieldError] of Object.entries(properties)) {
            if (field in form.getValues() && fieldError?.message) {
              form.setError(field as keyof SignupFormData, {
                type: 'manual',
                message: fieldError.message,
              });
            }
          }
        }

        toast.error('Signup failed', {
          description: error.message,
        });
        return;
      }

      const message = error instanceof Error ? error.message : 'Something went wrong.';
      toast.error('Signup failed', {
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
    isSubmitting: form.formState.isSubmitting || signupMutation.isPending,
    errors: form.formState.errors,
  };
}
