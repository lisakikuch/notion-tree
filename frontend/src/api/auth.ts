import { clearAccessToken, setAccessToken } from '@/lib/authToken';
import { authApiClient, type ApiError } from '@/lib/apiClient';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
}

export interface AuthError {
  message: string;
}

export async function login(credentials: LoginCredentials): Promise<LoginResponse> {
  try {
    const { data } = await authApiClient.post<LoginResponse>('/auth/login', credentials);
    setAccessToken(data.accessToken);
    return data;
  } catch (error) {
    if ((error as ApiError).status === 401) {
      throw new Error('Login failed. Please check your credentials.');
    }
    throw error;
  }

}

export async function logout(): Promise<void> {
  try {
    await authApiClient.post('/auth/logout');
  } finally {
    clearAccessToken();
  }
}

export async function refreshToken(): Promise<LoginResponse> {
  const { data } = await authApiClient.post<LoginResponse>('/auth/refresh');
  setAccessToken(data.accessToken);
  return data;
}