import { makeApiRequest } from '@/lib/api-client';
import { API_ENDPOINTS } from '@/lib/api-endpoints';

export interface SendOtpPayload {
  email: string;
  purpose: 'email_verification' | 'password_reset' | 'signin';
}

export interface SendOtpResponse {
  message: string;
  expiresIn: number;
  resendCooldown: number;
  otp?: string;
}

export interface VerifyOtpPayload {
  email?: string;
  otp: string;
  purpose?: 'email_verification' | 'password_reset' | 'signin';
}

export interface VerifyOtpResponse {
  message: string;
  verified: boolean;
}

export interface VerificationStatusResponse {
  email: string;
  maskedEmail: string;
  purpose: 'email_verification' | 'password_reset' | 'signin';
  remainingCooldown: number;
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

export async function getVerificationStatus(
  token?: string,
  signal?: AbortSignal,
): Promise<VerificationStatusResponse> {
  const headers: Record<string, string> = {};
  if (token) {
    headers['x-verification-token'] = token;
  }
  return makeApiRequest<VerificationStatusResponse>({
    url: API_ENDPOINTS.auth.verificationStatus,
    method: 'GET',
    headers: Object.keys(headers).length > 0 ? headers : undefined,
    signal,
  });
}
