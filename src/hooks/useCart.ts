// src/hooks/useCart.ts

'use client';

import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/services/redux/store';
import {
  fetchCart,
  addItemToCart,
  updateItemQuantity,
  removeItemFromCart,
  clearCartAction,
  setCartItems,
  clearError,
} from '@/services/redux/slices/cartSlice';
import { AppDispatch } from '@/services/redux/store';

/**
 * Custom hook for cart operations
 * Handles cart state and API calls with Redux Thunk
 */
export function useCart() {
  const dispatch = useDispatch<AppDispatch>();
  const cart = useSelector((state: RootState) => state.cart);

  return {
    // Cart state
    items: cart.items,
    total: cart.total,
    count: cart.count,
    loading: cart.loading,
    error: cart.error,

    // Cart actions
    fetchCart: () => dispatch(fetchCart()),
    addItem: (variationId: number, quantity: number) =>
      dispatch(addItemToCart({ variationId, quantity })),
    updateQuantity: (cartItemId: number, quantity: number) =>
      dispatch(updateItemQuantity({ cartItemId, quantity })),
    removeItem: (cartItemId: number) =>
      dispatch(removeItemFromCart(cartItemId)),
    clearCart: () => dispatch(clearCartAction()),
    setItems: (items: any[]) => dispatch(setCartItems(items)),
    clearError: () => dispatch(clearError()),
  };
}
