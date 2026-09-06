'use client';

import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import * as React from 'react';

import { useVerifyEmail } from '../hooks/use-verify-email';

import { OtpInput } from './otp-input';

import { Button } from '@/components/ui/button';

function PerigeeLogo() {
  return (
    <div className="flex items-center gap-2.5">
      <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center text-white shadow-sm font-bold text-xl select-none">
        P
      </div>
      <span className="font-extrabold text-2xl tracking-wider text-text-primary uppercase font-sans">
        Perigee
      </span>
    </div>
  );
}

export function VerifyEmailForm() {
  const {
    purpose,
    maskedEmail,
    otp,
    setOtp,
    errorMessage,
    cooldown,
    formattedCooldown,
    handleResend,
    handleSubmit,
    isSubmitting,
    isResending,
  } = useVerifyEmail();

  const isPasswordReset = purpose === 'password_reset';

  return (
    <div className="w-full h-full max-w-lg px-4 py-2 sm:px-6 lg:px-0 flex flex-col justify-start relative">
      {/* Top Left Back Navigation (Visible only for forgot-password flow) */}
      {isPasswordReset && (
        <div className="mb-6">
          <Link
            href="/signin"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-text-secondary hover:text-text-primary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus rounded"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            <span>Back to sign in</span>
          </Link>
        </div>
      )}

      {/* Header */}
      <div className="text-center mb-8">
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-text-primary leading-tight">
          Verify your email
        </h2>
        <p className="mt-2 text-sm text-text-secondary font-normal max-w-sm mx-auto">
          We sent a 6-digit verification code to <br />
          <strong className="font-semibold text-text-primary">{maskedEmail || 'your email'}</strong>
        </p>
      </div>

      {/* OTP Form */}
      <form onSubmit={handleSubmit} noValidate className="space-y-6">
        <div className="space-y-2">
          <OtpInput
            value={otp}
            onChange={setOtp}
            length={6}
            isInvalid={!!errorMessage}
            aria-describedby={errorMessage ? 'otp-error' : undefined}
          />
          {errorMessage && (
            <p
              id="otp-error"
              role="alert"
              className="text-xs text-danger font-medium text-center mt-2 leading-tight"
            >
              {errorMessage}
            </p>
          )}
        </div>

        {/* Resend Cooldown Section */}
        <div className="text-center text-sm">
          <p className="text-text-secondary">
            Didn&apos;t receive the code?{' '}
            {cooldown > 0 ? (
              <span className="font-medium text-text-secondary inline-block">
                Resend code in {formattedCooldown}
              </span>
            ) : (
              <button
                type="button"
                onClick={handleResend}
                disabled={isResending}
                className="font-medium text-accent hover:text-accent-hover hover:underline cursor-pointer disabled:opacity-50 transition-colors"
              >
                {isResending ? 'Sending...' : 'Resend code'}
              </button>
            )}
          </p>
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          variant="primary"
          size="lg"
          className="w-full h-11 font-semibold rounded-lg shadow-sm cursor-pointer bg-accent hover:bg-accent-hover active:bg-accent-active text-on-accent transition-colors"
          isLoading={isSubmitting}
          disabled={otp.length < 6 || isSubmitting}
        >
          Verify email
        </Button>

        {/* Change Email (Visible ONLY for password reset / forgot password flow) */}
        {isPasswordReset && (
          <div className="text-center text-sm text-text-secondary">
            Wrong email?{' '}
            <Link
              href="/forgot-password"
              className="font-medium text-accent hover:text-accent-hover hover:underline transition-colors"
            >
              Change email
            </Link>
          </div>
        )}
      </form>
    </div>
  );
}
