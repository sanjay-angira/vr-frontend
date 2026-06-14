"use client";

import { FormEvent, useMemo, useState } from "react";
import {
  CheckCircle2,
  Clock3,
  Mail,
  MessageCircleMore,
  Phone,
  Send,
  ShieldCheck,
} from "lucide-react";

type ContactFormState = {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  message: string;
  otp: string;
};

const initialState: ContactFormState = {
  firstName: "",
  lastName: "",
  email: "",
  phoneNumber: "",
  message: "",
  otp: "",
};

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL || "https://api.vrindavanrasa.com/backend/api";

export default function ContactUsPage() {
  const [form, setForm] = useState<ContactFormState>(initialState);
  const [errors, setErrors] = useState<Partial<Record<keyof ContactFormState, string>>>({});
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [verified, setVerified] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [statusType, setStatusType] = useState<"success" | "error" | "info">("info");

  const canSendOtp = useMemo(
    () =>
      form.firstName.trim() &&
      form.lastName.trim() &&
      form.email.trim() &&
      form.phoneNumber.trim() &&
      form.message.trim(),
    [form],
  );

  const stepState = verified ? 3 : otpSent ? 2 : 1;

  function setField<K extends keyof ContactFormState>(key: K, value: ContactFormState[K]) {
    setForm((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: "" }));
  }

  function validateBeforeOtp() {
    const nextErrors: Partial<Record<keyof ContactFormState, string>> = {};

    if (!form.firstName.trim()) nextErrors.firstName = "First name is required";
    if (!form.lastName.trim()) nextErrors.lastName = "Last name is required";
    if (!form.email.trim()) nextErrors.email = "Email is required";
    if (form.email && !/^\S+@\S+\.\S+$/.test(form.email)) nextErrors.email = "Enter a valid email";
    if (!form.phoneNumber.trim()) nextErrors.phoneNumber = "Phone number is required";
    if (!form.message.trim()) nextErrors.message = "Message is required";

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  async function sendOtp(e: FormEvent) {
    e.preventDefault();
    setStatusMessage("");

    if (!validateBeforeOtp()) return;

    try {
      setIsSendingOtp(true);
      const response = await fetch(`${API_BASE}/customer/contact-us/send-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: form.firstName.trim(),
          lastName: form.lastName.trim(),
          email: form.email.trim(),
          phoneNumber: form.phoneNumber.trim(),
          message: form.message.trim(),
        }),
      });

      const result = await response.json();

      if (!response.ok || !result?.success) {
        setStatusType("error");
        setStatusMessage(result?.message || "Failed to send OTP");
        return;
      }

      setOtpSent(true);
      setVerified(false);
      setStatusType("success");
      setStatusMessage(result?.message || "OTP sent successfully");
    } catch {
      setStatusType("error");
      setStatusMessage("Unable to send OTP right now");
    } finally {
      setIsSendingOtp(false);
    }
  }

  async function verifyOtp(e: FormEvent) {
    e.preventDefault();
    if (!form.otp.trim()) {
      setErrors((current) => ({ ...current, otp: "OTP is required" }));
      return;
    }

    try {
      setIsVerifyingOtp(true);
      const response = await fetch(`${API_BASE}/customer/contact-us/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: form.email.trim(),
          otp: form.otp.trim(),
        }),
      });

      const result = await response.json();

      if (!response.ok || !result?.success) {
        setStatusType("error");
        setStatusMessage(result?.message || "OTP verification failed");
        return;
      }

      setVerified(true);
      setStatusType("success");
      setStatusMessage(result?.message || "Email verified successfully");
    } catch {
      setStatusType("error");
      setStatusMessage("Unable to verify OTP right now");
    } finally {
      setIsVerifyingOtp(false);
    }
  }

  function resetForm() {
    setForm(initialState);
    setErrors({});
    setOtpSent(false);
    setVerified(false);
    setStatusMessage("");
    setStatusType("info");
  }

  return (
    <div className="container" style={{ paddingTop: "2rem", paddingBottom: "3rem" }}>
      <section className="contact-page-shell">
        <div className="contact-page-card">
          <div className="contact-page-info">
            <div className="contact-page-intro">
              <span className="contact-page-eyebrow">Contact Us</span>
              <h1>Let&apos;s start your conversation with a verified email.</h1>
              <p>
                Share your query with us and we&apos;ll create your lead after a quick OTP verification.
                That keeps the inbox cleaner and helps our team respond faster.
              </p>
            </div>

            <div className="contact-page-stepper">
              {[
                { id: 1, title: "Fill Details", note: "Add your message and contact details." },
                { id: 2, title: "Verify Email", note: "We send a 6-digit OTP to your inbox." },
                { id: 3, title: "Lead Created", note: "Your verified request reaches our admin team." },
              ].map((step) => (
                <div
                  key={step.id}
                  className={`contact-page-step ${stepState >= step.id ? "active" : ""} ${stepState > step.id ? "done" : ""}`}
                >
                  <span className="contact-page-step-index">
                    {stepState > step.id ? <CheckCircle2 size={14} /> : step.id}
                  </span>
                  <div>
                    <strong>{step.title}</strong>
                    <p>{step.note}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="contact-page-info-grid">
              <div className="contact-page-info-block">
                <div className="contact-page-info-icon">
                  <MessageCircleMore size={22} />
                </div>
                <div>
                  <h3>Phone or WhatsApp</h3>
                  <p>Need quick help? Reach out for product questions, orders, or general assistance.</p>
                </div>
              </div>

              <div className="contact-page-info-block">
                <div className="contact-page-info-icon">
                  <Mail size={22} />
                </div>
                <div>
                  <h3>Email Verification</h3>
                  <p>Your email is verified with OTP before the message is submitted as a lead.</p>
                </div>
              </div>

              <div className="contact-page-info-block">
                <div className="contact-page-info-icon">
                  <Clock3 size={22} />
                </div>
                <div>
                  <h3>Fast Response Flow</h3>
                  <p>Verified contact leads are easier for the admin team to review and follow up.</p>
                </div>
              </div>
            </div>

            <div className="contact-page-contact-strip">
              <div className="contact-page-contact-chip">
                <Phone size={15} />
                <span>Support Friendly</span>
              </div>
              <div className="contact-page-contact-chip">
                <ShieldCheck size={15} />
                <span>OTP Protected</span>
              </div>
              <div className="contact-page-contact-chip">
                <Send size={15} />
                <span>Admin Lead Ready</span>
              </div>
            </div>

            <div className="contact-page-info-note">
              <ShieldCheck size={18} />
              <span>Verified emails help us reduce spam and make sure genuine inquiries reach the admin panel.</span>
            </div>
          </div>

          <div className="contact-page-form-wrap">
            <div className="contact-page-form-header">
              <span className="contact-page-form-kicker">Verified Contact Form</span>
              <h2>{verified ? "Lead Submitted Successfully" : otpSent ? "Verify Your Email OTP" : "Send Message"}</h2>
              <p>
                {verified
                  ? "Your inquiry has been verified and submitted. Our team can now see it in the admin leads module."
                  : otpSent
                    ? `We sent a 6-digit OTP to ${form.email || "your email"}. Enter it below to finish submitting your message.`
                    : "Fill in your details below. We will send an OTP to your email before final submission."}
              </p>
            </div>

            {statusMessage && <div className={`contact-page-alert ${statusType}`}>{statusMessage}</div>}

            {!verified && (
              <div className="contact-page-progress">
                <div className={`contact-page-progress-bar step-${stepState}`}></div>
              </div>
            )}

            <form onSubmit={otpSent ? verifyOtp : sendOtp} className="contact-page-form">
              <div className="contact-page-grid">
                <div>
                  <label>First Name</label>
                  <input
                    value={form.firstName}
                    onChange={(e) => setField("firstName", e.target.value)}
                    placeholder="Enter your first name"
                    disabled={otpSent}
                  />
                  {errors.firstName && <p className="contact-page-error">{errors.firstName}</p>}
                </div>

                <div>
                  <label>Last Name</label>
                  <input
                    value={form.lastName}
                    onChange={(e) => setField("lastName", e.target.value)}
                    placeholder="Enter your last name"
                    disabled={otpSent}
                  />
                  {errors.lastName && <p className="contact-page-error">{errors.lastName}</p>}
                </div>

                <div>
                  <label>Email</label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => setField("email", e.target.value)}
                    placeholder="Enter your email"
                    disabled={otpSent}
                  />
                  {errors.email && <p className="contact-page-error">{errors.email}</p>}
                </div>

                <div>
                  <label>Mobile Number</label>
                  <input
                    value={form.phoneNumber}
                    onChange={(e) => setField("phoneNumber", e.target.value)}
                    placeholder="+91 9876543210"
                    disabled={otpSent}
                  />
                  {errors.phoneNumber && <p className="contact-page-error">{errors.phoneNumber}</p>}
                </div>
              </div>

              <div>
                <label>Message</label>
                <textarea
                  value={form.message}
                  onChange={(e) => setField("message", e.target.value)}
                  placeholder="Tell us how we can help you"
                  rows={6}
                  disabled={otpSent}
                />
                {errors.message && <p className="contact-page-error">{errors.message}</p>}
              </div>

              {otpSent && !verified && (
                <div className="contact-page-otp-panel">
                  <div className="contact-page-otp-copy">
                    <strong>Email OTP</strong>
                    <p>Enter the code sent to your email. Reset the form if you want to change the email address.</p>
                  </div>
                  <div>
                    <input
                      value={form.otp}
                      onChange={(e) => setField("otp", e.target.value)}
                      placeholder="Enter the 6-digit OTP"
                      maxLength={6}
                    />
                    {errors.otp && <p className="contact-page-error">{errors.otp}</p>}
                  </div>
                </div>
              )}

              <div className="contact-page-actions">
                {!otpSent && (
                  <button className="contact-page-submit" type="submit" disabled={isSendingOtp || !canSendOtp}>
                    {isSendingOtp ? "Sending OTP..." : "Send OTP"}
                  </button>
                )}

                {otpSent && !verified && (
                  <>
                    <button className="contact-page-submit" type="submit" disabled={isVerifyingOtp}>
                      {isVerifyingOtp ? "Verifying..." : "Verify Email & Submit"}
                    </button>
                    <button className="contact-page-secondary" type="button" onClick={resetForm}>
                      Edit Form
                    </button>
                  </>
                )}

                {verified && (
                  <button className="contact-page-secondary" type="button" onClick={resetForm}>
                    Submit Another Lead
                  </button>
                )}
              </div>
            </form>

            {!verified && (
              <div className="contact-page-form-footer">
                <span>Only verified emails are accepted.</span>
                <span>Your lead appears in the admin panel after OTP verification.</span>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
