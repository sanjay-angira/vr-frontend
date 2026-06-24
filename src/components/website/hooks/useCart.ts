"use client";

import { useCallback } from "react";
import { useAppDispatch, useAppSelector } from "@/services/redux/hooks";
import {
  fetchWebsiteCart,
  addWebsiteCartItem,
  updateWebsiteCartItem,
  removeWebsiteCartItem,
  clearWebsiteCart,
  setWebsiteCartItems,
  clearWebsiteCartError,
} from "@/services/redux/slices/websiteSlices/cartSlice";

export function useCart() {
  const dispatch = useAppDispatch();
  const cart = useAppSelector((state) => state.websiteCart);

  return {
    items: cart.items,
    total: cart.total,
    count: cart.count,
    loading: cart.loading,
    error: cart.error,
    fetchCart: useCallback(() => dispatch(fetchWebsiteCart()), [dispatch]),
    addItem: useCallback(
      (variationId: number, quantity: number) =>
        dispatch(addWebsiteCartItem({ variationId, quantity })),
      [dispatch]
    ),
    updateQuantity: useCallback(
      (cartItemId: number, quantity: number) =>
        dispatch(updateWebsiteCartItem({ cartItemId, quantity })),
      [dispatch]
    ),
    removeItem: useCallback(
      (cartItemId: number) => dispatch(removeWebsiteCartItem(cartItemId)),
      [dispatch]
    ),
    clearCart: useCallback(() => dispatch(clearWebsiteCart()), [dispatch]),
    setItems: useCallback(
      (items: Parameters<typeof setWebsiteCartItems>[0]) =>
        dispatch(setWebsiteCartItems(items)),
      [dispatch]
    ),
    clearError: useCallback(
      () => dispatch(clearWebsiteCartError()),
      [dispatch]
    ),
  };
}
