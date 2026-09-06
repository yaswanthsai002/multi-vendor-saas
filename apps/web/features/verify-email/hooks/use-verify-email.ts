'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import * as React from 'react';
import { toast } from 'sonner';

import {
  useSendOtpMutation,
  useVerifyOtpMutation,
  useVerificationStatusQuery,
} from './use-verify-email-mutation';

import { ApiError } from '@/lib/api-client';

export function maskEmail(email: string): string {
  if (!email || !email.includes('@')) return email;
  const [local, domain] = email.split('@');
  if (!local || !domain) return email;
  if (local.length <= 1) return `${local}••••••@${domain}`;
  const firstChar = local[0];
  return `${firstChar}••••••@${domain}`;
}

export function useVerifyEmail() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const tokenParam = searchParams.get('token') || undefined;
  const queryEmail = searchParams.get('email') || '';
  const rawPurpose = searchParams.get('purpose');
  const queryPurpose =
    rawPurpose === 'password_reset' || rawPurpose === 'signin' ? rawPurpose : 'email_verification';

  const sendOtpMutation = useSendOtpMutation();
  const verifyOtpMutation = useVerifyOtpMutation();
  const {
    data: statusData,
    isLoading: isLoadingStatus,
    error: statusError,
  } = useVerificationStatusQuery(tokenParam);

  React.useEffect(() => {
    if (statusError && statusError.status === 401 && !queryEmail) {
      toast.error('Session expired', {
        description: 'No active verification session found. Please request a new code.',
      });
      router.push('/signin');
    }
  }, [statusError, queryEmail, router]);

  const email = statusData?.email ?? queryEmail;
  const purpose = statusData?.purpose ?? queryPurpose;
  const maskedEmail = statusData?.maskedEmail ?? maskEmail(email);

  const [otp, setOtp] = React.useState('');
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const [cooldownRemaining, setCooldownRemaining] = React.useState<number | null>(null);

  const cooldown = cooldownRemaining ?? statusData?.remainingCooldown ?? 60;

  // Cooldown timer tick
  React.useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => {
      setCooldownRemaining((prev) => Math.max(0, (prev ?? cooldown) - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  const handleResend = () => {
    if (cooldown > 0 || !email) return;
    setErrorMessage(null);
    sendOtpMutation.mutate(
      { data: { email, purpose } },
      {
        onSuccess: (data) => {
          setOtp('');
          setCooldownRemaining(data.resendCooldown || 60);
          toast.success('New code sent', {
            description: 'Please check your email for the new verification code.',
          });
        },
        onError: (err) => {
          toast.error('Resend failed', {
            description: err.message || 'Please wait before requesting a new code.',
          });
        },
      },
    );
  };

  const handleOtpChange = (val: string) => {
    setOtp(val);
    if (errorMessage) {
      setErrorMessage(null);
    }
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!email) {
      setErrorMessage('No email address provided.');
      return;
    }
    if (otp.length < 6) {
      setErrorMessage('Please enter all 6 characters.');
      return;
    }

    try {
      await verifyOtpMutation.mutateAsync({
        data: {
          email,
          otp,
          purpose,
        },
      });

      if (purpose === 'password_reset') {
        toast.success('Email verified successfully!', {
          description: 'Please set your new password.',
        });
        router.push('/reset-password');
      } else {
        toast.success('Email verified successfully!', {
          description: 'You can now sign in with your credentials.',
        });
        router.push('/signin');
      }
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.status === 404) {
          const notFoundMsg = 'No account exists with this email address.';
          setErrorMessage(notFoundMsg);
          toast.error('Verification failed', {
            description: notFoundMsg,
          });
          return;
        }
        setErrorMessage(err.message);
        toast.error('Verification failed', {
          description: err.message,
        });
        return;
      }
      const msg = err instanceof Error ? err.message : 'Invalid code. Please try again.';
      setErrorMessage(msg);
      toast.error('Verification failed', {
        description: msg,
      });
    }
  };

  const formattedCooldown = React.useMemo(() => {
    const mins = Math.floor(cooldown / 60);
    const secs = cooldown % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  }, [cooldown]);

  return {
    email,
    purpose,
    maskedEmail,
    otp,
    setOtp: handleOtpChange,
    errorMessage,
    cooldown,
    formattedCooldown,
    handleResend,
    handleSubmit,
    isSubmitting: verifyOtpMutation.isPending,
    isResending: sendOtpMutation.isPending,
    isLoadingStatus,
  };
}
