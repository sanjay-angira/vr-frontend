"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

type AdminFormLayoutProps = {
  title: string;
  description?: string;
  module: string;
  loading?: boolean;
  loadError?: string;
  submitError?: string;
  children: React.ReactNode;
};

export function AdminFormLayout({
  title,
  description,
  module,
  loading,
  loadError,
  submitError,
  children,
}: AdminFormLayoutProps) {
  const router = useRouter();

  if (loading) {
    return (
      <div className="flex min-h-64 items-center justify-center rounded-xl border border-zinc-200 bg-white">
        <div className="flex flex-col items-center gap-3">
          <span className="h-8 w-8 animate-spin rounded-full border-2 border-zinc-300 border-t-zinc-700" />
          <p className="text-sm text-zinc-500">Loading form...</p>
        </div>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6">
        <p className="text-sm text-red-700">{loadError}</p>
        <button
          type="button"
          onClick={() => router.push(`/admin/${module}`)}
          className="mt-4 text-sm font-medium text-red-900 hover:underline"
        >
          Back to list
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
        <div className="mb-1 text-xs font-medium uppercase tracking-wide text-zinc-400">
          <Link href={`/admin/${module}`} className="hover:text-zinc-600">
            Back to list
          </Link>
        </div>
        <h1 className="text-2xl font-semibold text-zinc-900">{title}</h1>
        {description && <p className="mt-1 text-sm text-zinc-500">{description}</p>}
      </div>

      <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
        {submitError && (
          <div className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {submitError}
          </div>
        )}
        {children}
      </div>
    </div>
  );
}
