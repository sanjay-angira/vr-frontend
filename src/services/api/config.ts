import Cookies from "js-cookie";
import axios from "axios";
import { STORAGE_KEYS } from "./storage";
import { getNewAccessToken } from "./jwt";

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

axiosInstance.interceptors.request.use(
  async (req) => {
    if ((req as { skipAuth?: boolean }).skipAuth) {
      return req;
    }

    const refreshToken =
      Cookies.get(STORAGE_KEYS.refreshToken) ??
      Cookies.get(STORAGE_KEYS.adminRefreshToken) ??
      Cookies.get(STORAGE_KEYS.userRefreshToken);
    const accessToken =
      Cookies.get(STORAGE_KEYS.accessToken) ??
      Cookies.get(STORAGE_KEYS.adminAccessToken) ??
      Cookies.get(STORAGE_KEYS.userAccessToken);
    let resolvedAccessToken = accessToken;

    if (refreshToken && !resolvedAccessToken) {
      const refreshed = await getNewAccessToken(refreshToken);
      if (refreshed?.success && refreshed?.data) {
        resolvedAccessToken = refreshed.data;
      }
    }

    if (resolvedAccessToken) {
      req.headers.Authorization = `Bearer ${resolvedAccessToken}`;
    }

    return req;
  },
  (error) => Promise.reject(error)
);
