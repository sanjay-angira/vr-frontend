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
  FormImageUpload,
  FormInput,
  FormMultiSelect,
  FormSection,
  FormSelect,
  FormToggle,
} from "./shared/FormFields";
import { getData } from "@/services/api/apiService";
import { useAdminCrudForm } from "./shared/useAdminCrudForm";
import { useSlugSync } from "./shared/useSlugSync";
import { UPLOAD_PATHS } from "./shared/uploadPaths";
import { activeField, requiredString, slugField } from "./shared/validation";

type Values = {
  couponCode: string;
  couponSlug: string;
  image: string;
  discountType: string;
  discountValue: number | "";
  startDate: string;
  endDate: string;
  isActive: boolean;
  isUserSpecific: boolean;
  userIds: number[];
};

const initialValues: Values = {
  couponCode: "",
  couponSlug: "",
  image: "",
  discountType: "percentage",
  discountValue: "",
  startDate: "",
  endDate: "",
  isActive: true,
  isUserSpecific: false,
  userIds: [],
};

const schema = Yup.object({
  couponCode: requiredString("Coupon code", 2, 50),
  couponSlug: slugField("Coupon slug"),
  image: Yup.string(),
  discountType: Yup.string().oneOf(["percentage", "fixed"]).required(),
  discountValue: Yup.number().min(0).required("Discount value is required"),
  startDate: Yup.string().required("Start date is required"),
  endDate: Yup.string().required("End date is required"),
  isActive: activeField,
  isUserSpecific: Yup.boolean(),
  userIds: Yup.array().of(Yup.number()),
});

async function fetchUsersForSelect() {
  try {
    const res = await getData("users", { pageNumber: 1, pageSize: 1000, column: "firstName", order: "ASC" });
    const rows = res.data?.rows ?? [];
    return rows.map((u: Record<string, unknown>) => ({
      label: `${u.firstName ?? ""} ${u.lastName ?? ""}`.trim() || String(u.email),
      value: Number(u.id),
    }));
  } catch {
    return [];
  }
}

export function CouponForm({ module, recordId }: AdminFormProps) {
  const router = useRouter();
  const [users, setUsers] = useState<Array<{ label: string; value: string | number }>>([]);

  const { formik, loading, loadError, isEdit } = useAdminCrudForm<Values>({
    module,
    recordId,
    initialValues,
    validationSchema: schema,
    mapRecordToValues: (r) => {
      const userIds = Array.isArray(r.users)
        ? (r.users as Array<{ id: number }>).map((u) => u.id)
        : [];

      return {
        couponCode: String(r.couponCode ?? ""),
        couponSlug: String(r.couponSlug ?? ""),
        image: String(r.image ?? ""),
        discountType: String(r.discountType ?? "percentage"),
        discountValue: Number(r.discountValue ?? 0),
        startDate: r.startDate ? String(r.startDate).slice(0, 10) : "",
        endDate: r.endDate ? String(r.endDate).slice(0, 10) : "",
        isActive: Boolean(r.isActive ?? true),
        isUserSpecific: Boolean(r.isUserSpecific ?? userIds.length > 0),
        userIds,
      };
    },
    mapValuesToPayload: (v) => ({
      couponCode: v.couponCode.trim(),
      couponSlug: v.couponSlug.trim(),
      image: v.image || null,
      discountType: v.discountType,
      discountValue: Number(v.discountValue),
      startDate: v.startDate,
      endDate: v.endDate,
      isActive: v.isActive,
      isUserSpecific: v.isUserSpecific,
      ...(v.isUserSpecific ? { userIds: v.userIds } : {}),
    }),
  });

  useSlugSync(formik, "couponCode", "couponSlug", !isEdit);

  useEffect(() => {
    if (formik.values.isUserSpecific) {
      fetchUsersForSelect().then(setUsers);
    }
  }, [formik.values.isUserSpecific]);

  return (
    <AdminFormLayout
      title={isEdit ? "Edit Coupon" : "Add Coupon"}
      module={module}
      loading={loading}
      loadError={loadError}
      submitError={formik.status as string | undefined}
    >
      <form onSubmit={formik.handleSubmit} className="space-y-8">
        <FormSection title="Coupon details">
          <FormInput formik={formik} name="couponCode" label="Coupon Code" required />
          <FormInput formik={formik} name="couponSlug" label="Coupon Slug" required />
          <FormSelect
            formik={formik}
            name="discountType"
            label="Discount Type"
            required
            options={[
              { label: "Percentage", value: "percentage" },
              { label: "Fixed Amount", value: "fixed" },
            ]}
          />
          <FormInput formik={formik} name="discountValue" label="Discount Value" type="number" required />
          <FormImageUpload formik={formik} name="image" label="Image" uploadPath={UPLOAD_PATHS.coupons} />
          <FormInput formik={formik} name="startDate" label="Start Date" type="date" required />
          <FormInput formik={formik} name="endDate" label="End Date" type="date" required />
          <FormCheckbox formik={formik} name="isUserSpecific" label="User Specific Coupon" />
          {formik.values.isUserSpecific && (
            <FormFullWidth>
              <FormMultiSelect formik={formik} name="userIds" label="Users" options={users} />
            </FormFullWidth>
          )}
          <FormFullWidth>
            <FormToggle formik={formik} name="isActive" label="Active Status" />
          </FormFullWidth>
        </FormSection>
        <FormActions
          isEdit={isEdit}
          isSubmitting={formik.isSubmitting}
          entityLabel="Coupon"
          onCancel={() => router.push(`/admin/${module}`)}
        />
      </form>
    </AdminFormLayout>
  );
}
