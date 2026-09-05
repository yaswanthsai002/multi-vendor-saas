import type { SigninFormData } from '../schema/signin.schema';

import { makeApiRequest } from '@/lib/api-client';
import { API_ENDPOINTS } from '@/lib/api-endpoints';

export interface UserSummary {
  userId: string;
  fullName: string;
  email: string;
  roles: string[];
  emailVerifiedAt: string | null;
}

export interface SigninResponse {
  user: UserSummary;
}

/**
 * Authenticates an existing user account.
 * Communicates with POST /api/auth/signin via normalized makeApiRequest.
 */
export function signin(data: SigninFormData, signal?: AbortSignal): Promise<SigninResponse> {
  return makeApiRequest<SigninResponse>({
    url: API_ENDPOINTS.auth.signin,
    method: 'POST',
    data,
    signal,
  });
}
