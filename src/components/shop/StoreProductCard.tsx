"use client";

import { ProductCard } from "@/components/cards/ProductCard";
import { mapStoreListProduct } from "@/services/shopProductMapper";
import type { StoreListProduct } from "@/types/storeProduct";

export type { StoreListProduct } from "@/types/storeProduct";

type StoreProductCardProps = {
  product: StoreListProduct;
};

/** Thin adapter — always renders the shared ProductCard. */
export function StoreProductCard({ product }: StoreProductCardProps) {
  return <ProductCard product={mapStoreListProduct(product)} />;
}
