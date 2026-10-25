import type { Metadata } from "next";
import { CartPageContent } from "@/components/website/cart/CartPageContent";
import { NOINDEX_ROBOTS, buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Cart | Vrindavan Rasa",
  description: "Review items in your Vrindavan Rasa shopping cart.",
  path: "/cart",
  robots: NOINDEX_ROBOTS,
});

/** Thin page — layout provides PlaceOrderFlowWrapper (tid-web pattern). */
export default function CartPage() {
  return <CartPageContent />;
}
