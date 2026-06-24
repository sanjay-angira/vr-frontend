"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { API_ENDPOINTS } from "@/services/api/API_ENDPOINT";
import { getData } from "@/services/api/apiService";
import { ProductCard } from "@/components/website/cards/ProductCard";

type StoreProduct = {
  id: number;
  productId: number;
  variantId: number;
  productSlug: string;
  productName: string;
  baseProductName: string;
  variantName: string;
  stock: number;
  image: string | null;
  originalPrice: number;
  finalPrice: number;
  discountAmount: number;
  category?: {
    categoryName: string;
  } | null;
};

type StoreProductsApiResponse = {
  success: boolean;
  message: string;
  data?: {
    rows: StoreProduct[];
    count: number;
    pageNumber: number;
    pageSize: number;
  };
};

export function ShopPageContent() {
  const skeletonCards = Array.from({ length: 8 });
  const [products, setProducts] = useState<StoreProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [pageNumber, setPageNumber] = useState(1);
  const pageSize = 20;
  const [count, setCount] = useState(0);

  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(count / pageSize)),
    [count, pageSize]
  );

  const fetchStoreProducts = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const query = new URLSearchParams({
        pageNumber: String(pageNumber),
        pageSize: String(pageSize),
      });

      if (search.trim()) {
        query.set("search", search.trim());
      }

      const response = (await getData(
        `${API_ENDPOINTS.CUSTOMER.STORE_PRODUCTS}?${query.toString()}`
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
  }, [pageNumber, pageSize, search]);

  useEffect(() => {
    fetchStoreProducts();
  }, [fetchStoreProducts]);

  useEffect(() => {
    setPageNumber(1);
  }, [search]);

  return (
    <section className="products-section">
      <div className="container">
        <div className="section-header">
          <h1 className="section-title">Shop</h1>
          <p className="section-subtitle">
            Explore our latest products and best offers.
          </p>
        </div>

        <div
          style={{
            display: "flex",
            gap: "0.75rem",
            flexWrap: "wrap",
            marginBottom: "1rem",
            alignItems: "center",
          }}
        >
          <input
            type="text"
            placeholder="Search by product or variant name..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            style={{
              flex: "1 1 280px",
              maxWidth: "420px",
              border: "1px solid #e8e1d8",
              borderRadius: "8px",
              padding: "0.6rem 0.8rem",
              outline: "none",
            }}
          />
          <button
            type="button"
            className="btn btn-outline btn-sm"
            onClick={fetchStoreProducts}
          >
            Refresh
          </button>
        </div>

        {loading && (
          <div className="products-grid" style={{ marginBottom: "1rem" }}>
            {skeletonCards.map((_, index) => (
              <div className="store-skeleton-card" key={`skeleton-${index}`}>
                <div className="store-skeleton-image store-skeleton-shimmer" />
                <div className="store-skeleton-content">
                  <div className="store-skeleton-line store-skeleton-shimmer short" />
                  <div className="store-skeleton-line store-skeleton-shimmer" />
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && error && (
          <p style={{ marginBottom: "1rem", color: "#dc2626" }}>{error}</p>
        )}

        {!loading && !error && products.length === 0 && (
          <p style={{ marginBottom: "1rem", color: "#6b4e36" }}>
            No products found.
          </p>
        )}

        <div className="products-grid">
          {products.map((item) => (
            <ProductCard
              key={item.variantId}
              href={
                item.productSlug ? `/products/${item.productSlug}` : undefined
              }
              product={{
                id: String(item.variantId),
                name: item.productName,
                description: item.variantName || item.baseProductName || "",
                price: Number(item.finalPrice || 0),
                originalPrice:
                  Number(item.discountAmount || 0) > 0
                    ? Number(item.originalPrice || 0)
                    : undefined,
                image: item.image || "/next.svg",
                category: item.category?.categoryName || "Store",
                rating: 5,
                reviewCount: 0,
                inStock: Number(item.stock) > 0,
              }}
            />
          ))}
        </div>

        <div
          style={{
            marginTop: "1.25rem",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "0.75rem",
            flexWrap: "wrap",
          }}
        >
          <p style={{ color: "#6b4e36", margin: 0 }}>
            Showing page {pageNumber} of {totalPages} ({count} products)
          </p>
          <div style={{ display: "flex", gap: "0.5rem" }}>
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
    </section>
  );
}
