import type { Metadata } from "next";
import { CheckoutPageContent } from "@/components/website/cart/CheckoutPageContent";
import { NOINDEX_ROBOTS, buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Checkout | Vrindavan Rasa",
  description: "Complete your order securely at Vrindavan Rasa.",
  path: "/checkout",
  robots: NOINDEX_ROBOTS,
});

/** Thin page — layout provides PlaceOrderFlowWrapper (tid-web pattern). */
export default function CheckoutPage() {
  return <CheckoutPageContent />;
}
