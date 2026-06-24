import { API_BASE_URL } from "@/services/api/config";

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

  try {
    const res = await fetch(`${API_BASE_URL}/customer/products/${safeSlug}`, {
      cache: "no-store",
      signal: AbortSignal.timeout(15000),
    });

    if (!res.ok) return null;

    const json = await res.json();
    if (json.success && json.data) {
      return json.data as ProductPageData;
    }
  } catch {
    return null;
  }

  return null;
}

export function normalizeAttributes(
  attributes: Array<{
    id: number;
    value: string;
    attribute?: {
      id: number;
      name?: string;
      type?: string;
      isRequired?: boolean;
      isFilterable?: boolean;
    } | null;
  }> = []
) {
  return attributes
    .filter((attribute) => attribute.attribute?.name && attribute.value)
    .map((attribute) => ({
      id: attribute.id,
      name: attribute.attribute?.name || "Attribute",
      type: attribute.attribute?.type,
      value: attribute.value,
      isRequired: attribute.attribute?.isRequired,
      isFilterable: attribute.attribute?.isFilterable,
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
    attributes?: Array<{
      id: number;
      value: string;
      attribute?: { id?: number; name?: string; type?: string } | null;
    }>;
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
          type: String(variant.appliedOffer.type),
          discountValue: Number(variant.appliedOffer.discountValue),
        }
      : null,
    offerPrices: (variant.offerPrices || []).map((offerPrice) => ({
      offerId: Number(offerPrice.offerId),
      offerName: String(offerPrice.offerName),
      offerSlug: String(offerPrice.offerSlug),
      type: String(offerPrice.type),
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
    attributes: (variant.attributes || [])
      .filter((attribute) => attribute.attribute?.name && attribute.value)
      .map((attribute) => ({
        attributeId: attribute.attribute?.id || attribute.id,
        name: attribute.attribute?.name || "Option",
        type: attribute.attribute?.type,
        value: attribute.value,
      })),
  }));
}

export { toNumber };
