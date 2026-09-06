'use client';

import { useMutation } from '@tanstack/react-query';

import {
  requestPasswordResetOtp,
  type ForgotPasswordPayload,
  type ForgotPasswordResponse,
} from '../services/forgot-password.service';

import type { ApiError } from '@/lib/api-client';

export function useForgotPasswordMutation() {
  return useMutation<
    ForgotPasswordResponse,
    ApiError,
    { data: ForgotPasswordPayload; signal?: AbortSignal }
  >({
    mutationFn: ({ data, signal }) => requestPasswordResetOtp(data, signal),
  });
}
