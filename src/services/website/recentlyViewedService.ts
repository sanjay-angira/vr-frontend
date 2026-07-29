import { getData, postData } from "@/services/api/apiService";
import { API_ENDPOINTS } from "@/services/api/API_ENDPOINT";
import { getCartIdentity } from "@/utils/cartIdentity";
import type { WebsiteProductCardData } from "@/components/website/cards/ProductCard";
import { resolveImageUrl } from "@/components/admin/forms/shared/resolveImageUrl";

export type RecentlyViewedProduct = {
  id: string;
  productId?: number;
  slug: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  image: string;
  category: string;
  rating: number;
  reviewCount: number;
  inStock: boolean;
};

type ApiEnvelope<T> = {
  success?: boolean;
  message?: string;
  data?: T;
};

type ListPayload = {
  products: RecentlyViewedProduct[];
  count: number;
};

function identityParams() {
  const { userId, sessionId } = getCartIdentity();
  return {
    ...(userId != null ? { userId } : {}),
    ...(sessionId ? { sessionId } : {}),
  };
}

export function mapRecentlyViewedToCard(
  product: RecentlyViewedProduct,
): WebsiteProductCardData {
  return {
    id: String(product.id),
    slug: product.slug,
    name: product.name,
    description: product.description || "",
    price: Number(product.price) || 0,
    originalPrice:
      product.originalPrice && product.originalPrice > product.price
        ? product.originalPrice
        : undefined,
    image: resolveImageUrl(product.image),
    category: product.category || "",
    rating: Number(product.rating) || 0,
    reviewCount: Number(product.reviewCount) || 0,
    inStock: Boolean(product.inStock),
  };
}

export async function trackRecentlyViewedProduct(
  productId: number,
): Promise<void> {
  if (!productId || !Number.isFinite(productId)) return;

  const identity = getCartIdentity();
  if (!identity.userId && !identity.sessionId) return;

  try {
    await postData(
      API_ENDPOINTS.CUSTOMER.RECENTLY_VIEWED,
      {
        ...identity,
        productIds: [productId],
      },
      { auth: false },
    );
  } catch {
    // Tracking should never block PDP
  }
}

export async function listRecentlyViewedProducts(
  limit = 20,
): Promise<RecentlyViewedProduct[]> {
  const params = { ...identityParams(), limit };
  if (!params.userId && !params.sessionId) return [];

  const response = (await getData(
    API_ENDPOINTS.CUSTOMER.RECENTLY_VIEWED,
    params,
    { auth: false },
  )) as ApiEnvelope<ListPayload>;

  if (response?.success === false) {
    throw new Error(response.message || "Failed to load recently viewed");
  }

  const products = Array.isArray(response?.data?.products)
    ? response.data.products
    : [];

  // Guard against duplicate cards (same variant/product) from the API.
  const seen = new Set<string>();
  return products.filter((product) => {
    const key = String(product.productId ?? product.id);
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}
