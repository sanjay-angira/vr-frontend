"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import * as Yup from "yup";
import type { AdminFormProps } from "./types";
import { AdminFormLayout } from "./shared/AdminFormLayout";
import {
  FormActions,
  FormFullWidth,
  FormGrid,
  FormInput,
  FormMultiSelect,
  FormSection,
  FormTextarea,
  FormToggle,
} from "./shared/FormFields";
import { fetchCategoriesOptions, fetchOffersOptions } from "./shared/fetchOptions";
import { useAdminCrudForm } from "./shared/useAdminCrudForm";
import { useSlugSync } from "./shared/useSlugSync";
import {
  activeField,
  optionalUrl,
  requiredString,
  slugField,
} from "./shared/validation";

type Values = {
  brandName: string;
  brandSlug: string;
  shortDescription: string;
  description: string;
  website: string;
  categoryIds: number[];
  offerIds: number[];
  metaTitle: string;
  metaDescription: string;
  metaKeywords: string;
  isActive: boolean;
};

const initialValues: Values = {
  brandName: "",
  brandSlug: "",
  shortDescription: "",
  description: "",
  website: "",
  categoryIds: [],
  offerIds: [],
  metaTitle: "",
  metaDescription: "",
  metaKeywords: "",
  isActive: true,
};

const schema = Yup.object({
  brandName: requiredString("Brand name", 5),
  brandSlug: slugField("Brand slug"),
  shortDescription: requiredString("Short description", 5),
  description: requiredString("Description", 5),
  website: optionalUrl,
  categoryIds: Yup.array().of(Yup.number()),
  offerIds: Yup.array().of(Yup.number()),
  metaTitle: requiredString("Meta title", 5),
  metaDescription: requiredString("Meta description", 5),
  metaKeywords: Yup.string(),
  isActive: activeField,
});

export function BrandForm({ module, recordId }: AdminFormProps) {
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
      const rawOffers = (r.brandOffers ?? r.offers ?? []) as Array<{ id?: number }>;
      const categoryIds = Array.isArray(r.categories)
        ? (r.categories as Array<{ id: number }>).map((c) => c.id)
        : [];

      return {
        brandName: String(r.brandName ?? ""),
        brandSlug: String(r.brandSlug ?? ""),
        shortDescription: String(r.shortDescription ?? ""),
        description: String(r.description ?? ""),
        website: String(r.website ?? ""),
        categoryIds,
        offerIds: rawOffers.map((o) => o.id).filter(Boolean) as number[],
        metaTitle: String(r.metaTitle ?? ""),
        metaDescription: String(r.metaDescription ?? ""),
        metaKeywords: String(r.metaKeywords ?? ""),
        isActive: Boolean(r.isActive ?? true),
      };
    },
    mapValuesToPayload: (v) => ({
      ...v,
      website: v.website || undefined,
    }),
  });

  useSlugSync(formik, "brandName", "brandSlug", !isEdit);

  return (
    <AdminFormLayout
      title={isEdit ? "Edit Brand" : "Add Brand"}
      module={module}
      loading={loading}
      loadError={loadError}
      submitError={formik.status as string | undefined}
    >
      <form onSubmit={formik.handleSubmit} className="space-y-8">
        <FormSection title="Brand details">
          <FormInput formik={formik} name="brandName" label="Brand Name" required />
          <FormInput formik={formik} name="brandSlug" label="Brand Slug" required />
          <FormFullWidth>
            <FormInput formik={formik} name="shortDescription" label="Short Description" required />
          </FormFullWidth>
          <FormFullWidth>
            <FormTextarea formik={formik} name="description" label="Description" required rows={6} />
          </FormFullWidth>
          <FormInput formik={formik} name="website" label="Website" type="url" />
          <FormMultiSelect formik={formik} name="offerIds" label="Offers" options={offers} />
          <FormFullWidth>
            <FormMultiSelect formik={formik} name="categoryIds" label="Categories" options={categories} />
          </FormFullWidth>
        </FormSection>

        <FormSection title="SEO">
          <FormFullWidth>
            <FormInput formik={formik} name="metaTitle" label="Meta Title" required />
          </FormFullWidth>
          <FormFullWidth>
            <FormTextarea formik={formik} name="metaDescription" label="Meta Description" required rows={3} />
          </FormFullWidth>
          <FormFullWidth>
            <FormInput formik={formik} name="metaKeywords" label="Meta Keywords" hint="Separate keywords with commas" />
          </FormFullWidth>
        </FormSection>

        <FormToggle formik={formik} name="isActive" label="Active Status" />

        <FormActions
          isEdit={isEdit}
          isSubmitting={formik.isSubmitting}
          entityLabel="Brand"
          onCancel={() => router.push(`/admin/${module}`)}
        />
      </form>
    </AdminFormLayout>
  );
}
