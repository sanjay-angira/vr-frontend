"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { FormEvent, useState } from "react";
import { Button } from "@/components/common/Button";
import { ErrorMessage } from "@/components/common/ErrorMessage";
import { Input } from "@/components/common/Input";

export function AdminResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (!token) {
      setError("Invalid or expired reset link. Please request a new one.");
      return;
    }

    setIsLoading(true);

    try {
      // TODO: integrate with adminAuth.service
      await new Promise((resolve) => setTimeout(resolve, 800));
      setIsSubmitted(true);
    } catch {
      setError("Unable to reset password. The link may have expired.");
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
          <p className="font-medium text-blue-950">Password updated</p>
          <p className="mt-2 text-sm text-slate-500">
            Your admin password has been reset. You can now sign in.
          </p>
        </div>

        <Link href={"/admin/login"}>
          <Button fullWidth>Continue to sign in</Button>
        </Link>
      </div>
    );
  }

  if (!token) {
    return (
      <div className="space-y-5 text-center">
        <ErrorMessage message="This reset link is invalid or has expired." />
        <Link href={"/admin/forgot-password"}>
          <Button fullWidth>Request a new link</Button>
        </Link>
        <p className="text-sm text-slate-500">
          <Link
            href={"/admin/login"}
            className="font-medium text-admin-primary hover:underline"
          >
            Back to sign in
          </Link>
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <ErrorMessage message={error} />

      <Input
        label="New password"
        type="password"
        name="password"
        autoComplete="new-password"
        placeholder="At least 8 characters"
        value={password}
        onChange={(event) => setPassword(event.target.value)}
        required
      />

      <Input
        label="Confirm new password"
        type="password"
        name="confirmPassword"
        autoComplete="new-password"
        placeholder="Re-enter your password"
        value={confirmPassword}
        onChange={(event) => setConfirmPassword(event.target.value)}
        required
      />

      <Button type="submit" fullWidth isLoading={isLoading}>
        Reset password
      </Button>

      <p className="text-center text-sm text-slate-500">
        <Link
          href={"/admin/login"}
          className="font-medium text-admin-primary hover:underline"
        >
          Back to sign in
        </Link>
      </p>
    </form>
  );
}
