import type { SignupFormData } from '../schema/signup.schema';

import { makeApiRequest } from '@/lib/api-client';
import { API_ENDPOINTS } from '@/lib/api-endpoints';

export interface UserSummary {
  userId: string;
  fullName: string;
  email: string;
  roles: string[];
  emailVerifiedAt: string | null;
}

export interface SignupResponse {
  user: UserSummary;
}

/**
 * Creates a new customer user account.
 * Communicates with POST /api/auth/signup via normalized makeApiRequest.
 */
export function signup(data: SignupFormData, signal?: AbortSignal): Promise<SignupResponse> {
  return makeApiRequest<SignupResponse>({
    url: API_ENDPOINTS.auth.signup,
    method: 'POST',
    data,
    signal,
  });
}
