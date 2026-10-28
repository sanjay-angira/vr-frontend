"use client";

/**
 * Common Order Summary for cart + checkout.
 * Same role as tid-web `Shipmentdetail` — always mounted in PlaceOrderFlowWrapper
 * right column (.price-details). Only CTA / copy changes by route.
 */

import { useEffect, useState } from "react";
import Link from "next/link";
import { ShopSeedLink } from "@/components/shop/ShopSeedLink";
import {
  ArrowLeft,
  Heart,
  Lock,
  Package,
  RotateCcw,
  ShieldCheck,
  Tag,
  Ticket,
  Truck,
  X,
  Zap,
} from "lucide-react";
import { usePlaceOrderContext } from "@/components/cart/PlaceOrderFlowWrapper";
import {
  estimateCartShipping,
  type CartShippingEstimate,
} from "@/services/checkoutService";
import {
  FREE_SHIPPING_THRESHOLD,
  formatInr,
  getOrderSummaryTotals,
} from "@/components/cart/commerceUtils";

const TRUST_STRIP = [
  { icon: Lock, label: "Secure Payments" },
  { icon: RotateCcw, label: "Easy Returns" },
  { icon: Zap, label: "Fast Delivery" },
  { icon: Heart, label: "Made with love in Vrindavan, India" },
] as const;

function OrderSummarySkeleton({
  isCheckout,
  secureNote,
}: {
  isCheckout: boolean;
  secureNote: boolean;
}) {
  return (
    <aside
      className="commerce-summary cart-summary order-summary orderbg"
      aria-busy="true"
      aria-label="Loading order summary"
    >
      <div className="order-summary-skel-heading">
        <span className="order-summary-skel order-summary-skel--title" />
      </div>
      <div className="commerce-summary-row order-summary-skel-row">
        <span className="order-summary-skel order-summary-skel--label" />
        <span className="order-summary-skel order-summary-skel--value" />
      </div>
      <div className="commerce-summary-row order-summary-skel-row">
        <span className="order-summary-skel order-summary-skel--label order-summary-skel--shipping-label" />
        <span className="order-summary-skel order-summary-skel--value order-summary-skel--shipping-value" />
      </div>
      <div className="commerce-summary-row total order-summary-skel-row order-summary-skel-row--total">
        <span className="order-summary-skel order-summary-skel--total-label" />
        <span className="order-summary-skel order-summary-skel--total-value" />
      </div>
      <div className="order-summary-coupon order-summary-skel-coupon">
        <div className="order-summary-skel order-summary-skel--coupon-label" />
        <div className="order-summary-skel-coupon__form">
          <span className="order-summary-skel order-summary-skel--coupon-input" />
          <span className="order-summary-skel order-summary-skel--coupon-apply" />
        </div>
      </div>
      <div className="cart-shipping-banner order-summary-skel-shipping">
        <span className="order-summary-skel order-summary-skel--shipping-icon" />
        <span className="order-summary-skel order-summary-skel--shipping-copy" />
      </div>
      {secureNote ? (
        <div className="order-summary-skel-note">
          <span className="order-summary-skel order-summary-skel--note-icon" />
          <span className="order-summary-skel order-summary-skel--note-copy" />
        </div>
      ) : null}
      {isCheckout ? (
        <div className="order-summary-skel order-summary-skel--hint" />
      ) : null}
      <div className="order-summary-skel order-summary-skel--cta" />
      <div className="order-summary-skel order-summary-skel--secondary-cta" />
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
    appliedCoupon,
    couponDiscount,
    couponInput,
    setCouponInput,
    couponApplying,
    couponError,
    applyCoupon,
    removeCoupon,
  } = usePlaceOrderContext();
  const { shippingMode, secureNote } = config;

  const {
    itemCount,
    unitCount,
    listTotal,
    merchandiseTotal,
    payableTotal,
    offerDiscount,
    couponDiscount: appliedCouponDiscount,
    discount,
  } = getOrderSummaryTotals(items, couponDiscount);

  const shippingGap = Math.max(0, FREE_SHIPPING_THRESHOLD - merchandiseTotal);
  const deliveryPincode =
    confirmDeliveryAddress?.pincode.replace(/\D/g, "").slice(0, 6) ?? "";
  const cartContentsKey = items
    .map(({ id, variationId, quantity }) => `${id}:${variationId}:${quantity}`)
    .join("|");
  const estimateKey =
    isCheckout &&
    confirmDeliveryAddress &&
    deliveryPincode.length === 6
      ? `${deliveryPincode}:${paymentMethod}:${merchandiseTotal}:${cartContentsKey}`
      : null;
  const [shippingEstimateState, setShippingEstimateState] = useState<{
    key: string;
    estimate?: CartShippingEstimate;
    error?: string;
  } | null>(null);

  useEffect(() => {
    if (!estimateKey) return;

    const controller = new AbortController();
    void estimateCartShipping(
      deliveryPincode,
      paymentMethod,
      controller.signal,
    )
      .then((estimate) => {
        setShippingEstimateState({ key: estimateKey, estimate });
      })
      .catch((error: unknown) => {
        if (controller.signal.aborted) return;
        setShippingEstimateState({
          key: estimateKey,
          error:
            error instanceof Error
              ? error.message
              : typeof error === "object" &&
                  error !== null &&
                  "message" in error &&
                  typeof error.message === "string"
                ? error.message
                : "Shipping estimate could not be calculated.",
        });
      });

    return () => controller.abort();
  }, [deliveryPincode, estimateKey, paymentMethod]);

  const currentShippingEstimate =
    shippingEstimateState?.key === estimateKey ? shippingEstimateState : null;
  const estimatePending = Boolean(estimateKey) && !currentShippingEstimate;
  const shippingEstimate = currentShippingEstimate?.estimate;
  const qualifiesFreeShipping = shippingEstimate
    ? shippingEstimate.serviceable && shippingEstimate.freeShipping
    : estimateKey
      ? false
      : shippingMode === "free" || shippingGap === 0;
  const shippingLabel = shippingEstimate
    ? shippingEstimate.serviceable
      ? shippingEstimate.freeShipping
        ? "FREE"
        : formatInr(shippingEstimate.shippingFee)
      : "Unavailable"
    : currentShippingEstimate?.error
      ? "Unavailable"
      : estimatePending
        ? "Calculating…"
        : qualifiesFreeShipping
          ? "FREE"
          : "Calculated at checkout";

  const bannerMessage = estimatePending
    ? `Calculating shipping charges for ${deliveryPincode}…`
    : currentShippingEstimate?.error
      ? `Unable to calculate shipping: ${currentShippingEstimate.error}`
      : shippingEstimate && !shippingEstimate.serviceable
        ? shippingEstimate.message
        : shippingEstimate
          ? shippingEstimate.freeShipping
            ? `Free shipping is available to ${deliveryPincode}.`
            : `Shipping to ${deliveryPincode}: ${formatInr(shippingEstimate.shippingFee)}.`
          : shippingMode === "free"
            ? "Free shipping applied on this order."
            : qualifiesFreeShipping
              ? "You’ve unlocked FREE shipping on this order!"
              : `Add items worth ${formatInr(shippingGap)} more to get FREE shipping!`;
  const totalLabel = estimatePending
    ? "Calculating…"
    : currentShippingEstimate?.error ||
        (shippingEstimate && !shippingEstimate.serviceable)
      ? "Unavailable"
      : formatInr(
          payableTotal +
            (shippingEstimate?.serviceable ? shippingEstimate.shippingFee : 0),
        );

  const hasItems = items.length > 0;
  const canPlaceOrder =
    isCheckout && Boolean(confirmDeliveryAddress) && hasItems;

  if (loading && !hasItems) {
    return (
      <div className="order-summary-stack">
        <OrderSummarySkeleton isCheckout={isCheckout} secureNote={secureNote} />
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
              <ShopSeedLink
                href="/products"
                seed={{ sortBy: "discount_desc" }}
                className="cart-btn cart-btn-secondary"
              >
                Best Deals
              </ShopSeedLink>
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

        {offerDiscount > 0 ? (
          <div className="commerce-summary-row order-summary-discount">
            <span>
              <Tag size={14} strokeWidth={2} aria-hidden />
              Offer Discount
            </span>
            <strong>− {formatInr(offerDiscount)}</strong>
          </div>
        ) : null}

        {appliedCouponDiscount > 0 ? (
          <div className="commerce-summary-row order-summary-discount">
            <span>
              <Ticket size={14} strokeWidth={2} aria-hidden />
              Coupon ({appliedCoupon?.couponCode})
            </span>
            <strong>− {formatInr(appliedCouponDiscount)}</strong>
          </div>
        ) : null}

        <div className="commerce-summary-row">
          <span>
            Shipping Charges
            {isCheckout
              ? ` (${paymentMethod === "cod" ? "COD" : "Pre-paid"})`
              : ""}
          </span>
          <span
            className={qualifiesFreeShipping ? "order-summary-free" : undefined}
          >
            {shippingLabel}
          </span>
        </div>

        <div className="commerce-summary-row total">
          <span>Total</span>
          <strong>{totalLabel}</strong>
        </div>

        {discount > 0 ? (
          <p className="order-summary-save">
            You will save {formatInr(discount)} on this order
          </p>
        ) : null}

        <div className="order-summary-coupon">
          <p className="order-summary-coupon__label">Have a coupon?</p>
          {appliedCoupon ? (
            <div className="order-summary-coupon__applied">
              <span>
                <Ticket size={14} aria-hidden />
                {appliedCoupon.couponCode}
              </span>
              <button
                type="button"
                className="order-summary-coupon__remove"
                onClick={removeCoupon}
                aria-label="Remove coupon"
              >
                <X size={14} />
                Remove
              </button>
            </div>
          ) : (
            <form
              className="order-summary-coupon__form"
              onSubmit={(event) => {
                event.preventDefault();
                void applyCoupon();
              }}
            >
              <input
                type="text"
                value={couponInput}
                onChange={(event) => setCouponInput(event.target.value.toUpperCase())}
                placeholder="Enter coupon code"
                className="order-summary-coupon__input"
                disabled={couponApplying}
                autoComplete="off"
              />
              <button
                type="submit"
                className="order-summary-coupon__apply"
                disabled={couponApplying || !couponInput.trim()}
              >
                {couponApplying ? "Applying…" : "Apply"}
              </button>
            </form>
          )}
          {couponError ? (
            <p className="order-summary-coupon__error" role="alert">
              {couponError}
            </p>
          ) : null}
        </div>

        <div
          className={`cart-shipping-banner${qualifiesFreeShipping ? " is-free" : ""}`}
          role="status"
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
                    ? `Pay now · ${totalLabel}`
                    : `Place order · ${totalLabel}`}
              </button>
              <Link
                href="/cart"
                className="cart-btn cart-btn-secondary commerce-home-cta"
              >
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
              <Link
                href="/products"
                className="cart-btn cart-btn-secondary commerce-home-cta"
              >
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
