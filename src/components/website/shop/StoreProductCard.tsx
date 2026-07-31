"use client";

import {
  ProductCard,
  type WebsiteProductCardData,
} from "@/components/website/cards/ProductCard";

/** Store / products listing API shape — mapped into the shared ProductCard. */
export type StoreListProduct = {
  id: number;
  productId: number;
  variantId: number;
  productSlug: string | null;
  productName: string;
  image: string | null;
  originalPrice: number | null;
  finalPrice: number | null;
  discountPercentage?: number;
  rating?: number;
  inStock?: boolean;
  stock?: number;
  isNew?: boolean;
  categoryName?: string | null;
  reviewCount?: number;
};

type StoreProductCardProps = {
  product: StoreListProduct;
};

export function mapStoreListProduct(
  product: StoreListProduct,
): WebsiteProductCardData {
  const finalPrice = Number(product.finalPrice || 0);
  const originalPrice = Number(product.originalPrice || 0);

  return {
    id: String(product.variantId),
    name: product.productName,
    description: "",
    price: finalPrice,
    originalPrice:
      originalPrice > finalPrice && finalPrice > 0 ? originalPrice : undefined,
    image: product.image || "",
    category: product.categoryName?.trim() || "",
    rating: Number(product.rating || 0),
    reviewCount: Number(product.reviewCount || 0),
    inStock:
      product.inStock ??
      (typeof product.stock === "number" ? product.stock > 0 : true),
    isNew: Boolean(product.isNew),
    slug: product.productSlug || undefined,
  };
}

/** Thin adapter — always renders the shared ProductCard. */
export function StoreProductCard({ product }: StoreProductCardProps) {
  return <ProductCard product={mapStoreListProduct(product)} />;
}
