"use client";

import { useEffect, useState } from "react";
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
  FormSelect,
  FormToggle,
} from "./shared/FormFields";
import { fetchProductsOptions } from "./shared/fetchOptions";
import { useAdminCrudForm } from "./shared/useAdminCrudForm";
import { activeField, htmlMinLength, requiredString } from "./shared/validation";

type Values = {
  question: string;
  answer: string;
  productId: string;
  isActive: boolean;
};

const initialValues: Values = {
  question: "",
  answer: "",
  productId: "",
  isActive: true,
};

const schema = Yup.object({
  question: requiredString("Question", 5),
  answer: htmlMinLength("Answer", 10),
  productId: Yup.string().required("Product is required"),
  isActive: activeField,
});

export function ProductFaqForm({ module, recordId }: AdminFormProps) {
  const router = useRouter();
  const [products, setProducts] = useState<Array<{ label: string; value: string | number }>>([]);

  useEffect(() => {
    fetchProductsOptions().then(setProducts);
  }, []);

  const { formik, loading, loadError, isEdit } = useAdminCrudForm<Values>({
    module,
    recordId,
    initialValues,
    validationSchema: schema,
    mapRecordToValues: (r) => ({
      question: String(r.question ?? ""),
      answer: String(r.answer ?? ""),
      productId: String(r.productId ?? (r.product as { id?: number })?.id ?? ""),
      isActive: Boolean(r.isActive ?? true),
    }),
    mapValuesToPayload: (v) => ({
      ...v,
      productId: Number(v.productId),
    }),
  });

  return (
    <AdminFormLayout
      title={isEdit ? "Edit Product FAQ" : "Add Product FAQ"}
      module={module}
      loading={loading}
      loadError={loadError}
      submitError={formik.status as string | undefined}
    >
      <form onSubmit={formik.handleSubmit} className="space-y-8">
        <FormSection title="FAQ details">
          <FormFullWidth>
            <FormInput formik={formik} name="question" label="Question" required />
          </FormFullWidth>
          <FormFullWidth>
            <FormQuill formik={formik} name="answer" label="Answer" required minHeight={200} placeholder="FAQ answer..." />
          </FormFullWidth>
          <FormSelect formik={formik} name="productId" label="Product" required options={products} />
          <FormFullWidth>
            <FormToggle formik={formik} name="isActive" label="Active Status" />
          </FormFullWidth>
        </FormSection>
        <FormActions
          isEdit={isEdit}
          isSubmitting={formik.isSubmitting}
          entityLabel="FAQ"
          onCancel={() => router.push(`/admin/${module}`)}
        />
      </form>
    </AdminFormLayout>
  );
}
