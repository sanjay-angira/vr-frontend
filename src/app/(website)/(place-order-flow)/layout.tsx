import { Suspense } from "react";
import PlaceOrderFlowWrapper from "@/components/website/cart/PlaceOrderFlowWrapper";

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
