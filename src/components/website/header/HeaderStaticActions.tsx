"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Heart, Search, ShoppingCart } from "lucide-react";
import type { HeaderSettingsData } from "@/types/header";
import { useAppSelector } from "@/services/redux/hooks";
import { HeaderUser } from "@/components/website/header/HeaderUser";

type HeaderStaticActionsProps = {
  settings: HeaderSettingsData;
};

export function HeaderStaticActions({ settings }: HeaderStaticActionsProps) {
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
      {settings.showSearch ? (
        <Link href="/search" className="icon-button" aria-label="Search">
          <Search size={20} />
        </Link>
      ) : null}

      {settings.showWishlist ? (
        <Link
          href="/account/wishlist"
          className="icon-button"
          aria-label="Wishlist"
          style={{ position: "relative" }}
        >
          <Heart size={20} />
          {mounted && isAuthenticated && wishlistCount > 0 ? (
            <span className="cart-count-badge">{wishlistCount}</span>
          ) : null}
        </Link>
      ) : null}

      {settings.showCart ? (
        <Link
          href="/cart"
          className="icon-button"
          aria-label="Cart"
          style={{ position: "relative" }}
        >
          <ShoppingCart size={20} />
          {mounted && cartCount > 0 ? (
            <span className="cart-count-badge">{cartCount}</span>
          ) : null}
        </Link>
      ) : null}

      {settings.showAccount ? <HeaderUser /> : null}
    </>
  );
}
