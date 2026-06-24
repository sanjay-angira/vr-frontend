"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { Button } from "@/components/common/Button";
import { ErrorMessage } from "@/components/common/ErrorMessage";
import { Input } from "@/components/common/Input";

export function AdminForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      await new Promise((resolve) => setTimeout(resolve, 800));
      setIsSubmitted(true);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  if (isSubmitted) {
    return (
      <div className="space-y-5 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-500/10">
          <svg
            className="h-6 w-6 text-green-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>

        <div>
          <p className="font-medium text-blue-950">Check your email</p>
          <p className="mt-2 text-sm text-slate-500">
            We sent a password reset link to{" "}
            <span className="font-medium text-slate-700">{email}</span>
          </p>
        </div>

        <Link href={"/admin/login"}>
          <Button variant="secondary" fullWidth>
            Back to sign in
          </Button>
        </Link>
      </div>
    );
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
        hint="We'll send you a link to reset your admin password."
        required
      />

      <Button type="submit" fullWidth isLoading={isLoading}>
        Send reset link
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
