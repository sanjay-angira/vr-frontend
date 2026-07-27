import type { ReactNode } from "react";
import {
  AccountAddressesSkeleton,
  AccountOrderDetailSkeleton,
  AccountOrdersSkeleton,
  AccountProfileSkeleton,
  AccountWishlistSkeleton,
} from "@/components/website/account/AccountSkeletons";

export function getAccountMeta(pathname: string | null): {
  title: string;
  skeleton: ReactNode;
} {
  if (!pathname) {
    return { title: "Account", skeleton: <AccountProfileSkeleton /> };
  }

  // Order detail: /orders/:id
  if (/^\/orders\/.+/.test(pathname)) {
    return { title: "Order details", skeleton: <AccountOrderDetailSkeleton /> };
  }

  if (pathname === "/orders" || pathname.startsWith("/orders?")) {
    return { title: "My orders", skeleton: <AccountOrdersSkeleton /> };
  }

  if (pathname === "/wishlist" || pathname.startsWith("/wishlist?")) {
    return { title: "Wishlist", skeleton: <AccountWishlistSkeleton /> };
  }

  if (pathname === "/addresses" || pathname.startsWith("/addresses?")) {
    return { title: "Addresses", skeleton: <AccountAddressesSkeleton /> };
  }

  if (pathname === "/profile" || pathname.startsWith("/profile?")) {
    return { title: "Profile", skeleton: <AccountProfileSkeleton /> };
  }

  // Legacy /account/* paths (redirects / bookmarks)
  if (pathname.startsWith("/account/orders/") && pathname !== "/account/orders") {
    return { title: "Order details", skeleton: <AccountOrderDetailSkeleton /> };
  }
  if (pathname.startsWith("/account/orders")) {
    return { title: "My orders", skeleton: <AccountOrdersSkeleton /> };
  }
  if (pathname.startsWith("/account/wishlist")) {
    return { title: "Wishlist", skeleton: <AccountWishlistSkeleton /> };
  }
  if (pathname.startsWith("/account/addresses")) {
    return { title: "Addresses", skeleton: <AccountAddressesSkeleton /> };
  }

  return { title: "Profile", skeleton: <AccountProfileSkeleton /> };
}
