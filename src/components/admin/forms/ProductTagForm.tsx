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

type ProductTagValues = {
  tagName: string;
  tagSlug: string;
  isActive: boolean;
};

const initialValues: ProductTagValues = {
  tagName: "",
  tagSlug: "",
  isActive: true,
};

const schema = Yup.object({
  tagName: requiredString("Tag name", 3, 100),
  tagSlug: slugField("Tag slug"),
  isActive: activeField,
});

export function ProductTagForm({ module, recordId }: AdminFormProps) {
  const router = useRouter();
  const { formik, loading, loadError, isEdit } = useAdminCrudForm<ProductTagValues>({
    module,
    recordId,
    initialValues,
    validationSchema: schema,
    mapRecordToValues: (record) => ({
      tagName: String(record.tagName ?? ""),
      tagSlug: String(record.tagSlug ?? ""),
      isActive: Boolean(record.isActive ?? true),
    }),
  });

  useSlugSync(formik, "tagName", "tagSlug", !isEdit);

  return (
    <AdminFormLayout
      title={isEdit ? "Edit Product Tag" : "Add Product Tag"}
      module={module}
      loading={loading}
      loadError={loadError}
      submitError={formik.status as string | undefined}
    >
      <form onSubmit={formik.handleSubmit} className="space-y-8">
        <FormSection title="Tag details">
          <FormInput formik={formik} name="tagName" label="Tag Name" required />
          <FormInput formik={formik} name="tagSlug" label="Tag Slug" required />
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
