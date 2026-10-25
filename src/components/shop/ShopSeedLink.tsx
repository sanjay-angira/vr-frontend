"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import {
  buildShopHref,
  type ShopFilterSeed,
} from "@/utils/shopFilterUrl";

type ShopSeedLinkProps = {
  href?: string;
  seed?: ShopFilterSeed;
  className?: string;
  children: ReactNode;
};

/** Link to /products with filter query params in the URL. */
export function ShopSeedLink({
  href,
  seed,
  className,
  children,
}: ShopSeedLinkProps) {
  const resolvedHref = seed ? buildShopHref(seed) : href || "/products";

  return (
    <Link href={resolvedHref} className={className}>
      {children}
    </Link>
  );
}
