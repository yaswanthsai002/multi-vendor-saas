import { makeApiRequest } from '@/lib/api-client';
import { API_ENDPOINTS } from '@/lib/api-endpoints';

export interface ForgotPasswordPayload {
  email: string;
}

export interface ForgotPasswordResponse {
  message: string;
  expiresIn: number;
  resendCooldown: number;
  otp?: string;
}

export async function requestPasswordResetOtp(
  data: ForgotPasswordPayload,
  signal?: AbortSignal,
): Promise<ForgotPasswordResponse> {
  return makeApiRequest<ForgotPasswordResponse>({
    url: API_ENDPOINTS.auth.sendOtp,
    method: 'POST',
    data: {
      email: data.email,
      purpose: 'password_reset',
    },
    signal,
  });
}
