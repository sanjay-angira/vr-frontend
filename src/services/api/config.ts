import Cookies from "js-cookie";
import axios from "axios";
import type { InternalAxiosRequestConfig } from "axios";
import { STORAGE_KEYS } from "./storage";
import { getNewAccessToken } from "./jwt";

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

type AuthRequestConfig = InternalAxiosRequestConfig & {
  skipAuth?: boolean;
  authRetry?: boolean;
};

let pendingRefresh: Promise<string> | undefined;

function isCustomerRequest(url?: string): boolean {
  return url?.replace(/^\/+/, "").startsWith("customer/") ?? false;
}

function refreshAccessToken(refreshToken: string): Promise<string> {
  if (!pendingRefresh) {
    pendingRefresh = getNewAccessToken(refreshToken).finally(() => {
      pendingRefresh = undefined;
    });
  }
  return pendingRefresh;
}

axiosInstance.interceptors.request.use(
  async (req) => {
    const authConfig = req as AuthRequestConfig;
    if (authConfig.skipAuth) {
      return req;
    }

    if (!isCustomerRequest(req.url)) return req;

    const refreshToken = Cookies.get(STORAGE_KEYS.userRefreshToken);
    let accessToken = Cookies.get(STORAGE_KEYS.userAccessToken);
    if (!accessToken && refreshToken) {
      accessToken = await refreshAccessToken(refreshToken);
    }

    if (accessToken) {
      req.headers.Authorization = `Bearer ${accessToken}`;
    }

    return req;
  },
  (error) => Promise.reject(error),
);

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error: unknown) => {
    if (!axios.isAxiosError(error) || error.response?.status !== 401) {
      return Promise.reject(error);
    }

    const request = error.config as AuthRequestConfig | undefined;
    if (
      !request ||
      request.skipAuth ||
      request.authRetry ||
      request.url?.includes("auth/refresh-token")
    ) {
      return Promise.reject(error);
    }

    if (!isCustomerRequest(request.url)) return Promise.reject(error);

    const refreshToken = Cookies.get(STORAGE_KEYS.userRefreshToken);
    if (!refreshToken) return Promise.reject(error);

    request.authRetry = true;
    try {
      const accessToken = await refreshAccessToken(refreshToken);
      request.headers.Authorization = `Bearer ${accessToken}`;
      return axiosInstance.request(request);
    } catch (refreshError) {
      return Promise.reject(refreshError);
    }
  },
);
