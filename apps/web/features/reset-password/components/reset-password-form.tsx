'use client';

import { ArrowLeft, Eye, EyeOff } from 'lucide-react';
import Link from 'next/link';

import { useResetPassword } from '../hooks/use-reset-password';

import { Button } from '@/components/ui/button';
import { FormField } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export function ResetPasswordForm() {
  const {
    form: {
      register,
      formState: { errors },
    },
    isSubmitting,
    onSubmit,
    showPassword,
    showConfirmPassword,
    togglePasswordVisibility,
    toggleConfirmPasswordVisibility,
  } = useResetPassword();

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
          Set new password
        </h2>
        <p className="mt-1.5 text-sm text-text-secondary font-normal">
          Must be at least 8 characters long and match confirmation.
        </p>
      </div>

      {/* Form */}
      <form onSubmit={onSubmit} noValidate aria-label="Set new password" className="space-y-4">
        {/* New Password */}
        <FormField name="newPassword">
          <Label htmlFor="newPassword" isRequired>
            New password
          </Label>
          <div className="relative">
            <Input
              id="newPassword"
              type={showPassword ? 'text' : 'password'}
              placeholder="Enter new password"
              autoComplete="new-password"
              isInvalid={!!errors.newPassword}
              aria-describedby={errors.newPassword ? 'new-password-error' : undefined}
              className="pr-10"
              {...register('newPassword')}
            />
            <button
              type="button"
              onClick={togglePasswordVisibility}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary hover:text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus rounded p-1 transition-colors"
              aria-label={showPassword ? 'Hide new password' : 'Show new password'}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Eye className="h-4 w-4" aria-hidden="true" />
              )}
            </button>
          </div>
          {errors.newPassword && (
            <p
              id="new-password-error"
              role="alert"
              className="text-xs text-danger font-medium mt-1 leading-tight"
            >
              {errors.newPassword.message}
            </p>
          )}
        </FormField>

        {/* Confirm New Password */}
        <FormField name="confirmNewPassword">
          <Label htmlFor="confirmNewPassword" isRequired>
            Confirm new password
          </Label>
          <div className="relative">
            <Input
              id="confirmNewPassword"
              type={showConfirmPassword ? 'text' : 'password'}
              placeholder="Confirm new password"
              autoComplete="new-password"
              isInvalid={!!errors.confirmNewPassword}
              aria-describedby={errors.confirmNewPassword ? 'confirm-password-error' : undefined}
              className="pr-10"
              {...register('confirmNewPassword')}
            />
            <button
              type="button"
              onClick={toggleConfirmPasswordVisibility}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary hover:text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus rounded p-1 transition-colors"
              aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
            >
              {showConfirmPassword ? (
                <EyeOff className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Eye className="h-4 w-4" aria-hidden="true" />
              )}
            </button>
          </div>
          {errors.confirmNewPassword && (
            <p
              id="confirm-password-error"
              role="alert"
              className="text-xs text-danger font-medium mt-1 leading-tight"
            >
              {errors.confirmNewPassword.message}
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
          Reset password
        </Button>
      </form>
    </div>
  );
}
