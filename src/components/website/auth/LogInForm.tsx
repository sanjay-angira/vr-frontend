"use client";

import { useState, useEffect } from "react";
import { useFormik } from "formik";
import { phoneSchema, otpSchema } from "@/utils/validations";
import { getError } from "@/utils/formikHelpers";
import { postData } from "@/services/api/apiService";
import { toast } from "react-toastify";
import { API_ENDPOINTS } from "@/services/api/API_ENDPOINT";
import { setJson, STORAGE_KEYS, tokenStorage } from "@/services/api/storage";
import { useDispatch } from "react-redux";
import { setUserCredentials } from "@/services/redux/slices/websiteSlices/userAuthSlice";
import { setAuthModalOpen } from "@/services/redux/slices/websiteSlices/modalSlice";
import type { User } from "../../../types/user";
import { usePathname, useRouter } from "next/navigation";
import { isAuthPagePath } from "@/utils/authRoutes";
import { Button, GoogleButton } from "@/components/website/auth/buttons";
import { PhoneInput, OTPInput } from "@/components/website/auth/inputes";
import { ShieldCheck, Lock, Send } from "lucide-react";
import Link from "next/link";

type LogInFormProps = {
  onCreateAccount?: () => void;
  /** modal = auth dialog chrome; inline = checkout accordion (tid LogInSection) */
  variant?: "modal" | "inline";
  onSuccess?: () => void;
};

const LogInForm = ({
  onCreateAccount,
  variant = "modal",
  onSuccess,
}: LogInFormProps) => {
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const isInline = variant === "inline";

  const dispatch = useDispatch();
  const router = useRouter();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const phoneFormik = useFormik({
    initialValues: { phoneNumber: "" },
    validationSchema: phoneSchema,
    validateOnChange: true,
    validateOnBlur: true,
    onSubmit: async (values) => {
      setLoading(true);
      try {
        const response = await postData(
          API_ENDPOINTS.CUSTOMER_AUTH.SEND_WHATSAPP_OTP,
          { phoneNumber: values.phoneNumber },
        );

        if (response.success) {
          toast.success("OTP sent successfully via WhatsApp!");
          setStep("otp");
        } else {
          toast.error(response.message || "Failed to send OTP");
        }
      } catch (err: unknown) {
        const message =
          err && typeof err === "object" && "response" in err
            ? (err as { response?: { data?: { message?: string } } }).response
                ?.data?.message
            : undefined;
        toast.error(message || "Failed to send OTP");
      } finally {
        setLoading(false);
      }
    },
  });

  const otpFormik = useFormik({
    initialValues: { otp: "" },
    validationSchema: otpSchema,
    validateOnChange: true,
    validateOnBlur: true,
    onSubmit: async (values) => {
      setLoading(true);
      try {
        const response = await postData(
          API_ENDPOINTS.CUSTOMER_AUTH.VERIFY_WHATSAPP_OTP,
          {
            phoneNumber: phoneFormik.values.phoneNumber,
            otp: values.otp,
          },
        );

        if (response.success) {
          const { accessToken, refreshToken, user } = response.data;

          if (accessToken) {
            tokenStorage.setUserAccessToken(accessToken);
          }

          if (refreshToken) {
            tokenStorage.setUserRefreshToken(refreshToken);
          }

          if (user && accessToken) {
            const mappedUser: User = {
              id: String(user.id),
              email: user.email || "",
              name:
                [user.firstName, user.lastName].filter(Boolean).join(" ").trim() ||
                user.phoneNumber ||
                user.phone ||
                "Customer",
              phone: user.phoneNumber || user.phone,
              avatar: user.profileImage || undefined,
            };
            setJson(STORAGE_KEYS.userProfile, mappedUser);
            dispatch(setUserCredentials({ user: mappedUser, accessToken }));
          }

          toast.success("Login successful!");
          dispatch(setAuthModalOpen(false));
          onSuccess?.();

          if (!isInline && isAuthPagePath(pathname)) {
            router.push("/");
          }
        } else {
          toast.error(response.message || "Invalid OTP");
        }
      } catch (err: unknown) {
        const message =
          err && typeof err === "object" && "response" in err
            ? (err as { response?: { data?: { message?: string } } }).response
                ?.data?.message
            : undefined;
        toast.error(message || "Invalid OTP");
      } finally {
        setLoading(false);
      }
    },
  });

  if (!mounted) return null;

  const formBody = (
    <div className={isInline ? "checkout-login-form-body" : "auth-form-body"}>
      {step === "phone" ? (
        <form onSubmit={phoneFormik.handleSubmit} className="auth-form-fields">
          <PhoneInput
            value={phoneFormik.values.phoneNumber}
            onChange={phoneFormik.handleChange}
            onBlur={phoneFormik.handleBlur}
            error={getError(phoneFormik, "phoneNumber")}
          />

          {!isInline ? null : (
            <p className="checkout-login-terms">
              By continuing, you agree to our{" "}
              <Link href="/terms">Terms of Use</Link> and{" "}
              <Link href="/privacy">Privacy Policy</Link>.
            </p>
          )}

          <Button
            type="submit"
            text="Request OTP"
            loading={loading}
            disabled={loading}
            loadingText="Sending OTP..."
            icon={<Send size={16} strokeWidth={2.25} />}
          />
        </form>
      ) : (
        <form onSubmit={otpFormik.handleSubmit} className="auth-form-fields">
          <p className="auth-otp-hint">
            OTP sent to +91 {phoneFormik.values.phoneNumber}
            <button
              type="button"
              className="auth-otp-change"
              onClick={() => setStep("phone")}
            >
              Change
            </button>
          </p>

          <OTPInput
            value={otpFormik.values.otp}
            onChange={(otp: string) => otpFormik.setFieldValue("otp", otp)}
            onBlur={otpFormik.handleBlur}
            error={getError(otpFormik, "otp")}
            maxLength={6}
          />

          <Button
            type="submit"
            text="Verify & Login"
            loading={loading}
            disabled={loading}
            loadingText="Verifying..."
          />
        </form>
      )}

      {!isInline ? (
        <>
          <div className="auth-or-divider" role="separator">
            <span>or</span>
          </div>

          <GoogleButton
            onClick={() => toast.info("Google sign-in coming soon")}
          />

          {onCreateAccount && (
            <p className="auth-create-account">
              New to Vrindavan Rasa?{" "}
              <button type="button" onClick={onCreateAccount}>
                Create an account
              </button>
            </p>
          )}
        </>
      ) : null}
    </div>
  );

  if (isInline) {
    return <div className="checkout-login-form">{formBody}</div>;
  }

  return (
    <div className="auth-modal-form">
      <div className="auth-form-header">
        <div className="auth-form-shield" aria-hidden>
          <ShieldCheck size={28} strokeWidth={1.75} />
        </div>
        <h2 className="auth-form-title">Login to your account</h2>
        <p className="auth-form-subtitle">
          Get access to your Orders, Wishlist and Recommendations.
        </p>
      </div>

      {formBody}

      <div className="auth-trust-bar">
        <span className="auth-trust-item">
          <ShieldCheck size={14} strokeWidth={2} />
          Secure &amp; Private
        </span>
        <span className="auth-trust-item">
          <Lock size={14} strokeWidth={2} />
          100% Safe &amp; Trusted
        </span>
      </div>
    </div>
  );
};

export default LogInForm;
