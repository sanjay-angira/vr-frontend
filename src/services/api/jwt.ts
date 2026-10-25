import axios from "axios";
import { tokenStorage } from "./storage";
import { API_BASE_URL } from "./config";
import API_ENDPOINTS from "./API_ENDPOINT";

export async function getNewAccessToken(refreshToken: string): Promise<string> {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/${API_ENDPOINTS.CUSTOMER_AUTH.REFRESH_TOKEN}`,
      { refreshToken },
      { headers: { "Content-Type": "application/json" } },
    );
    const accessToken = response.data?.data?.accessToken;
    const returnedRefreshToken = response.data?.data?.refreshToken;
    if (
      typeof accessToken !== "string" ||
      typeof returnedRefreshToken !== "string"
    ) {
      throw new Error("Refresh token response was invalid");
    }

    tokenStorage.setUserAccessToken(accessToken);
    tokenStorage.setUserRefreshToken(returnedRefreshToken);
    return accessToken;
  } catch (error) {
    if (
      axios.isAxiosError(error) &&
      [401, 403].includes(error.response?.status ?? 0)
    ) {
      tokenStorage.clearUser();
    }
    throw error;
  }
}
