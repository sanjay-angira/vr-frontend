import Link from "next/link";
import { Heart, Search, ShoppingCart, User } from "lucide-react";
import type { HeaderSettingsData } from "@/types/header";

type HeaderStaticActionsProps = {
  settings: HeaderSettingsData;
};

export function HeaderStaticActions({ settings }: HeaderStaticActionsProps) {
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
        >
          <Heart size={20} />
        </Link>
      ) : null}

      {settings.showCart ? (
        <Link
          href="/cart"
          className="icon-button"
          aria-label="Cart"
        >
          <ShoppingCart size={20} />
        </Link>
      ) : null}

      {settings.showAccount ? (
        <Link
          href="/account"
          className="icon-button"
          aria-label="Account"
        >
          <User size={20} />
        </Link>
      ) : null}
    </>
  );
}
