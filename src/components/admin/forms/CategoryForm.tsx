"use client";

import { ArrowLeft, ArrowRight } from "lucide-react";
import { useEffect, useState, type FormEvent, type MouseEvent } from "react";
import * as Yup from "yup";
import { Button } from "@/components/common/Button";
import type { AdminFormProps } from "./types";
import { AdminFormLayout } from "./shared/AdminFormLayout";
import {
  FormFullWidth,
  FormImageUpload,
  FormInput,
  FormMultiSelect,
  FormSelect,
  FormQuill,
  FormTextarea,
} from "./shared/FormFields";
import { FormStepper } from "./shared/FormStepper";
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
  mobileImage: string;
  imageAltText: string;
  metaTitle: string;
  metaDescription: string;
  metaKeywords: string;
};

const CATEGORY_FORM_STEPS = [
  { id: 1, label: "General Information" },
  { id: 2, label: "Media Assets" },
  { id: 3, label: "SEO Settings" },
] as const;

const SHORT_DESC_MAX = 500;
const META_TITLE_MAX = 70;
const META_DESC_MAX = 320;

const STEP_TOUCH_FIELDS: Record<number, Array<keyof Values>> = {
  1: ["categoryName", "categorySlug", "shortDescription", "description", "publishStatus"],
  2: [],
  3: ["metaTitle", "metaDescription"],
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
  mobileImage: "",
  imageAltText: "",
  metaTitle: "",
  metaDescription: "",
  metaKeywords: "",
};

const schema = Yup.object({
  categoryName: requiredString("Category name", 3, 100),
  categorySlug: slugField("Category slug"),
  shortDescription: requiredString("Short description", 3, SHORT_DESC_MAX),
  description: htmlMinLength("Description", 3),
  parentId: Yup.string(),
  offerIds: Yup.array().of(Yup.number()),
  publishStatus: Yup.string().oneOf(["draft", "published"]).required(),
  isActive: activeField,
  showOnHomePage: Yup.boolean(),
  image: Yup.string(),
  mobileImage: Yup.string(),
  imageAltText: Yup.string(),
  metaTitle: requiredString("Meta title", 3, META_TITLE_MAX),
  metaDescription: requiredString("Meta description", 3, META_DESC_MAX),
  metaKeywords: Yup.string(),
});

function stripHtml(value: string) {
  return value.replace(/<[^>]*>/g, "").trim();
}

function isCategoryStepValid(step: number, values: Values, errors: Record<string, unknown>) {
  if (step === 1) {
    const slug = values.categorySlug.trim();
    return (
      values.categoryName.trim().length >= 3 &&
      slug.length >= 3 &&
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug) &&
      values.shortDescription.trim().length >= 3 &&
      stripHtml(values.description).length >= 3 &&
      Boolean(values.publishStatus) &&
      !errors.categoryName &&
      !errors.categorySlug &&
      !errors.shortDescription &&
      !errors.description &&
      !errors.publishStatus
    );
  }

  if (step === 3) {
    return (
      values.metaTitle.trim().length >= 3 &&
      values.metaDescription.trim().length >= 3 &&
      !errors.metaTitle &&
      !errors.metaDescription
    );
  }

  return true;
}

function StatusToggle({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <div className="flex min-h-[42px] flex-1 items-center gap-3 rounded-lg border border-zinc-200 bg-zinc-50 px-3.5">
      <span className="text-sm font-medium text-zinc-700">{label}</span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        onClick={onChange}
        className={`relative ml-auto inline-flex h-6 w-11 shrink-0 rounded-full transition-colors ${
          checked ? "bg-admin-primary" : "bg-zinc-300"
        }`}
      >
        <span
          className={`inline-block h-5 w-5 translate-y-0.5 rounded-full bg-white shadow transition-transform ${
            checked ? "translate-x-5" : "translate-x-0.5"
          }`}
        />
      </button>
      <span
        className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
          checked ? "bg-emerald-50 text-emerald-700" : "bg-zinc-200 text-zinc-600"
        }`}
      >
        {checked ? "Active" : "Not Active"}
      </span>
    </div>
  );
}

export function CategoryForm({ module, recordId }: AdminFormProps) {
  const [currentStep, setCurrentStep] = useState(1);
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
      const publishStatus = String(r.publishStatus ?? "draft");
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
        publishStatus: publishStatus === "published" ? "published" : "draft",
        isActive: Boolean(r.isActive ?? true),
        showOnHomePage: Boolean(r.showOnHomePage ?? false),
        image: String(r.image ?? ""),
        mobileImage: String(r.mobileImage ?? ""),
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
      mobileImage: v.mobileImage || null,
      imageAltText: v.imageAltText || null,
      seo: {
        metaTitle: v.metaTitle,
        metaDescription: v.metaDescription,
        metaKeywords: v.metaKeywords,
      },
    }),
  });

  useSlugSync(formik, "categoryName", "categorySlug", !isEdit);

  async function touchStepFields(step: number) {
    const fields = STEP_TOUCH_FIELDS[step] ?? [];
    await Promise.all(fields.map((name) => formik.setFieldTouched(name, true, false)));
  }

  async function handleNextStep(event: MouseEvent<HTMLButtonElement>) {
    event.preventDefault();
    event.stopPropagation();

    await touchStepFields(currentStep);
    const errors = await formik.validateForm();

    if (!isCategoryStepValid(currentStep, formik.values, errors as Record<string, unknown>)) {
      return;
    }

    window.setTimeout(() => {
      setCurrentStep((step) => Math.min(step + 1, CATEGORY_FORM_STEPS.length));
    }, 0);
  }

  function handlePreviousStep() {
    setCurrentStep((step) => Math.max(step - 1, 1));
  }

  function handleFormSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (currentStep !== CATEGORY_FORM_STEPS.length) {
      return;
    }

    void formik.handleSubmit(event);
  }

  const stepValid = isCategoryStepValid(
    currentStep,
    formik.values,
    formik.errors as Record<string, unknown>
  );

  return (
    <AdminFormLayout
      title={isEdit ? "Edit Product Category" : "Add Product Category"}
      module={module}
      loading={loading}
      loadError={loadError}
      submitError={formik.status as string | undefined}
    >
      <form onSubmit={handleFormSubmit} className="space-y-6">
        <FormStepper
          steps={[...CATEGORY_FORM_STEPS]}
          currentStep={currentStep}
          onStepClick={(step) => {
            if (step < currentStep) setCurrentStep(step);
          }}
        />

        {currentStep === 1 && (
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <FormInput formik={formik} name="categoryName" label="Category Name" required />
            <FormInput formik={formik} name="categorySlug" label="Category Slug" required />
            <FormFullWidth>
              <FormInput
                formik={formik}
                name="shortDescription"
                label="Short Description"
                required
                maxLength={SHORT_DESC_MAX}
                hint={`${formik.values.shortDescription.length}/${SHORT_DESC_MAX}`}
              />
            </FormFullWidth>
            <FormFullWidth>
              <FormQuill
                formik={formik}
                name="description"
                label="Description"
                required
                minHeight={200}
                placeholder="Category description..."
              />
            </FormFullWidth>
            <FormFullWidth>
              <FormMultiSelect
                formik={formik}
                name="offerIds"
                label="Select Offers"
                options={offers}
              />
            </FormFullWidth>
            <FormSelect
              formik={formik}
              name="parentId"
              label="Select Parent Category"
              options={categories}
              placeholder="Select a Parent Category"
            />
            <FormSelect
              formik={formik}
              name="publishStatus"
              label="Publish Status"
              required
              options={[
                { label: "Draft", value: "draft" },
                { label: "Published", value: "published" },
              ]}
            />
            <FormFullWidth>
              <div className="flex flex-col gap-3 sm:flex-row">
                <StatusToggle
                  label="Active Status"
                  checked={formik.values.isActive}
                  onChange={() => void formik.setFieldValue("isActive", !formik.values.isActive)}
                />
                <StatusToggle
                  label="Show On Home Page"
                  checked={formik.values.showOnHomePage}
                  onChange={() =>
                    void formik.setFieldValue("showOnHomePage", !formik.values.showOnHomePage)
                  }
                />
              </div>
            </FormFullWidth>
          </div>
        )}

        {currentStep === 2 && (
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <FormImageUpload
              formik={formik}
              name="image"
              label="Upload Main Image"
              uploadPath={UPLOAD_PATHS.categories.image}
              imageType="category"
            />
            <FormImageUpload
              formik={formik}
              name="mobileImage"
              label="Upload Mobile Image"
              uploadPath={UPLOAD_PATHS.categories.mobile}
              imageType="category_mobile"
            />
            <FormFullWidth>
              <FormInput formik={formik} name="imageAltText" label="Image Alt Text" />
            </FormFullWidth>
          </div>
        )}

        {currentStep === 3 && (
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <FormFullWidth>
              <FormInput
                formik={formik}
                name="metaTitle"
                label="Meta Title"
                required
                maxLength={META_TITLE_MAX}
                hint={`${formik.values.metaTitle.length}/${META_TITLE_MAX}`}
              />
            </FormFullWidth>
            <FormFullWidth>
              <FormTextarea
                formik={formik}
                name="metaDescription"
                label="Meta Description"
                required
                rows={3}
                maxLength={META_DESC_MAX}
                hint={`${formik.values.metaDescription.length}/${META_DESC_MAX}`}
              />
            </FormFullWidth>
            <FormFullWidth>
              <FormInput
                formik={formik}
                name="metaKeywords"
                label="Meta Keywords"
                hint="Separate keywords with commas"
              />
            </FormFullWidth>
          </div>
        )}

        <div
          className={`flex pt-6 ${currentStep === 1 ? "justify-end" : "justify-between"}`}
        >
          {currentStep > 1 && (
            <Button type="button" variant="secondary" onClick={handlePreviousStep}>
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
          )}

          {currentStep < CATEGORY_FORM_STEPS.length ? (
            <Button type="button" onClick={handleNextStep} disabled={!stepValid}>
              Next
              <ArrowRight className="h-4 w-4" />
            </Button>
          ) : (
            <Button type="submit" disabled={!stepValid || formik.isSubmitting}>
              {formik.isSubmitting
                ? isEdit
                  ? "Updating Product Category..."
                  : "Creating Product Category..."
                : isEdit
                  ? "Update Product Category"
                  : "Create Product Category"}
            </Button>
          )}
        </div>
      </form>
    </AdminFormLayout>
  );
}
