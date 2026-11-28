"use client";

import { useState, type FormEvent } from "react";
import { API_ENDPOINTS } from "@/services/api/API_ENDPOINT";
import { postData } from "@/services/api/apiService";

type SubmissionStatus = {
  type: "success" | "error";
  message: string;
};

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (
    typeof error === "object" &&
    error !== null &&
    "message" in error &&
    typeof error.message === "string"
  ) {
    return error.message;
  }
  return "We could not complete your signup. Please try again.";
}

export function NewsletterSignupForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState<SubmissionStatus | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    const email = String(formData.get("email") || "").trim();
    const consent = formData.get("consent") === "on";

    setStatus(null);
    setIsSubmitting(true);

    try {
      const response = await postData(
        API_ENDPOINTS.NEWSLETTER.SUBSCRIBE,
        { email, consent },
        { auth: false },
      );

      if (response?.success !== true) {
        throw new Error(
          typeof response?.message === "string"
            ? response.message
            : "We could not complete your signup. Please try again.",
        );
      }

      form.reset();
      setStatus({
        type: "success",
        message:
          typeof response.message === "string"
            ? response.message
            : "Thank you for signing up.",
      });
    } catch (error) {
      setStatus({ type: "error", message: getErrorMessage(error) });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form
      className="footer-newsletter-form"
      onSubmit={handleSubmit}
      aria-label="Newsletter signup"
      aria-busy={isSubmitting}
    >
      <label className="footer-newsletter__field-label" htmlFor="newsletter-email">
        Email address
      </label>
      <div className="footer-newsletter__controls">
        <input
          id="newsletter-email"
          className="footer-newsletter__input"
          type="email"
          name="email"
          placeholder="you@example.com"
          autoComplete="email"
          maxLength={320}
          required
          disabled={isSubmitting}
        />
        <button
          className="footer-newsletter__submit"
          type="submit"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Submitting..." : "Subscribe"}
        </button>
      </div>
      <label className="footer-newsletter__consent">
        <input
          type="checkbox"
          name="consent"
          required
          disabled={isSubmitting}
        />
        <span>I agree to receive Vrindavan Rasa news and offers by email.</span>
      </label>
      {status ? (
        <p
          className={`footer-newsletter__status footer-newsletter__status--${status.type}`}
          role={status.type === "error" ? "alert" : "status"}
        >
          {status.message}
        </p>
      ) : null}
    </form>
  );
}
