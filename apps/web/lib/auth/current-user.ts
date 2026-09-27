import { ApiError, axiosInstance, makeApiRequest } from '@/lib/api-client';
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

export async function getCurrentUser(signal?: AbortSignal): Promise<CurrentUserResponse> {
  try {
    return await makeApiRequest<CurrentUserResponse>({
      url: API_ENDPOINTS.auth.me,
      method: 'GET',
      signal,
    });
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) {
      return { user: null };
    }
    throw error;
  }
}

export async function getCurrentUserServer(cookieHeader: string): Promise<CurrentUserResponse> {
  const response = await axiosInstance.get<CurrentUserResponse>(API_ENDPOINTS.auth.me, {
    headers: { Cookie: cookieHeader },
  });
  return response.data;
}
