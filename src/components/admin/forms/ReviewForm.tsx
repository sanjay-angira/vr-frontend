"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import * as Yup from "yup";
import type { AdminFormProps } from "./types";
import { AdminFormLayout } from "./shared/AdminFormLayout";
import {
  FormActions,
  FormCheckbox,
  FormFullWidth,
  FormInput,
  FormQuill,
  FormSection,
  FormSelect,
  FormToggle,
} from "./shared/FormFields";
import { getData } from "@/services/api/apiService";
import { fetchProductsOptions } from "./shared/fetchOptions";
import { useAdminCrudForm } from "./shared/useAdminCrudForm";
import { activeField, htmlMinLength } from "./shared/validation";

type Values = {
  rating: number;
  comment: string;
  productId: string;
  isManual: boolean;
  userName: string;
  userId: string;
  isApproved: boolean;
};

const initialValues: Values = {
  rating: 5,
  comment: "",
  productId: "",
  isManual: false,
  userName: "",
  userId: "",
  isApproved: true,
};

const schema = Yup.object({
  rating: Yup.number().min(1).max(5).required(),
  comment: htmlMinLength("Comment", 5),
  productId: Yup.string().required("Product is required"),
  isManual: Yup.boolean(),
  userName: Yup.string().when("isManual", {
    is: true,
    then: (s) => s.required("User name is required").min(2),
    otherwise: (s) => s,
  }),
  userId: Yup.string().when("isManual", {
    is: false,
    then: (s) => s.required("User is required"),
    otherwise: (s) => s,
  }),
  isApproved: activeField,
});

async function fetchUsersForSelect() {
  try {
    const res = await getData("users", { pageNumber: 1, pageSize: 1000, column: "firstName", order: "ASC" });
    const rows = res.data?.rows ?? [];
    return rows.map((u: Record<string, unknown>) => ({
      label: `${u.firstName ?? ""} ${u.lastName ?? ""} (${u.email ?? ""})`.trim(),
      value: Number(u.id),
    }));
  } catch {
    return [];
  }
}

export function ReviewForm({ module, recordId }: AdminFormProps) {
  const router = useRouter();
  const [products, setProducts] = useState<Array<{ label: string; value: string | number }>>([]);
  const [users, setUsers] = useState<Array<{ label: string; value: string | number }>>([]);

  useEffect(() => {
    fetchProductsOptions().then(setProducts);
  }, []);

  const { formik, loading, loadError, isEdit } = useAdminCrudForm<Values>({
    module,
    recordId,
    initialValues,
    validationSchema: schema,
    mapRecordToValues: (r) => {
      const isManual = Boolean(r.isManual ?? (r.userName && !r.userId));
      return {
        rating: Number(r.rating ?? 5),
        comment: String(r.comment ?? ""),
        productId: String(r.productId ?? (r.product as { id?: number })?.id ?? ""),
        isManual,
        userName: String(r.userName ?? ""),
        userId: String((r.user as { id?: number })?.id ?? r.userId ?? ""),
        isApproved: Boolean(r.isApproved ?? true),
      };
    },
    mapValuesToPayload: (v) => ({
      rating: v.rating,
      comment: v.comment,
      productId: Number(v.productId),
      isApproved: v.isApproved,
      isManual: v.isManual,
      userName: v.isManual ? v.userName : null,
      userId: v.isManual ? null : Number(v.userId),
    }),
  });

  useEffect(() => {
    if (!formik.values.isManual) {
      fetchUsersForSelect().then(setUsers);
    }
  }, [formik.values.isManual]);

  return (
    <AdminFormLayout
      title={isEdit ? "Edit Review" : "Add Review"}
      module={module}
      loading={loading}
      loadError={loadError}
      submitError={formik.status as string | undefined}
    >
      <form onSubmit={formik.handleSubmit} className="space-y-8">
        <FormSection title="Review details">
          <FormSelect
            formik={formik}
            name="rating"
            label="Rating"
            required
            options={[1, 2, 3, 4, 5].map((n) => ({ label: `${n} Star${n > 1 ? "s" : ""}`, value: n }))}
          />
          <FormSelect formik={formik} name="productId" label="Product" required options={products} />
          <FormFullWidth>
            <FormQuill formik={formik} name="comment" label="Comment" required minHeight={180} placeholder="Review comment..." />
          </FormFullWidth>
          <FormFullWidth>
            <FormCheckbox formik={formik} name="isManual" label="Manual user entry" />
          </FormFullWidth>
          {formik.values.isManual ? (
            <FormInput formik={formik} name="userName" label="User Name" required />
          ) : (
            <FormSelect formik={formik} name="userId" label="User" required options={users} />
          )}
          <FormFullWidth>
            <FormToggle formik={formik} name="isApproved" label="Approved" />
          </FormFullWidth>
        </FormSection>
        <FormActions
          isEdit={isEdit}
          isSubmitting={formik.isSubmitting}
          entityLabel="Review"
          onCancel={() => router.push(`/admin/${module}`)}
        />
      </form>
    </AdminFormLayout>
  );
}
