import { setAccessToken, clearAccessToken, getAccessToken } from '@/lib/authToken';

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

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

export async function login(credentials: LoginCredentials): Promise<LoginResponse> {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(credentials),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Login failed. Please check your credentials.');
  }

  const data: LoginResponse = await response.json();
  setAccessToken(data.accessToken);
  return data;
}

export async function logout(): Promise<void> {
  const token = getAccessToken();
  
  try {
    await fetch('/api/auth/logout', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });
  } finally {
    clearAccessToken();
  }
}

export async function refreshToken(): Promise<LoginResponse> {
  const response = await fetch('/api/auth/refresh', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
  });

  if (!response.ok) {
    clearAccessToken();
    throw new Error('Session expired. Please log in again.');
  }

  const data: LoginResponse = await response.json();
  setAccessToken(data.accessToken);
  return data;
}
