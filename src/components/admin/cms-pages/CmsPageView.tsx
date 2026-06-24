"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  getAdminModuleApiPath,
  getAdminModuleEditPath,
  type AdminModuleKey,
} from "@/components/admin/commonTable/adminModuleTable.config";
import type { AdminViewProps } from "@/components/admin/views/adminViewRegistry";
import { getData } from "@/services/api/apiService";

type CmsPageRecord = {
  id: number;
  title: string;
  slug: string;
  content: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
};

export function CmsPageView({ module, recordId }: AdminViewProps) {
  const router = useRouter();
  const apiPath = getAdminModuleApiPath(module as AdminModuleKey);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [page, setPage] = useState<CmsPageRecord | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchPage() {
      setLoading(true);
      setLoadError("");

      try {
        const response = await getData(`${apiPath}/${recordId}`);
        const data = response?.data;
        const record =
          data && typeof data === "object" && !Array.isArray(data)
            ? (data as CmsPageRecord)
            : ((response ?? {}) as CmsPageRecord);

        if (!cancelled) {
          setPage(record);
        }
      } catch {
        if (!cancelled) {
          setLoadError("Failed to load CMS page.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    fetchPage();

    return () => {
      cancelled = true;
    };
  }, [apiPath, recordId]);

  if (loading) {
    return (
      <div className="flex min-h-64 items-center justify-center rounded-xl border border-zinc-200 bg-white">
        <div className="flex flex-col items-center gap-3">
          <span className="h-8 w-8 animate-spin rounded-full border-2 border-zinc-300 border-t-zinc-700" />
          <p className="text-sm text-zinc-500">Loading page...</p>
        </div>
      </div>
    );
  }

  if (loadError || !page) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6">
        <p className="text-sm text-red-700">{loadError || "Page not found."}</p>
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
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-zinc-900">{page.title}</h1>
            <p className="mt-1 text-sm text-zinc-500">/{page.slug}</p>
          </div>
          <div className="flex items-center gap-3">
            <span
              className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${
                page.isActive
                  ? "bg-emerald-50 text-emerald-700"
                  : "bg-zinc-100 text-zinc-600"
              }`}
            >
              {page.isActive ? "Active" : "Inactive"}
            </span>
            <Link
              href={getAdminModuleEditPath(module, page.id)}
              className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800"
            >
              Edit page
            </Link>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-zinc-500">
          Content
        </h2>
        <div
          className="prose prose-zinc max-w-none"
          dangerouslySetInnerHTML={{ __html: page.content }}
        />
      </div>
    </div>
  );
}
