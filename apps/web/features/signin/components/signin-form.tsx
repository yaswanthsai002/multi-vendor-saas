'use client';

import { Eye, EyeOff } from 'lucide-react';
import Link from 'next/link';

import { useSignin } from '../hooks/use-signin';

import { Button } from '@/components/ui/button';
import { FormField } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

function GoogleIcon() {
  return (
    <svg className="h-5 w-5 shrink-0" viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
        fill="#EA4335"
      />
    </svg>
  );
}

export function SigninForm() {
  const {
    form: {
      register,
      formState: { errors },
    },
    isSubmitting,
    onSubmit,
    showPassword,
    togglePasswordVisibility,
  } = useSignin();

  return (
    <div className="w-full h-full max-w-lg px-4 py-2 sm:px-6 lg:px-0">
      {/* Form Title & Subtitle */}
      <div className="mb-6 text-left">
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-text-primary leading-tight">
          Welcome back
        </h2>
        <p className="mt-1.5 text-sm text-text-secondary font-normal">
          Enter your details to access your account.
        </p>
      </div>

      {/* Signin Form */}
      <form onSubmit={onSubmit} noValidate aria-label="Sign in to Perigee" className="space-y-4">
        {/* Email */}
        <FormField name="email">
          <Label htmlFor="email" isRequired>
            Email
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

        {/* Password */}
        <FormField name="password">
          <div className="flex items-center justify-between mb-1">
            <Label htmlFor="password" isRequired>
              Password
            </Label>
            <Link
              href="/forgot-password"
              className="text-xs font-medium text-accent hover:text-accent-hover hover:underline transition-colors"
            >
              Forgot password?
            </Link>
          </div>
          <Input
            id="password"
            type={showPassword ? 'text' : 'password'}
            placeholder="Enter your password"
            autoComplete="current-password"
            isInvalid={!!errors.password}
            aria-describedby={errors.password ? 'password-error' : undefined}
            rightElement={
              <button
                type="button"
                onClick={togglePasswordVisibility}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                className="p-1 text-text-tertiary hover:text-text-primary rounded cursor-pointer transition-colors"
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" aria-hidden="true" />
                ) : (
                  <Eye className="h-4 w-4" aria-hidden="true" />
                )}
              </button>
            }
            {...register('password')}
          />
          {errors.password && (
            <p
              id="password-error"
              role="alert"
              className="text-xs text-danger font-medium mt-1 leading-tight"
            >
              {errors.password.message}
            </p>
          )}
        </FormField>

        {/* Submit Action */}
        <div className="pt-2">
          <Button
            type="submit"
            variant="primary"
            size="lg"
            className="w-full h-11 font-semibold rounded-lg shadow-sm cursor-pointer bg-accent hover:bg-accent-hover active:bg-accent-active text-on-accent transition-colors"
            isLoading={isSubmitting}
          >
            {isSubmitting ? 'Signing in...' : 'Sign in'}
          </Button>
        </div>
      </form>

      {/* Divider */}
      <div className="relative flex items-center justify-center my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-border-default" />
        </div>
        <span className="relative px-3 bg-surface-raised dark:bg-surface text-xs text-text-tertiary font-medium">
          or
        </span>
      </div>

      {/* Google Social CTA */}
      <Button
        type="button"
        variant="outline"
        size="lg"
        className="w-full h-11 rounded-lg border-border-strong text-text-primary font-medium hover:bg-surface-hover active:bg-surface-active bg-surface-raised dark:bg-surface shadow-xs transition-colors flex items-center justify-center gap-2.5 cursor-pointer"
        onClick={() => {
          // OAuth redirect hook point
        }}
      >
        <GoogleIcon />
        <span>Continue with Google</span>
      </Button>

      {/* Footer Navigation */}
      <p className="mt-6 text-center text-sm text-text-secondary">
        Don&apos;t have an account?{' '}
        <Link
          href="/signup"
          className="font-medium text-accent hover:text-accent-hover hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus rounded transition-colors"
        >
          Sign up
        </Link>
      </p>
    </div>
  );
}
