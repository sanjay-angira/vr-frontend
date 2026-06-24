"use client";

import { useRouter } from "next/navigation";
import * as Yup from "yup";
import type { AdminFormProps } from "./types";
import { AdminFormLayout } from "./shared/AdminFormLayout";
import {
  FormActions,
  FormFullWidth,
  FormInput,
  FormSection,
  FormToggle,
} from "./shared/FormFields";
import { useAdminCrudForm } from "./shared/useAdminCrudForm";
import { useSlugSync } from "./shared/useSlugSync";
import { activeField, requiredString, slugField } from "./shared/validation";

type Values = { title: string; slug: string; isActive: boolean };

const initialValues: Values = { title: "", slug: "", isActive: true };
const schema = Yup.object({
  title: requiredString("Title", 3, 100),
  slug: slugField("Slug"),
  isActive: activeField,
});

export function BlogTagForm({ module, recordId }: AdminFormProps) {
  const router = useRouter();
  const { formik, loading, loadError, isEdit } = useAdminCrudForm<Values>({
    module,
    recordId,
    initialValues,
    validationSchema: schema,
    mapRecordToValues: (r) => ({
      title: String(r.title ?? ""),
      slug: String(r.slug ?? ""),
      isActive: Boolean(r.isActive ?? true),
    }),
  });
  useSlugSync(formik, "title", "slug", !isEdit);

  return (
    <AdminFormLayout
      title={isEdit ? "Edit Blog Tag" : "Add Blog Tag"}
      module={module}
      loading={loading}
      loadError={loadError}
      submitError={formik.status as string | undefined}
    >
      <form onSubmit={formik.handleSubmit} className="space-y-8">
        <FormSection title="Tag details">
          <FormInput formik={formik} name="title" label="Title" required />
          <FormInput formik={formik} name="slug" label="Slug" required />
          <FormFullWidth>
            <FormToggle formik={formik} name="isActive" label="Active Status" />
          </FormFullWidth>
        </FormSection>
        <FormActions
          isEdit={isEdit}
          isSubmitting={formik.isSubmitting}
          entityLabel="Tag"
          onCancel={() => router.push(`/admin/${module}`)}
        />
      </form>
    </AdminFormLayout>
  );
}
