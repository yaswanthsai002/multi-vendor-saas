import { makeApiRequest } from '@/lib/api-client';
import { API_ENDPOINTS } from '@/lib/api-endpoints';

export interface ResetPasswordPayload {
  newPassword: string;
  confirmNewPassword: string;
  resetToken?: string;
}

export interface ResetPasswordResponse {
  message: string;
}

export async function resetPassword(
  data: ResetPasswordPayload,
  signal?: AbortSignal,
): Promise<ResetPasswordResponse> {
  return makeApiRequest<ResetPasswordResponse>({
    url: API_ENDPOINTS.auth.resetPassword,
    method: 'POST',
    data,
    signal,
  });
}
