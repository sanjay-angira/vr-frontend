import { getApiBaseUrl } from "@/lib/site";
import type {
  StoreCategoryOption,
  StoreFilterState,
  StoreProductSectionOption,
} from "@/components/website/shop/StoreFiltersSidebar";
import type { StoreListProduct } from "@/components/website/shop/StoreProductCard";
import { categorySlugsToExpandedIds } from "@/utils/categoryFilterHelpers";
import { parseShopSearchParams } from "@/utils/shopFilterUrl";

const PAGE_SIZE = 48;

export type ShopCategoryInfo = {
  id: number;
  name: string;
  slug: string;
  description: string;
  image?: string | null;
};

export type CategoryShopInitialData = {
  category: ShopCategoryInfo;
  categories: StoreCategoryOption[];
  productSections: StoreProductSectionOption[];
  sortOptions: Array<{ value: string; label: string }>;
  priceBounds: { min: number; max: number };
  filters: StoreFilterState;
  search: string;
  products: StoreListProduct[];
  count: number;
};

type StoreFiltersResponse = {
  success?: boolean;
  data?: {
    categories?: StoreCategoryOption[];
    priceRange?: { min: number; max: number };
    sortOptions?: Array<{ value: string; label: string }>;
    productSections?: StoreProductSectionOption[];
  };
};

type CategoriesResponse = {
  success?: boolean;
  data?: {
    rows?: Array<{
      id: number;
      name: string;
      slug?: string | null;
      description?: string | null;
      image?: string | null;
    }>;
  };
};

type ProductsResponse = {
  success?: boolean;
  data?: {
    rows?: StoreListProduct[];
    count?: number;
  };
};

const DEFAULT_SORT_OPTIONS = [
  { value: "newest", label: "Newest" },
  { value: "price_asc", label: "Price: Low to High" },
  { value: "price_desc", label: "Price: High to Low" },
  { value: "name_asc", label: "Name: A to Z" },
  { value: "discount_desc", label: "Best Discount" },
];

async function apiGet<T>(path: string, query?: URLSearchParams): Promise<T | null> {
  const base = getApiBaseUrl();
  const url = query?.toString()
    ? `${base}/${path}?${query.toString()}`
    : `${base}/${path}`;

  try {
    const res = await fetch(url, {
      next: { revalidate: 60 },
      headers: { Accept: "application/json" },
    });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

function buildDefaultFilters(
  bounds: { min: number; max: number },
  overrides: Partial<StoreFilterState> = {}
): StoreFilterState {
  return {
    minPrice: bounds.min,
    maxPrice: bounds.max,
    sortBy: "newest",
    categoryIds: [],
    sectionSlugs: [],
    minRating: null,
    minDiscount: null,
    ...overrides,
  };
}

function toSearchParams(
  input?: Record<string, string | string[] | undefined>
): URLSearchParams {
  const params = new URLSearchParams();
  if (!input) return params;
  for (const [key, value] of Object.entries(input)) {
    if (value == null) continue;
    if (Array.isArray(value)) {
      if (value[0]) params.set(key, value[0]);
    } else if (value) {
      params.set(key, value);
    }
  }
  return params;
}

/** Server-side load for `/category/[slug]` — filters, products, description. */
export async function fetchCategoryShopPage(
  slug: string,
  searchParamsInput?: Record<string, string | string[] | undefined>
): Promise<CategoryShopInitialData | null> {
  const pathSlug = slug.trim().toLowerCase();
  if (!pathSlug) return null;

  const urlParams = toSearchParams(searchParamsInput);

  const [filtersRes, categoriesRes] = await Promise.all([
    apiGet<StoreFiltersResponse>("customer/store-filters"),
    apiGet<CategoriesResponse>("customer/categories"),
  ]);

  const filterCategories = filtersRes?.data?.categories || [];
  const categoryRows = categoriesRes?.data?.rows || [];

  const filterMatch = filterCategories.find(
    (category) => category.slug?.trim().toLowerCase() === pathSlug
  );
  const listMatch = categoryRows.find(
    (row) => row.slug?.trim().toLowerCase() === pathSlug
  );

  if (!filterMatch && !listMatch) return null;

  const category: ShopCategoryInfo = {
    id: filterMatch?.id ?? listMatch!.id,
    name: filterMatch?.name || listMatch!.name,
    slug: pathSlug,
    description: String(
      listMatch?.description || filterMatch?.description || ""
    ).trim(),
    image: filterMatch?.image ?? listMatch?.image ?? null,
  };

  const bounds = {
    min: Number(filtersRes?.data?.priceRange?.min) || 0,
    max: Math.max(
      Number(filtersRes?.data?.priceRange?.min) || 0,
      Number(filtersRes?.data?.priceRange?.max) || 100000
    ),
  };

  const parsed = parseShopSearchParams(urlParams, filterCategories);
  const lockedCategoryIds = categorySlugsToExpandedIds(
    [pathSlug],
    filterCategories
  );

  const filters = buildDefaultFilters(bounds, {
    ...parsed.filters,
    categoryIds: lockedCategoryIds,
    minPrice:
      parsed.minPrice != null
        ? Math.max(bounds.min, parsed.minPrice)
        : bounds.min,
    maxPrice:
      parsed.maxPrice != null
        ? Math.min(bounds.max, parsed.maxPrice)
        : bounds.max,
  });

  const productQuery = new URLSearchParams({
    pageNumber: "1",
    pageSize: String(PAGE_SIZE),
    sortBy: filters.sortBy || "newest",
  });

  const priceActive =
    filters.minPrice > bounds.min || filters.maxPrice < bounds.max;
  if (priceActive) {
    productQuery.set("minPrice", String(filters.minPrice));
    productQuery.set("maxPrice", String(filters.maxPrice));
  }
  if (parsed.search.trim()) productQuery.set("search", parsed.search.trim());
  if (filters.categoryIds.length) {
    productQuery.set("categoryIds", filters.categoryIds.join(","));
  }
  if (filters.sectionSlugs.length) {
    productQuery.set("sectionSlugs", filters.sectionSlugs.join(","));
  }
  if (filters.minRating) {
    productQuery.set("minRating", String(filters.minRating));
  }
  if (filters.minDiscount) {
    productQuery.set("minDiscount", String(filters.minDiscount));
  }

  const productsRes = await apiGet<ProductsResponse>(
    "customer/all-products",
    productQuery
  );

  return {
    category,
    categories: filterCategories,
    productSections: filtersRes?.data?.productSections || [],
    sortOptions: filtersRes?.data?.sortOptions?.length
      ? filtersRes.data.sortOptions
      : DEFAULT_SORT_OPTIONS,
    priceBounds: bounds,
    filters,
    search: parsed.search,
    products: productsRes?.data?.rows || [],
    count: productsRes?.data?.count || 0,
  };
}

export { PAGE_SIZE as CATEGORY_SHOP_PAGE_SIZE };
