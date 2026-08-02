import type { Metadata } from "next";
import { Suspense } from "react";
import PlaceOrderFlowWrapper from "@/components/website/cart/PlaceOrderFlowWrapper";
import { NOINDEX_ROBOTS, buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Cart & Checkout | Vrindavan Rasa",
  description: "Review your cart and complete checkout at Vrindavan Rasa.",
  path: "/cart",
  robots: NOINDEX_ROBOTS,
});

export default function PlaceOrderFlowLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense fallback={null}>
      <PlaceOrderFlowWrapper>{children}</PlaceOrderFlowWrapper>
    </Suspense>
  );
}
