import { resolveImageUrl } from "@/components/admin/forms/shared/resolveImageUrl";
import { API_ENDPOINTS } from "@/services/api/API_ENDPOINT";
import { getData } from "@/services/api/apiService";

export type BlogListCard = {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  image: string;
  imageAlt: string;
  category: string;
  categorySlug: string | null;
  date: string;
  readingTime: number;
  isFeatured: boolean;
  href: string;
};

export type BlogCategoryOption = {
  id: number;
  title: string;
  slug: string;
};

export type BlogDetail = {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  image: string;
  imageAlt: string;
  category: { id: number; title: string; slug: string } | null;
  tags: Array<{ id: number; title: string; slug: string }>;
  faqs: Array<{ question: string; answer: string }>;
  date: string;
  readingTime: number;
  views: number;
  isFeatured: boolean;
  seo: {
    metaTitle: string | null;
    metaDescription: string | null;
    canonicalUrl: string | null;
    ogTitle: string | null;
    ogDescription: string | null;
    ogImage: string | null;
  } | null;
  related: BlogListCard[];
};

type ListResponse = {
  success: boolean;
  message?: string;
  data?: {
    rows: Array<Record<string, unknown>>;
    count: number;
    pageNumber: number;
    pageSize: number;
  };
};

type DetailResponse = {
  success: boolean;
  message?: string;
  data?: Record<string, unknown> & { related?: Array<Record<string, unknown>> };
};

type FiltersResponse = {
  success: boolean;
  data?: {
    categories: BlogCategoryOption[];
  };
};

function mapListCard(row: Record<string, unknown>): BlogListCard {
  const slug = String(row.slug || "");
  return {
    id: Number(row.id) || 0,
    title: String(row.title || ""),
    slug,
    excerpt: String(row.excerpt || ""),
    image: resolveImageUrl(String(row.image || "")),
    imageAlt: String(row.imageAlt || row.title || ""),
    category: String(row.category || "Blog"),
    categorySlug: row.categorySlug ? String(row.categorySlug) : null,
    date: String(row.date || ""),
    readingTime: Number(row.readingTime) || 0,
    isFeatured: Boolean(row.isFeatured),
    href: String(row.href || (slug ? `/blog/${slug}` : "/blogs")),
  };
}

export async function fetchBlogFilters(): Promise<BlogCategoryOption[]> {
  try {
    const response = (await getData(
      API_ENDPOINTS.CUSTOMER.BLOG_FILTERS,
      undefined,
      { auth: false }
    )) as FiltersResponse;
    return response?.data?.categories || [];
  } catch {
    return [];
  }
}

export async function fetchBlogs(params: {
  pageNumber?: number;
  pageSize?: number;
  search?: string;
  categorySlug?: string;
}): Promise<{ rows: BlogListCard[]; count: number; pageNumber: number; pageSize: number }> {
  const query = new URLSearchParams({
    pageNumber: String(params.pageNumber || 1),
    pageSize: String(params.pageSize || 12),
  });
  if (params.search?.trim()) query.set("search", params.search.trim());
  if (params.categorySlug?.trim()) query.set("categorySlug", params.categorySlug.trim());

  const response = (await getData(
    `${API_ENDPOINTS.CUSTOMER.BLOGS}?${query.toString()}`,
    undefined,
    { auth: false }
  )) as ListResponse;

  if (!response?.success || !response.data) {
    return { rows: [], count: 0, pageNumber: 1, pageSize: params.pageSize || 12 };
  }

  return {
    rows: (response.data.rows || []).map(mapListCard),
    count: response.data.count || 0,
    pageNumber: response.data.pageNumber || 1,
    pageSize: response.data.pageSize || 12,
  };
}

export async function fetchBlogBySlug(slug: string): Promise<BlogDetail | null> {
  try {
    const response = (await getData(
      API_ENDPOINTS.CUSTOMER.BLOG_DETAILS(slug),
      undefined,
      { auth: false }
    )) as DetailResponse;

    if (!response?.success || !response.data) return null;

    const data = response.data;
    const category = data.category as
      | { id: number; title: string; slug: string }
      | null
      | undefined;
    const tags = Array.isArray(data.tags)
      ? (data.tags as Array<{ id: number; title: string; slug: string }>)
      : [];
    const faqs = Array.isArray(data.faqs)
      ? (data.faqs as Array<{ question: string; answer: string }>)
      : [];
    const seo = (data.seo as BlogDetail["seo"]) || null;
    const related = Array.isArray(data.related)
      ? data.related.map((item) => mapListCard(item))
      : [];

    return {
      id: Number(data.id) || 0,
      title: String(data.title || ""),
      slug: String(data.slug || slug),
      excerpt: String(data.excerpt || ""),
      content: String(data.content || ""),
      image: resolveImageUrl(String(data.image || "")),
      imageAlt: String(data.imageAlt || data.title || ""),
      category: category
        ? {
            id: Number(category.id),
            title: String(category.title || ""),
            slug: String(category.slug || ""),
          }
        : null,
      tags,
      faqs,
      date: String(data.date || ""),
      readingTime: Number(data.readingTime) || 0,
      views: Number(data.views) || 0,
      isFeatured: Boolean(data.isFeatured),
      seo,
      related,
    };
  } catch {
    return null;
  }
}
