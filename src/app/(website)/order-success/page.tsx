import { Suspense } from "react";
import { OrderSuccessContent } from "@/components/website/cart/OrderSuccessContent";

export default function OrderSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="commerce-page">
          <div className="commerce-container">
            <p className="commerce-muted">Loading order…</p>
          </div>
        </div>
      }
    >
      <OrderSuccessContent />
    </Suspense>
  );
}
