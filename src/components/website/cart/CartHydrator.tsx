"use client";

import { useEffect } from "react";
import { useAppDispatch } from "@/services/redux/hooks";
import { fetchWebsiteCart } from "@/services/redux/slices/websiteSlices/cartSlice";

/** Hydrates cart count/items once the website shell mounts. */
export function CartHydrator() {
  const dispatch = useAppDispatch();

  useEffect(() => {
    void dispatch(fetchWebsiteCart());
  }, [dispatch]);

  return null;
}
