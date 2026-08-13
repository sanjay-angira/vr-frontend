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
import { fetchBlogCategoriesOptions, fetchBlogTagsOptions } from "./shared/fetchOptions";
import { useAdminCrudForm } from "./shared/useAdminCrudForm";
import { useSlugSync } from "./shared/useSlugSync";
import { UPLOAD_PATHS } from "./shared/uploadPaths";
import { activeField, htmlMinLength, requiredString, slugField } from "./shared/validation";

type Values = {
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  categoryId: string;
  blogImage: string;
  blogImageAlt: string;
  tagIds: number[];
  status: string;
  isActive: boolean;
  isFeatured: boolean;
  metaTitle: string;
  metaDescription: string;
};

const initialValues: Values = {
  title: "",
  slug: "",
  content: "",
  excerpt: "",
  categoryId: "",
  blogImage: "",
  blogImageAlt: "",
  tagIds: [],
  status: "draft",
  isActive: true,
  isFeatured: false,
  metaTitle: "",
  metaDescription: "",
};

const schema = Yup.object({
  title: requiredString("Title", 3, 200),
  slug: slugField("Slug"),
  content: htmlMinLength("Content", 10),
  excerpt: Yup.string().max(300),
  categoryId: Yup.string().required("Category is required"),
  blogImage: requiredString("Blog image", 1),
  blogImageAlt: Yup.string(),
  tagIds: Yup.array().of(Yup.number()),
  status: Yup.string().required(),
  isActive: activeField,
  isFeatured: Yup.boolean(),
  metaTitle: requiredString("Meta title", 3, 60),
  metaDescription: requiredString("Meta description", 3, 160),
});

export function BlogForm({ module, recordId }: AdminFormProps) {
  const router = useRouter();
  const [categories, setCategories] = useState<Array<{ label: string; value: string | number }>>([]);
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
      return {
        title: String(r.title ?? ""),
        slug: String(r.slug ?? ""),
        content: String(r.content ?? ""),
        excerpt: String(r.excerpt ?? ""),
        categoryId: String(r.categoryId ?? (r.category as { id?: number })?.id ?? ""),
        blogImage: String(r.blogImage ?? r.featuredImage ?? ""),
        blogImageAlt: String(r.blogImageAlt ?? ""),
        tagIds,
        status: String(r.status ?? r.publishStatus ?? "draft"),
        isActive: Boolean(r.isActive ?? true),
        isFeatured: Boolean(r.isFeatured ?? false),
        metaTitle: String(seo.metaTitle ?? r.metaTitle ?? ""),
        metaDescription: String(seo.metaDescription ?? r.metaDescription ?? ""),
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
      status: v.status,
      publishStatus: v.status,
      isActive: v.isActive,
      isFeatured: v.isFeatured,
      seo: {
        metaTitle: v.metaTitle,
        metaDescription: v.metaDescription,
      },
    }),
  });

  useSlugSync(formik, "title", "slug", !isEdit);

  return (
    <AdminFormLayout
      title={isEdit ? "Edit Blog Post" : "Add Blog Post"}
      module={module}
      loading={loading}
      loadError={loadError}
      submitError={formik.status as string | undefined}
    >
      <form onSubmit={formik.handleSubmit} className="space-y-8">
        <FormSection title="Content">
          <FormInput formik={formik} name="title" label="Title" required />
          <FormInput formik={formik} name="slug" label="Slug" required />
          <FormSelect formik={formik} name="categoryId" label="Category" required options={categories} />
          <FormFullWidth>
            <FormQuill formik={formik} name="content" label="Content" required minHeight={280} placeholder="Write blog content..." />
          </FormFullWidth>
          <FormFullWidth>
            <FormTextarea formik={formik} name="excerpt" label="Excerpt" rows={3} />
          </FormFullWidth>
          <FormImageUpload
            formik={formik}
            name="blogImage"
            label="Blog Image"
            required
            uploadPath={UPLOAD_PATHS.blogs}
            imageType="blog"
          />
          <FormInput formik={formik} name="blogImageAlt" label="Image Alt Text" />
          <FormFullWidth>
            <FormMultiSelect formik={formik} name="tagIds" label="Tags" options={tags} />
          </FormFullWidth>
        </FormSection>

        <FormSection title="SEO">
          <FormFullWidth>
            <FormInput formik={formik} name="metaTitle" label="Meta Title" required />
          </FormFullWidth>
          <FormFullWidth>
            <FormTextarea formik={formik} name="metaDescription" label="Meta Description" required rows={3} />
          </FormFullWidth>
        </FormSection>

        <FormSelect
          formik={formik}
          name="status"
          label="Publish Status"
          required
          options={[
            { label: "Draft", value: "draft" },
            { label: "Published", value: "published" },
            { label: "Scheduled", value: "scheduled" },
          ]}
        />
        <FormToggle formik={formik} name="isActive" label="Active Status" />
        <FormCheckbox formik={formik} name="isFeatured" label="Featured post" />

        <FormActions
          isEdit={isEdit}
          isSubmitting={formik.isSubmitting}
          entityLabel="Post"
          onCancel={() => router.push(`/admin/${module}`)}
        />
      </form>
    </AdminFormLayout>
  );
}
