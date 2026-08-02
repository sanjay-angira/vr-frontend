"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ProductCard,
  type WebsiteProductCardData,
} from "@/components/website/cards/ProductCard";
import { SectionHeading } from "@/components/website/shared/SectionHeading";
import { ProductGridSkeleton } from "@/components/website/shared/ProductGridSkeleton";
import {
  listRecentlyViewedProducts,
  mapRecentlyViewedToCard,
} from "@/services/website/recentlyViewedService";

export function RecentlyViewedPageContent() {
  const [products, setProducts] = useState<WebsiteProductCardData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      try {
        const rows = await listRecentlyViewedProducts(40);
        if (!cancelled) {
          setProducts(rows.map(mapRecentlyViewedToCard));
        }
      } catch {
        if (!cancelled) setProducts([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <section className="section home-section home-product-section">
      <div className="container">
        <SectionHeading
          title="Recently Viewed"
          accent="Products"
          description="Take a quick look at your recent favorites"
        />

        {loading ? (
          <ProductGridSkeleton count={8} />
        ) : products.length === 0 ? (
          <div className="home-empty">
            <p className="home-empty__message">
              You have not viewed any products yet.
            </p>
            <Link href="/products" className="btn btn-primary btn-lg">
              Browse products
            </Link>
          </div>
        ) : (
          <div className="home-product-grid">
            {products.map((product, index) => (
              <ProductCard
                key={`recently-viewed-${product.slug || "product"}-${product.id}-${index}`}
                product={product}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
