import type { Metadata } from "next";
import { AccountWishlistContent } from "@/components/website/account/AccountWishlistContent";
import { NOINDEX_ROBOTS, buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Wishlist | Vrindavan Rasa",
  description: "Your saved wishlist items at Vrindavan Rasa.",
  path: "/wishlist",
  robots: NOINDEX_ROBOTS,
});

export default function Page() {
  return <AccountWishlistContent />;
}
