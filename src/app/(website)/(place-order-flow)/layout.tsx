/**
 * Same pattern as tid-web:
 *   app/(theindiadecor)/(place-order-flow)/layout.tsx
 *     → PlaceOrderFlowWrapper (Context + shared OrderSummary column)
 */
import PlaceOrderFlowWrapper from "@/components/website/cart/PlaceOrderFlowWrapper";

export default function PlaceOrderFlowLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <PlaceOrderFlowWrapper>{children}</PlaceOrderFlowWrapper>;
}
