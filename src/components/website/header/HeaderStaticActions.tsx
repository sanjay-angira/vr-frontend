"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Heart, ShoppingCart } from "lucide-react";
import { useAppSelector } from "@/services/redux/hooks";
import { HeaderUser } from "@/components/website/header/HeaderUser";

export function HeaderStaticActions() {
  const [mounted, setMounted] = useState(false);
  const cartCount = useAppSelector((state) => state.websiteCart.count);
  const wishlistCount = useAppSelector((state) => state.wishlist.count);
  const isAuthenticated = useAppSelector(
    (state) => state.userAuth.isAuthenticated,
  );

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <>
      <Link href="/wishlist" className="icon-button" aria-label="Wishlist">
        <Heart size={20} />
        {mounted && isAuthenticated && wishlistCount > 0 ? (
          <span className="cart-count-badge">{wishlistCount}</span>
        ) : null}
      </Link>

      <Link href="/cart" className="icon-button" aria-label="Cart">
        <ShoppingCart size={20} />
        {mounted && cartCount > 0 ? (
          <span className="cart-count-badge">{cartCount}</span>
        ) : null}
      </Link>

      <HeaderUser />
    </>
  );
}
