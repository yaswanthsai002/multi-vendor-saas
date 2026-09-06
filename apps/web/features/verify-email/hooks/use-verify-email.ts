'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import * as React from 'react';
import { toast } from 'sonner';

import { useSendOtpMutation, useVerifyOtpMutation } from './use-verify-email-mutation';

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

  const email = searchParams.get('email') || '';
  const rawPurpose = searchParams.get('purpose');
  const purpose =
    rawPurpose === 'password_reset' || rawPurpose === 'signin' ? rawPurpose : 'email_verification';

  const [otp, setOtp] = React.useState('');
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const [cooldown, setCooldown] = React.useState(60);

  const sendOtpMutation = useSendOtpMutation();
  const verifyOtpMutation = useVerifyOtpMutation();

  // Trigger initial OTP send on mount if email is provided
  const initialSendRef = React.useRef(false);
  React.useEffect(() => {
    if (!email || initialSendRef.current) return;
    initialSendRef.current = true;

    sendOtpMutation.mutate(
      { data: { email, purpose } },
      {
        onSuccess: (data) => {
          setCooldown(data.resendCooldown || 60);
        },
        onError: (err) => {
          // If already sent or cooldown active, set standard 60s
          if (err.status === 429) {
            setCooldown(60);
          }
        },
      },
    );
  }, [email, purpose, sendOtpMutation]);

  // Cooldown timer tick
  React.useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => {
      setCooldown((prev) => Math.max(0, prev - 1));
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
          setCooldown(data.resendCooldown || 60);
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
      const response = await verifyOtpMutation.mutateAsync({
        data: {
          email,
          otp,
          purpose,
        },
      });

      toast.success('Email verified successfully!', {
        description: 'You can now sign in with your credentials.',
      });

      if (purpose === 'password_reset' && response.resetToken) {
        router.push(`/reset-password?token=${encodeURIComponent(response.resetToken)}`);
      } else {
        router.push('/signin');
      }
    } catch (err) {
      if (err instanceof ApiError) {
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
    maskedEmail: maskEmail(email),
    otp,
    setOtp: handleOtpChange,
    errorMessage,
    cooldown,
    formattedCooldown,
    handleResend,
    handleSubmit,
    isSubmitting: verifyOtpMutation.isPending,
    isResending: sendOtpMutation.isPending,
  };
}
