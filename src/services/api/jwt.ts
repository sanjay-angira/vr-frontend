import axios from "axios";
import { tokenStorage } from "./storage";
import { API_BASE_URL } from "./config";
import API_ENDPOINTS from "./API_ENDPOINT";

type AuthScope = "admin" | "customer";

export async function getNewAccessToken(
  refreshToken: string,
  scope: AuthScope,
): Promise<string> {
  const endpoint =
    scope === "customer"
      ? API_ENDPOINTS.CUSTOMER_AUTH.REFRESH_TOKEN
      : API_ENDPOINTS.AUTH.REFRESH_TOKEN;

  try {
    const response = await axios.post(
      `${API_BASE_URL}/${endpoint}`,
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

    if (scope === "customer") {
      tokenStorage.setUserAccessToken(accessToken);
      tokenStorage.setUserRefreshToken(returnedRefreshToken);
    } else {
      tokenStorage.setAdminAccessToken(accessToken);
      tokenStorage.setAdminRefreshToken(returnedRefreshToken);
    }
    return accessToken;
  } catch (error) {
    if (
      axios.isAxiosError(error) &&
      [401, 403].includes(error.response?.status ?? 0)
    ) {
      if (scope === "customer") {
        tokenStorage.clearUser();
      } else {
        tokenStorage.clearAdmin();
      }
    }
    throw error;
  }
}
