import Cookies from "js-cookie";

const AUTH_COOKIE_OPTIONS = { expires: 7, path: "/", sameSite: "lax" as const };
export const STORAGE_KEYS = {
  accessToken: "access-token",
  refreshToken: "refresh-token",
  adminAccessToken: "admin_access_token",
  adminRefreshToken: "admin_refresh_token",
  adminUser: "admin_user",
  adminPermissions: "admin_permissions",
  adminSession: "admin_session",
  userAccessToken: "user_access_token",
  userRefreshToken: "user_refresh_token",
  userProfile: "user_profile",
  userSession: "user_session",
} as const;


function isBrowser() {
  return typeof window !== "undefined";
}

function setCookie(key: string, value: string) {
  if (!isBrowser()) return;
  Cookies.set(key, value, AUTH_COOKIE_OPTIONS);
}

function removeCookie(key: string) {
  if (!isBrowser()) return;
  Cookies.remove(key, { path: "/" });
}

export function getItem(key: string): string | null {
  if (!isBrowser()) return null;
  return localStorage.getItem(key);
}

export function setItem(key: string, value: string) {
  if (!isBrowser()) return;
  localStorage.setItem(key, value);
}

export function removeItem(key: string) {
  if (!isBrowser()) return;
  localStorage.removeItem(key);
}

export function getJson<T>(key: string): T | null {
  const raw = getItem(key);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export function setJson<T>(key: string, value: T) {
  setItem(key, JSON.stringify(value));
}

export const tokenStorage = {
  getAdminAccessToken: () => Cookies.get(STORAGE_KEYS.adminAccessToken) ?? null,
  setAdminAccessToken: (token: string) => {
    setCookie(STORAGE_KEYS.adminAccessToken, token);
    setCookie(STORAGE_KEYS.adminSession, "1");
  },
  getAdminRefreshToken: () => Cookies.get(STORAGE_KEYS.adminRefreshToken) ?? null,
  setAdminRefreshToken: (token: string) => {
    setCookie(STORAGE_KEYS.adminRefreshToken, token);
  },
  clearAdmin: () => {
    removeItem(STORAGE_KEYS.adminUser);
    removeItem(STORAGE_KEYS.adminPermissions);
    removeCookie(STORAGE_KEYS.adminAccessToken);
    removeCookie(STORAGE_KEYS.adminRefreshToken);
    removeCookie(STORAGE_KEYS.adminSession);
  },
  
  getUserAccessToken: () => Cookies.get(STORAGE_KEYS.userAccessToken) ?? null,
  setUserAccessToken: (token: string) => {
    setCookie(STORAGE_KEYS.userAccessToken, token);
    setCookie(STORAGE_KEYS.userSession, "1");
  },
  getUserRefreshToken: () => Cookies.get(STORAGE_KEYS.userRefreshToken) ?? null,
  setUserRefreshToken: (token: string) => {
    setCookie(STORAGE_KEYS.userRefreshToken, token);
  },
  clearUser: () => {
    removeItem(STORAGE_KEYS.userProfile);
    removeCookie(STORAGE_KEYS.userAccessToken);
    removeCookie(STORAGE_KEYS.userRefreshToken);
    removeCookie(STORAGE_KEYS.userSession);
  },
  hasAdminSession: () => tokenStorage.getAdminAccessToken() !== null,
};
