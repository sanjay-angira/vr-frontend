"use client";

import { useEffect, useState } from "react";
import { ProductSection } from "@/components/sections/ProductSection";
import type { WebsiteProductCardData } from "@/components/cards/ProductCard";
import {
  listRecentlyViewedProducts,
  mapRecentlyViewedToCard,
} from "@/services/recentlyViewedService";
import type { SectionHeadingProps } from "@/components/shared/SectionHeading";

const HOME_LIMIT = 8;

export function RecentlyViewedSection({
  heading,
  viewAllLabel,
}: {
  heading?: SectionHeadingProps;
  viewAllLabel?: string;
}) {
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
      heading={
        heading ?? {
          eyebrow: "✦ CONTINUE SHOPPING ✦",
          title: "Recently Viewed",
          accent: "Products",
          description:
            "Pick up where you left off and continue exploring your favorite products.",
        }
      }
      products={products}
      viewAllLink="/recently-viewed-products"
      viewAllLabel={viewAllLabel || "View All Recently Viewed Products"}
    />
  );
}
