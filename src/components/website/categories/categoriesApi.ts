import { resolveImageUrl } from "@/components/admin/forms/shared/resolveImageUrl";
import type { Category } from "@/components/website/cards/CategoryCard";
import { API_ENDPOINTS } from "@/services/api/API_ENDPOINT";
import { getData } from "@/services/api/apiService";

type CategoriesApiResponse = {
  success: boolean;
  message?: string;
  data?: {
    rows: Array<{
      id: number;
      name: string;
      slug: string | null;
      description?: string;
      image?: string | null;
      mobileImage?: string | null;
      productCount?: number;
      parentId?: number | null;
      href?: string;
    }>;
    count: number;
  };
};

export async function fetchAllCategories(): Promise<Category[]> {
  try {
    const response = (await getData(
      API_ENDPOINTS.CUSTOMER.CATEGORIES,
      undefined,
      { auth: false }
    )) as CategoriesApiResponse;

    if (!response?.success || !response.data) {
      return [];
    }

    return (response.data.rows || []).map((row) => ({
      id: row.id,
      name: row.name,
      slug: row.slug || undefined,
      description: row.description || "",
      image: resolveImageUrl(row.image || ""),
      mobileImage: resolveImageUrl(row.mobileImage || ""),
      productCount: Number(row.productCount) || 0,
      href: row.slug
        ? `/category/${encodeURIComponent(row.slug)}`
        : "/products",
    }));
  } catch {
    return [];
  }
}

export type HeaderParentCategory = {
  id: number;
  name: string;
  slug: string;
  href: string;
};

export async function fetchParentCategories(): Promise<HeaderParentCategory[]> {
  try {
    const response = (await getData(
      API_ENDPOINTS.CUSTOMER.CATEGORIES,
      undefined,
      { auth: false }
    )) as CategoriesApiResponse;

    if (!response?.success || !response.data) {
      return [];
    }

    return (response.data.rows || [])
      .filter((row) => row.parentId == null)
      .filter((row) => Boolean((row.name || "").trim()))
      .map((row) => {
        const slug = (row.slug || "").trim();
        return {
          id: row.id,
          name: row.name.trim(),
          slug,
          href: slug
            ? `/category/${encodeURIComponent(slug)}`
            : "/products",
        };
      });
  } catch {
    return [];
  }
}
