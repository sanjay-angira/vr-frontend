"use client";

/**
 * Common Order Summary for cart + checkout.
 * Same role as tid-web `Shipmentdetail` — always mounted in PlaceOrderFlowWrapper
 * right column (.price-details). Only CTA / copy changes by route.
 */

import Link from "next/link";
import {
  ArrowLeft,
  Heart,
  Lock,
  Package,
  RotateCcw,
  ShieldCheck,
  Tag,
  Truck,
  Zap,
} from "lucide-react";
import { usePlaceOrderContext } from "@/components/website/cart/PlaceOrderFlowWrapper";
import {
  FREE_SHIPPING_THRESHOLD,
  formatInr,
  getOrderSummaryTotals,
} from "@/components/website/cart/commerceUtils";

const TRUST_STRIP = [
  { icon: Lock, label: "Secure Payments" },
  { icon: RotateCcw, label: "Easy Returns" },
  { icon: Zap, label: "Fast Delivery" },
  { icon: Heart, label: "Made with love in Vrindavan, India" },
] as const;

function OrderSummarySkeleton() {
  return (
    <aside
      className="commerce-summary cart-summary order-summary orderbg"
      aria-busy="true"
      aria-label="Loading order summary"
    >
      <div className="order-summary-skel order-summary-skel--title" />
      <div className="order-summary-skel" />
      <div className="order-summary-skel" />
      <div className="order-summary-skel" />
      <div className="order-summary-skel order-summary-skel--total" />
      <div className="order-summary-skel order-summary-skel--cta" />
    </aside>
  );
}

function OrderSummaryTrust() {
  return (
    <div className="order-summary-trust" aria-label="Shopping assurances">
      {TRUST_STRIP.map(({ icon: Icon, label }) => (
        <span key={label} className="order-summary-trust-item">
          <Icon size={14} strokeWidth={2} aria-hidden />
          {label}
        </span>
      ))}
    </div>
  );
}

export function OrderSummary() {
  const {
    items,
    loading,
    config,
    isCheckout,
    checkoutLoading,
    handlePlaceOrder,
    confirmDeliveryAddress,
    submitCheckout,
    checkoutError,
    paymentMethod,
  } = usePlaceOrderContext();
  const { shippingMode, secureNote } = config;

  const { itemCount, unitCount, listTotal, payableTotal, discount } =
    getOrderSummaryTotals(items);

  const shippingGap = Math.max(0, FREE_SHIPPING_THRESHOLD - payableTotal);
  const qualifiesFreeShipping =
    shippingMode === "free" || shippingGap === 0;

  const shippingLabel = qualifiesFreeShipping
    ? "FREE"
    : "Calculated at checkout";

  const bannerMessage =
    shippingMode === "free"
      ? "Free shipping applied on this order."
      : qualifiesFreeShipping
        ? "You’ve unlocked FREE shipping on this order!"
        : `Add items worth ${formatInr(shippingGap)} more to get FREE shipping!`;

  const hasItems = items.length > 0;
  const canPlaceOrder =
    isCheckout && Boolean(confirmDeliveryAddress) && hasItems;

  if (loading && !hasItems) {
    return (
      <div className="order-summary-stack">
        <OrderSummarySkeleton />
        <OrderSummaryTrust />
      </div>
    );
  }

  if (!hasItems) {
    return (
      <div className="order-summary-stack">
        <aside className="commerce-summary cart-summary order-summary orderbg">
          <h2>Order Summary</h2>
          <div className="order-summary-empty">
            <Package size={40} strokeWidth={1.5} aria-hidden />
            <p>You have not added anything to cart yet.</p>
            <div className="order-summary-empty-actions">
              <Link href="/products" className="cart-btn cart-btn-secondary">
                New Arrivals
              </Link>
              <Link
                href="/products?sort=discount_desc"
                className="cart-btn cart-btn-secondary"
              >
                Best Deals
              </Link>
            </div>
          </div>
        </aside>
        <OrderSummaryTrust />
      </div>
    );
  }

  return (
    <div className="order-summary-stack">
      <aside className="commerce-summary cart-summary order-summary orderbg">
        <h2>Order Summary</h2>

        <div className="commerce-summary-row">
          <span>
            Price ({unitCount} {unitCount === 1 ? "item" : "items"}
            {itemCount !== unitCount ? ` · ${itemCount} lines` : ""})
          </span>
          <strong>{formatInr(listTotal)}</strong>
        </div>

        {discount > 0 ? (
          <div className="commerce-summary-row order-summary-discount">
            <span>
              <Tag size={14} strokeWidth={2} aria-hidden />
              Discount
            </span>
            <strong>− {formatInr(discount)}</strong>
          </div>
        ) : null}

        <div className="commerce-summary-row">
          <span>Shipping Charges</span>
          <span
            className={qualifiesFreeShipping ? "order-summary-free" : undefined}
          >
            {shippingLabel}
          </span>
        </div>

        <div className="commerce-summary-row total">
          <span>Total</span>
          <strong>{formatInr(payableTotal)}</strong>
        </div>

        {discount > 0 ? (
          <p className="order-summary-save">
            You will save {formatInr(discount)} on this order
          </p>
        ) : null}

        <div
          className={`cart-shipping-banner${qualifiesFreeShipping ? " is-free" : ""}`}
        >
          <Truck size={18} strokeWidth={1.75} aria-hidden />
          <p>{bannerMessage}</p>
        </div>

        {secureNote ? (
          <div className="checkout-secure-note">
            <ShieldCheck size={16} strokeWidth={2} aria-hidden />
            Your payment details are secure and encrypted.
          </div>
        ) : null}

        {isCheckout && !confirmDeliveryAddress ? (
          <p className="checkout-summary-hint">
            Confirm your delivery address to place the order.
          </p>
        ) : null}

        {checkoutError && isCheckout ? (
          <p className="commerce-error checkout-summary-error" role="alert">
            {checkoutError}
          </p>
        ) : null}

        {/* Pathname only swaps CTA — same aside chrome (tid pattern) */}
        <div className="payment-summary-actions order-summary-actions">
          {isCheckout ? (
            <>
              <button
                type="button"
                className="cart-btn cart-btn-primary"
                disabled={!canPlaceOrder || checkoutLoading}
                onClick={() => {
                  void submitCheckout();
                }}
              >
                <Lock size={16} strokeWidth={2.25} aria-hidden />
              {checkoutLoading
                ? paymentMethod === "online"
                  ? "Opening Razorpay…"
                  : "Placing order…"
                : paymentMethod === "online"
                  ? `Pay now · ${formatInr(payableTotal)}`
                  : `Place order · ${formatInr(payableTotal)}`}
              </button>
              <Link href="/cart" className="cart-btn cart-btn-secondary">
                <ArrowLeft size={16} strokeWidth={2.25} aria-hidden />
                Edit cart
              </Link>
            </>
          ) : (
            <>
              <button
                type="button"
                className="cart-btn cart-btn-primary"
                disabled={checkoutLoading}
                onClick={handlePlaceOrder}
              >
                <Lock size={16} strokeWidth={2.25} aria-hidden />
                {checkoutLoading ? "Checking…" : "Place Order"}
              </button>
              <Link href="/products" className="cart-btn cart-btn-secondary">
                <ArrowLeft size={16} strokeWidth={2.25} aria-hidden />
                Continue Shopping
              </Link>
            </>
          )}
        </div>
      </aside>

      <OrderSummaryTrust />
    </div>
  );
}

export default OrderSummary;
