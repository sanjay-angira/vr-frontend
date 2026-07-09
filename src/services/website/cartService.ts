
// src/services/api/cartService.ts

import { getData, postData, putData, deleteData } from '@/services/api/apiService';
import { API_ENDPOINTS } from '@/services/api/API_ENDPOINT';
import { getSessionId } from '@/utils/sessionId';

export interface CartItemData {
  id: number;
  cartId: number;
  variationId: number;
  quantity: number;
  priceAtTime: number;
  attributesSnapshot?: Record<string, any>;
  subtotal?: number;
  productName?: string;
  image?: string;
  variantName?: string;
}

export interface CartData {
  items: CartItemData[];
  total: number;
}

export interface AddToCartRequest {
  variationId: number;
  quantity: number;
  sessionId?: string;
}

export interface UpdateCartRequest {
  cartItemId: number;
  quantity: number;
  sessionId?: string;
}

/**
 * Get the authorization header for cart requests
 * Includes sessionId for guest users
 */
function getCartHeaders() {
  const headers: Record<string, string> = {};
  const token = localStorage.getItem('access_token') || sessionStorage.getItem('access_token');
  
  if (!token) {
    // Guest user - include sessionId
    const sessionId = getSessionId();
    headers['X-Session-Id'] = sessionId;
  }
  
  return headers;
}

/**
 * Add item to cart
 */
export async function addToCart(variationId: number, quantity: number) {
  try {
    const payload: AddToCartRequest = {
      variationId,
      quantity,
    };

    // Include sessionId for guest users
    const token = localStorage.getItem('access_token') || sessionStorage.getItem('access_token');
    if (!token) {
      payload.sessionId = getSessionId();
    }

    const response = await postData(API_ENDPOINTS.CUSTOMER.ADD_CART, payload);
    return response;
  } catch (error) {
    return Promise.reject(error);
  }
}

/**
 * Add or update item in cart
 * If item already exists, it updates the quantity (replaces old count)
 * If item doesn't exist, it adds it as new
 */
export async function addOrUpdateCartItem(variationId: number, quantity: number) {
  try {
    // First, get current cart to check if item exists
    const cartData = await getCart();
    
    // Find if this variation already exists in cart
    const existingItem = cartData.items?.find((item) => item.variationId === variationId);
    
    if (existingItem) {
      // Item exists - update quantity to new quantity (replace old count)
      return await updateCartItem(existingItem.id, quantity);
    } else {
      // Item doesn't exist - add as new
      return await addToCart(variationId, quantity);
    }
  } catch (error) {
    return Promise.reject(error);
  }
}

/**
 * Get cart items
 */
export async function getCart() {
  try {
    const token = localStorage.getItem('access_token') || sessionStorage.getItem('access_token');
    let url = API_ENDPOINTS.CUSTOMER.GET_CART;
    
    if (!token) {
      // Guest user - include sessionId as query param
      const sessionId = getSessionId();
      url = API_ENDPOINTS.CUSTOMER.GET_CART + `?sessionId=${sessionId}`;
    }

    const response = await getData(url);
    return response as CartData;
  } catch (error) {
    return Promise.reject(error);
  }
}

/**
 * Update cart item quantity
 */
export async function updateCartItem(cartItemId: number, quantity: number) {
  try {
    const payload: UpdateCartRequest = {
      cartItemId,
      quantity,
    };

    // Include sessionId for guest users
    const token = localStorage.getItem('access_token') || sessionStorage.getItem('access_token');
    if (!token) {
      payload.sessionId = getSessionId();
    }

    const response = await putData(API_ENDPOINTS.CUSTOMER.UPDATE_CART, payload);
    return response;
  } catch (error) {
    return Promise.reject(error);
  }
}

/**
 * Remove item from cart
 */
export async function removeFromCart(cartItemId: number) {
  try {
    const token = localStorage.getItem('access_token') || sessionStorage.getItem('access_token');
    let url = API_ENDPOINTS.CUSTOMER.REMOVE_CART(cartItemId.toString());
    
    if (!token) {
      // Guest user - include sessionId as query param
      const sessionId = getSessionId();
      url = `${url}?sessionId=${sessionId}`;
    }

    const response = await deleteData(url);
    return response;
  } catch (error) {
    return Promise.reject(error);
  }
}

/**
 * Clear entire cart
 */
export async function clearCart() {
  try {
    const token = localStorage.getItem('access_token') || sessionStorage.getItem('access_token');
    let url = API_ENDPOINTS.CUSTOMER.CLEAR_CART;
    
    if (!token) {
      // Guest user - include sessionId as query param
      const sessionId = getSessionId();
      url = API_ENDPOINTS.CUSTOMER.CLEAR_CART + `?sessionId=${sessionId}`;
    }

    const response = await deleteData(url);
    return response;
  } catch (error) {
    return Promise.reject(error);
  }
}

/**
 * Get cart count
 */
export async function getCartCount() {
  try {
    const token = localStorage.getItem('access_token') || sessionStorage.getItem('access_token');
    let url = API_ENDPOINTS.CUSTOMER.CART_COUNT;
    
    if (!token) {
      // Guest user - include sessionId as query param
      const sessionId = getSessionId();
      url = API_ENDPOINTS.CUSTOMER.CART_COUNT + `?sessionId=${sessionId}` ;
    }

    const response = await getData(url);
    return response;
  } catch (error) {
    return Promise.reject(error);
  }
}
