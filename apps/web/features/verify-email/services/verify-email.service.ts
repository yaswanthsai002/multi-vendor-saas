import { makeApiRequest } from '@/lib/api-client';
import { API_ENDPOINTS } from '@/lib/api-endpoints';

export interface SendOtpPayload {
  email: string;
  purpose: 'email_verification' | 'password_reset' | 'signin';
}

export interface SendOtpResponse {
  message: string;
  email: string;
  purpose: string;
  expiresIn: number;
  resendCooldown: number;
  otp?: string;
}

export interface VerifyOtpPayload {
  email: string;
  otp: string;
  purpose: 'email_verification' | 'password_reset' | 'signin';
}

export interface VerifyOtpResponse {
  message: string;
  verified: boolean;
  email: string;
  purpose: string;
  resetToken?: string;
}

export async function sendOtp(
  data: SendOtpPayload,
  signal?: AbortSignal,
): Promise<SendOtpResponse> {
  return makeApiRequest<SendOtpResponse>({
    url: API_ENDPOINTS.auth.sendOtp,
    method: 'POST',
    data,
    signal,
  });
}

export async function verifyOtp(
  data: VerifyOtpPayload,
  signal?: AbortSignal,
): Promise<VerifyOtpResponse> {
  return makeApiRequest<VerifyOtpResponse>({
    url: API_ENDPOINTS.auth.verifyOtp,
    method: 'POST',
    data,
    signal,
  });
}
