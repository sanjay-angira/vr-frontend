import { Suspense } from "react";
import type { Metadata } from "next";
import { OrderSuccessContent } from "@/components/website/cart/OrderSuccessContent";
import { NOINDEX_ROBOTS, buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Thank You | Vrindavan Rasa",
  description: "Thank you for your order with Vrindavan Rasa.",
  path: "/thank-you",
  robots: NOINDEX_ROBOTS,
});

export default function ThankYouPage() {
  return (
    <Suspense
      fallback={
        <div className="commerce-page thankyou-page">
          <div className="commerce-container">
            <p className="commerce-muted">Loading your thank-you details…</p>
          </div>
        </div>
      }
    >
      <OrderSuccessContent />
    </Suspense>
  );
}
