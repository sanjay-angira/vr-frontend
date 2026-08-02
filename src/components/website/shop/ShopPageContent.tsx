"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type FormEvent,
} from "react";
import { Search, SlidersHorizontal } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { API_ENDPOINTS } from "@/services/api/API_ENDPOINT";
import { getData } from "@/services/api/apiService";
import {
  StoreFiltersSidebar,
  type StoreCategoryOption,
  type StoreFilterState,
  type StoreProductSectionOption,
} from "@/components/website/shop/StoreFiltersSidebar";
import {
  StoreProductCard,
  type StoreListProduct,
} from "@/components/website/shop/StoreProductCard";
import {
  StorePromoBanner,
  type StoreBanner,
} from "@/components/website/shop/StorePromoBanner";
import {
  buildShopQueryString,
  normalizeQueryString,
  parseShopSearchParams,
} from "@/utils/shopFilterUrl";
import { categorySlugsToExpandedIds } from "@/utils/categoryFilterHelpers";
import { notFound } from "next/navigation";
import Link from "next/link";
import type { CategoryShopInitialData } from "@/services/website/shopCatalogApi";

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

type StoreFiltersApiResponse = {
  success: boolean;
  message: string;
  data?: {
    categories: StoreCategoryOption[];
    priceRange: { min: number; max: number };
    sortOptions: Array<{ value: string; label: string }>;
    productSections?: StoreProductSectionOption[];
    banners: StoreBanner[];
  };
};

const DEFAULT_SORT_OPTIONS = [
  { value: "newest", label: "Newest" },
  { value: "price_asc", label: "Price: Low to High" },
  { value: "price_desc", label: "Price: High to Low" },
  { value: "name_asc", label: "Name: A to Z" },
  { value: "discount_desc", label: "Best Discount" },
];

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
    ...overrides,
  };
}

type ShopPageContentProps = {
  /** When set, this is a `/category/[slug]` page — same layout as store */
  categorySlug?: string;
  /** Server-fetched catalog payload (category pages) */
  initialData?: CategoryShopInitialData;
  /** Header/description rendered by the RSC category page */
  hideCategoryChrome?: boolean;
  /** Skip outer section/container when wrapped by a server page shell */
  embedded?: boolean;
};

export function ShopPageContent({
  categorySlug,
  initialData,
  hideCategoryChrome = false,
  embedded = false,
}: ShopPageContentProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const skipUrlWriteRef = useRef(true);
  const isCategoryPage = Boolean(categorySlug?.trim());
  const pathCategorySlug = categorySlug?.trim().toLowerCase() || "";

  const [products, setProducts] = useState<StoreListProduct[]>(
    () => initialData?.products || []
  );
  const [loading, setLoading] = useState(() => !initialData);
  const [loadingMore, setLoadingMore] = useState(false);
  const [filtersLoading, setFiltersLoading] = useState(() => !initialData);
  const [error, setError] = useState("");
  const [categoryMissing, setCategoryMissing] = useState(false);
  const [searchInput, setSearchInput] = useState(
    () => initialData?.search || ""
  );
  const [search, setSearch] = useState(() => initialData?.search || "");
  const [pageNumber, setPageNumber] = useState(1);
  const pageSize = 48;
  const [count, setCount] = useState(() => initialData?.count || 0);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const [categories, setCategories] = useState<StoreCategoryOption[]>(
    () => initialData?.categories || []
  );
  const [productSections, setProductSections] = useState<
    StoreProductSectionOption[]
  >(() => initialData?.productSections || []);
  const [banners, setBanners] = useState<StoreBanner[]>(
    () => initialData?.banners || []
  );
  const [sortOptions, setSortOptions] = useState(
    () => initialData?.sortOptions || DEFAULT_SORT_OPTIONS
  );
  const [priceBounds, setPriceBounds] = useState(
    () => initialData?.priceBounds || { min: 0, max: 100000 }
  );
  const [filters, setFilters] = useState<StoreFilterState>(() =>
    initialData
      ? initialData.filters
      : buildDefaultFilters({ min: 0, max: 100000 })
  );
  const [categoryDescription, setCategoryDescription] = useState(
    () => initialData?.category.description || ""
  );

  const searchParamsKey = searchParams.toString();

  const activeCategory = categories.find(
    (category) => category.slug?.trim().toLowerCase() === pathCategorySlug
  );

  const resolvedCategoryDescription = (
    categoryDescription ||
    activeCategory?.description ||
    ""
  ).trim();

  const categoryDisplay =
    activeCategory ||
    (initialData?.category
      ? {
          id: initialData.category.id,
          name: initialData.category.name,
          slug: initialData.category.slug,
          description: initialData.category.description,
        }
      : undefined);

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
      setSearchInput(parsed.search);
      setPageNumber(1);
    },
    [isCategoryPage, pathCategorySlug]
  );

  useEffect(() => {
    if (initialData) {
      setFiltersLoading(false);
      return;
    }

    let cancelled = false;

    async function loadFilters() {
      try {
        setFiltersLoading(true);
        const response = (await getData(
          API_ENDPOINTS.CUSTOMER.STORE_FILTERS,
          undefined,
          { auth: false }
        )) as StoreFiltersApiResponse;

        if (cancelled || !response?.success || !response.data) return;

        const bounds = {
          min: Number(response.data.priceRange?.min) || 0,
          max: Math.max(
            Number(response.data.priceRange?.min) || 0,
            Number(response.data.priceRange?.max) || 100000
          ),
        };

        const nextCategories = response.data.categories || [];

        if (isCategoryPage && pathCategorySlug) {
          const exists = nextCategories.some(
            (category) =>
              category.slug?.trim().toLowerCase() === pathCategorySlug
          );
          if (!exists) {
            setCategoryMissing(true);
            setCategories(nextCategories);
            setPriceBounds(bounds);
            return;
          }
        }

        setCategoryMissing(false);
        setCategories(nextCategories);
        setProductSections(response.data.productSections || []);
        setBanners(response.data.banners || []);
        setSortOptions(
          response.data.sortOptions?.length
            ? response.data.sortOptions
            : DEFAULT_SORT_OPTIONS
        );
        setPriceBounds(bounds);
        applyUrlToState(
          new URLSearchParams(searchParamsKey),
          nextCategories,
          bounds
        );
      } catch {
        // Keep defaults if filters fail
      } finally {
        if (!cancelled) setFiltersLoading(false);
      }
    }

    loadFilters();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- searchParams applied in separate effect
  }, [applyUrlToState, isCategoryPage, pathCategorySlug, initialData]);

  // Browser back/forward (and external URL changes)
  const skipFirstUrlSyncRef = useRef(Boolean(initialData));
  useEffect(() => {
    if (filtersLoading) return;
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
    filtersLoading,
    categories,
    priceBounds,
    applyUrlToState,
  ]);

  // Sync state → URL
  useEffect(() => {
    if (filtersLoading) return;
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
    filtersLoading,
    pathname,
    router,
    searchParamsKey,
    isCategoryPage,
  ]);

  useEffect(() => {
    if (!filtersLoading && categoryMissing) {
      notFound();
    }
  }, [filtersLoading, categoryMissing]);

  // Category description — skip client fetch when SSR already provided it
  useEffect(() => {
    if (!isCategoryPage || !pathCategorySlug) {
      setCategoryDescription("");
      return;
    }
    if (initialData?.category.description) {
      setCategoryDescription(initialData.category.description);
      return;
    }

    let cancelled = false;

    async function loadCategoryDescription() {
      try {
        const response = (await getData(
          API_ENDPOINTS.CUSTOMER.CATEGORIES,
          undefined,
          { auth: false }
        )) as {
          success?: boolean;
          data?: {
            rows?: Array<{ slug?: string | null; description?: string | null }>;
          };
        };

        if (cancelled || !response?.success) return;

        const match = (response.data?.rows || []).find(
          (row) => row.slug?.trim().toLowerCase() === pathCategorySlug
        );
        setCategoryDescription(String(match?.description || "").trim());
      } catch {
        if (!cancelled) setCategoryDescription("");
      }
    }

    loadCategoryDescription();
    return () => {
      cancelled = true;
    };
  }, [isCategoryPage, pathCategorySlug, initialData?.category.description]);

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
        if (filters.categoryIds.length) {
          query.set("categoryIds", filters.categoryIds.join(","));
        }
        if (filters.sectionSlugs.length) {
          query.set("sectionSlugs", filters.sectionSlugs.join(","));
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
    [pageSize, search, filters, priceBounds.min, priceBounds.max]
  );

  const skipInitialProductFetchRef = useRef(Boolean(initialData));
  useEffect(() => {
    if (filtersLoading) return;
    if (skipInitialProductFetchRef.current) {
      skipInitialProductFetchRef.current = false;
      return;
    }
    setPageNumber(1);
    fetchStoreProducts(1, false);
  }, [fetchStoreProducts, filtersLoading]);

  const hasMore = products.length < count;

  const handleLoadMore = () => {
    if (loading || loadingMore || !hasMore) return;
    const nextPage = pageNumber + 1;
    setPageNumber(nextPage);
    fetchStoreProducts(nextPage, true);
  };

  const handleSearchSubmit = (event: FormEvent) => {
    event.preventDefault();
    setPageNumber(1);
    setSearch(searchInput.trim());
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

  const handleClearFilters = () => {
    setPageNumber(1);
    setSearch("");
    setSearchInput("");
    const lockedCategoryIds =
      isCategoryPage && pathCategorySlug
        ? categorySlugsToExpandedIds([pathCategorySlug], categories)
        : [];
    setFilters(
      buildDefaultFilters(priceBounds, {
        categoryIds: lockedCategoryIds,
      })
    );
  };

  const catalogBody = (
    <>
      <style dangerouslySetInnerHTML={{ __html: STORE_GRID_STYLES }} />
      <StorePromoBanner banners={banners} />

      {!hideCategoryChrome && isCategoryPage && categoryDisplay && (
        <div className="store-catalog__category-head">
          <nav className="store-catalog__breadcrumbs" aria-label="Breadcrumb">
            <Link href="/">Home</Link>
            <span aria-hidden>›</span>
            <Link href="/products">Shop</Link>
            <span aria-hidden>›</span>
            <span className="is-current">{categoryDisplay.name}</span>
          </nav>
          <h1 className="store-catalog__category-title">
            {categoryDisplay.name}
          </h1>
        </div>
      )}

      <div className="store-catalog__layout">
        <StoreFiltersSidebar
          categories={categories}
          productSections={productSections}
          priceBounds={priceBounds}
          sortOptions={sortOptions}
          value={filters}
          onChange={handleFiltersChange}
          onClear={handleClearFilters}
          mobileOpen={mobileFiltersOpen}
          onCloseMobile={() => setMobileFiltersOpen(false)}
          hideCategories={isCategoryPage}
        />

        <div className="store-catalog__main">
          <div className="store-catalog__toolbar">
            <form
              className="store-catalog__search"
              onSubmit={handleSearchSubmit}
            >
              <Search size={18} aria-hidden />
              <input
                type="search"
                placeholder="Search products..."
                value={searchInput}
                onChange={(event) => setSearchInput(event.target.value)}
              />
              <button type="submit" className="btn btn-outline btn-sm">
                Search
              </button>
            </form>

            <button
              type="button"
              className="store-catalog__filter-btn"
              onClick={() => setMobileFiltersOpen(true)}
            >
              <SlidersHorizontal size={16} />
              Filters
            </button>

            <p className="store-catalog__count">
              {loading && products.length === 0
                ? "Loading…"
                : products.length > 0
                  ? `Showing ${products.length} of ${count}`
                  : `${count} product${count === 1 ? "" : "s"}`}
            </p>
          </div>

          {loading && products.length === 0 && (
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

          {!loading && error && products.length === 0 && (
            <p className="store-page__message store-page__message--error">
              {error}
            </p>
          )}

          {!loading && !error && products.length === 0 && (
            <p className="store-page__message">
              No products match your filters. Try clearing filters.
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
                disabled={loading || loadingMore}
              >
                {loadingMore ? "Loading…" : "Load More"}
              </button>
            </div>
          )}
        </div>
      </div>

      {!hideCategoryChrome &&
        isCategoryPage &&
        resolvedCategoryDescription.replace(/<[^>]*>/g, "").trim() && (
          <article
            className="store-catalog__category-description"
            aria-label={`${categoryDisplay?.name || "Category"} description`}
          >
            {/<[a-z][\s\S]*>/i.test(resolvedCategoryDescription) ? (
              <div
                dangerouslySetInnerHTML={{
                  __html: resolvedCategoryDescription,
                }}
              />
            ) : (
              <p>{resolvedCategoryDescription}</p>
            )}
          </article>
        )}
    </>
  );

  if (embedded) {
    return catalogBody;
  }

  return (
    <section className="store-catalog">
      <div className="container store-catalog__inner">{catalogBody}</div>
    </section>
  );
}
