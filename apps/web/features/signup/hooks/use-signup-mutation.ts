'use client';

import { useMutation } from '@tanstack/react-query';

import { signup } from '../services/signup.service';

import type { SignupFormData } from '../schema/signup.schema';
import type { SignupResponse } from '../services/signup.service';
import type { ApiError } from '@/lib/api-client';

export function useSignupMutation() {
  return useMutation<SignupResponse, ApiError, { data: SignupFormData; signal?: AbortSignal }>({
    mutationFn: ({ data, signal }) => signup(data, signal),
  });
}
