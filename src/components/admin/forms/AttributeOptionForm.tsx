"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import * as Yup from "yup";
import type { AdminFormProps } from "./types";
import { AdminFormLayout } from "./shared/AdminFormLayout";
import {
  FormActions,
  FormImageUpload,
  FormInput,
  FormSection,
  FormSelect,
} from "./shared/FormFields";
import { fetchAttributesOptions } from "./shared/fetchOptions";
import { UPLOAD_PATHS } from "./shared/uploadPaths";
import { useAdminCrudForm } from "./shared/useAdminCrudForm";
import { hexColor, requiredString } from "./shared/validation";

type Values = {
  value: string;
  code: string;
  image: string;
  attributeId: string;
};

const initialValues: Values = {
  value: "",
  code: "#000000",
  image: "",
  attributeId: "",
};

const schema = Yup.object({
  value: requiredString("Value", 1, 255),
  code: hexColor,
  image: Yup.string().max(255),
  attributeId: Yup.string().required("Attribute is required"),
});

export function AttributeOptionForm({ module, recordId }: AdminFormProps) {
  const router = useRouter();
  const [attributes, setAttributes] = useState<Array<{ label: string; value: string | number }>>([]);

  useEffect(() => {
    fetchAttributesOptions("select").then(setAttributes);
  }, []);

  const { formik, loading, loadError, isEdit } = useAdminCrudForm<Values>({
    module,
    recordId,
    initialValues,
    validationSchema: schema,
    mapRecordToValues: (r) => ({
      value: String(r.value ?? ""),
      code: String(r.code ?? "#000000"),
      image: String(r.image ?? ""),
      attributeId: String(
        (r.attribute as { id?: number })?.id ?? r.attributeId ?? ""
      ),
    }),
    mapValuesToPayload: (v) => ({
      value: v.value.trim(),
      code: v.code || null,
      image: v.image.trim() || null,
      attributeId: Number(v.attributeId),
    }),
  });

  return (
    <AdminFormLayout
      title={isEdit ? "Edit Attribute Option" : "Add Attribute Option"}
      module={module}
      loading={loading}
      loadError={loadError}
      submitError={formik.status as string | undefined}
    >
      <form onSubmit={formik.handleSubmit} className="space-y-8">
        <FormSection title="Option details">
          <FormSelect formik={formik} name="attributeId" label="Attribute" required options={attributes} />
          <FormInput formik={formik} name="value" label="Value" required />
          <FormInput formik={formik} name="code" label="Color Code" type="color" />
          <FormImageUpload formik={formik} name="image" label="Image" uploadPath={UPLOAD_PATHS.attributeOptions} />
        </FormSection>
        <FormActions
          isEdit={isEdit}
          isSubmitting={formik.isSubmitting}
          entityLabel="Option"
          onCancel={() => router.push(`/admin/${module}`)}
        />
      </form>
    </AdminFormLayout>
  );
}
