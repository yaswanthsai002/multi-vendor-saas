'use client';

import { useMutation } from '@tanstack/react-query';

import {
  sendOtp,
  verifyOtp,
  type SendOtpPayload,
  type SendOtpResponse,
  type VerifyOtpPayload,
  type VerifyOtpResponse,
} from '../services/verify-email.service';

import type { ApiError } from '@/lib/api-client';

export function useSendOtpMutation() {
  return useMutation<SendOtpResponse, ApiError, { data: SendOtpPayload; signal?: AbortSignal }>({
    mutationFn: ({ data, signal }) => sendOtp(data, signal),
  });
}

export function useVerifyOtpMutation() {
  return useMutation<VerifyOtpResponse, ApiError, { data: VerifyOtpPayload; signal?: AbortSignal }>(
    {
      mutationFn: ({ data, signal }) => verifyOtp(data, signal),
    },
  );
}
