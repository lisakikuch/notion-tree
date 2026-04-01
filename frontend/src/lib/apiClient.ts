import axios, { AxiosError, type AxiosRequestConfig } from 'axios';
import { clearAccessToken, getAccessToken, setAccessToken } from '@/lib/authToken';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

export class ApiError extends Error {
  public status: number;

  constructor(
    message: string,
    status: number
  ) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

interface RefreshResponse {
  accessToken: string;
}

interface RetryableAxiosRequestConfig extends AxiosRequestConfig {
  _retry?: boolean;
}

const authApiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

let isRefreshing = false;
let pendingRequestsQueue: Array<{
  resolve: (token: string) => void;
  reject: (error: unknown) => void;
}> = [];

function processPendingRequests(error: unknown, token: string | null = null) {
  pendingRequestsQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error);
      return;
    }

    if (token) {
      resolve(token);
    } else {
      reject(new Error('Unable to refresh access token'));
    }
  });

  pendingRequestsQueue = [];
}

authApiClient.interceptors.request.use((config) => {
  const token = getAccessToken();

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

authApiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<{ message?: string }>) => {
    const originalRequest = error.config as RetryableAxiosRequestConfig | undefined;
    const status = error.response?.status;

    if (!originalRequest) {
      return Promise.reject(error);
    }

    if (status !== 401 || originalRequest._retry || originalRequest.url === '/auth/refresh') {
      if (error.response) {
        const message = error.response.data?.message || 'An error occurred';
        return Promise.reject(new ApiError(message, error.response.status));
      }

      return Promise.reject(error);
    }

    originalRequest._retry = true;

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        pendingRequestsQueue.push({
          resolve: (token: string) => {
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
            }
            resolve(authApiClient(originalRequest));
          },
          reject,
        });
      });
    }

    isRefreshing = true;

    try {
      const { data } = await axios.post<RefreshResponse>(`${API_BASE_URL}/auth/refresh`, undefined, {
        withCredentials: true,
      });

      setAccessToken(data.accessToken);
      processPendingRequests(null, data.accessToken);

      if (originalRequest.headers) {
        originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
      }

      return authApiClient(originalRequest);
    } catch (refreshError) {
      processPendingRequests(refreshError);
      clearAccessToken();
      window.location.href = '/login';
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);

export { authApiClient };

export async function apiClient<T>(
  endpoint: string,
  config: AxiosRequestConfig = {}
): Promise<T> {
  try {
    const response = await authApiClient.request<T>({
      url: endpoint,
      ...config,
    });

    return response.data;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }

    if (axios.isAxiosError(error) && error.response) {
      const message = (error.response.data as { message?: string } | undefined)?.message || 'An error occurred';
      throw new ApiError(message, error.response.status);
    }

    throw error;
  }
}
