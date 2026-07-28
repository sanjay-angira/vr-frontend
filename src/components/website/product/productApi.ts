import { getData } from "@/services/api/apiService";
import { API_ENDPOINTS } from "@/services/api/API_ENDPOINT";

import { normalizeVariantAttributes, type VariantAttributeView } from "./productVariantUtils";

export type { VariantAttributeView };

export type VariantPricingView = {
  sellingPrice: number | null;
  finalPrice: number | null;
  totalDiscount: number;
  appliedOffer: {
    id: number;
    offerName: string;
    offerSlug: string;
    discountType: string;
    discountValue: number;
    sources: string[];
  } | null;
  availableOffers: Array<{
    id: number;
    offerName: string;
    offerSlug: string;
    discountType: string;
    discountValue: number;
    sources: string[];
    sellingPrice: number | null;
    finalPrice: number | null;
    totalDiscount: number;
    isApplied: boolean;
  }>;
};

export type ProductVariantView = {
  id: number;
  slug?: string | null;
  name: string;
  price: number | null;
  stock: number | null;
  sku: string | null;
  description?: string | null;
  images: string[];
  variantAttributes: VariantAttributeView[];
  pricing: VariantPricingView;
};

export type ProductPageData = {
  id: number;
  productName: string;
  productSlug: string;
  shortDescription: string;
  description: string;
  brand?: { brandName?: string | null } | null;
  category?: { categoryName?: string | null } | null;
  images?: Array<{ id: number; url: string; sortOrder: number }>;
  variants?: Array<Record<string, unknown>>;
  attributes?: Array<Record<string, unknown>>;
  productAttributes?: Array<Record<string, unknown>>;
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
  attributes: Array<Record<string, unknown>> = [],
  productAttributes: Array<Record<string, unknown>> = []
) {
  const fromAttributes = attributes
    .map((attribute) => ({
      id: Number(attribute.id ?? attribute.attributeId),
      name: String(attribute.name ?? (attribute.attribute as { name?: string })?.name ?? ""),
      value: String(attribute.value ?? ""),
    }))
    .filter((attribute) => attribute.id && attribute.name && attribute.value);

  if (fromAttributes.length > 0) return fromAttributes;

  return productAttributes
    .map((item) => {
      const attribute = item.attribute as { id?: number; name?: string } | undefined;
      return {
        id: Number(attribute?.id ?? item.id),
        name: String(attribute?.name ?? ""),
        value: String(item.value ?? attribute?.name ?? "").trim(),
      };
    })
    .filter((attribute) => attribute.id && attribute.name);
}

export function normalizeVariants(
  variants: Array<{
    id: number;
    slug?: string | null;
    name: string;
    price?: string | number | null;
    stock?: string | number | null;
    sku?: string | null;
    description?: string | null;
    images?: Array<{ id: number; url: string; sortOrder: number }>;
    variantAttributes?: Array<Record<string, unknown>>;
    pricing?: Record<string, unknown>;
  }> = []
) {
  return variants.map((variant) => {
    const pricingRaw = (variant.pricing || {}) as Record<string, unknown>;
    const appliedOfferRaw = pricingRaw.appliedOffer as Record<string, unknown> | null | undefined;

    const pricing: VariantPricingView = {
      sellingPrice: toNumber(pricingRaw.sellingPrice as string | number | null),
      finalPrice: toNumber(pricingRaw.finalPrice as string | number | null),
      totalDiscount: toNumber(pricingRaw.totalDiscount as string | number | null) ?? 0,
      appliedOffer: appliedOfferRaw
        ? {
            id: Number(appliedOfferRaw.id),
            offerName: String(appliedOfferRaw.offerName),
            offerSlug: String(appliedOfferRaw.offerSlug),
            discountType: String(appliedOfferRaw.discountType),
            discountValue: Number(appliedOfferRaw.discountValue),
            sources: (appliedOfferRaw.sources as string[]) || [],
          }
        : null,
      availableOffers: ((pricingRaw.availableOffers as Array<Record<string, unknown>>) || []).map(
        (offer) => ({
          id: Number(offer.id),
          offerName: String(offer.offerName),
          offerSlug: String(offer.offerSlug),
          discountType: String(offer.discountType),
          discountValue: Number(offer.discountValue),
          sources: (offer.sources as string[]) || [],
          sellingPrice: toNumber(offer.sellingPrice as string | number | null),
          finalPrice: toNumber(offer.finalPrice as string | number | null),
          totalDiscount: toNumber(offer.totalDiscount as string | number | null) ?? 0,
          isApplied: Boolean(offer.isApplied),
        })
      ),
    };

    return {
      id: variant.id,
      slug: variant.slug || null,
      name: variant.name,
      price: toNumber(variant.price),
      stock: toNumber(variant.stock),
      sku: variant.sku || null,
      description: variant.description ? String(variant.description).trim() || null : null,
      images: (variant.images || [])
        .slice()
        .sort((a, b) => a.sortOrder - b.sortOrder)
        .map((image) => image.url)
        .filter((url): url is string => typeof url === "string" && url.trim().length > 0),
      variantAttributes: normalizeVariantAttributes(variant.variantAttributes || []),
      pricing,
    };
  });
}

export { toNumber };
