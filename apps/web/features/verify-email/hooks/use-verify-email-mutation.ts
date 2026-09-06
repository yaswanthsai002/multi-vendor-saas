'use client';

import { useMutation, useQuery } from '@tanstack/react-query';

import {
  sendOtp,
  verifyOtp,
  getVerificationStatus,
  type SendOtpPayload,
  type SendOtpResponse,
  type VerifyOtpPayload,
  type VerifyOtpResponse,
  type VerificationStatusResponse,
} from '../services/verify-email.service';

import type { ApiError } from '@/lib/api-client';

import { queryKeys } from '@/lib/query-keys';

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

export function useVerificationStatusQuery(token?: string) {
  return useQuery<VerificationStatusResponse, ApiError>({
    queryKey: queryKeys.auth.verificationStatus(token),
    queryFn: ({ signal }) => getVerificationStatus(token, signal),
    retry: false,
    staleTime: 0,
  });
}
