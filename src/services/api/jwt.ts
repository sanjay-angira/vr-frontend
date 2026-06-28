import axios from "axios";
import Cookies from "js-cookie";
import { STORAGE_KEYS } from "./storage";
import { API_BASE_URL } from "./config";
import API_ENDPOINTS from "./API_ENDPOINT";

export function saveAccessToken(token: string) {
  Cookies.set(STORAGE_KEYS.accessToken, token, { expires: 365 });
}

export function saveRefreshToken(refreshToken: string) {
  Cookies.set(STORAGE_KEYS.refreshToken, refreshToken, { expires: 365 });
}

export function destroyTokens() {
  Cookies.remove(STORAGE_KEYS.accessToken);
  Cookies.remove(STORAGE_KEYS.refreshToken);
}

export async function getNewAccessToken(refreshToken: string) {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/${API_ENDPOINTS.AUTH.REFRESH_TOKEN}`,
      { refreshToken },
      { headers: { "Content-Type": "application/json" } }
    );
    const parsedResponse = response.data;

    if (
      parsedResponse?.data?.token &&
      parsedResponse?.data?.refreshToken
    ) {
      saveAccessToken(parsedResponse.data.token);
      saveRefreshToken(parsedResponse.data.refreshToken);
      return { success: true, data: parsedResponse.data.token as string };
    }

    throw new Error("Refresh token response was invalid");
  } catch {
    destroyTokens();
    return { success: false, data: null };
  }
}
