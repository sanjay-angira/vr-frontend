import type { StoreFilterState } from "@/components/website/shop/StoreFiltersSidebar";

/** Shared by URL parsing (server) and the shop sidebar (client). */
export const DISCOUNT_FILTER_OPTIONS = [50, 40, 30, 20, 10] as const;
import {
  categoryIdsToTopLevelSlugs,
  categorySlugsToExpandedIds,
  expandCategorySelection,
  type FlatCategoryOption,
} from "@/utils/categoryFilterHelpers";

export type ShopUrlState = {
  filters: Partial<StoreFilterState> & {
    categoryIds: number[];
    sectionSlugs: string[];
    sortBy: string;
    minRating: number | null;
    minDiscount: number | null;
  };
  search: string;
  pageNumber: number;
  minPrice?: number;
  maxPrice?: number;
};

export type ShopFilterSeed = {
  /** Preferred: category slugs for the URL */
  categorySlugs?: string[];
  /** Legacy fallback — prefer categorySlugs when available */
  categoryIds?: number[];
  sectionSlugs?: string[];
  sortBy?: string;
  search?: string;
  page?: number;
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  minDiscount?: number;
};

function parseNumberList(raw: string | null): number[] {
  if (!raw?.trim()) return [];
  return raw
    .split(",")
    .map((id) => Number(id.trim()))
    .filter((id) => Number.isFinite(id) && id > 0);
}

function parseSlugList(raw: string | null): string[] {
  if (!raw?.trim()) return [];
  return raw
    .split(",")
    .map((slug) => slug.trim().toLowerCase())
    .filter(Boolean);
}

/** Read shop filters from URL search params. */
export function parseShopSearchParams(
  searchParams: URLSearchParams,
  categories: FlatCategoryOption[] = []
): ShopUrlState {
  const sectionSlugs = parseSlugList(
    searchParams.get("sectionSlugs") ||
      searchParams.get("section") ||
      searchParams.get("sectionSlug")
  );

  const categorySlugs = parseSlugList(
    searchParams.get("category") ||
      searchParams.get("categorySlugs") ||
      searchParams.get("categories")
  );

  let categoryIds: number[] = [];
  if (categorySlugs.length && categories.length) {
    categoryIds = categorySlugsToExpandedIds(categorySlugs, categories);
  } else {
    // Legacy support for old ?categoryIds= links
    const rawCategoryIds = parseNumberList(searchParams.get("categoryIds"));
    categoryIds = categories.length
      ? expandCategorySelection(rawCategoryIds, categories)
      : rawCategoryIds;
  }

  const sortBy =
    (searchParams.get("sortBy") || searchParams.get("sort") || "newest").trim() ||
    "newest";

  const search = (searchParams.get("search") || "").trim();

  const pageRaw = Number(
    searchParams.get("page") || searchParams.get("pageNumber") || 1
  );
  const pageNumber =
    Number.isFinite(pageRaw) && pageRaw > 0 ? Math.floor(pageRaw) : 1;

  const minPriceRaw = searchParams.get("minPrice");
  const maxPriceRaw = searchParams.get("maxPrice");
  const minPrice =
    minPriceRaw != null && minPriceRaw !== ""
      ? Number(minPriceRaw)
      : undefined;
  const maxPrice =
    maxPriceRaw != null && maxPriceRaw !== ""
      ? Number(maxPriceRaw)
      : undefined;

  const minRatingRaw = Number(searchParams.get("minRating"));
  const minRating =
    Number.isFinite(minRatingRaw) && minRatingRaw >= 1 && minRatingRaw <= 5
      ? Math.floor(minRatingRaw)
      : null;

  const minDiscountRaw = Number(searchParams.get("minDiscount"));
  const minDiscount = (DISCOUNT_FILTER_OPTIONS as readonly number[]).includes(
    minDiscountRaw
  )
    ? minDiscountRaw
    : null;

  return {
    filters: {
      categoryIds,
      sectionSlugs,
      sortBy,
      minRating,
      minDiscount,
    },
    search,
    pageNumber,
    minPrice:
      minPrice != null && Number.isFinite(minPrice) ? minPrice : undefined,
    maxPrice:
      maxPrice != null && Number.isFinite(maxPrice) ? maxPrice : undefined,
  };
}

type BuildShopQueryArgs = {
  filters: StoreFilterState;
  search: string;
  pageNumber: number;
  priceBounds: { min: number; max: number };
  categories: FlatCategoryOption[];
  /** When true, category lives in the path (`/category/[slug]`) — omit from query */
  omitCategory?: boolean;
};

/** Build query string for the shop page (omits defaults). */
export function buildShopQueryString({
  filters,
  search,
  pageNumber,
  priceBounds,
  categories,
  omitCategory = false,
}: BuildShopQueryArgs): string {
  const params = new URLSearchParams();

  if (!omitCategory) {
    const categorySlugs = categoryIdsToTopLevelSlugs(
      filters.categoryIds,
      categories
    );
    if (categorySlugs.length) {
      params.set("category", categorySlugs.join(","));
    }
  }

  if (filters.sectionSlugs.length) {
    params.set("sectionSlugs", filters.sectionSlugs.join(","));
  }
  if (filters.sortBy && filters.sortBy !== "newest") {
    params.set("sortBy", filters.sortBy);
  }

  const priceActive =
    filters.minPrice > priceBounds.min || filters.maxPrice < priceBounds.max;
  if (priceActive) {
    params.set("minPrice", String(filters.minPrice));
    params.set("maxPrice", String(filters.maxPrice));
  }

  if (filters.minRating) {
    params.set("minRating", String(filters.minRating));
  }

  if (filters.minDiscount) {
    params.set("minDiscount", String(filters.minDiscount));
  }

  if (search.trim()) {
    params.set("search", search.trim());
  }
  if (pageNumber > 1) {
    params.set("page", String(pageNumber));
  }

  return params.toString();
}

/**
 * Build shop href from a filter seed.
 * Single category → `/category/{slug}` (tid-web style).
 * Multi / no category → `/products?...`
 */
export function buildShopHref(seed?: ShopFilterSeed): string {
  if (!seed) return "/products";

  const categorySlugs = (seed.categorySlugs || [])
    .map((slug) => slug.trim().toLowerCase())
    .filter(Boolean);

  const params = new URLSearchParams();

  if (seed.sectionSlugs?.length) {
    params.set("sectionSlugs", seed.sectionSlugs.join(","));
  }
  if (seed.sortBy && seed.sortBy !== "newest") {
    params.set("sortBy", seed.sortBy);
  }
  if (seed.search?.trim()) {
    params.set("search", seed.search.trim());
  }
  if (seed.page && seed.page > 1) {
    params.set("page", String(seed.page));
  }
  if (seed.minPrice != null && Number.isFinite(seed.minPrice)) {
    params.set("minPrice", String(seed.minPrice));
  }
  if (seed.maxPrice != null && Number.isFinite(seed.maxPrice)) {
    params.set("maxPrice", String(seed.maxPrice));
  }
  if (seed.minRating != null && Number.isFinite(seed.minRating) && seed.minRating >= 1) {
    params.set("minRating", String(Math.floor(seed.minRating)));
  }
  if (seed.minDiscount != null && Number.isFinite(seed.minDiscount) && seed.minDiscount > 0) {
    params.set("minDiscount", String(Math.floor(seed.minDiscount)));
  }

  const qs = params.toString();

  // Dedicated category page (same layout as store)
  if (categorySlugs.length === 1 && !seed.categoryIds?.length) {
    return qs
      ? `/category/${encodeURIComponent(categorySlugs[0])}?${qs}`
      : `/category/${encodeURIComponent(categorySlugs[0])}`;
  }

  if (categorySlugs.length) {
    params.set("category", categorySlugs.join(","));
  } else if (seed.categoryIds?.length) {
    params.set("categoryIds", seed.categoryIds.join(","));
  }

  const fullQs = params.toString();
  return fullQs ? `/products?${fullQs}` : "/products";
}

/** Normalize query strings for equality checks (order-independent). */
export function normalizeQueryString(qs: string): string {
  const params = new URLSearchParams(qs.startsWith("?") ? qs.slice(1) : qs);
  const keys = Array.from(params.keys()).sort();
  const normalized = new URLSearchParams();
  for (const key of keys) {
    const values = params.getAll(key);
    for (const value of values) normalized.append(key, value);
  }
  return normalized.toString();
}
