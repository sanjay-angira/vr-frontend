"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type FormEvent,
} from "react";
import { Search, SlidersHorizontal } from "lucide-react";
import { API_ENDPOINTS } from "@/services/api/API_ENDPOINT";
import { getData } from "@/services/api/apiService";
import {
  StoreFiltersSidebar,
  type StoreCategoryOption,
  type StoreFilterState,
} from "@/components/website/shop/StoreFiltersSidebar";
import {
  StoreProductCard,
  type StoreListProduct,
} from "@/components/website/shop/StoreProductCard";
import {
  StorePromoBanner,
  type StoreBanner,
} from "@/components/website/shop/StorePromoBanner";

const STORE_GRID_STYLES = `
.store-catalog__grid {
  display: grid !important;
  grid-template-columns: repeat(4, minmax(0, 1fr)) !important;
  gap: 1rem !important;
  width: 100% !important;
}
.store-catalog__grid > * {
  min-width: 0 !important;
  max-width: 100% !important;
  width: auto !important;
  flex: unset !important;
}
@media (max-width: 900px) {
  .store-catalog__grid {
    grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
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

function buildDefaultFilters(bounds: { min: number; max: number }): StoreFilterState {
  return {
    minPrice: bounds.min,
    maxPrice: bounds.max,
    sortBy: "newest",
    newArrivals: false,
    featured: false,
    bestDeals: false,
    categoryIds: [],
  };
}

export function ShopPageContent() {
  const [products, setProducts] = useState<StoreListProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtersLoading, setFiltersLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [pageNumber, setPageNumber] = useState(1);
  const pageSize = 48;
  const [count, setCount] = useState(0);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const [categories, setCategories] = useState<StoreCategoryOption[]>([]);
  const [banners, setBanners] = useState<StoreBanner[]>([]);
  const [sortOptions, setSortOptions] = useState(DEFAULT_SORT_OPTIONS);
  const [priceBounds, setPriceBounds] = useState({ min: 0, max: 100000 });
  const [filters, setFilters] = useState<StoreFilterState>(
    buildDefaultFilters({ min: 0, max: 100000 })
  );

  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(count / pageSize)),
    [count, pageSize]
  );

  useEffect(() => {
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

        setCategories(response.data.categories || []);
        setBanners(response.data.banners || []);
        setSortOptions(
          response.data.sortOptions?.length
            ? response.data.sortOptions
            : DEFAULT_SORT_OPTIONS
        );
        setPriceBounds(bounds);
        setFilters(buildDefaultFilters(bounds));
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
  }, []);

  const fetchStoreProducts = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const query = new URLSearchParams({
        pageNumber: String(pageNumber),
        pageSize: String(pageSize),
        sortBy: filters.sortBy || "newest",
      });

      // Only send price bounds when the user narrowed the default range
      const priceFilterActive =
        filters.minPrice > priceBounds.min || filters.maxPrice < priceBounds.max;
      if (priceFilterActive) {
        query.set("minPrice", String(filters.minPrice));
        query.set("maxPrice", String(filters.maxPrice));
      }

      if (search.trim()) query.set("search", search.trim());
      if (filters.categoryIds.length) {
        query.set("categoryIds", filters.categoryIds.join(","));
      }
      if (filters.newArrivals) query.set("newArrivals", "true");
      if (filters.featured) query.set("featured", "true");
      if (filters.bestDeals) query.set("bestDeals", "true");

      const response = (await getData(
        `${API_ENDPOINTS.CUSTOMER.STORE_PRODUCTS}?${query.toString()}`,
        undefined,
        { auth: false }
      )) as StoreProductsApiResponse;

      if (!response?.success || !response.data) {
        setProducts([]);
        setCount(0);
        setError(response?.message || "Failed to load store products.");
        return;
      }

      setProducts(response.data.rows || []);
      setCount(response.data.count || 0);
    } catch (err: unknown) {
      setProducts([]);
      setCount(0);
      const message =
        err && typeof err === "object" && "message" in err
          ? String((err as { message: string }).message)
          : "Unable to fetch products. Please try again.";
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [pageNumber, pageSize, search, filters, priceBounds.min, priceBounds.max]);

  useEffect(() => {
    if (filtersLoading) return;
    fetchStoreProducts();
  }, [fetchStoreProducts, filtersLoading]);

  const handleSearchSubmit = (event: FormEvent) => {
    event.preventDefault();
    setPageNumber(1);
    setSearch(searchInput.trim());
  };

  const handleFiltersChange = (next: StoreFilterState) => {
    setPageNumber(1);
    setFilters(next);
  };

  const handleClearFilters = () => {
    setPageNumber(1);
    setSearch("");
    setSearchInput("");
    setFilters(buildDefaultFilters(priceBounds));
  };

  return (
    <section className="store-catalog">
      <style dangerouslySetInnerHTML={{ __html: STORE_GRID_STYLES }} />
      <div className="container store-catalog__inner">
        <StorePromoBanner banners={banners} />

        <div className="store-catalog__layout">
          <StoreFiltersSidebar
            categories={categories}
            priceBounds={priceBounds}
            sortOptions={sortOptions}
            value={filters}
            onChange={handleFiltersChange}
            onClear={handleClearFilters}
            mobileOpen={mobileFiltersOpen}
            onCloseMobile={() => setMobileFiltersOpen(false)}
          />

          <div className="store-catalog__main">
            <div className="store-catalog__toolbar">
              <form className="store-catalog__search" onSubmit={handleSearchSubmit}>
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
                {loading ? "Loading…" : `${count} product${count === 1 ? "" : "s"}`}
              </p>
            </div>

            {loading && (
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

            {!loading && error && (
              <p className="store-page__message store-page__message--error">{error}</p>
            )}

            {!loading && !error && products.length === 0 && (
              <p className="store-page__message">
                No products match your filters. Try clearing filters.
              </p>
            )}

            {!loading && !error && products.length > 0 && (
              <div className="store-catalog__grid">
                {products.map((item) => (
                  <StoreProductCard
                    key={`${item.productId}-${item.variantId}`}
                    product={item}
                  />
                ))}
              </div>
            )}

            <div className="store-page__pagination">
              <p className="store-page__pagination-meta">
                Page {pageNumber} of {totalPages}
              </p>
              <div className="store-page__pagination-actions">
                <button
                  type="button"
                  className="btn btn-outline btn-sm"
                  onClick={() => setPageNumber((prev) => Math.max(1, prev - 1))}
                  disabled={pageNumber <= 1 || loading}
                >
                  Previous
                </button>
                <button
                  type="button"
                  className="btn btn-outline btn-sm"
                  onClick={() =>
                    setPageNumber((prev) => Math.min(totalPages, prev + 1))
                  }
                  disabled={pageNumber >= totalPages || loading}
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
