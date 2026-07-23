import { deleteData, getData, postData } from "@/services/api/apiService";
import { API_ENDPOINTS } from "@/services/api/API_ENDPOINT";
import { getCartIdentity } from "@/utils/cartIdentity";

export type WishlistItem = {
  id: number;
  userId: number;
  variationId: number;
  productId: number | null;
  productName: string;
  productSlug: string | null;
  variantName: string | null;
  image: string | null;
  sellingPrice: number | null;
  finalPrice: number;
  totalDiscount?: number;
  stock: number;
  inStock: boolean;
  createdAt?: string;
  updatedAt?: string;
};

export type WishlistToggleResult = {
  wished: boolean;
  variationId: number;
  id: number | null;
};

type ApiEnvelope<T> = {
  success?: boolean;
  message?: string;
  data?: T;
};

function requireUserId() {
  const userId = getCartIdentity().userId;
  if (!userId) {
    throw new Error("Please log in to manage wishlist");
  }
  return userId;
}

export async function listWishlistItems(): Promise<WishlistItem[]> {
  const userId = requireUserId();
  const response = (await getData(API_ENDPOINTS.CUSTOMER.WISHLIST, {
    userId,
  })) as ApiEnvelope<WishlistItem[]>;

  if (response?.success === false) {
    throw new Error(response.message || "Failed to load wishlist");
  }

  return Array.isArray(response?.data) ? response.data : [];
}

export async function listWishlistVariationIds(): Promise<number[]> {
  const userId = requireUserId();
  const response = (await getData(API_ENDPOINTS.CUSTOMER.WISHLIST_IDS, {
    userId,
  })) as ApiEnvelope<number[]>;

  if (response?.success === false) {
    throw new Error(response.message || "Failed to load wishlist");
  }

  return Array.isArray(response?.data)
    ? response.data.map((id) => Number(id)).filter((id) => Number.isFinite(id))
    : [];
}

export async function getWishlistCount(): Promise<number> {
  const userId = requireUserId();
  const response = (await getData(API_ENDPOINTS.CUSTOMER.WISHLIST_COUNT, {
    userId,
  })) as ApiEnvelope<{ count: number }>;

  if (response?.success === false) {
    throw new Error(response.message || "Failed to load wishlist count");
  }

  return Number(response?.data?.count) || 0;
}

export async function addToWishlist(
  variationId: number,
): Promise<WishlistItem> {
  const userId = requireUserId();
  const response = (await postData(API_ENDPOINTS.CUSTOMER.WISHLIST, {
    userId,
    variationId,
  })) as ApiEnvelope<WishlistItem>;

  if (response?.success === false || !response?.data) {
    throw new Error(response?.message || "Failed to add to wishlist");
  }

  return response.data;
}

export async function toggleWishlist(
  variationId: number,
): Promise<WishlistToggleResult> {
  const userId = requireUserId();
  const response = (await postData(API_ENDPOINTS.CUSTOMER.WISHLIST_TOGGLE, {
    userId,
    variationId,
  })) as ApiEnvelope<WishlistToggleResult>;

  if (response?.success === false || !response?.data) {
    throw new Error(response?.message || "Failed to update wishlist");
  }

  return response.data;
}

export async function removeWishlistItem(id: number): Promise<void> {
  const userId = requireUserId();
  const response = (await deleteData(
    `${API_ENDPOINTS.CUSTOMER.WISHLIST_BY_ID(id)}?userId=${userId}`,
  )) as ApiEnvelope<{ id: number; variationId: number }>;

  if (response?.success === false) {
    throw new Error(response.message || "Failed to remove from wishlist");
  }
}

export async function removeWishlistByVariation(
  variationId: number,
): Promise<void> {
  const userId = requireUserId();
  const response = (await deleteData(
    `${API_ENDPOINTS.CUSTOMER.WISHLIST_BY_VARIATION(variationId)}?userId=${userId}`,
  )) as ApiEnvelope<{ id: number; variationId: number }>;

  if (response?.success === false) {
    throw new Error(response.message || "Failed to remove from wishlist");
  }
}
