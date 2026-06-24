"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import OtpInput from "react-otp-input";
import { Button } from "@/components/common/Button";
import { ErrorMessage } from "@/components/common/ErrorMessage";
import { Input } from "@/components/common/Input";
import { API_ENDPOINTS, postData } from "@/services/api";
import type { ApiErrorResponse } from "@/services/api/errors";

type SendOtpResponse = {
  success: boolean;
  message?: string;
};

type VerifyOtpResponse = {
  success: boolean;
  message?: string;
  data?: {
    accessToken: string;
  };
};

function getErrorMessage(error: unknown, fallback: string) {
  if (error && typeof error === "object" && "message" in error) {
    return String((error as ApiErrorResponse).message || fallback);
  }
  if (error instanceof Error) {
    return error.message;
  }
  return fallback;
}

export function AdminForgotPasswordForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [error, setError] = useState("");
  const [otpSent, setOtpSent] = useState(false);

  async function handleSendOtp(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsSendingOtp(true);

    try {
      const response = (await postData(
        API_ENDPOINTS.AUTH.SEND_OTP,
        { email: email.trim() },
        { auth: false }
      )) as SendOtpResponse;

      if (response.success === false) {
        throw new Error(response.message ?? "Failed to send OTP.");
      }

      setOtp("");
      setOtpSent(true);
    } catch (sendError) {
      setError(getErrorMessage(sendError, "Unable to send OTP. Please try again."));
    } finally {
      setIsSendingOtp(false);
    }
  }

  async function handleVerifyOtp(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (otp.length !== 6) {
      setError("Please enter the 6-digit OTP.");
      return;
    }

    setIsVerifyingOtp(true);

    try {
      const response = (await postData(
        API_ENDPOINTS.AUTH.VERIFY_OTP,
        { email: email.trim(), emailOtp: otp },
        { auth: false }
      )) as VerifyOtpResponse;

      const accessToken = response.data?.accessToken;
      if (!accessToken) {
        throw new Error(response.message ?? "OTP verification failed.");
      }

      router.push(`/admin/reset-password?token=${encodeURIComponent(accessToken)}`);
    } catch (verifyError) {
      setError(getErrorMessage(verifyError, "Invalid or expired OTP. Please try again."));
    } finally {
      setIsVerifyingOtp(false);
    }
  }

  if (otpSent) {
    return (
      <form onSubmit={handleVerifyOtp} className="space-y-5">
        <ErrorMessage message={error} />

        <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
          We sent a 6-digit OTP to{" "}
          <span className="font-medium">{email}</span>. Enter it below to continue.
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-zinc-700">
            Verification code
          </label>
          <OtpInput
            value={otp}
            onChange={setOtp}
            numInputs={6}
            inputType="tel"
            shouldAutoFocus
            containerStyle="flex justify-between gap-2"
            inputStyle={{
              width: "100%",
              height: "2.75rem",
              borderRadius: "0.5rem",
              border: "1px solid #d4d4d8",
              fontSize: "1.125rem",
              fontWeight: 600,
            }}
            renderInput={(props) => <input {...props} />}
          />
        </div>

        <Button type="submit" fullWidth isLoading={isVerifyingOtp}>
          Verify OTP
        </Button>

        <div className="flex flex-col gap-2 text-center text-sm">
          <button
            type="button"
            onClick={() => {
              setOtpSent(false);
              setOtp("");
              setError("");
            }}
            className="font-medium text-admin-primary hover:underline"
          >
            Use a different email
          </button>
          <button
            type="button"
            onClick={async () => {
              setError("");
              setIsSendingOtp(true);
              try {
                await postData(
                  API_ENDPOINTS.AUTH.SEND_OTP,
                  { email: email.trim() },
                  { auth: false }
                );
              } catch (resendError) {
                setError(getErrorMessage(resendError, "Unable to resend OTP."));
              } finally {
                setIsSendingOtp(false);
              }
            }}
            disabled={isSendingOtp}
            className="font-medium text-admin-primary hover:underline disabled:opacity-50"
          >
            {isSendingOtp ? "Resending..." : "Resend OTP"}
          </button>
        </div>
      </form>
    );
  }

  return (
    <form onSubmit={handleSendOtp} className="space-y-5">
      <ErrorMessage message={error} />

      <Input
        label="Email address"
        type="email"
        name="email"
        autoComplete="email"
        placeholder="admin@example.com"
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        hint="We'll send a 6-digit OTP to reset your admin password."
        required
      />

      <Button type="submit" fullWidth isLoading={isSendingOtp}>
        Send OTP
      </Button>

      <p className="text-center text-sm text-slate-500">
        Remember your password?{" "}
        <Link
          href={"/admin/login"}
          className="font-medium text-admin-primary hover:underline"
        >
          Sign in
        </Link>
      </p>
    </form>
  );
}
