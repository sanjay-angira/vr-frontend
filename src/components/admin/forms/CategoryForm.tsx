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
  FormQuill,
  FormTextarea,
  FormToggle,
} from "./shared/FormFields";
import { fetchCategoriesOptions, fetchOffersOptions } from "./shared/fetchOptions";
import { useAdminCrudForm } from "./shared/useAdminCrudForm";
import { useSlugSync } from "./shared/useSlugSync";
import { UPLOAD_PATHS } from "./shared/uploadPaths";
import { activeField, htmlMinLength, requiredString, slugField } from "./shared/validation";

type Values = {
  categoryName: string;
  categorySlug: string;
  shortDescription: string;
  description: string;
  parentId: string;
  offerIds: number[];
  publishStatus: string;
  isActive: boolean;
  showOnHomePage: boolean;
  image: string;
  video: string;
  icon: string;
  imageAltText: string;
  metaTitle: string;
  metaDescription: string;
  metaKeywords: string;
};

const initialValues: Values = {
  categoryName: "",
  categorySlug: "",
  shortDescription: "",
  description: "",
  parentId: "",
  offerIds: [],
  publishStatus: "draft",
  isActive: true,
  showOnHomePage: false,
  image: "",
  video: "",
  icon: "",
  imageAltText: "",
  metaTitle: "",
  metaDescription: "",
  metaKeywords: "",
};

const schema = Yup.object({
  categoryName: requiredString("Category name", 3, 100),
  categorySlug: slugField("Category slug"),
  shortDescription: requiredString("Short description", 3, 500),
  description: htmlMinLength("Description", 3),
  parentId: Yup.string(),
  offerIds: Yup.array().of(Yup.number()),
  publishStatus: Yup.string().oneOf(["draft", "published", "scheduled"]).required(),
  isActive: activeField,
  showOnHomePage: Yup.boolean(),
  image: Yup.string(),
  video: Yup.string(),
  icon: Yup.string(),
  imageAltText: Yup.string(),
  metaTitle: requiredString("Meta title", 3, 70),
  metaDescription: requiredString("Meta description", 3, 320),
  metaKeywords: Yup.string(),
});

export function CategoryForm({ module, recordId }: AdminFormProps) {
  const router = useRouter();
  const [categories, setCategories] = useState<Array<{ label: string; value: string | number }>>([]);
  const [offers, setOffers] = useState<Array<{ label: string; value: string | number }>>([]);

  useEffect(() => {
    fetchCategoriesOptions().then(setCategories);
    fetchOffersOptions().then(setOffers);
  }, []);

  const { formik, loading, loadError, isEdit } = useAdminCrudForm<Values>({
    module,
    recordId,
    initialValues,
    validationSchema: schema,
    mapRecordToValues: (r) => {
      const seo = (r.seo ?? {}) as Record<string, unknown>;
      return {
        categoryName: String(r.categoryName ?? ""),
        categorySlug: String(r.categorySlug ?? ""),
        shortDescription: String(r.shortDescription ?? ""),
        description: String(r.description ?? ""),
        parentId: String(r.parentId ?? (r.parent as { id?: number })?.id ?? ""),
        offerIds: Array.isArray(r.categoryOffers)
          ? (r.categoryOffers as Array<{ id: number }>).map((o) => o.id)
          : Array.isArray(r.offerIds)
            ? (r.offerIds as number[])
            : [],
        publishStatus: String(r.publishStatus ?? "draft"),
        isActive: Boolean(r.isActive ?? true),
        showOnHomePage: Boolean(r.showOnHomePage ?? false),
        image: String(r.image ?? ""),
        video: String(r.video ?? ""),
        icon: String(r.icon ?? ""),
        imageAltText: String(r.imageAltText ?? ""),
        metaTitle: String(seo.metaTitle ?? r.metaTitle ?? ""),
        metaDescription: String(seo.metaDescription ?? r.metaDescription ?? ""),
        metaKeywords: String(seo.metaKeywords ?? r.metaKeywords ?? ""),
      };
    },
    mapValuesToPayload: (v) => ({
      categoryName: v.categoryName,
      categorySlug: v.categorySlug,
      shortDescription: v.shortDescription,
      description: v.description,
      parentId: v.parentId ? Number(v.parentId) : null,
      offerIds: v.offerIds,
      publishStatus: v.publishStatus,
      isActive: v.isActive,
      showOnHomePage: v.showOnHomePage,
      image: v.image || null,
      video: v.video || null,
      icon: v.icon || null,
      imageAltText: v.imageAltText || null,
      seo: {
        metaTitle: v.metaTitle,
        metaDescription: v.metaDescription,
        metaKeywords: v.metaKeywords,
      },
    }),
  });

  useSlugSync(formik, "categoryName", "categorySlug", !isEdit);

  return (
    <AdminFormLayout
      title={isEdit ? "Edit Category" : "Add Category"}
      module={module}
      loading={loading}
      loadError={loadError}
      submitError={formik.status as string | undefined}
    >
      <form onSubmit={formik.handleSubmit} className="space-y-8">
        <FormSection title="Category details">
          <FormInput formik={formik} name="categoryName" label="Category Name" required />
          <FormInput formik={formik} name="categorySlug" label="Category Slug" required />
          <FormFullWidth>
            <FormInput formik={formik} name="shortDescription" label="Short Description" required />
          </FormFullWidth>
          <FormFullWidth>
            <FormQuill formik={formik} name="description" label="Description" required minHeight={240} placeholder="Category description..." />
          </FormFullWidth>
          <FormSelect formik={formik} name="parentId" label="Parent Category" options={categories} placeholder="None" />
          <FormSelect
            formik={formik}
            name="publishStatus"
            label="Publish Status"
            required
            options={[
              { label: "Draft", value: "draft" },
              { label: "Published", value: "published" },
              { label: "Scheduled", value: "scheduled" },
            ]}
          />
          <FormFullWidth>
            <FormMultiSelect formik={formik} name="offerIds" label="Offers" options={offers} />
          </FormFullWidth>
        </FormSection>

        <FormSection title="Media">
          <FormImageUpload
            formik={formik}
            name="image"
            label="Image"
            uploadPath={UPLOAD_PATHS.categories.image}
            imageType="category"
          />
          <FormImageUpload formik={formik} name="video" label="Video" uploadPath={UPLOAD_PATHS.categories.video} mediaType="video" />
          <FormImageUpload formik={formik} name="icon" label="Icon" uploadPath={UPLOAD_PATHS.categories.icon} />
          <FormInput formik={formik} name="imageAltText" label="Image Alt Text" />
        </FormSection>

        <FormSection title="SEO">
          <FormInput formik={formik} name="metaTitle" label="Meta Title" required />
          <FormFullWidth>
            <FormTextarea formik={formik} name="metaDescription" label="Meta Description" required rows={3} />
          </FormFullWidth>
          <FormInput formik={formik} name="metaKeywords" label="Meta Keywords" />
        </FormSection>

        <FormSection title="Visibility">
          <FormToggle formik={formik} name="isActive" label="Active" />
          <FormCheckbox formik={formik} name="showOnHomePage" label="Show on home page" />
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
