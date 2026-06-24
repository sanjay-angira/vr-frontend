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
  FormMultiSelect,
  FormSection,
  FormSelect,
  FormToggle,
} from "./shared/FormFields";
import { getData } from "@/services/api/apiService";
import { useAdminCrudForm } from "./shared/useAdminCrudForm";
import { activeField, requiredString } from "./shared/validation";

type Values = {
  couponCode: string;
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
      const start = r.startDate ?? r.start_date;
      const end = r.endDate ?? r.end_date;

      return {
        couponCode: String(r.couponCode ?? ""),
        discountType: String(r.discountType ?? r.discount_type ?? "percentage"),
        discountValue: Number(r.discountValue ?? r.discount_value ?? 0),
        startDate: start ? String(start).slice(0, 10) : "",
        endDate: end ? String(end).slice(0, 10) : "",
        isActive: Boolean(r.isActive ?? r.is_active ?? true),
        isUserSpecific: Boolean(r.isUserSpecific ?? userIds.length > 0),
        userIds,
      };
    },
    mapValuesToPayload: (v) => ({
      couponCode: v.couponCode.trim(),
      discountType: v.discountType,
      discount_type: v.discountType,
      discountValue: Number(v.discountValue),
      discount_value: Number(v.discountValue),
      startDate: v.startDate,
      start_date: v.startDate,
      endDate: v.endDate,
      end_date: v.endDate,
      isActive: v.isActive,
      is_active: v.isActive,
      isUserSpecific: v.isUserSpecific,
      ...(v.isUserSpecific ? { userIds: v.userIds, user_ids: v.userIds } : {}),
    }),
  });

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
          <FormInput formik={formik} name="startDate" label="Start Date" type="date" required />
          <FormInput formik={formik} name="endDate" label="End Date" type="date" required />
          <FormToggle formik={formik} name="isActive" label="Active Status" />
          <FormFullWidth>
            <FormCheckbox formik={formik} name="isUserSpecific" label="User Specific Coupon" />
          </FormFullWidth>
          {formik.values.isUserSpecific && (
            <FormFullWidth>
              <FormMultiSelect formik={formik} name="userIds" label="Users" options={users} />
            </FormFullWidth>
          )}
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
