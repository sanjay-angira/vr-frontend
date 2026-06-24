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
  FormTextarea,
  FormToggle,
} from "./shared/FormFields";
import { useAdminCrudForm } from "./shared/useAdminCrudForm";
import { useSlugSync } from "./shared/useSlugSync";
import { activeField, requiredString, slugField } from "./shared/validation";

type Values = {
  title: string;
  slug: string;
  description: string;
  isActive: boolean;
};

const initialValues: Values = {
  title: "",
  slug: "",
  description: "",
  isActive: true,
};

const schema = Yup.object({
  title: requiredString("Title", 3, 100),
  slug: slugField("Slug"),
  description: requiredString("Description", 3),
  isActive: activeField,
});

export function BlogCategoryForm({ module, recordId }: AdminFormProps) {
  const router = useRouter();
  const { formik, loading, loadError, isEdit } = useAdminCrudForm<Values>({
    module,
    recordId,
    initialValues,
    validationSchema: schema,
    mapRecordToValues: (r) => ({
      title: String(r.title ?? ""),
      slug: String(r.slug ?? ""),
      description: String(r.description ?? ""),
      isActive: Boolean(r.isActive ?? true),
    }),
  });
  useSlugSync(formik, "title", "slug", !isEdit);

  return (
    <AdminFormLayout
      title={isEdit ? "Edit Blog Category" : "Add Blog Category"}
      module={module}
      loading={loading}
      loadError={loadError}
      submitError={formik.status as string | undefined}
    >
      <form onSubmit={formik.handleSubmit} className="space-y-8">
        <FormSection title="Category details">
          <FormInput formik={formik} name="title" label="Title" required />
          <FormInput formik={formik} name="slug" label="Slug" required />
          <FormFullWidth>
            <FormTextarea formik={formik} name="description" label="Description" required rows={5} />
          </FormFullWidth>
          <FormFullWidth>
            <FormToggle formik={formik} name="isActive" label="Active Status" />
          </FormFullWidth>
        </FormSection>
        <FormActions
          isEdit={isEdit}
          isSubmitting={formik.isSubmitting}
          entityLabel="Category"
          onCancel={() => router.push(`/admin/${module}`)}
        />
      </form>
    </AdminFormLayout>
  );
}
