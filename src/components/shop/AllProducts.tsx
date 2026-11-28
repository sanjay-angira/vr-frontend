"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { API_ENDPOINTS } from "@/services/api/API_ENDPOINT";
import { getData } from "@/services/api/apiService";
import {
  type StoreCategoryOption,
  type StoreFilterState,
} from "@/components/shop/StoreFiltersSidebar";
import {
  StoreProductCard,
  type StoreListProduct,
} from "@/components/shop/StoreProductCard";
import { StoreSortBar } from "@/components/shop/StoreSortBar";
import { StoreMobileTools } from "@/components/shop/StoreMobileTools";
import {
  buildShopQueryString,
  normalizeQueryString,
  parseShopSearchParams,
} from "@/utils/shopFilterUrl";
import { categorySlugsToExpandedIds } from "@/utils/categoryFilterHelpers";

const STORE_GRID_STYLES = `
.store-catalog__grid {
  display: grid !important;
  grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
  gap: var(--gap-m) !important;
  width: 100% !important;
}
.store-catalog__grid > * {
  min-width: 0 !important;
  max-width: 100% !important;
  width: auto !important;
  flex: unset !important;
  height: 100% !important;
}
@media (max-width: 768px) {
  .store-catalog__grid {
    gap: var(--gap-s) !important;
  }
}
@media (min-width: 1024px) {
  .store-catalog__grid {
    grid-template-columns: repeat(3, minmax(0, 1fr)) !important;
  }
}
@media (min-width: 1280px) {
  .store-catalog__grid {
    grid-template-columns: repeat(4, minmax(0, 1fr)) !important;
  }
}
`;

type StoreProductsApiResponse = {
  success: boolean;
  message: string;
  data?: {
    rows: StoreListProduct[];
    count: number;
    pageNumber: number;
    pageSize: number;
  };
};

type CategoryApiResponse = {
  success?: boolean;
  message?: string;
  data?: {
    id: number;
    name?: string | null;
    categoryName?: string | null;
    slug?: string | null;
    categorySlug?: string | null;
    description?: string | null;
    shortDescription?: string | null;
    image?: string | null;
    desktopImage?: string | null;
    bannerImage?: string | null;
    parentId?: number | null;
    parent?: { id?: number | null } | null;
  };
};

const DEFAULT_SORT_OPTIONS = [
  { value: "newest", label: "Newest" },
  { value: "price_asc", label: "Price: Low to High" },
  { value: "price_desc", label: "Price: High to Low" },
  { value: "name_asc", label: "Name: A to Z" },
  { value: "discount_desc", label: "Best Discount" },
];

const DEFAULT_PRICE_BOUNDS = { min: 0, max: 100000 };

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

type ShopPageContentProps = {
  slug?: string;
};

export function AllProducts({
  slug,
}: ShopPageContentProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const searchParamsKey = searchParams.toString();
  const initialUrlState = parseShopSearchParams(
    new URLSearchParams(searchParamsKey)
  );
  const skipUrlWriteRef = useRef(true);
  const isCategoryPage = Boolean(slug?.trim());
  const pathCategorySlug = slug?.trim().toLowerCase() || "";

  const [products, setProducts] = useState<StoreListProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState(initialUrlState.search);
  const [pageNumber, setPageNumber] = useState(1);
  const pageSize = 48;
  const [count, setCount] = useState(0);

  const [categories, setCategories] = useState<StoreCategoryOption[]>(
    []
  );
  const sortOptions = DEFAULT_SORT_OPTIONS;
  const priceBounds = DEFAULT_PRICE_BOUNDS;
  const [filters, setFilters] = useState<StoreFilterState>(() =>
    buildDefaultFilters(priceBounds, {
      ...initialUrlState.filters,
      minPrice: initialUrlState.minPrice ?? priceBounds.min,
      maxPrice: initialUrlState.maxPrice ?? priceBounds.max,
    })
  );
  const [loadedCategorySlug, setLoadedCategorySlug] = useState("");

  const categoryReady =
    !isCategoryPage || loadedCategorySlug === pathCategorySlug;
  const catalogLoading = loading || (!categoryReady && !error);

  const applyUrlToState = useCallback(
    (
      params: URLSearchParams,
      nextCategories: StoreCategoryOption[],
      bounds: { min: number; max: number }
    ) => {
      const parsed = parseShopSearchParams(params, nextCategories);

      const pathCategoryIds =
        pathCategorySlug && nextCategories.length
          ? categorySlugsToExpandedIds([pathCategorySlug], nextCategories)
          : [];

      const nextFilters = buildDefaultFilters(bounds, {
        ...parsed.filters,
        categoryIds: isCategoryPage
          ? pathCategoryIds
          : parsed.filters.categoryIds,
        minPrice:
          parsed.minPrice != null
            ? Math.max(bounds.min, parsed.minPrice)
            : bounds.min,
        maxPrice:
          parsed.maxPrice != null
            ? Math.min(bounds.max, parsed.maxPrice)
            : bounds.max,
      });

      skipUrlWriteRef.current = true;
      setFilters(nextFilters);
      setSearch(parsed.search);
      setPageNumber(1);
    },
    [isCategoryPage, pathCategorySlug]
  );

  useEffect(() => {
    if (!pathCategorySlug) return;
    let cancelled = false;

    async function loadCategory() {
      try {
        const response = (await getData(
          API_ENDPOINTS.CUSTOMER.CATEGORY_BY_SLUG(pathCategorySlug),
          undefined,
          { auth: false }
        )) as CategoryApiResponse;

        if (cancelled) return;
        const category = response?.data;
        const categorySlug = category?.slug || category?.categorySlug;
        if (!response?.success || !category?.id || !categorySlug) {
          setError(
            response?.message ||
              "The category response did not include a valid slug."
          );
          setLoading(false);
          return;
        }

        const option: StoreCategoryOption = {
          id: category.id,
          name: category.name || category.categoryName || "",
          slug: categorySlug,
          parentId: category.parentId ?? category.parent?.id ?? null,
          description:
            category.description || category.shortDescription || "",
          image: category.image || category.desktopImage || null,
        };
        setCategories([option]);
        setFilters((current) => ({
          ...current,
          categoryIds: [category.id],
        }));
        setLoadedCategorySlug(pathCategorySlug);
        setError("");
      } catch (err: unknown) {
        if (cancelled) return;
        const message =
          err && typeof err === "object" && "message" in err
            ? String((err as { message: string }).message)
            : "Unable to load this category.";
        setError(message);
        setLoading(false);
      } finally {
        if (!cancelled) setPageNumber(1);
      }
    }

    void loadCategory();
    return () => {
      cancelled = true;
    };
  }, [pathCategorySlug]);

  // Browser back/forward (and external URL changes)
  const skipFirstUrlSyncRef = useRef(true);
  useEffect(() => {
    if (!categoryReady) return;
    if (skipFirstUrlSyncRef.current) {
      skipFirstUrlSyncRef.current = false;
      return;
    }
    applyUrlToState(
      new URLSearchParams(searchParamsKey),
      categories,
      priceBounds
    );
  }, [
    searchParamsKey,
    categoryReady,
    categories,
    priceBounds,
    applyUrlToState,
  ]);

  // Sync state → URL
  useEffect(() => {
    if (!categoryReady) return;
    if (skipUrlWriteRef.current) {
      skipUrlWriteRef.current = false;
      return;
    }

    const nextQuery = buildShopQueryString({
      filters,
      search,
      pageNumber: 1,
      priceBounds,
      categories,
      omitCategory: isCategoryPage,
    });
    const currentQuery = normalizeQueryString(searchParamsKey);
    const normalizedNext = normalizeQueryString(nextQuery);

    if (normalizedNext === currentQuery) return;

    const href = normalizedNext ? `${pathname}?${normalizedNext}` : pathname;
    router.replace(href, { scroll: false });
  }, [
    filters,
    search,
    priceBounds,
    categories,
    categoryReady,
    pathname,
    router,
    searchParamsKey,
    isCategoryPage,
  ]);

  const fetchStoreProducts = useCallback(
    async (page: number, append: boolean) => {
      try {
        if (append) {
          setLoadingMore(true);
        } else {
          setLoading(true);
        }
        setError("");

        const query = new URLSearchParams({
          pageNumber: String(page),
          pageSize: String(pageSize),
          sortBy: filters.sortBy || "newest",
        });

        const priceFilterActive =
          filters.minPrice > priceBounds.min ||
          filters.maxPrice < priceBounds.max;
        if (priceFilterActive) {
          query.set("minPrice", String(filters.minPrice));
          query.set("maxPrice", String(filters.maxPrice));
        }

        if (search.trim()) query.set("search", search.trim());
        const categoryIds = isCategoryPage
          ? categoryReady
            ? filters.categoryIds
            : []
          : parseShopSearchParams(
              new URLSearchParams(searchParamsKey),
              categories
            ).filters.categoryIds;
        if (categoryIds.length) {
          query.set("categoryIds", categoryIds.join(","));
        }
        if (filters.sectionSlugs.length) {
          query.set("sectionSlugs", filters.sectionSlugs.join(","));
        }
        if (filters.minRating) {
          query.set("minRating", String(filters.minRating));
        }
        if (filters.minDiscount) {
          query.set("minDiscount", String(filters.minDiscount));
        }

        const response = (await getData(
          `${API_ENDPOINTS.CUSTOMER.STORE_PRODUCTS}?${query.toString()}`,
          undefined,
          { auth: false }
        )) as StoreProductsApiResponse;

        if (!response?.success || !response.data) {
          if (!append) {
            setProducts([]);
            setCount(0);
          }
          setError(response?.message || "Failed to load store products.");
          return;
        }

        const rows = response.data.rows || [];
        setCount(response.data.count || 0);
        setProducts((prev) => (append ? [...prev, ...rows] : rows));
      } catch (err: unknown) {
        if (!append) {
          setProducts([]);
          setCount(0);
        }
        const message =
          err && typeof err === "object" && "message" in err
            ? String((err as { message: string }).message)
            : "Unable to fetch products. Please try again.";
        setError(message);
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [
      pageSize,
      search,
      filters,
      priceBounds.min,
      priceBounds.max,
      isCategoryPage,
      categoryReady,
      searchParamsKey,
      categories,
    ]
  );

  useEffect(() => {
    if (!categoryReady) return;
    let cancelled = false;
    void Promise.resolve().then(() => {
      if (!cancelled) {
        void fetchStoreProducts(1, false);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [categoryReady, fetchStoreProducts]);

  const hasMore = products.length < count;

  const handleLoadMore = () => {
    if (loading || loadingMore || !hasMore) return;
    const nextPage = pageNumber + 1;
    setPageNumber(nextPage);
    fetchStoreProducts(nextPage, true);
  };

  const handleFiltersChange = (next: StoreFilterState) => {
    setPageNumber(1);
    if (isCategoryPage && pathCategorySlug) {
      setFilters({
        ...next,
        categoryIds: categorySlugsToExpandedIds(
          [pathCategorySlug],
          categories
        ),
      });
      return;
    }
    setFilters(next);
  };

  const catalogBody = (
    <>
      <style dangerouslySetInnerHTML={{ __html: STORE_GRID_STYLES }} />

      <div className="store-catalog__layout">
        <div className="store-catalog__main">
          <StoreMobileTools
            sortOptions={sortOptions}
            sortBy={filters.sortBy || "newest"}
            onSortChange={(sortBy) =>
              handleFiltersChange({ ...filters, sortBy })
            }
          />

          <StoreSortBar
            options={sortOptions}
            value={filters.sortBy || "newest"}
            onChange={(sortBy) =>
              handleFiltersChange({ ...filters, sortBy })
            }
          />

          {catalogLoading && products.length === 0 && (
            <div className="store-catalog__grid" aria-busy="true">
              {Array.from({ length: 8 }).map((_, index) => (
                <div className="store-skeleton-card" key={`skeleton-${index}`}>
                  <div className="store-skeleton-image store-skeleton-shimmer" />
                  <div className="store-skeleton-content">
                    <div className="store-skeleton-line store-skeleton-shimmer" />
                    <div className="store-skeleton-line store-skeleton-shimmer medium" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {!catalogLoading && error && products.length === 0 && (
            <p className="store-page__message store-page__message--error">
              {error}
            </p>
          )}

          {!catalogLoading && !error && products.length === 0 && (
            <p className="store-page__message">
              No products found.
            </p>
          )}

          {products.length > 0 && (
            <div className="store-catalog__grid">
              {products.map((item) => (
                <StoreProductCard
                  key={`${item.productId}-${item.variantId}`}
                  product={item}
                />
              ))}
            </div>
          )}

          {hasMore && products.length > 0 && (
            <div className="store-page__load-more">
              <button
                type="button"
                className="btn btn-outline"
                onClick={handleLoadMore}
                disabled={catalogLoading || loadingMore}
              >
                {loadingMore ? "Loading…" : "Load More"}
              </button>
            </div>
          )}
        </div>
      </div>

    </>
  );

  if (isCategoryPage) {
    return catalogBody;
  }

  return (
    <section className="store-catalog">
      <div className="container store-catalog__inner">{catalogBody}</div>
    </section>
  );
}
