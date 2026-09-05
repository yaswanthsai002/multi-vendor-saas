'use client';

import { useMutation } from '@tanstack/react-query';

import { signin } from '../services/signin.service';

import type { SigninFormData } from '../schema/signin.schema';
import type { SigninResponse } from '../services/signin.service';
import type { ApiError } from '@/lib/api-client';

export function useSigninMutation() {
  return useMutation<SigninResponse, ApiError, { data: SigninFormData; signal?: AbortSignal }>({
    mutationFn: ({ data, signal }) => signin(data, signal),
  });
}
