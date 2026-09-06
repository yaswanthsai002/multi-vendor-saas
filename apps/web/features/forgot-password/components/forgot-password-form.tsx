'use client';

import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

import { useForgotPassword } from '../hooks/use-forgot-password';

import { Button } from '@/components/ui/button';
import { FormField } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export function ForgotPasswordForm() {
  const {
    form: {
      register,
      formState: { errors },
    },
    isSubmitting,
    onSubmit,
  } = useForgotPassword();

  return (
    <div className="w-full h-full max-w-lg px-4 py-2 sm:px-6 lg:px-0 flex flex-col justify-start">
      {/* Top Left Navigation */}
      <div className="mb-6">
        <Link
          href="/signin"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-text-secondary hover:text-text-primary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus rounded"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          <span>Back to sign in</span>
        </Link>
      </div>

      {/* Form Header */}
      <div className="mb-6 text-left">
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-text-primary leading-tight">
          Forgot your password?
        </h2>
        <p className="mt-1.5 text-sm text-text-secondary font-normal">
          Enter your email address and we&apos;ll send you a verification code to reset your
          password.
        </p>
      </div>

      {/* Forgot Password Form */}
      <form
        onSubmit={onSubmit}
        noValidate
        aria-label="Request password reset code"
        className="space-y-4"
      >
        <FormField name="email">
          <Label htmlFor="email" isRequired>
            Email address
          </Label>
          <Input
            id="email"
            type="email"
            placeholder="Enter your email"
            autoComplete="email"
            isInvalid={!!errors.email}
            aria-describedby={errors.email ? 'email-error' : undefined}
            {...register('email')}
          />
          {errors.email && (
            <p
              id="email-error"
              role="alert"
              className="text-xs text-danger font-medium mt-1 leading-tight"
            >
              {errors.email.message}
            </p>
          )}
        </FormField>

        {/* Submit Button */}
        <Button
          type="submit"
          variant="primary"
          size="lg"
          className="w-full h-11 font-semibold rounded-lg shadow-sm cursor-pointer bg-accent hover:bg-accent-hover active:bg-accent-active text-on-accent transition-colors"
          isLoading={isSubmitting}
          disabled={isSubmitting}
        >
          Send verification code
        </Button>

        {/* Remember password link */}
        <div className="text-center text-sm text-text-secondary pt-2">
          Remember your password?{' '}
          <Link
            href="/signin"
            className="font-medium text-accent hover:text-accent-hover hover:underline transition-colors"
          >
            Sign in
          </Link>
        </div>
      </form>
    </div>
  );
}
