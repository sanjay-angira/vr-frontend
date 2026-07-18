"use client";

import { Form, Formik, useFormikContext } from "formik";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import * as Yup from "yup";
import { Button } from "@/components/common/Button";
import { FormMultiDropdown } from "@/components/admin/forms/shared/FormMultiDropdown";
import { FormDropdown } from "@/components/admin/forms/shared/FormDropdown";
import { FormLabel } from "@/components/admin/forms/shared/FormLabel";
import { Input } from "@/components/common/Input";
import { generateSlug } from "@/components/admin/forms/shared/generateSlug";
import { useSlugSync } from "@/components/admin/forms/shared/useSlugSync";
import {
  fetchBannersOptions,
  fetchBlogsOptions,
  fetchCategoriesOptions,
  fetchFaqsOptions,
  fetchOffersOptions,
  fetchProductsOptions,
  fetchReviewsOptions,
} from "@/components/admin/forms/shared/fetchOptions";
import { API_ENDPOINTS } from "@/services/api/API_ENDPOINT";
import { getData, postData, putData } from "@/services/api/apiService";

function unwrap<T>(response: { data?: T } | T): T {
  if (response && typeof response === "object" && "data" in response) {
    return (response as { data?: T }).data as T;
  }
  return response as T;
}

type CmsSectionPayload = {
  title: string;
  slug: string;
  type: string;
  position?: number;
  status?: boolean;
  data?: Record<string, unknown>;
  productIds?: number[];
  categoryIds?: number[];
  blogIds?: number[];
  offerIds?: number[];
  faqIds?: number[];
  bannerIds?: number[];
  reviewIds?: number[];
};

const SECTION_TYPES = [
  { label: "Hero Banner", value: "hero_banner" },
  { label: "Newsletter", value: "news_letter" },
  { label: "Product Slider", value: "product_slider" },
  { label: "Category Slider", value: "category_slider" },
  { label: "Blog Section", value: "blog_section" },
  { label: "Offer Banner", value: "offer_banner" },
  { label: "FAQ Section", value: "faq_section" },
  { label: "Review Section", value: "review_section" },
  { label: "Custom", value: "custom" },
];

const DISPLAY_STYLES = [
  { label: "Grid", value: "grid" },
  { label: "Carousel", value: "carousel" },
  { label: "List", value: "list" },
];

type SectionFormValues = {
  title: string;
  slug: string;
  type: string;
  visible: boolean;
  displayStyle: string;
  maxProducts: number;
  heading: string;
  headingAccent: string;
  subHeading: string;
  description: string;
  productIds: number[];
  categoryIds: number[];
  blogIds: number[];
  offerIds: number[];
  faqIds: number[];
  bannerIds: number[];
  reviewIds: number[];
  position: number;
};

const schema = Yup.object({
  title: Yup.string().min(2).max(100).required("Title is required"),
  slug: Yup.string()
    .min(2)
    .max(160)
    .matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use lowercase letters, numbers, and hyphens")
    .required("Slug is required"),
  type: Yup.string().required("Section type is required"),
  displayStyle: Yup.string().required(),
  maxProducts: Yup.number().min(1).max(100).required(),
});

function SectionSlugSync({ enabled }: { enabled: boolean }) {
  const formik = useFormikContext<SectionFormValues>();
  useSlugSync(formik, "title", "slug", enabled);
  return null;
}

type SectionSettingsPageProps = {
  sectionId?: string;
};

export function SectionSettingsPage({ sectionId }: SectionSettingsPageProps) {
  const router = useRouter();
  const isEdit = Boolean(sectionId);
  const [loading, setLoading] = useState(isEdit);
  const [error, setError] = useState("");

  const [products, setProducts] = useState<Array<{ label: string; value: string | number }>>([]);
  const [categories, setCategories] = useState<Array<{ label: string; value: string | number }>>([]);
  const [offers, setOffers] = useState<Array<{ label: string; value: string | number }>>([]);
  const [blogs, setBlogs] = useState<Array<{ label: string; value: string | number }>>([]);
  const [faqs, setFaqs] = useState<Array<{ label: string; value: string | number }>>([]);
  const [banners, setBanners] = useState<Array<{ label: string; value: string | number }>>([]);
  const [reviews, setReviews] = useState<Array<{ label: string; value: string | number }>>([]);

  const [initialValues, setInitialValues] = useState<SectionFormValues>({
    title: "",
    slug: "",
    type: "product_slider",
    visible: true,
    displayStyle: "grid",
    maxProducts: 8,
    heading: "",
    headingAccent: "",
    subHeading: "",
    description: "",
    productIds: [],
    categoryIds: [],
    blogIds: [],
    offerIds: [],
    faqIds: [],
    bannerIds: [],
    reviewIds: [],
    position: 1,
  });

  useEffect(() => {
    Promise.all([
      fetchProductsOptions(),
      fetchCategoriesOptions(),
      fetchOffersOptions(),
      fetchBlogsOptions(),
      fetchFaqsOptions(),
      fetchBannersOptions(),
      fetchReviewsOptions(),
    ]).then(([p, c, o, b, f, bn, r]) => {
      setProducts(p);
      setCategories(c);
      setOffers(o);
      setBlogs(b);
      setFaqs(f);
      setBanners(bn);
      setReviews(r);
    });
  }, []);

  useEffect(() => {
    if (!sectionId) return;

    async function load() {
      setLoading(true);
      try {
        const res = await getData(API_ENDPOINTS.CMS_SECTIONS.DETAILS(sectionId!));
        const section = unwrap<{
          title: string;
          slug?: string | null;
          type: string;
          status: boolean;
          position?: number;
          data?: Record<string, unknown>;
          products?: Array<{ id: number }>;
          categories?: Array<{ id: number }>;
          blogs?: Array<{ id: number }>;
          offers?: Array<{ id: number }>;
          faqs?: Array<{ id: number }>;
          banners?: Array<{ id: number }>;
          reviews?: Array<{ id: number }>;
        }>(res);
        const data = (section.data ?? {}) as Record<string, unknown>;
        setInitialValues({
          title: section.title,
          slug: section.slug || generateSlug(section.title),
          type: section.type,
          visible: Boolean(section.status),
          displayStyle: String(data.displayStyle ?? "grid"),
          maxProducts: Number(data.maxProducts ?? 8),
          heading: String(data.heading ?? ""),
          headingAccent: String(data.headingAccent ?? ""),
          subHeading: String(data.subHeading ?? ""),
          description: String(data.description ?? ""),
          productIds: section.products?.map((item) => item.id) ?? [],
          categoryIds: section.categories?.map((item) => item.id) ?? [],
          blogIds: section.blogs?.map((item) => item.id) ?? [],
          offerIds: section.offers?.map((item) => item.id) ?? [],
          faqIds: section.faqs?.map((item) => item.id) ?? [],
          bannerIds: section.banners?.map((item) => item.id) ?? [],
          reviewIds: section.reviews?.map((item) => item.id) ?? [],
          position: section.position ?? 1,
        });
      } catch {
        setError("Failed to load section.");
      } finally {
        setLoading(false);
      }
    }

    void load();
  }, [sectionId]);

  async function handleSubmit(values: SectionFormValues) {
    const payload: CmsSectionPayload = {
      title: values.title,
      slug: values.slug.trim() || generateSlug(values.title),
      type: values.type,
      position: values.position,
      status: values.visible,
      data: {
        displayStyle: values.displayStyle,
        maxProducts: values.maxProducts,
        heading: values.heading,
        headingAccent: values.headingAccent,
        subHeading: values.subHeading,
        description: values.description,
      },
      productIds: values.productIds,
      categoryIds: values.categoryIds,
      blogIds: values.blogIds,
      offerIds: values.offerIds,
      faqIds: values.faqIds,
      bannerIds: values.bannerIds,
      reviewIds: values.reviewIds,
    };

    try {
      if (isEdit && sectionId) {
        await putData(API_ENDPOINTS.CMS_SECTIONS.UPDATE(sectionId), payload);
      } else {
        await postData(API_ENDPOINTS.CMS_SECTIONS.CREATE, payload);
      }
      router.push("/admin/website-layout");
    } catch {
      setError(`Failed to ${isEdit ? "update" : "create"} section.`);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-64 items-center justify-center">
        <span className="h-8 w-8 animate-spin rounded-full border-2 border-zinc-300 border-t-zinc-700" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
        <div className="mb-1 text-xs font-medium uppercase tracking-wide text-zinc-400">
          <Link href="/admin/website-layout" className="hover:text-zinc-600">
            Back to homepage builder
          </Link>
        </div>
        <h1 className="text-2xl font-semibold text-zinc-900">
          {isEdit ? "Edit Section" : "Create Section"}
        </h1>
        {error && (
          <p className="mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </p>
        )}
      </div>

      <Formik
        initialValues={initialValues}
        enableReinitialize
        validationSchema={schema}
        onSubmit={handleSubmit}
      >
        {({ values, errors, touched, setFieldValue, isSubmitting, handleChange, handleBlur }) => (
          <Form className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
            <SectionSlugSync enabled={!isEdit} />
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              <Input
                label="Section Title"
                required
                name="title"
                value={values.title}
                onChange={handleChange}
                onBlur={handleBlur}
                error={touched.title && errors.title ? String(errors.title) : undefined}
              />

              <Input
                label="Section Slug"
                required
                name="slug"
                value={values.slug}
                onChange={handleChange}
                onBlur={handleBlur}
                error={touched.slug && errors.slug ? String(errors.slug) : undefined}
              />

              <FormDropdown
                label="Section Type"
                required
                value={values.type}
                onChange={(value) => setFieldValue("type", value)}
                options={SECTION_TYPES}
              />

              <FormDropdown
                label="Display Style"
                required
                value={values.displayStyle}
                onChange={(value) => setFieldValue("displayStyle", value)}
                options={DISPLAY_STYLES}
              />

              <Input
                label="Maximum Products"
                required
                type="number"
                name="maxProducts"
                value={String(values.maxProducts)}
                onChange={handleChange}
                onBlur={handleBlur}
                error={
                  touched.maxProducts && errors.maxProducts
                    ? String(errors.maxProducts)
                    : undefined
                }
              />

              <div className="md:col-span-2 rounded-xl border border-zinc-100 bg-zinc-50/70 p-4 md:p-5">
                <h2 className="mb-1 text-sm font-semibold text-zinc-900">
                  Section heading (storefront)
                </h2>
                <p className="mb-4 text-xs text-zinc-500">
                  Matches the branded header: eyebrow label, two-tone title, and description.
                </p>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="md:col-span-2">
                    <Input
                      label="Eyebrow label"
                      name="subHeading"
                      value={values.subHeading}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      placeholder="e.g. Explore Our Range"
                    />
                    <p className="mt-1 text-xs text-zinc-500">
                      Shown in uppercase above the title with leaf + lines.
                    </p>
                  </div>

                  <Input
                    label="Heading"
                    name="heading"
                    value={values.heading}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="e.g. Our Best Categories"
                  />

                  <Input
                    label="Accent word"
                    name="headingAccent"
                    value={values.headingAccent}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="e.g. Categories"
                  />
                  <p className="md:col-span-2 -mt-2 text-xs text-zinc-500">
                    Accent word is highlighted in terracotta. Use a word that appears in the heading.
                  </p>

                  <div className="md:col-span-2">
                    <FormLabel label="Description" />
                    <textarea
                      name="description"
                      rows={3}
                      value={values.description}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      placeholder="e.g. Handpicked goodness for a healthier, happier you and your home."
                      className="w-full rounded-lg border border-zinc-300 bg-white px-3.5 py-2.5 text-sm focus:border-admin-primary focus:outline-none focus:ring-2 focus:ring-admin-primary/15"
                    />
                  </div>
                </div>
              </div>

              <FormMultiDropdown
                label="Products"
                value={values.productIds}
                onChange={(ids) => setFieldValue("productIds", ids)}
                options={products}
              />
              <FormMultiDropdown
                label="Categories"
                value={values.categoryIds}
                onChange={(ids) => setFieldValue("categoryIds", ids)}
                options={categories}
              />
              <FormMultiDropdown
                label="Offers"
                value={values.offerIds}
                onChange={(ids) => setFieldValue("offerIds", ids)}
                options={offers}
              />
              <FormMultiDropdown
                label="Blogs"
                value={values.blogIds}
                onChange={(ids) => setFieldValue("blogIds", ids)}
                options={blogs}
              />
              <FormMultiDropdown
                label="FAQs"
                value={values.faqIds}
                onChange={(ids) => setFieldValue("faqIds", ids)}
                options={faqs}
              />
              <FormMultiDropdown
                label="Banners"
                value={values.bannerIds}
                onChange={(ids) => setFieldValue("bannerIds", ids)}
                options={banners}
              />
              <FormMultiDropdown
                label="Reviews"
                value={values.reviewIds}
                onChange={(ids) => setFieldValue("reviewIds", ids)}
                options={reviews}
              />

              <div className="md:col-span-2">
                <label className="flex items-center justify-between gap-4 rounded-lg border border-zinc-200 bg-zinc-50 px-4 py-3">
                  <span className="text-sm font-medium text-zinc-700">Active Status</span>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={values.visible}
                    onClick={() => setFieldValue("visible", !values.visible)}
                    className={`relative inline-flex h-6 w-11 shrink-0 rounded-full transition-colors ${
                      values.visible ? "bg-admin-primary" : "bg-zinc-300"
                    }`}
                  >
                    <span
                      className={`inline-block h-5 w-5 translate-y-0.5 rounded-full bg-white shadow transition-transform ${
                        values.visible ? "translate-x-5" : "translate-x-0.5"
                      }`}
                    />
                  </button>
                </label>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3 border-t border-zinc-100 pt-6">
              <Link
                href="/admin/website-layout"
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-admin-border bg-white px-4 py-2.5 text-sm font-medium text-blue-950 transition-colors hover:bg-admin-muted"
              >
                Cancel
              </Link>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting
                  ? "Saving..."
                  : isEdit
                    ? "Update Section"
                    : "Create Section"}
              </Button>
            </div>
          </Form>
        )}
      </Formik>
    </div>
  );
}
