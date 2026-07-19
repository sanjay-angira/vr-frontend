import { Suspense } from "react";
import { OrderSuccessContent } from "@/components/website/cart/OrderSuccessContent";

export const metadata = {
  title: "Thank you | Vrindavan Rasa",
};

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
