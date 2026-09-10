import { axiosInstance, makeApiRequest } from '@/lib/api-client';
import { API_ENDPOINTS } from '@/lib/api-endpoints';

export interface CurrentUserData {
  userId: string | number;
  fullName?: string;
  email: string;
  roles?: string[];
  avatarUrl?: string;
  emailVerifiedAt?: string | null;
}

export interface CurrentUserResponse {
  user?: CurrentUserData | null;
}

export function getCurrentUser(signal?: AbortSignal) {
  return makeApiRequest<CurrentUserResponse>({
    url: API_ENDPOINTS.auth.me,
    method: 'GET',
    signal,
  });
}

export async function getCurrentUserServer(cookieHeader: string): Promise<CurrentUserResponse> {
  const response = await axiosInstance.get<CurrentUserResponse>(API_ENDPOINTS.auth.me, {
    headers: { Cookie: cookieHeader },
  });
  return response.data;
}
