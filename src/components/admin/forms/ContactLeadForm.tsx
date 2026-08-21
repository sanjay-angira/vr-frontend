"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useFormik } from "formik";
import * as Yup from "yup";
import type { AdminFormProps } from "./types";
import { AdminFormLayout } from "./shared/AdminFormLayout";
import {
  FormActions,
  FormFullWidth,
  FormSection,
  FormSelect,
} from "./shared/FormFields";
import { API_ENDPOINTS } from "@/services/api/API_ENDPOINT";
import { getData, patchData } from "@/services/api/apiService";

const STATUS_OPTIONS = [
  { label: "New", value: "new" },
  { label: "Contacted", value: "contacted" },
  { label: "Resolved", value: "resolved" },
];

type LeadRecord = {
  firstName?: string;
  lastName?: string;
  email?: string;
  phoneNumber?: string;
  message?: string;
  emailVerified?: boolean;
  status?: string;
};

function unwrap<T>(response: { data?: T } | T): T {
  if (response && typeof response === "object" && "data" in response) {
    return (response as { data?: T }).data as T;
  }
  return response as T;
}

export function ContactLeadForm({ module, recordId }: AdminFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(Boolean(recordId));
  const [loadError, setLoadError] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [lead, setLead] = useState<LeadRecord | null>(null);

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: { status: lead?.status || "new" },
    validationSchema: Yup.object({
      status: Yup.string().oneOf(["new", "contacted", "resolved"]).required(),
    }),
    onSubmit: async (values, helpers) => {
      if (!recordId) return;
      setSubmitError("");
      try {
        await patchData(API_ENDPOINTS.CONTACT_LEADS.STATUS(recordId), {
          status: values.status,
        });
        router.push(`/admin/${module}`);
      } catch (error) {
        setSubmitError(
          error && typeof error === "object" && "message" in error
            ? String((error as { message: string }).message)
            : "Failed to update lead status.",
        );
      } finally {
        helpers.setSubmitting(false);
      }
    },
  });

  useEffect(() => {
    if (!recordId) {
      setLoading(false);
      return;
    }

    let cancelled = false;
    async function load() {
      setLoading(true);
      try {
        const response = await getData(
          API_ENDPOINTS.CONTACT_LEADS.DETAILS(recordId!),
        );
        if (!cancelled) {
          setLead(unwrap<LeadRecord>(response));
        }
      } catch {
        if (!cancelled) setLoadError("Failed to load contact lead.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [recordId]);

  if (!recordId) {
    return (
      <AdminFormLayout
        title="Contact Us Lead"
        module={module}
        description="Leads are submitted from the website contact form. Open a lead from the list to update its status."
      >
        <p className="text-sm text-zinc-600">
          There is no create flow for contact leads in admin.
        </p>
      </AdminFormLayout>
    );
  }

  return (
    <AdminFormLayout
      title="Update lead status"
      module={module}
      loading={loading}
      loadError={loadError}
      submitError={submitError}
    >
      <form onSubmit={formik.handleSubmit} className="space-y-6">
        <FormSection title="Lead details">
          <FormFullWidth>
            <dl className="grid gap-3 text-sm sm:grid-cols-2">
              <div>
                <dt className="text-zinc-500">Name</dt>
                <dd className="font-medium text-zinc-900">
                  {[lead?.firstName, lead?.lastName].filter(Boolean).join(" ") ||
                    "—"}
                </dd>
              </div>
              <div>
                <dt className="text-zinc-500">Email</dt>
                <dd className="font-medium text-zinc-900">{lead?.email || "—"}</dd>
              </div>
              <div>
                <dt className="text-zinc-500">Phone</dt>
                <dd className="font-medium text-zinc-900">
                  {lead?.phoneNumber || "—"}
                </dd>
              </div>
              <div>
                <dt className="text-zinc-500">Email verified</dt>
                <dd className="font-medium text-zinc-900">
                  {lead?.emailVerified ? "Yes" : "No"}
                </dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="text-zinc-500">Message</dt>
                <dd className="mt-1 whitespace-pre-wrap text-zinc-800">
                  {lead?.message || "—"}
                </dd>
              </div>
            </dl>
          </FormFullWidth>
        </FormSection>

        <FormSelect
          formik={formik}
          name="status"
          label="Status"
          required
          options={STATUS_OPTIONS}
        />

        <FormActions
          isEdit
          isSubmitting={formik.isSubmitting}
          entityLabel="status"
          onCancel={() => router.push(`/admin/${module}`)}
        />
      </form>
    </AdminFormLayout>
  );
}
