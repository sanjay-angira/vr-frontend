import { getData, postData, putData, deleteData } from "@/services/api/apiService";
import { API_ENDPOINTS } from "@/services/api/API_ENDPOINT";
import {
  appendCartIdentity,
  getCartIdentity,
  type CartIdentity,
} from "@/utils/cartIdentity";
import {
  fetchProductBySlug,
  normalizeVariants,
  type VariantPricingView,
} from "@/components/website/product/productApi";

export interface CartItemData {
  id: number;
  cartId: number;
  variationId: number;
  quantity: number;
  priceAtTime: number;
  /** List / MRP before offer (when present) */
  sellingPrice?: number | null;
  /** Offer-aware unit price (same as priceAtTime after cart pricing) */
  finalPrice?: number | null;
  totalDiscount?: number;
  appliedOffer?: {
    id: number;
    offerName: string;
    offerSlug: string;
    discountType: string;
    discountValue: number;
    sources?: string[];
  } | null;
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

/**
 * Cart lines should already include offer pricing (finalPrice = pay,
 * sellingPrice = crossed MRP). If not, reuse PDP OfferPricingService output.
 */
async function applyProductOfferPricing(cart: CartData): Promise<CartData> {
  if (!cart.items.length) return cart;

  const alreadyPriced = cart.items.every((item) => {
    const selling = Number(item.sellingPrice);
    const final = Number(item.finalPrice ?? item.priceAtTime);
    return (
      item.appliedOffer != null ||
      (Number.isFinite(selling) &&
        selling > 0 &&
        Number.isFinite(final) &&
        final > 0 &&
        selling > final)
    );
  });

  if (alreadyPriced) {
    const items = cart.items.map((item) => {
      const unit =
        Number(item.finalPrice ?? item.priceAtTime) ||
        Number(item.priceAtTime) ||
        0;
      return {
        ...item,
        priceAtTime: unit,
        finalPrice: unit,
        subtotal: unit * Number(item.quantity || 0),
      };
    });
    return {
      items,
      total: items.reduce((sum, item) => sum + Number(item.subtotal || 0), 0),
    };
  }

  const slugs = [
    ...new Set(
      cart.items
        .map((item) => item.variant?.product?.productSlug)
        .filter((slug): slug is string => Boolean(slug)),
    ),
  ];

  if (!slugs.length) return cart;

  const pricingByVariationId = new Map<number, VariantPricingView>();

  await Promise.all(
    slugs.map(async (slug) => {
      try {
        const product = await fetchProductBySlug(slug);
        if (!product?.variants?.length) return;
        const variants = normalizeVariants(
          product.variants as Parameters<typeof normalizeVariants>[0],
        );
        for (const variant of variants) {
          pricingByVariationId.set(variant.id, variant.pricing);
        }
      } catch {
        // Keep raw cart price for this product if detail fetch fails
      }
    }),
  );

  if (!pricingByVariationId.size) return cart;

  const items = cart.items.map((item) => {
    const pricing = pricingByVariationId.get(item.variationId);
    if (!pricing) return item;

    const listUnit =
      Number(pricing.sellingPrice) ||
      Number(item.priceAtTime) ||
      0;
    const unit =
      Number(pricing.finalPrice) ||
      Number(pricing.sellingPrice) ||
      Number(item.priceAtTime) ||
      0;

    return {
      ...item,
      priceAtTime: unit,
      sellingPrice: listUnit || unit,
      finalPrice: unit,
      totalDiscount: pricing.totalDiscount ?? 0,
      appliedOffer: pricing.appliedOffer,
      subtotal: unit * Number(item.quantity || 0),
    };
  });

  return {
    items,
    total: items.reduce((sum, item) => sum + Number(item.subtotal || 0), 0),
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
  const cart: CartData = {
    items: Array.isArray(response?.items) ? response.items : [],
    total: Number(response?.total) || 0,
  };
  return applyProductOfferPricing(cart);
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
