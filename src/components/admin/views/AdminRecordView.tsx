"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import {
  getAdminModuleApiPath,
  getAdminModuleEditPath,
  getAdminModuleTableConfig,
  getVisibleAdminColumns,
  type AdminModuleKey,
} from "@/components/admin/commonTable/adminModuleTable.config";
import {
  renderAdminCell,
  type ModuleTableRow,
} from "@/components/admin/commonTable/buildAdminTableColumns";
import { hasAdminForm } from "@/components/admin/forms/adminFormModules";
import type { AdminViewProps } from "@/components/admin/views/adminViewRegistry";
import { getRowDisplayName } from "@/components/common/getRowDisplayName";
import { getData } from "@/services/api/apiService";

export function AdminRecordView({ module, recordId }: AdminViewProps) {
  const router = useRouter();
  const config = getAdminModuleTableConfig(module);
  const apiPath = getAdminModuleApiPath(module as AdminModuleKey);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [record, setRecord] = useState<ModuleTableRow | null>(null);

  const columns = useMemo(
    () => (config ? getVisibleAdminColumns(config.columns) : []),
    [config]
  );

  useEffect(() => {
    let cancelled = false;

    async function fetchRecord() {
      setLoading(true);
      setLoadError("");

      try {
        const response = await getData(`${apiPath}/${recordId}`);
        const data = response?.data;
        const nextRecord =
          data && typeof data === "object" && !Array.isArray(data)
            ? (data as ModuleTableRow)
            : ((response ?? {}) as ModuleTableRow);

        if (!cancelled) {
          setRecord(nextRecord);
        }
      } catch {
        if (!cancelled) {
          setLoadError("Failed to load record.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    fetchRecord();

    return () => {
      cancelled = true;
    };
  }, [apiPath, recordId]);

  if (!config) {
    return null;
  }

  if (loading) {
    return (
      <div className="flex min-h-64 items-center justify-center rounded-xl border border-zinc-200 bg-white">
        <div className="flex flex-col items-center gap-3">
          <span className="h-8 w-8 animate-spin rounded-full border-2 border-zinc-300 border-t-zinc-700" />
          <p className="text-sm text-zinc-500">Loading {config.label.toLowerCase()}...</p>
        </div>
      </div>
    );
  }

  if (loadError || !record) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6">
        <p className="text-sm text-red-700">{loadError || "Record not found."}</p>
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

  const displayName = getRowDisplayName(record);
  const recordIdValue = record.id ?? recordId;
  const supportsEdit =
    config.actions.includes("edit") && hasAdminForm(module);

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
            <h1 className="text-2xl font-semibold text-zinc-900">
              {displayName ?? `${config.label.replace(/s$/, "")} #${recordIdValue}`}
            </h1>
            <p className="mt-1 text-sm text-zinc-500">
              View {config.label.toLowerCase()} details
            </p>
          </div>
          {supportsEdit ? (
            <Link
              href={getAdminModuleEditPath(module, String(recordIdValue))}
              className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800"
            >
              Edit
            </Link>
          ) : null}
        </div>
      </div>

      <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-zinc-500">
          Details
        </h2>
        <dl className="grid gap-4 sm:grid-cols-2">
          {columns.map((column) => (
            <div key={column.property} className="min-w-0">
              <dt className="text-xs font-medium uppercase tracking-wide text-zinc-400">
                {column.label}
              </dt>
              <dd className="mt-1 text-sm text-zinc-900">
                {renderAdminCell(record, column)}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </div>
  );
}
