import type { StoreFilterState } from "@/components/website/shop/StoreFiltersSidebar";
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

  return {
    filters: {
      categoryIds,
      sectionSlugs,
      sortBy,
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
};

/** Build query string for the shop page (omits defaults). */
export function buildShopQueryString({
  filters,
  search,
  pageNumber,
  priceBounds,
  categories,
}: BuildShopQueryArgs): string {
  const params = new URLSearchParams();

  const categorySlugs = categoryIdsToTopLevelSlugs(
    filters.categoryIds,
    categories
  );
  if (categorySlugs.length) {
    params.set("category", categorySlugs.join(","));
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

  if (search.trim()) {
    params.set("search", search.trim());
  }
  if (pageNumber > 1) {
    params.set("page", String(pageNumber));
  }

  return params.toString();
}

/** Build `/products?...` href from a filter seed (for links). */
export function buildShopHref(seed?: ShopFilterSeed): string {
  if (!seed) return "/products";

  const params = new URLSearchParams();

  if (seed.categorySlugs?.length) {
    params.set(
      "category",
      seed.categorySlugs
        .map((slug) => slug.trim().toLowerCase())
        .filter(Boolean)
        .join(",")
    );
  } else if (seed.categoryIds?.length) {
    // Fallback only when slug is unavailable (prefer updating callers to use slugs)
    params.set("categoryIds", seed.categoryIds.join(","));
  }

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

  const qs = params.toString();
  return qs ? `/products?${qs}` : "/products";
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
