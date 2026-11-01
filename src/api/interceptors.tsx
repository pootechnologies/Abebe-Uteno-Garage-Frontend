// interceptors.js
import axios from 'axios';
import type { AxiosInstance, InternalAxiosRequestConfig, AxiosError } from 'axios';
import { API_BASE_REFRESH } from "@/utils/apiConfig";

const authService = {
  getAccessToken: () => localStorage.getItem('token'),
  getRefreshToken: () => localStorage.getItem('refreshToken'),
  setTokens: ({ accessToken, refreshToken }) => {
    if (accessToken) localStorage.setItem('token', accessToken);
    if (refreshToken) localStorage.setItem('refreshToken', refreshToken);
  },
  clearTokens: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
  }
};

interface RefreshResponse {
  access: string; // Changed from accessToken to access
}

export const setupInterceptors = (api: AxiosInstance): void => {
  let isRefreshing = false;
  let refreshSubscribers: Array<(token: string) => void> = [];

  const onRefreshed = (token: string) => {
    refreshSubscribers.forEach((callback) => callback(token));
    refreshSubscribers = [];
  };

  // ✅ Request interceptor (cache-busting added)
  api.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
      const token = authService.getAccessToken();
      if (token && config.headers) {
        config.headers['Authorization'] = `Bearer ${token}`;
      }

      // ✅ Cache-busting for GET requests (added)
      if (config.method?.toLowerCase() === "get") {
        config.params = {
          ...config.params,
          _: new Date().getTime(),
        };
      }

      return config;
    },
    (error: AxiosError) => Promise.reject(error)
  );

  // Response interceptor (unchanged except formatting)
  api.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
      const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

      if (error.response?.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;

        if (!isRefreshing) {
          isRefreshing = true;
          try {
            const refreshToken = authService.getRefreshToken();
            if (!refreshToken) throw new Error('Missing refresh token');

            const { data } = await axios.post<RefreshResponse>(
              API_BASE_REFRESH,
              { refresh: refreshToken }
            );

            authService.setTokens({ accessToken: data.access, refreshToken: refreshToken });
            onRefreshed(data.access);

          } catch (err) {
            authService.clearTokens();
            return Promise.reject(err);
          } finally {
            isRefreshing = false;
          }
        }

        return new Promise((resolve) => {
          refreshSubscribers.push((newToken: string) => {
            if (originalRequest.headers) {
              originalRequest.headers['Authorization'] = `Bearer ${newToken}`;
            }
            resolve(api(originalRequest));
          });
        });
      }

      return Promise.reject(error);
    }
  );
};
