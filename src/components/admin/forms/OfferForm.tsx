"use client";

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
  FormSection,
  FormSelect,
  FormToggle,
} from "./shared/FormFields";
import { useAdminCrudForm } from "./shared/useAdminCrudForm";
import { useSlugSync } from "./shared/useSlugSync";
import { UPLOAD_PATHS } from "./shared/uploadPaths";
import { activeField, requiredString, slugField } from "./shared/validation";

type Values = {
  offerName: string;
  offerSlug: string;
  image: string;
  discountType: string;
  discountValue: number | "";
  startDateTime: string;
  endDateTime: string;
  timeBased: boolean;
  isActive: boolean;
};

const initialValues: Values = {
  offerName: "",
  offerSlug: "",
  image: "",
  discountType: "percentage",
  discountValue: "",
  startDateTime: "",
  endDateTime: "",
  timeBased: false,
  isActive: true,
};

const schema = Yup.object({
  offerName: requiredString("Offer name", 2, 250),
  offerSlug: slugField("Offer slug"),
  image: Yup.string(),
  discountType: Yup.string()
    .oneOf(["percentage", "fixed"])
    .required("Discount type is required"),
  discountValue: Yup.number().min(0).required("Discount value is required"),
  startDateTime: Yup.string(),
  endDateTime: Yup.string(),
  timeBased: Yup.boolean(),
  isActive: activeField,
});

export function OfferForm({ module, recordId }: AdminFormProps) {
  const router = useRouter();
  const { formik, loading, loadError, isEdit } = useAdminCrudForm<Values>({
    module,
    recordId,
    initialValues,
    validationSchema: schema,
    mapRecordToValues: (r) => ({
      offerName: String(r.offerName ?? ""),
      offerSlug: String(r.offerSlug ?? ""),
      image: String(r.image ?? ""),
      discountType: String(r.discountType ?? r.type ?? "percentage"),
      discountValue: Number(r.discountValue ?? 0),
      startDateTime: r.startDate ? String(r.startDate).slice(0, 16) : "",
      endDateTime: r.endDate ? String(r.endDate).slice(0, 16) : "",
      timeBased: Boolean(r.timeBased ?? false),
      isActive: Boolean(r.isActive ?? true),
    }),
    mapValuesToPayload: (v) => ({
      offerName: v.offerName,
      offerSlug: v.offerSlug,
      image: v.image || null,
      discountType: v.discountType,
      discountValue: Number(v.discountValue),
      timeBased: v.timeBased,
      isActive: v.isActive,
      ...(v.timeBased
        ? {
          startDate: v.startDateTime ? new Date(v.startDateTime).toISOString() : null,
          endDate: v.endDateTime ? new Date(v.endDateTime).toISOString() : null,
        }
        : {}),
    }),
  });

  useSlugSync(formik, "offerName", "offerSlug", !isEdit);

  return (
    <AdminFormLayout
      title={isEdit ? "Edit Offer" : "Add Offer"}
      module={module}
      loading={loading}
      loadError={loadError}
      submitError={formik.status as string | undefined}
    >
      <form onSubmit={formik.handleSubmit} className="space-y-8">
        <FormSection title="Offer details">
          <FormInput formik={formik} name="offerName" label="Offer Name" required />
          <FormInput formik={formik} name="offerSlug" label="Offer Slug" required />
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
          <FormImageUpload formik={formik} name="image" label="Image" uploadPath={UPLOAD_PATHS.offers} />
          <FormCheckbox formik={formik} name="timeBased" label="Time Based Offer" />
          {formik.values.timeBased && (
            <>
              <FormInput formik={formik} name="startDateTime" label="Start Date" type="datetime-local" />
              <FormInput formik={formik} name="endDateTime" label="End Date" type="datetime-local" />
            </>
          )}
          <FormFullWidth>
            <FormToggle formik={formik} name="isActive" label="Active Status" />
          </FormFullWidth>
        </FormSection>
        <FormActions
          isEdit={isEdit}
          isSubmitting={formik.isSubmitting}
          entityLabel="Offer"
          onCancel={() => router.push(`/admin/${module}`)}
        />
      </form>
    </AdminFormLayout>
  );
}
