import type { WebsiteProductCardData } from "@/components/cards/ProductCard";
import type { StoreListProduct } from "@/types/storeProduct";

export function mapStoreListProduct(
  product: StoreListProduct
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
    discountPercentage:
      Number.isFinite(Number(product.discountPercentage)) &&
      Number(product.discountPercentage) > 0
        ? Number(product.discountPercentage)
        : undefined,
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
