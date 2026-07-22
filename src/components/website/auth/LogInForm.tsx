"use client";

import { useState, useEffect } from "react";
import { useFormik } from "formik";
import {
  phoneSchema,
  otpSchema,
  completeProfileSchema,
} from "@/utils/validations";
import { getError } from "@/utils/formikHelpers";
import { postData } from "@/services/api/apiService";
import { toast } from "react-toastify";
import { API_ENDPOINTS } from "@/services/api/API_ENDPOINT";
import { setJson, STORAGE_KEYS, tokenStorage } from "@/services/api/storage";
import { useDispatch } from "react-redux";
import { setUserCredentials } from "@/services/redux/slices/websiteSlices/userAuthSlice";
import { setAuthModalOpen } from "@/services/redux/slices/websiteSlices/modalSlice";
import type { User } from "../../../types/user";
import { Button } from "@/components/website/auth/buttons";
import {
  PhoneInput,
  OTPInput,
  AuthTextInput,
} from "@/components/website/auth/inputes";
import { ShieldCheck, Lock, Send } from "lucide-react";
import Link from "next/link";

type LogInFormProps = {
  /** modal = auth dialog chrome; inline = checkout accordion (tid LogInSection) */
  variant?: "modal" | "inline";
  onSuccess?: () => void;
};

type AuthStep = "phone" | "otp" | "profile" | "email_otp";

type AuthUserPayload = {
  id: number | string;
  email?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  phoneNumber?: string;
  phone?: string;
  profileImage?: string | null;
};

function getApiErrorMessage(err: unknown, fallback: string) {
  if (err && typeof err === "object") {
    if ("message" in err && typeof (err as { message: unknown }).message === "string") {
      return (err as { message: string }).message || fallback;
    }
    if ("response" in err) {
      return (
        (err as { response?: { data?: { message?: string } } }).response?.data
          ?.message || fallback
      );
    }
  }
  return fallback;
}

function mapAuthUser(user: AuthUserPayload): User {
  return {
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
}

const LogInForm = ({
  variant = "modal",
  onSuccess,
}: LogInFormProps) => {
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<AuthStep>("phone");
  const [savedEmail, setSavedEmail] = useState("");
  const [profileDefaults, setProfileDefaults] = useState({
    firstName: "",
    lastName: "",
    email: "",
  });
  const isInline = variant === "inline";

  const dispatch = useDispatch();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const finishLogin = (
    user: AuthUserPayload,
    accessToken: string,
    refreshToken?: string,
  ) => {
    tokenStorage.setUserAccessToken(accessToken);
    if (refreshToken) {
      tokenStorage.setUserRefreshToken(refreshToken);
    }

    const mappedUser = mapAuthUser(user);
    setJson(STORAGE_KEYS.userProfile, mappedUser);
    dispatch(setUserCredentials({ user: mappedUser, accessToken }));

    toast.success("Login successful!");
    dispatch(setAuthModalOpen(false));
    onSuccess?.();
  };

  const goToIncompleteStep = (
    nextStep: string | null | undefined,
    user?: AuthUserPayload,
  ) => {
    if (nextStep === "email_otp") {
      setSavedEmail(user?.email || profileDefaults.email || "");
      setStep("email_otp");
      return;
    }

    setProfileDefaults({
      firstName: user?.firstName || "",
      lastName: user?.lastName || "",
      email: user?.email || "",
    });
    setStep("profile");
  };

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
        toast.error(getApiErrorMessage(err, "Failed to send OTP"));
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

        if (!response.success) {
          toast.error(response.message || "Invalid OTP");
          return;
        }

        const { profileCompleted, accessToken, refreshToken, user, nextStep } =
          response.data || {};

        if (profileCompleted && accessToken && user) {
          finishLogin(user, accessToken, refreshToken);
          return;
        }

        toast.success(
          nextStep === "email_otp"
            ? "Phone verified. Please verify your email OTP."
            : "OTP verified. Please complete your profile.",
        );
        goToIncompleteStep(nextStep, user);
      } catch (err: unknown) {
        toast.error(getApiErrorMessage(err, "Invalid OTP"));
      } finally {
        setLoading(false);
      }
    },
  });

  const profileFormik = useFormik({
    initialValues: profileDefaults,
    enableReinitialize: true,
    validationSchema: completeProfileSchema,
    validateOnChange: true,
    validateOnBlur: true,
    onSubmit: async (values) => {
      setLoading(true);
      try {
        const response = await postData(
          API_ENDPOINTS.CUSTOMER_AUTH.COMPLETE_PROFILE,
          {
            phoneNumber: phoneFormik.values.phoneNumber,
            firstName: values.firstName.trim(),
            lastName: values.lastName.trim(),
            email: values.email.trim(),
          },
        );

        if (!response.success) {
          const message = response.message || "Failed to complete profile";
          toast.error(message);
          if (/email/i.test(message)) {
            profileFormik.setFieldError("email", message);
          }
          return;
        }

        const { profileCompleted, accessToken, refreshToken, user } =
          response.data || {};

        if (profileCompleted && accessToken && user) {
          finishLogin(user, accessToken, refreshToken);
          return;
        }

        // Profile details saved — always continue to email OTP verification.
        toast.success("Profile saved. Enter the OTP sent to your email.");
        setSavedEmail(values.email.trim());
        setStep("email_otp");
      } catch (err: unknown) {
        const message = getApiErrorMessage(err, "Failed to complete profile");
        toast.error(message);
        if (/email/i.test(message)) {
          profileFormik.setFieldError("email", message);
        }
      } finally {
        setLoading(false);
      }
    },
  });

  const emailOtpFormik = useFormik({
    initialValues: { otp: "" },
    validationSchema: otpSchema,
    validateOnChange: true,
    validateOnBlur: true,
    onSubmit: async (values) => {
      setLoading(true);
      try {
        const response = await postData(
          API_ENDPOINTS.CUSTOMER_AUTH.VERIFY_EMAIL_OTP,
          {
            phoneNumber: phoneFormik.values.phoneNumber,
            otp: values.otp,
          },
        );

        if (!response.success) {
          toast.error(response.message || "Invalid email OTP");
          return;
        }

        const { profileCompleted, accessToken, refreshToken, user, nextStep } =
          response.data || {};

        if (profileCompleted && accessToken && user) {
          finishLogin(user, accessToken, refreshToken);
          return;
        }

        toast.error("Profile is still incomplete");
        goToIncompleteStep(nextStep, user);
      } catch (err: unknown) {
        toast.error(getApiErrorMessage(err, "Invalid email OTP"));
      } finally {
        setLoading(false);
      }
    },
  });

  const handleResendEmailOtp = async () => {
    setLoading(true);
    try {
      const response = await postData(
        API_ENDPOINTS.CUSTOMER_AUTH.RESEND_EMAIL_OTP,
        { phoneNumber: phoneFormik.values.phoneNumber },
      );

      if (response.success) {
        toast.success("Email OTP resent successfully");
      } else {
        toast.error(response.message || "Failed to resend email OTP");
      }
    } catch (err: unknown) {
      toast.error(getApiErrorMessage(err, "Failed to resend email OTP"));
    } finally {
      setLoading(false);
    }
  };

  if (!mounted) return null;

  const title =
    step === "profile"
      ? "Complete your profile"
      : step === "email_otp"
        ? "Verify your email"
        : "Login to your account";

  const subtitle =
    step === "profile"
      ? "Add your name and email to continue."
      : step === "email_otp"
        ? `Enter the OTP sent to ${savedEmail || "your email"}.`
        : "Get access to your Orders, Wishlist and Recommendations.";

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
      ) : step === "otp" ? (
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
            text="Verify OTP"
            loading={loading}
            disabled={loading}
            loadingText="Verifying..."
          />
        </form>
      ) : step === "profile" ? (
        <form
          onSubmit={profileFormik.handleSubmit}
          className="auth-form-fields auth-form-fields--compact"
        >
          <p className="auth-otp-hint">
            +91 {phoneFormik.values.phoneNumber}
          </p>

          <AuthTextInput
            name="firstName"
            value={profileFormik.values.firstName}
            placeholder="First name"
            onChange={profileFormik.handleChange}
            onBlur={profileFormik.handleBlur}
            error={getError(profileFormik, "firstName")}
            maxLength={25}
            autoComplete="given-name"
          />

          <AuthTextInput
            name="lastName"
            value={profileFormik.values.lastName}
            placeholder="Last name"
            onChange={profileFormik.handleChange}
            onBlur={profileFormik.handleBlur}
            error={getError(profileFormik, "lastName")}
            maxLength={25}
            autoComplete="family-name"
          />

          <AuthTextInput
            name="email"
            type="email"
            value={profileFormik.values.email}
            placeholder="Email address"
            onChange={profileFormik.handleChange}
            onBlur={profileFormik.handleBlur}
            error={getError(profileFormik, "email")}
            maxLength={50}
            autoComplete="email"
          />

          <Button
            type="submit"
            text="Continue"
            loading={loading}
            disabled={loading}
            loadingText="Saving..."
          />
        </form>
      ) : (
        <form onSubmit={emailOtpFormik.handleSubmit} className="auth-form-fields">
          <p className="auth-otp-hint">
            OTP sent to {savedEmail || "your email"}
            <button
              type="button"
              className="auth-otp-change"
              onClick={() => setStep("profile")}
            >
              Change email
            </button>
          </p>

          <OTPInput
            value={emailOtpFormik.values.otp}
            onChange={(otp: string) => emailOtpFormik.setFieldValue("otp", otp)}
            onBlur={emailOtpFormik.handleBlur}
            error={getError(emailOtpFormik, "otp")}
            maxLength={6}
          />

          <Button
            type="submit"
            text="Verify & Login"
            loading={loading}
            disabled={loading}
            loadingText="Verifying..."
          />

          <button
            type="button"
            className="auth-otp-change"
            onClick={handleResendEmailOtp}
            disabled={loading}
          >
            Resend email OTP
          </button>
        </form>
      )}
    </div>
  );

  if (isInline) {
    return <div className="checkout-login-form">{formBody}</div>;
  }

  return (
    <div
      className={`auth-modal-form${step === "profile" ? " is-profile-step" : ""}`}
    >
      <div className="auth-form-header">
        <div className="auth-form-shield" aria-hidden>
          <ShieldCheck size={step === "profile" ? 22 : 28} strokeWidth={1.75} />
        </div>
        <h2 className="auth-form-title">{title}</h2>
        <p className="auth-form-subtitle">{subtitle}</p>
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
