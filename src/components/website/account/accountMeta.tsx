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
