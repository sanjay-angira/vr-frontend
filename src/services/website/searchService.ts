import { getData } from "@/services/api/apiService";
import { API_ENDPOINTS } from "@/services/api/API_ENDPOINT";
import { resolveImageUrl } from "@/components/admin/forms/shared/resolveImageUrl";

export type StoreSearchProduct = {
  id: number;
  name: string;
  slug: string | null;
  image: string;
  href: string;
  category: {
    id: number;
    name: string;
    slug: string | null;
    href: string;
  } | null;
};

export type StoreSearchCategory = {
  id: number;
  name: string;
  slug: string | null;
  image: string;
  href: string;
};

export type StoreSearchResult = {
  query: string;
  products: StoreSearchProduct[];
  categories: StoreSearchCategory[];
};

type StoreSearchApiResponse = {
  success?: boolean;
  data?: {
    query?: string;
    products?: Array<{
      id?: number;
      name?: string;
      slug?: string | null;
      image?: string;
      href?: string;
      category?: {
        id?: number;
        name?: string;
        slug?: string | null;
        href?: string;
      } | null;
    }>;
    categories?: Array<{
      id?: number;
      name?: string;
      slug?: string | null;
      image?: string;
      href?: string;
    }>;
  };
};

const EMPTY_RESULT: StoreSearchResult = {
  query: "",
  products: [],
  categories: [],
};

export async function searchStorefront(
  q: string,
  options?: { limit?: number; signal?: AbortSignal }
): Promise<StoreSearchResult> {
  const query = q.trim();
  if (!query) return { ...EMPTY_RESULT };

  const response = (await getData(
    API_ENDPOINTS.CUSTOMER.SEARCH,
    { q: query, limit: options?.limit ?? 8 },
    { auth: false, signal: options?.signal }
  )) as StoreSearchApiResponse;

  if (!response?.success || !response.data) {
    return { ...EMPTY_RESULT, query };
  }

  return {
    query: response.data.query || query,
    products: (response.data.products || [])
      .filter((row) => row?.id && row.name)
      .map((row) => ({
        id: Number(row.id),
        name: String(row.name),
        slug: row.slug ?? null,
        image: resolveImageUrl(row.image || ""),
        href: row.href || (row.slug ? `/product/${row.slug}` : "/products"),
        category: row.category?.id && row.category.name
          ? {
              id: Number(row.category.id),
              name: String(row.category.name),
              slug: row.category.slug ?? null,
              href:
                row.category.href ||
                (row.category.slug
                  ? `/category/${row.category.slug}`
                  : "/products"),
            }
          : null,
      })),
    categories: (response.data.categories || [])
      .filter((row) => row?.id && row.name)
      .map((row) => ({
        id: Number(row.id),
        name: String(row.name),
        slug: row.slug ?? null,
        image: resolveImageUrl(row.image || ""),
        href: row.href || (row.slug ? `/category/${row.slug}` : "/products"),
      })),
  };
}
