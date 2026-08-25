"use client";

import { FieldArray, FormikProvider } from "formik";
import { ArrowLeft, ArrowRight, Plus, Trash2 } from "lucide-react";
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
  FormQuill,
  FormSelect,
  FormTextarea,
} from "./shared/FormFields";
import { FormStepper } from "./shared/FormStepper";
import { fetchBlogCategoriesOptions, fetchBlogTagsOptions } from "./shared/fetchOptions";
import { useAdminCrudForm } from "./shared/useAdminCrudForm";
import { useSlugSync } from "./shared/useSlugSync";
import { UPLOAD_PATHS } from "./shared/uploadPaths";
import {
  activeField,
  htmlMinLength,
  optionalUrl,
  requiredString,
  slugField,
} from "./shared/validation";

type BlogFaq = {
  question: string;
  answer: string;
};

type Values = {
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  categoryId: string;
  blogImage: string;
  blogImageAlt: string;
  tagIds: number[];
  readingTime: number;
  seo: {
    metaTitle: string;
    metaDescription: string;
    focusKeyword: string;
    canonicalUrl: string;
    schemaType: string;
    ogTitle: string;
    ogDescription: string;
    ogImage: string;
  };
  status: string;
  scheduledAt: string;
  isActive: boolean;
  isFeatured: boolean;
  faqs: BlogFaq[];
};

const BLOG_FORM_STEPS = [
  { id: 1, label: "Blog Content" },
  { id: 2, label: "SEO Settings" },
  { id: 3, label: "FAQs & Publishing" },
] as const;

const META_TITLE_MAX = 60;
const META_DESC_MAX = 160;
const EXCERPT_MAX = 300;

const STEP_TOUCH_FIELDS: Record<number, string[]> = {
  1: ["title", "slug", "content", "categoryId", "blogImage"],
  2: ["seo.metaTitle", "seo.metaDescription"],
  3: ["status", "scheduledAt"],
};

const SCHEMA_TYPE_OPTIONS = [
  { label: "Article", value: "Article" },
  { label: "Blog Posting", value: "BlogPosting" },
  { label: "News Article", value: "NewsArticle" },
];

const STATUS_OPTIONS = [
  { label: "Draft", value: "draft" },
  { label: "Published", value: "published" },
  { label: "Scheduled", value: "scheduled" },
];

const emptyFaq = (): BlogFaq => ({ question: "", answer: "" });

const initialValues: Values = {
  title: "",
  slug: "",
  content: "",
  excerpt: "",
  categoryId: "",
  blogImage: "",
  blogImageAlt: "",
  tagIds: [],
  readingTime: 0,
  seo: {
    metaTitle: "",
    metaDescription: "",
    focusKeyword: "",
    canonicalUrl: "",
    schemaType: "Article",
    ogTitle: "",
    ogDescription: "",
    ogImage: "",
  },
  status: "draft",
  scheduledAt: "",
  isActive: true,
  isFeatured: false,
  faqs: [],
};

const schema = Yup.object({
  title: requiredString("Title", 3, 200),
  slug: slugField("Slug"),
  content: htmlMinLength("Content", 10),
  excerpt: Yup.string().max(EXCERPT_MAX),
  categoryId: Yup.mixed().required("Category is required"),
  blogImage: requiredString("Blog image", 1),
  blogImageAlt: Yup.string(),
  tagIds: Yup.array().of(Yup.number()),
  readingTime: Yup.number()
    .transform((value, original) => (original === "" || original == null ? 0 : value))
    .min(0, "Reading time must be 0 or more"),
  seo: Yup.object({
    metaTitle: requiredString("Meta title", 3, META_TITLE_MAX),
    metaDescription: requiredString("Meta description", 3, META_DESC_MAX),
    focusKeyword: Yup.string(),
    canonicalUrl: optionalUrl,
    schemaType: Yup.string(),
    ogTitle: Yup.string(),
    ogDescription: Yup.string(),
    ogImage: Yup.string(),
  }),
  status: Yup.string().oneOf(["draft", "published", "scheduled"]).required("Status is required"),
  scheduledAt: Yup.string().when("status", {
    is: "scheduled",
    then: (field) => field.required("Schedule date is required"),
    otherwise: (field) => field.optional(),
  }),
  isActive: activeField,
  isFeatured: Yup.boolean(),
  faqs: Yup.array().of(
    Yup.object({
      question: Yup.string(),
      answer: Yup.string(),
    })
  ),
});

function stripHtml(value: string) {
  return value.replace(/<[^>]*>/g, "").trim();
}

function toDatetimeLocal(value: unknown): string {
  if (!value) return "";
  const date = new Date(String(value));
  if (Number.isNaN(date.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function fromDatetimeLocal(value: string): string | null {
  if (!value.trim()) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toISOString();
}

function isBlogStepValid(step: number, values: Values, errors: Record<string, unknown>) {
  if (step === 1) {
    const slug = values.slug.trim();
    return (
      values.title.trim().length >= 3 &&
      slug.length >= 3 &&
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug) &&
      stripHtml(values.content).length >= 10 &&
      Boolean(values.categoryId) &&
      Boolean(values.blogImage.trim()) &&
      !errors.title &&
      !errors.slug &&
      !errors.content &&
      !errors.categoryId &&
      !errors.blogImage
    );
  }

  if (step === 2) {
    const seoErrors = (errors.seo ?? {}) as Record<string, unknown>;
    return (
      values.seo.metaTitle.trim().length >= 3 &&
      values.seo.metaDescription.trim().length >= 3 &&
      !seoErrors.metaTitle &&
      !seoErrors.metaDescription &&
      !seoErrors.canonicalUrl
    );
  }

  if (step === 3) {
    const scheduledOk =
      values.status !== "scheduled" || Boolean(values.scheduledAt.trim());
    return Boolean(values.status) && scheduledOk && !errors.status && !errors.scheduledAt;
  }

  return true;
}

function StatusToggle({
  label,
  checked,
  onChange,
  onLabel = "Active",
  offLabel = "Not Active",
}: {
  label: string;
  checked: boolean;
  onChange: () => void;
  onLabel?: string;
  offLabel?: string;
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
        {checked ? onLabel : offLabel}
      </span>
    </div>
  );
}

export function BlogForm({ module, recordId }: AdminFormProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [categories, setCategories] = useState<Array<{ label: string; value: string | number }>>(
    []
  );
  const [tags, setTags] = useState<Array<{ label: string; value: string | number }>>([]);

  useEffect(() => {
    fetchBlogCategoriesOptions().then(setCategories);
    fetchBlogTagsOptions().then(setTags);
  }, []);

  const { formik, loading, loadError, isEdit } = useAdminCrudForm<Values>({
    module,
    recordId,
    initialValues,
    validationSchema: schema,
    mapRecordToValues: (r) => {
      const seo = (r.seo ?? {}) as Record<string, unknown>;
      const tagIds = Array.isArray(r.tags)
        ? (r.tags as Array<{ id: number }>).map((t) => t.id)
        : Array.isArray(r.tagIds)
          ? (r.tagIds as number[])
          : [];
      const faqs = Array.isArray(r.faqs)
        ? (r.faqs as Array<{ question?: string; answer?: string }>).map((faq) => ({
            question: String(faq.question ?? ""),
            answer: String(faq.answer ?? ""),
          }))
        : [];

      return {
        title: String(r.title ?? ""),
        slug: String(r.slug ?? ""),
        content: String(r.content ?? ""),
        excerpt: String(r.excerpt ?? ""),
        categoryId: String(r.categoryId ?? (r.category as { id?: number })?.id ?? ""),
        blogImage: String(r.blogImage ?? r.featuredImage ?? ""),
        blogImageAlt: String(r.blogImageAlt ?? ""),
        tagIds,
        readingTime: Number(r.readingTime ?? 0),
        seo: {
          metaTitle: String(seo.metaTitle ?? r.metaTitle ?? ""),
          metaDescription: String(seo.metaDescription ?? r.metaDescription ?? ""),
          focusKeyword: String(seo.focusKeyword ?? ""),
          canonicalUrl: String(seo.canonicalUrl ?? ""),
          schemaType: String(seo.schemaType ?? "Article"),
          ogTitle: String(seo.ogTitle ?? ""),
          ogDescription: String(seo.ogDescription ?? ""),
          ogImage: String(seo.ogImage ?? ""),
        },
        status: String(r.status ?? r.publishStatus ?? "draft"),
        scheduledAt: toDatetimeLocal(r.scheduledAt),
        isActive: Boolean(r.isActive ?? true),
        isFeatured: Boolean(r.isFeatured ?? false),
        faqs,
      };
    },
    mapValuesToPayload: (v) => ({
      title: v.title,
      slug: v.slug,
      content: v.content,
      excerpt: v.excerpt,
      categoryId: Number(v.categoryId),
      blogImage: v.blogImage,
      blogImageAlt: v.blogImageAlt || null,
      tagIds: v.tagIds,
      readingTime: Number(v.readingTime) || 0,
      status: v.status,
      scheduledAt: v.status === "scheduled" ? fromDatetimeLocal(v.scheduledAt) : null,
      isActive: v.isActive,
      isFeatured: v.isFeatured,
      faqs: v.faqs.filter((faq) => faq.question.trim() && faq.answer.trim()),
      seo: {
        metaTitle: v.seo.metaTitle,
        metaDescription: v.seo.metaDescription,
        focusKeyword: v.seo.focusKeyword || null,
        canonicalUrl: v.seo.canonicalUrl || null,
        schemaType: v.seo.schemaType || "Article",
        ogTitle: v.seo.ogTitle || null,
        ogDescription: v.seo.ogDescription || null,
        ogImage: v.seo.ogImage || null,
      },
    }),
  });

  useSlugSync(formik, "title", "slug", !isEdit);

  async function touchStepFields(step: number) {
    const fields = STEP_TOUCH_FIELDS[step] ?? [];
    await Promise.all(fields.map((name) => formik.setFieldTouched(name, true, false)));
  }

  async function handleNextStep(event: MouseEvent<HTMLButtonElement>) {
    event.preventDefault();
    event.stopPropagation();

    await touchStepFields(currentStep);
    const errors = await formik.validateForm();

    if (!isBlogStepValid(currentStep, formik.values, errors as Record<string, unknown>)) {
      return;
    }

    window.setTimeout(() => {
      setCurrentStep((step) => Math.min(step + 1, BLOG_FORM_STEPS.length));
    }, 0);
  }

  function handlePreviousStep() {
    setCurrentStep((step) => Math.max(step - 1, 1));
  }

  function handleFormSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (currentStep !== BLOG_FORM_STEPS.length) {
      return;
    }

    void formik.handleSubmit(event);
  }

  const stepValid = isBlogStepValid(
    currentStep,
    formik.values,
    formik.errors as Record<string, unknown>
  );

  return (
    <AdminFormLayout
      title={isEdit ? "Edit Blog Post" : "Add Blog Post"}
      module={module}
      loading={loading}
      loadError={loadError}
      submitError={formik.status as string | undefined}
    >
      <FormikProvider value={formik}>
        <form onSubmit={handleFormSubmit} className="space-y-6">
          <FormStepper
            steps={[...BLOG_FORM_STEPS]}
            currentStep={currentStep}
            onStepClick={(step) => {
              if (step < currentStep) setCurrentStep(step);
            }}
          />

          {currentStep === 1 && (
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              <FormInput formik={formik} name="title" label="Title" required />
              <FormInput formik={formik} name="slug" label="Slug" required />
              <FormSelect
                formik={formik}
                name="categoryId"
                label="Category"
                required
                options={categories}
                placeholder="Select a category"
              />
              <FormMultiSelect formik={formik} name="tagIds" label="Tags" options={tags} />
              <FormFullWidth>
                <FormTextarea
                  formik={formik}
                  name="excerpt"
                  label="Excerpt"
                  rows={2}
                  maxLength={EXCERPT_MAX}
                  hint={`${formik.values.excerpt.length}/${EXCERPT_MAX}`}
                />
              </FormFullWidth>
              <FormFullWidth>
                <FormQuill
                  formik={formik}
                  name="content"
                  label="Content"
                  required
                  minHeight={300}
                  placeholder="Write your blog post here..."
                />
              </FormFullWidth>
              <FormImageUpload
                formik={formik}
                name="blogImage"
                label="Upload Blog Image"
                required
                uploadPath={UPLOAD_PATHS.blogs}
                imageType="blog"
              />
              <FormInput
                formik={formik}
                name="readingTime"
                label="Reading Time (minutes)"
                type="number"
                min={0}
              />
              <FormFullWidth>
                <FormInput formik={formik} name="blogImageAlt" label="Image Alt Text" />
              </FormFullWidth>
            </div>
          )}

          {currentStep === 2 && (
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              <FormInput
                formik={formik}
                name="seo.metaTitle"
                label="Meta Title"
                required
                maxLength={META_TITLE_MAX}
                hint={`${formik.values.seo.metaTitle.length}/${META_TITLE_MAX}`}
              />
              <FormInput formik={formik} name="seo.focusKeyword" label="Focus Keyword" />
              <FormFullWidth>
                <FormTextarea
                  formik={formik}
                  name="seo.metaDescription"
                  label="Meta Description"
                  required
                  rows={3}
                  maxLength={META_DESC_MAX}
                  hint={`${formik.values.seo.metaDescription.length}/${META_DESC_MAX}`}
                />
              </FormFullWidth>
              <FormInput
                formik={formik}
                name="seo.canonicalUrl"
                label="Canonical URL"
                type="url"
              />
              <FormSelect
                formik={formik}
                name="seo.schemaType"
                label="Schema Type"
                options={SCHEMA_TYPE_OPTIONS}
              />
              <FormFullWidth>
                <div className="space-y-4 rounded-lg border border-zinc-200 p-4">
                  <h3 className="text-sm font-semibold text-zinc-900">
                    Open Graph (Social Sharing)
                  </h3>
                  <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                    <FormInput formik={formik} name="seo.ogTitle" label="OG Title" />
                    <FormImageUpload
                      formik={formik}
                      name="seo.ogImage"
                      label="OG Image"
                      uploadPath={UPLOAD_PATHS.blogs}
                      imageType="blog"
                    />
                    <FormFullWidth>
                      <FormTextarea
                        formik={formik}
                        name="seo.ogDescription"
                        label="OG Description"
                        rows={2}
                      />
                    </FormFullWidth>
                  </div>
                </div>
              </FormFullWidth>
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-8">
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                <FormSelect
                  formik={formik}
                  name="status"
                  label="Status"
                  required
                  options={STATUS_OPTIONS}
                />
                {formik.values.status === "scheduled" && (
                  <FormInput
                    formik={formik}
                    name="scheduledAt"
                    label="Schedule Date"
                    required
                    type="datetime-local"
                  />
                )}
                <FormFullWidth>
                  <div className="flex flex-col gap-3 sm:flex-row">
                    <StatusToggle
                      label="Active Status"
                      checked={formik.values.isActive}
                      onChange={() => void formik.setFieldValue("isActive", !formik.values.isActive)}
                    />
                    <StatusToggle
                      label="Featured Post"
                      checked={formik.values.isFeatured}
                      onChange={() =>
                        void formik.setFieldValue("isFeatured", !formik.values.isFeatured)
                      }
                      onLabel="Featured"
                      offLabel="Not Featured"
                    />
                  </div>
                </FormFullWidth>
              </div>

              <div>
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-base font-semibold text-zinc-900">
                    Frequently Asked Questions (FAQs)
                  </h3>
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() =>
                      void formik.setFieldValue("faqs", [...formik.values.faqs, emptyFaq()])
                    }
                  >
                    <Plus className="h-4 w-4" />
                    Add FAQ
                  </Button>
                </div>

                <FieldArray name="faqs">
                  {({ remove }) =>
                    formik.values.faqs.length > 0 ? (
                      <div className="flex flex-col gap-4">
                        {formik.values.faqs.map((_, index) => (
                          <div
                            key={index}
                            className="relative rounded-lg border border-zinc-200 bg-zinc-50 p-4"
                          >
                            <button
                              type="button"
                              aria-label={`Remove FAQ ${index + 1}`}
                              onClick={() => remove(index)}
                              className="absolute right-2 top-2 rounded-md p-1.5 text-red-600 hover:bg-red-50"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                            <div className="mr-8 grid grid-cols-1 gap-4">
                              <FormInput
                                formik={formik}
                                name={`faqs.${index}.question`}
                                label="Question"
                              />
                              <FormTextarea
                                formik={formik}
                                name={`faqs.${index}.answer`}
                                label="Answer"
                                rows={2}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="rounded-lg border-2 border-dashed border-zinc-200 py-10 text-center">
                        <p className="text-sm text-zinc-500">
                          No FAQs added yet. Click &quot;Add FAQ&quot; to start.
                        </p>
                      </div>
                    )
                  }
                </FieldArray>
              </div>
            </div>
          )}

          <div
            className={`flex pt-6 ${currentStep === 1 ? "justify-end" : "justify-between"}`}
          >
            {currentStep > 1 && (
              <Button type="button" variant="secondary" onClick={handlePreviousStep}>
                <ArrowLeft className="h-4 w-4" />
                Previous
              </Button>
            )}

            {currentStep < BLOG_FORM_STEPS.length ? (
              <Button type="button" onClick={handleNextStep} disabled={!stepValid}>
                Next
                <ArrowRight className="h-4 w-4" />
              </Button>
            ) : (
              <Button type="submit" disabled={!stepValid || formik.isSubmitting}>
                {formik.isSubmitting
                  ? isEdit
                    ? "Updating Blog..."
                    : "Creating Blog..."
                  : isEdit
                    ? "Update Blog"
                    : "Create Blog"}
              </Button>
            )}
          </div>
        </form>
      </FormikProvider>
    </AdminFormLayout>
  );
}
