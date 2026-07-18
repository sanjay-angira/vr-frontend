"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ShoppingBag } from "lucide-react";
import { useAppSelector } from "@/services/redux/hooks";
import { CommerceLayout } from "@/components/website/cart/CommerceLayout";
import { usePlaceOrderContext } from "@/components/website/cart/PlaceOrderFlowWrapper";
import { CheckoutLoginSection } from "@/components/website/cart/checkoutComponents/CheckoutLoginSection";
import { CheckoutAddressSection } from "@/components/website/cart/checkoutComponents/CheckoutAddressSection";
import { CheckoutOrderSection } from "@/components/website/cart/checkoutComponents/CheckoutOrderSection";
import {
  formatItemCountLabel,
  getCartCounts,
} from "@/components/website/cart/commerceUtils";

/**
 * Checkout accordion — same flow as tid-web CheckoutAccordion:
 * 1. Login / continue  →  2. Delivery address  →  3. Order & payment
 * Place order lives in OrderSummary (right column).
 */
export function CheckoutPageContent() {
  const { isAuthenticated } = useAppSelector((state) => state.userAuth);
  const {
    items,
    loading,
    confirmDeliveryAddress,
    setConfirmDeliveryAddress,
    checkoutError,
  } = usePlaceOrderContext();

  const [loginDone, setLoginDone] = useState(false);

  useEffect(() => {
    if (isAuthenticated) setLoginDone(true);
  }, [isAuthenticated]);

  const addressConfirmed = Boolean(confirmDeliveryAddress);

  const { itemCount, unitCount } = useMemo(
    () => getCartCounts(items),
    [items],
  );

  if (loading && items.length === 0) {
    return (
      <CommerceLayout
        eyebrow="Checkout"
        title="Complete your order"
        loadingMessage="Preparing checkout…"
      />
    );
  }

  if (!loading && items.length === 0) {
    return (
      <CommerceLayout
        eyebrow="Checkout"
        title="Complete your order"
        empty={{
          icon: <ShoppingBag size={36} />,
          title: "Nothing to checkout",
          description:
            "Your cart is empty. Add products before placing an order.",
          action: (
            <Link href="/products" className="cart-btn cart-btn-primary">
              Browse products
            </Link>
          ),
        }}
      />
    );
  }

  return (
    <CommerceLayout
      eyebrow="Checkout"
      title="Complete your order"
      subtitle={`${formatItemCountLabel(itemCount, unitCount)} · Login, confirm address, then place your order.`}
      error={checkoutError}
      headerAction={
        <Link href="/cart" className="cart-clear-btn">
          <ArrowLeft size={15} strokeWidth={2} />
          Back to cart
        </Link>
      }
    >
      <div className="checkout-accordion">
        <CheckoutLoginSection
          confirmed={loginDone}
          onChange={() => {
            setLoginDone(false);
            setConfirmDeliveryAddress(null);
          }}
          onContinue={() => setLoginDone(true)}
        />

        <CheckoutAddressSection
          enabled={loginDone}
          onEdit={() => setConfirmDeliveryAddress(null)}
        />

        <CheckoutOrderSection enabled={addressConfirmed} />
      </div>
    </CommerceLayout>
  );
}
