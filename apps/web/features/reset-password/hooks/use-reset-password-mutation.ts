'use client';

import { useMutation } from '@tanstack/react-query';

import {
  resetPassword,
  type ResetPasswordPayload,
  type ResetPasswordResponse,
} from '../services/reset-password.service';

import type { ApiError } from '@/lib/api-client';

export function useResetPasswordMutation() {
  return useMutation<
    ResetPasswordResponse,
    ApiError,
    { data: ResetPasswordPayload; signal?: AbortSignal }
  >({
    mutationFn: ({ data, signal }) => resetPassword(data, signal),
  });
}
