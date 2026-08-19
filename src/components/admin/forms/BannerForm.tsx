"use client";

import { useRouter } from "next/navigation";
import * as Yup from "yup";
import type { AdminFormProps } from "./types";
import { AdminFormLayout } from "./shared/AdminFormLayout";
import {
  FormActions,
  FormFullWidth,
  FormImageUpload,
  FormInput,
  FormSection,
  FormToggle,
} from "./shared/FormFields";
import { UPLOAD_PATHS } from "./shared/uploadPaths";
import { useAdminCrudForm } from "./shared/useAdminCrudForm";
import { activeField, requiredString } from "./shared/validation";

type Values = {
  title: string;
  subtitle: string;
  image: string;
  mobileImage: string;
  bannerLink: string;
  position: number;
  status: boolean;
  sectionId: number;
};

const initialValues: Values = {
  title: "",
  subtitle: "",
  image: "",
  mobileImage: "",
  bannerLink: "",
  position: 1,
  status: true,
  sectionId: 1,
};

const schema = Yup.object({
  title: requiredString("Title", 2, 100),
  subtitle: requiredString("Subtitle", 2, 200),
  image: requiredString("Desktop image", 1),
  mobileImage: requiredString("Mobile image", 1),
  bannerLink: requiredString("Banner link", 1),
  position: Yup.number().min(1).required("Position is required"),
  status: activeField,
  sectionId: Yup.number().required("Section is required"),
});

export function BannerForm({ module, recordId }: AdminFormProps) {
  const router = useRouter();
  const { formik, loading, loadError, isEdit } = useAdminCrudForm<Values>({
    module,
    recordId,
    initialValues,
    validationSchema: schema,
    mapRecordToValues: (r) => ({
      title: String(r.title ?? ""),
      subtitle: String(r.subtitle ?? ""),
      image: String(r.image ?? ""),
      mobileImage: String(r.mobileImage ?? ""),
      bannerLink: String(r.bannerLink ?? r.buttonLink ?? ""),
      position: Number(r.position ?? 1),
      status: Boolean(r.status ?? true),
      sectionId: Number(r.sectionId ?? 1),
    }),
    mapValuesToPayload: (v) => ({
      title: v.title,
      subtitle: v.subtitle,
      image: v.image,
      mobileImage: v.mobileImage,
      bannerLink: v.bannerLink,
      position: v.position,
      status: v.status,
      sectionId: v.sectionId,
    }),
  });

  return (
    <AdminFormLayout
      title={isEdit ? "Edit Banner" : "Add Banner"}
      module={module}
      loading={loading}
      loadError={loadError}
      submitError={formik.status as string | undefined}
    >
      <form onSubmit={formik.handleSubmit} className="space-y-8">
        <FormSection title="Banner details">
          <FormInput formik={formik} name="title" label="Title" required />
          <FormInput formik={formik} name="subtitle" label="Subtitle" required />
          <FormImageUpload
            formik={formik}
            name="image"
            label="Desktop Image"
            required
            uploadPath={UPLOAD_PATHS.banners}
            imageType="banner"
          />
          <FormImageUpload
            formik={formik}
            name="mobileImage"
            label="Mobile Image"
            required
            uploadPath={UPLOAD_PATHS.banners}
            imageType="banner_mobile"
          />
          <FormInput formik={formik} name="bannerLink" label="Banner Link" required />
          <FormInput formik={formik} name="position" label="Position" type="number" required />
          <FormInput formik={formik} name="sectionId" label="Section ID" type="number" required />
          <FormFullWidth>
            <FormToggle formik={formik} name="status" label="Active Status" />
          </FormFullWidth>
        </FormSection>
        <FormActions
          isEdit={isEdit}
          isSubmitting={formik.isSubmitting}
          entityLabel="Banner"
          onCancel={() => router.push(`/admin/${module}`)}
        />
      </form>
    </AdminFormLayout>
  );
}
