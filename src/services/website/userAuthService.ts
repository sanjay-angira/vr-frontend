import { postData } from "@/services/api/apiService";
import { API_ENDPOINTS } from "@/services/api/API_ENDPOINT";
import { tokenStorage } from "@/services/api/storage";
import type { User } from "@/utils/types/user";
import type { ApiErrorResponse } from "@/services/api/errors";
import { ApiError } from "@/services/api/errors";

type VerifyOtpResponse = {
  success: boolean;
  message: string;
  data?: {
    user: {
      id: number;
      phoneNumber?: string;
      firstName?: string;
      lastName?: string;
      email?: string;
      profileImage?: string;
    };
    accessToken: string;
    refreshToken: string;
  };
  statusCode?: number;
};

function mapBackendUser(
  user: NonNullable<VerifyOtpResponse["data"]>["user"]
): User {
  const name =
    [user.firstName, user.lastName].filter(Boolean).join(" ").trim() ||
    user.phoneNumber ||
    "Customer";

  return {
    id: String(user.id),
    email: user.email || "",
    name,
    phone: user.phoneNumber,
    avatar: user.profileImage || undefined,
  };
}

function throwIfError(response: ApiErrorResponse | VerifyOtpResponse): void {
  if (!response.success) {
    throw new ApiError(response.message, response.statusCode);
  }
}

export const userAuthService = {
  async sendWhatsappOtp(phoneNumber: string) {
    const response = await postData(
      API_ENDPOINTS.CUSTOMER_AUTH.SEND_WHATSAPP_OTP,
      { phoneNumber },
      { auth: false }
    );
    throwIfError(response);
    return response;
  },

  async verifyWhatsappOtp(phoneNumber: string, otp: string) {
    const response = (await postData(
      API_ENDPOINTS.CUSTOMER_AUTH.VERIFY_WHATSAPP_OTP,
      { phoneNumber, otp },
      { auth: false }
    )) as VerifyOtpResponse;

    throwIfError(response);

    if (!response.data?.user || !response.data.accessToken) {
      throw new ApiError("Invalid login response");
    }

    tokenStorage.setUserAccessToken(response.data.accessToken);
    tokenStorage.setUserRefreshToken(response.data.refreshToken);

    return {
      user: mapBackendUser(response.data.user),
      accessToken: response.data.accessToken,
    };
  },

  logout() {
    tokenStorage.clearUser();
  },
};
