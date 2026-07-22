import { postData } from "@/services/api/apiService";
import { API_ENDPOINTS } from "@/services/api/API_ENDPOINT";
import { tokenStorage } from "@/services/api/storage";
import type { User } from "../../types/user";
import type { ApiErrorResponse } from "@/services/api/errors";
import { ApiError } from "@/services/api/errors";

export type AuthNextStep = "profile" | "email_otp" | null;

export type AuthBackendUser = {
  id: number;
  phoneNumber?: string;
  firstName?: string | null;
  lastName?: string | null;
  email?: string | null;
  profileImage?: string | null;
  phoneNumberVerified?: boolean;
  emailVerified?: boolean;
};

export type AuthSessionResponse = {
  success: boolean;
  message: string;
  data?: {
    profileCompleted: boolean;
    nextStep?: AuthNextStep;
    user: AuthBackendUser;
    accessToken?: string;
    refreshToken?: string;
  };
  statusCode?: number;
};

export type CompleteProfilePayload = {
  phoneNumber: string;
  firstName: string;
  lastName: string;
  email: string;
};

export type AuthSessionResult =
  | {
      profileCompleted: true;
      nextStep: null;
      user: User;
      accessToken: string;
      refreshToken?: string;
    }
  | {
      profileCompleted: false;
      nextStep: AuthNextStep;
      user: AuthBackendUser;
    };

function mapBackendUser(user: AuthBackendUser): User {
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

function throwIfError(response: ApiErrorResponse | AuthSessionResponse): void {
  if (!response.success) {
    throw new ApiError(response.message, response.statusCode);
  }
}

function toAuthSessionResult(response: AuthSessionResponse): AuthSessionResult {
  if (!response.data?.user) {
    throw new ApiError("Invalid auth response");
  }

  if (response.data.profileCompleted && response.data.accessToken) {
    tokenStorage.setUserAccessToken(response.data.accessToken);
    if (response.data.refreshToken) {
      tokenStorage.setUserRefreshToken(response.data.refreshToken);
    }

    return {
      profileCompleted: true,
      nextStep: null,
      user: mapBackendUser(response.data.user),
      accessToken: response.data.accessToken,
      refreshToken: response.data.refreshToken,
    };
  }

  return {
    profileCompleted: false,
    nextStep: response.data.nextStep ?? "profile",
    user: response.data.user,
  };
}

export const userAuthService = {
  mapBackendUser,

  async sendWhatsappOtp(phoneNumber: string) {
    const response = await postData(
      API_ENDPOINTS.CUSTOMER_AUTH.SEND_WHATSAPP_OTP,
      { phoneNumber },
      { auth: false }
    );
    throwIfError(response);
    return response;
  },

  async verifyWhatsappOtp(
    phoneNumber: string,
    otp: string
  ): Promise<AuthSessionResult> {
    const response = (await postData(
      API_ENDPOINTS.CUSTOMER_AUTH.VERIFY_WHATSAPP_OTP,
      { phoneNumber, otp },
      { auth: false }
    )) as AuthSessionResponse;

    throwIfError(response);
    return toAuthSessionResult(response);
  },

  async completeProfile(
    payload: CompleteProfilePayload
  ): Promise<AuthSessionResult> {
    const response = (await postData(
      API_ENDPOINTS.CUSTOMER_AUTH.COMPLETE_PROFILE,
      payload,
      { auth: false }
    )) as AuthSessionResponse;

    throwIfError(response);
    return toAuthSessionResult(response);
  },

  async verifyEmailOtp(
    phoneNumber: string,
    otp: string
  ): Promise<AuthSessionResult> {
    const response = (await postData(
      API_ENDPOINTS.CUSTOMER_AUTH.VERIFY_EMAIL_OTP,
      { phoneNumber, otp },
      { auth: false }
    )) as AuthSessionResponse;

    throwIfError(response);
    return toAuthSessionResult(response);
  },

  async resendEmailOtp(phoneNumber: string) {
    const response = await postData(
      API_ENDPOINTS.CUSTOMER_AUTH.RESEND_EMAIL_OTP,
      { phoneNumber },
      { auth: false }
    );
    throwIfError(response);
    return response;
  },

  logout() {
    tokenStorage.clearUser();
  },
};
