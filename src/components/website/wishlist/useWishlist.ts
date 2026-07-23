"use client";

import { useCallback, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/services/redux/hooks";
import {
  clearWishlist,
  fetchWishlistIds,
  toggleWishlistItem,
} from "@/services/redux/slices/websiteSlices/wishlistSlice";
import { setAuthModalOpen } from "@/services/redux/slices/websiteSlices/modalSlice";
import { toast } from "react-toastify";

/** Hydrates wishlist ids when the user is authenticated; clears on logout. */
export function WishlistHydrator() {
  const dispatch = useAppDispatch();
  const isAuthenticated = useAppSelector(
    (state) => state.userAuth.isAuthenticated,
  );

  useEffect(() => {
    if (isAuthenticated) {
      void dispatch(fetchWishlistIds());
    } else {
      dispatch(clearWishlist());
    }
  }, [dispatch, isAuthenticated]);

  return null;
}

export function useWishlist() {
  const dispatch = useAppDispatch();
  const isAuthenticated = useAppSelector(
    (state) => state.userAuth.isAuthenticated,
  );
  const variationIds = useAppSelector((state) => state.wishlist.variationIds);
  const count = useAppSelector((state) => state.wishlist.count);
  const loading = useAppSelector((state) => state.wishlist.loading);
  const mutating = useAppSelector((state) => state.wishlist.mutating);

  const isWished = useCallback(
    (variationId: number | null | undefined) => {
      const id = Number(variationId);
      if (!Number.isFinite(id) || id <= 0) return false;
      return variationIds.includes(id);
    },
    [variationIds],
  );

  const toggle = useCallback(
    async (variationId: number | null | undefined) => {
      const id = Number(variationId);
      if (!Number.isFinite(id) || id <= 0) return null;

      if (!isAuthenticated) {
        dispatch(setAuthModalOpen(true));
        return null;
      }

      try {
        const result = await dispatch(toggleWishlistItem(id)).unwrap();
        toast.success(
          result.wished ? "Added to wishlist" : "Removed from wishlist",
        );
        return result;
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "Failed to update wishlist",
        );
        return null;
      }
    },
    [dispatch, isAuthenticated],
  );

  return {
    isAuthenticated,
    variationIds,
    count,
    loading,
    mutating,
    isWished,
    toggle,
  };
}
