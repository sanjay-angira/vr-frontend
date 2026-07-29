"use client";

import { useEffect, useState } from "react";
import { ProductSection } from "@/components/website/sections/ProductSection";
import type { WebsiteProductCardData } from "@/components/website/cards/ProductCard";
import {
  listRecentlyViewedProducts,
  mapRecentlyViewedToCard,
} from "@/services/website/recentlyViewedService";

const HOME_LIMIT = 8;

export function RecentlyViewedSection() {
  const [products, setProducts] = useState<WebsiteProductCardData[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const rows = await listRecentlyViewedProducts(HOME_LIMIT);
        if (!cancelled) {
          setProducts(rows.map(mapRecentlyViewedToCard));
        }
      } catch {
        if (!cancelled) setProducts([]);
      } finally {
        if (!cancelled) setReady(true);
      }
    };

    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  if (!ready || products.length === 0) {
    return null;
  }

  return (
    <ProductSection
      heading={{
        eyebrow: "RECENTLY VIEWED",
        title: "Continue Shopping with Your",
        accent: "Recently Viewed Products",
        description: "Rediscover the products you've recently explored, from premium spices and groceries to pooja essentials and wellness products. Pick up where you left off and shop with ease.",
      }}
      products={products}
      viewAllLink="/recently-viewed-products"
    />
  );
}
