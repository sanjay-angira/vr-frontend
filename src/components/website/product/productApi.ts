import { getData } from "@/services/api/apiService";
import { API_ENDPOINTS } from "@/services/api/API_ENDPOINT";

export type ProductPageData = {
  id: number;
  productName: string;
  productSlug: string;
  selectedVariantId?: number | null;
  shortDescription: string;
  description: string;
  productType?: string;
  brand?: { brandName?: string | null } | null;
  category?: { categoryName?: string | null } | null;
  images?: Array<{ id: number; url: string; sortOrder: number }>;
  variants?: Array<Record<string, unknown>>;
  attributes?: Array<Record<string, unknown>>;
  faqs?: Array<{ id: number; question: string; answer: string; sortOrder?: number }>;
  reviews?: Array<{
    id: number;
    userName?: string | null;
    rating?: string | number | null;
    comment?: string | null;
    createdAt?: string;
  }>;
  frequentlyBoughtTogether?: Array<{
    id: number;
    productName: string;
    shortDescription?: string | null;
    image?: string | null;
    price?: number | null;
    inStock?: boolean;
  }>;
  activeOffers?: Array<Record<string, unknown>>;
};

function toNumber(value: string | number | null | undefined): number | null {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : null;
  }
  if (typeof value === "string") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

export async function fetchProductBySlug(
  slug: string
): Promise<ProductPageData | null> {
  const safeSlug = encodeURIComponent(slug);
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);

  try {
    const json = await getData(
      API_ENDPOINTS.CUSTOMER.PRODUCT_DETAILS(safeSlug),
      undefined,
      { auth: false, signal: controller.signal }
    );

    if (json?.success && json?.data) {
      return json.data as ProductPageData;
    }
  } catch {
    return null;
  } finally {
    clearTimeout(timeout);
  }

  return null;
}

export function normalizeAttributes(
  attributes: Array<{ id: number; name: string; value: string }> = []
) {
  return attributes
    .filter((attribute) => attribute.name && attribute.value)
    .map((attribute) => ({
      id: attribute.id,
      name: attribute.name,
      value: attribute.value,
    }));
}

export function normalizeVariants(
  variants: Array<{
    id: number;
    slug?: string | null;
    name: string;
    price?: string | number | null;
    originalPrice?: string | number | null;
    finalPrice?: string | number | null;
    discountAmount?: string | number | null;
    discountPercentage?: string | number | null;
    appliedOffer?: Record<string, unknown> | null;
    offerPrices?: Array<Record<string, unknown>>;
    stock?: string | number | null;
    sku?: string | null;
    images?: Array<{ id: number; url: string; sortOrder: number }>;
  }> = []
) {
  return variants.map((variant) => ({
    id: variant.id,
    slug: variant.slug || null,
    name: variant.name,
    price: toNumber(variant.price),
    originalPrice: toNumber(variant.originalPrice ?? variant.price),
    finalPrice: toNumber(variant.finalPrice ?? variant.price),
    discountAmount: toNumber(variant.discountAmount) ?? 0,
    discountPercentage: toNumber(variant.discountPercentage) ?? 0,
    appliedOffer: variant.appliedOffer
      ? {
          id: Number(variant.appliedOffer.id),
          offerName: String(variant.appliedOffer.offerName),
          offerSlug: String(variant.appliedOffer.offerSlug),
          discountType: String(variant.appliedOffer.discountType ?? variant.appliedOffer.type),
          discountValue: Number(variant.appliedOffer.discountValue),
        }
      : null,
    offerPrices: (variant.offerPrices || []).map((offerPrice) => ({
      offerId: Number(offerPrice.offerId),
      offerName: String(offerPrice.offerName),
      offerSlug: String(offerPrice.offerSlug),
      discountType: String(offerPrice.discountType ?? offerPrice.type),
      discountValue: Number(offerPrice.discountValue),
      originalPrice: toNumber(offerPrice.originalPrice as string | number | null),
      finalPrice: toNumber(offerPrice.finalPrice as string | number | null),
      discountAmount: toNumber(offerPrice.discountAmount as string | number | null) ?? 0,
      discountPercentage:
        toNumber(offerPrice.discountPercentage as string | number | null) ?? 0,
      sources: (offerPrice.sources as string[]) || [],
    })),
    stock: toNumber(variant.stock),
    sku: variant.sku || null,
    images: (variant.images || [])
      .slice()
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map((image) => image.url),
  }));
}

export { toNumber };
