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

type AuthScope = "admin" | "customer";
type AuthRequestConfig = InternalAxiosRequestConfig & {
  skipAuth?: boolean;
  authRetry?: boolean;
};

const pendingRefresh: Partial<Record<AuthScope, Promise<string>>> = {};

function isCustomerRequest(url?: string): boolean {
  return url?.replace(/^\/+/, "").startsWith("customer/") ?? false;
}

function refreshAccessToken(
  scope: AuthScope,
  refreshToken: string,
): Promise<string> {
  if (!pendingRefresh[scope]) {
    pendingRefresh[scope] = getNewAccessToken(refreshToken, scope).finally(
      () => {
        delete pendingRefresh[scope];
      },
    );
  }
  return pendingRefresh[scope]!;
}

axiosInstance.interceptors.request.use(
  async (req) => {
    const authConfig = req as AuthRequestConfig;
    if (authConfig.skipAuth) {
      return req;
    }

    const scope: AuthScope = isCustomerRequest(req.url) ? "customer" : "admin";
    const refreshToken =
      scope === "customer"
        ? Cookies.get(STORAGE_KEYS.userRefreshToken)
        : Cookies.get(STORAGE_KEYS.adminRefreshToken);
    let accessToken =
      scope === "customer"
        ? Cookies.get(STORAGE_KEYS.userAccessToken)
        : Cookies.get(STORAGE_KEYS.adminAccessToken);

    if (!accessToken && refreshToken) {
      accessToken = await refreshAccessToken(scope, refreshToken);
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

    const scope: AuthScope = isCustomerRequest(request.url)
      ? "customer"
      : "admin";
    const refreshToken =
      scope === "customer"
        ? Cookies.get(STORAGE_KEYS.userRefreshToken)
        : Cookies.get(STORAGE_KEYS.adminRefreshToken);
    if (!refreshToken) return Promise.reject(error);

    request.authRetry = true;
    try {
      const accessToken = await refreshAccessToken(scope, refreshToken);
      request.headers.Authorization = `Bearer ${accessToken}`;
      return axiosInstance.request(request);
    } catch (refreshError) {
      return Promise.reject(refreshError);
    }
  },
);
