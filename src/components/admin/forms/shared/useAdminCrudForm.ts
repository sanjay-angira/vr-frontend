"use client";

import { useFormik } from "formik";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import type { AnySchema } from "yup";
import {
  getAdminModuleApiPath,
  type AdminModuleKey,
} from "@/components/admin/commonTable/adminModuleTable.config";
import { getData, postData, putData } from "@/services/api/apiService";

type UseAdminCrudFormOptions<T extends Record<string, unknown>> = {
  module: AdminModuleKey | string;
  recordId?: string;
  initialValues: T;
  validationSchema: AnySchema;
  mapRecordToValues?: (record: Record<string, unknown>) => T;
  mapValuesToPayload?: (values: T) => unknown;
  redirectPath?: string;
};


function getErrorMessage(error: unknown): string {
  if (error && typeof error === "object" && "message" in error) {
    return String((error as { message: string }).message);
  }
  return "Something went wrong. Please try again.";
}

export function useAdminCrudForm<T extends Record<string, unknown>>({
  module,
  recordId,
  initialValues,
  validationSchema,
  mapRecordToValues,
  mapValuesToPayload,
  redirectPath,
}: UseAdminCrudFormOptions<T>) {
  const router = useRouter();
  const apiPath = getAdminModuleApiPath(module as AdminModuleKey);
  const isEdit = Boolean(recordId);
  const [loadedValues, setLoadedValues] = useState<T>(initialValues);
  const [loading, setLoading] = useState(isEdit);
  const [formReady, setFormReady] = useState(!isEdit);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    if (!recordId) {
      setLoadedValues(initialValues);
      setLoading(false);
      setFormReady(true);
      return;
    }

    let cancelled = false;
    setFormReady(false);

    async function fetchRecord() {
      setLoading(true);
      setLoadError("");

      try {
        const response = await getData(`${apiPath}/${recordId}`);
        const data = response?.data;
        const record =
          data && typeof data === "object" && !Array.isArray(data)
            ? (data as Record<string, unknown>)
            : ((response ?? {}) as Record<string, unknown>);

        if (!cancelled) {
          setLoadedValues(
            mapRecordToValues?.(record) ?? ({ ...initialValues, ...record } as T)
          );
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [apiPath, recordId]);

  const formik = useFormik<T>({
    initialValues: loadedValues,
    enableReinitialize: true,
    validationSchema,
    onSubmit: async (values, helpers) => {
      try {
        const payload = mapValuesToPayload?.(values) ?? values;
        const response = isEdit
          ? await putData(`${apiPath}/${recordId}`, payload)
          : await postData(apiPath, payload);

        if (response?.success === false) {
          helpers.setStatus(response.message || "Save failed.");
          return;
        }

        router.push(redirectPath ?? `/admin/${module}`);
      } catch (error) {
        helpers.setStatus(getErrorMessage(error));
      } finally {
        helpers.setSubmitting(false);
      }
    },
  });

  useEffect(() => {
    if (!recordId) {
      setFormReady(true);
      return;
    }

    if (loading) {
      setFormReady(false);
      return;
    }

    formik.resetForm({ values: loadedValues });
    setFormReady(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [recordId, loading, loadedValues]);

  return {
    formik,
    loading: loading || !formReady,
    loadError,
    isEdit,
    apiPath,
  };
}
