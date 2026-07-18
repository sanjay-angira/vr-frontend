import { getData, postData, putData, deleteData } from "@/services/api/apiService";
import { API_ENDPOINTS } from "@/services/api/API_ENDPOINT";
import {
  appendCartIdentity,
  getCartIdentity,
  type CartIdentity,
} from "@/utils/cartIdentity";

export interface CartItemData {
  id: number;
  cartId: number;
  variationId: number;
  quantity: number;
  priceAtTime: number;
  attributesSnapshot?: Record<string, unknown>;
  subtotal?: number;
  productName?: string;
  image?: string | null;
  variantName?: string | null;
  variant?: {
    id: number;
    name?: string | null;
    price?: number;
    stock?: number;
    sku?: string | null;
    product?: {
      id: number;
      productName?: string;
      productSlug?: string | null;
    } | null;
  } | null;
}

export interface CartData {
  items: CartItemData[];
  total: number;
}

function withIdentity<T extends Record<string, unknown>>(
  payload: T,
  identity: CartIdentity = getCartIdentity()
): T & CartIdentity {
  return {
    ...payload,
    ...(identity.userId != null ? { userId: identity.userId } : {}),
    ...(identity.sessionId ? { sessionId: identity.sessionId } : {}),
  };
}

export async function addToCart(variationId: number, quantity: number) {
  const payload = withIdentity({ variationId, quantity });
  return postData(API_ENDPOINTS.CUSTOMER.ADD_CART, payload);
}

export async function addOrUpdateCartItem(
  variationId: number,
  quantity: number
) {
  const cartData = await getCart();
  const existingItem = cartData.items?.find(
    (item) => item.variationId === variationId
  );

  if (existingItem) {
    return updateCartItem(existingItem.id, quantity);
  }

  return addToCart(variationId, quantity);
}

export async function getCart(): Promise<CartData> {
  const url = appendCartIdentity(API_ENDPOINTS.CUSTOMER.GET_CART);
  const response = await getData(url);
  return {
    items: Array.isArray(response?.items) ? response.items : [],
    total: Number(response?.total) || 0,
  };
}

export async function updateCartItem(cartItemId: number, quantity: number) {
  const payload = withIdentity({ cartItemId, quantity });
  return putData(API_ENDPOINTS.CUSTOMER.UPDATE_CART, payload);
}

export async function removeFromCart(cartItemId: number) {
  const url = appendCartIdentity(
    API_ENDPOINTS.CUSTOMER.REMOVE_CART(cartItemId.toString())
  );
  return deleteData(url);
}

export async function clearCart() {
  const url = appendCartIdentity(API_ENDPOINTS.CUSTOMER.CLEAR_CART);
  return deleteData(url);
}

export async function getCartCount(): Promise<{ count: number }> {
  const url = appendCartIdentity(API_ENDPOINTS.CUSTOMER.CART_COUNT);
  const response = await getData(url);
  return { count: Number(response?.count) || 0 };
}
