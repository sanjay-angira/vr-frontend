"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { FormEvent, useState } from "react";
import { Button } from "@/components/common/Button";
import { ErrorMessage } from "@/components/common/ErrorMessage";
import { Input } from "@/components/common/Input";
import { setJson, tokenStorage } from "@/services/api/storage";
import {
  API_ENDPOINTS,
  postData,
  STORAGE_KEYS,
} from "@/services/api";
import type { ApiErrorResponse } from "@/services/api/errors";
import { useAppDispatch } from "@/services/redux/hooks";
import {
  setAdminAuthLoading,
  setAdminCredentials,
} from "@/services/redux/slices/adminSlices/adminAuthSlice";
import { Admin } from "../../../types/user";

export interface BackendAdminUser {
  id: number;
  email: string;
  firstName?: string;
  lastName?: string;
  profileImage?: string;
  userRoles?: Array<{ roleName?: string; role?: { roleName?: string } }>;
  permissions?: Array<Record<string, unknown>>;
}

export function mapBackendAdminUser(user: BackendAdminUser): Admin {
  return {
    id: String(user.id),
    email: user.email,
    name: `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim() || user.email,
    role:
      user.userRoles?.[0]?.roleName ??
      user.userRoles?.[0]?.role?.roleName ??
      "admin",
    avatar: user.profileImage ?? undefined,
  };
}

type AdminLoginResponse = {
  success: boolean;
  message?: string;
  data?: {
    user: BackendAdminUser;
    accessToken: string;
    refreshToken: string;
  };
};

function getLoginErrorMessage(error: unknown): string {
  if (error && typeof error === "object" && "message" in error) {
    const message = (error as ApiErrorResponse).message;
    if (message) return message;
  }
  if (error instanceof Error && error.message) {
    return error.message;
  }
  return "Login failed. Please check your credentials.";
}

export function AdminLoginForm() {
  const searchParams = useSearchParams();
  const dispatch = useAppDispatch();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsLoading(true);
    dispatch(setAdminAuthLoading(true));

    try {
      const response = (await postData(
        API_ENDPOINTS.AUTH.LOGIN,
        { email, password },
        { auth: false }
      )) as AdminLoginResponse;

      if (!response?.success || !response.data) {
        setError(response?.message ?? "Invalid email or password");
        return;
      }

      const { user, accessToken, refreshToken } = response.data;

      if (!accessToken || !refreshToken) {
        throw new Error("Login response did not include an access token");
      }
      tokenStorage.setAdminAccessToken(accessToken);
      tokenStorage.setAdminRefreshToken(refreshToken);

      setJson(STORAGE_KEYS.adminUser, user);
      if (user.permissions?.length) {
        setJson(STORAGE_KEYS.adminPermissions, user.permissions);
      }

      dispatch(
        setAdminCredentials({
          admin: mapBackendAdminUser(user),
          accessToken,
        })
      );

      window.location.href = searchParams.get("returnUrl") || "/admin/dashboard";
    } catch (err) {
      setError(getLoginErrorMessage(err));
    } finally {
      setIsLoading(false);
      dispatch(setAdminAuthLoading(false));
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <ErrorMessage message={error} />

      <Input
        label="Email address"
        type="email"
        name="email"
        autoComplete="email"
        placeholder="admin@example.com"
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        required
      />

      <Input
        label="Password"
        type="password"
        name="password"
        autoComplete="current-password"
        placeholder="Enter your password"
        value={password}
        onChange={(event) => setPassword(event.target.value)}
        showPasswordToggle
        required
      />

      <div className="flex justify-end">
        <Link
          href={"/admin/forgot-password"}
          className="font-medium text-admin-primary hover:underline"
        >
          Forgot password?
        </Link>
      </div>

      <Button type="submit" fullWidth isLoading={isLoading}>
        Sign in to admin
      </Button>
    </form>
  );
}
