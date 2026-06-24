"use client";

import { useRouter } from "next/navigation";
import * as Yup from "yup";
import type { AdminFormProps } from "./types";
import { AdminFormLayout } from "./shared/AdminFormLayout";
import {
  FormActions,
  FormFullWidth,
  FormInput,
  FormQuill,
  FormSection,
  FormToggle,
} from "./shared/FormFields";
import { useAdminCrudForm } from "./shared/useAdminCrudForm";
import { useSlugSync } from "./shared/useSlugSync";
import { activeField, htmlMinLength, requiredString, slugField } from "./shared/validation";

type Values = {
  title: string;
  slug: string;
  content: string;
  isActive: boolean;
};

const initialValues: Values = {
  title: "",
  slug: "",
  content: "",
  isActive: true,
};

const schema = Yup.object({
  title: requiredString("Title", 3, 200),
  slug: slugField("Slug"),
  content: htmlMinLength("Content", 10),
  isActive: activeField,
});

export function CmsPageForm({ module, recordId }: AdminFormProps) {
  const router = useRouter();
  const { formik, loading, loadError, isEdit } = useAdminCrudForm<Values>({
    module,
    recordId,
    initialValues,
    validationSchema: schema,
    mapRecordToValues: (r) => ({
      title: String(r.title ?? ""),
      slug: String(r.slug ?? ""),
      content: String(r.content ?? ""),
      isActive: Boolean(r.isActive ?? true),
    }),
  });
  useSlugSync(formik, "title", "slug", !isEdit);

  return (
    <AdminFormLayout
      title={isEdit ? "Edit CMS Page" : "Add CMS Page"}
      module={module}
      loading={loading}
      loadError={loadError}
      submitError={formik.status as string | undefined}
    >
      <form onSubmit={formik.handleSubmit} className="space-y-8">
        <FormSection title="Page details">
          <FormInput formik={formik} name="title" label="Title" required />
          <FormInput formik={formik} name="slug" label="Slug" required />
          <FormFullWidth>
            <FormQuill formik={formik} name="content" label="Content" required />
          </FormFullWidth>
          <FormFullWidth>
            <FormToggle formik={formik} name="isActive" label="Active Status" />
          </FormFullWidth>
        </FormSection>
        <FormActions
          isEdit={isEdit}
          isSubmitting={formik.isSubmitting}
          entityLabel="Page"
          onCancel={() => router.push(`/admin/${module}`)}
        />
      </form>
    </AdminFormLayout>
  );
}
