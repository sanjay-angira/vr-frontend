"use client";

import { useEffect, useState } from "react";
import { ShoppingCart } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/services/redux/hooks";
import { toggleCartDrawer } from "@/services/redux/slices/websiteSlices/modalSlice";

export function HeaderCart() {
  const [mounted, setMounted] = useState(false);
  const dispatch = useAppDispatch();
  const cartCount = useAppSelector((state) => state.websiteCart.items.length);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <button
      type="button"
      className="icon-button"
      style={{ position: "relative" }}
      onClick={() => dispatch(toggleCartDrawer())}
      aria-label="Open cart"
    >
      <ShoppingCart size={20} />
      {mounted && cartCount > 0 && (
        <span
          style={{
            position: "absolute",
            top: -6,
            right: -6,
            minWidth: 18,
            height: 18,
            borderRadius: 0,
            background: "#ef4444",
            color: "#ffffff",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 11,
            lineHeight: 1,
            padding: "0 5px",
          }}
        >
          {cartCount}
        </span>
      )}
    </button>
  );
}
