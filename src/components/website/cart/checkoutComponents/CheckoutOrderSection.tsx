"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Banknote, Check, CreditCard, Minus, Plus, Trash2 } from "lucide-react";
import { usePlaceOrderContext } from "@/components/website/cart/PlaceOrderFlowWrapper";
import {
  formatInr,
  getCartItemPricing,
} from "@/components/website/cart/commerceUtils";

type CheckoutOrderSectionProps = {
  enabled: boolean;
};

export function CheckoutOrderSection({ enabled }: CheckoutOrderSectionProps) {
  const {
    items,
    loading,
    paymentMethod,
    setPaymentMethod,
    confirmDeliveryAddress,
    updateQuantity,
    removeItem,
  } = usePlaceOrderContext();
  const [busyId, setBusyId] = useState<number | null>(null);

  const handleQuantity = async (cartItemId: number, quantity: number) => {
    if (quantity < 1) return;
    setBusyId(cartItemId);
    try {
      await updateQuantity(cartItemId, quantity);
    } finally {
      setBusyId(null);
    }
  };

  const handleRemove = async (cartItemId: number) => {
    setBusyId(cartItemId);
    try {
      await removeItem(cartItemId);
    } finally {
      setBusyId(null);
    }
  };

  if (!enabled) {
    return (
      <div className="checkout-step checkout-step--locked">
        <div className="checkout-step-head">
          <span className="checkout-step-num">3</span>
          <h3>Order &amp; payment</h3>
        </div>
        <p className="checkout-step-copy">
          Confirm your delivery address to review items and pay.
        </p>
      </div>
    );
  }

  return (
    <div className="checkout-step checkout-step--open">
      <div className="checkout-step-head">
        <span className="checkout-step-num">3</span>
        <div className="checkout-step-title-row">
          <h3>Order &amp; payment</h3>
          {confirmDeliveryAddress ? (
            <Check size={18} className="checkout-step-check" aria-hidden />
          ) : null}
        </div>
      </div>

      <ul className="checkout-order-list">
        {items.map((item) => {
          const { unit, listUnit, line, listLine, hasDiscount, offerName } =
            getCartItemPricing(item);
          const slug = item.variant?.product?.productSlug;
          const href = slug ? `/product/${slug}` : "/products";
          const busy = busyId === item.id || loading;

          return (
            <li key={item.id} className="checkout-order-item">
              <Link href={href} className="checkout-order-thumb">
                {item.image ? (
                  <Image
                    src={item.image}
                    alt={item.productName || "Product"}
                    width={64}
                    height={64}
                    unoptimized
                  />
                ) : (
                  <div className="commerce-line-placeholder" />
                )}
              </Link>

              <div className="checkout-order-body">
                <div className="checkout-order-top">
                  <div>
                    <Link href={href} className="commerce-line-title">
                      {item.productName || "Product"}
                    </Link>
                    {item.variantName ? (
                      <p className="cart-line-variant">{item.variantName}</p>
                    ) : null}
                    {offerName ? (
                      <p className="cart-line-offer">{offerName}</p>
                    ) : null}
                  </div>
                  <div className="commerce-line-price-wrap checkout-order-price">
                    <strong>{formatInr(line)}</strong>
                    {hasDiscount ? (
                      <span className="commerce-line-mrp">
                        {formatInr(listLine)}
                      </span>
                    ) : null}
                  </div>
                </div>

                <div className="checkout-order-actions">
                  <div className="commerce-qty cart-qty">
                    <button
                      type="button"
                      aria-label="Decrease quantity"
                      disabled={busy || item.quantity <= 1}
                      onClick={() =>
                        void handleQuantity(item.id, item.quantity - 1)
                      }
                    >
                      <Minus size={14} />
                    </button>
                    <span>{item.quantity}</span>
                    <button
                      type="button"
                      aria-label="Increase quantity"
                      disabled={busy}
                      onClick={() =>
                        void handleQuantity(item.id, item.quantity + 1)
                      }
                    >
                      <Plus size={14} />
                    </button>
                  </div>

                  <p className="cart-unit-price">
                    {formatInr(unit)} each
                    {hasDiscount ? (
                      <span className="cart-unit-mrp">
                        {" "}
                        {formatInr(listUnit)}
                      </span>
                    ) : null}
                  </p>

                  <button
                    type="button"
                    className="commerce-remove"
                    disabled={busy}
                    onClick={() => void handleRemove(item.id)}
                  >
                    <Trash2 size={15} />
                    Remove
                  </button>
                </div>
              </div>
            </li>
          );
        })}
      </ul>

      <div className="commerce-payment-options checkout-payment-block">
        <label
          className={`commerce-payment-option checkout-payment${
            paymentMethod === "cod" ? " is-selected" : ""
          }`}
        >
          <input
            type="radio"
            name="paymentMethod"
            checked={paymentMethod === "cod"}
            onChange={() => setPaymentMethod("cod")}
          />
          <span className="checkout-payment-icon" aria-hidden>
            <Banknote size={18} strokeWidth={1.75} />
          </span>
          <span>
            <strong>Cash on delivery</strong>
            <em>Pay when your order arrives</em>
          </span>
        </label>
        <label className="commerce-payment-option checkout-payment disabled">
          <input type="radio" name="paymentMethod" disabled />
          <span className="checkout-payment-icon" aria-hidden>
            <CreditCard size={18} strokeWidth={1.75} />
          </span>
          <span>
            <strong>Online payment</strong>
            <em>Coming soon</em>
          </span>
        </label>
      </div>
    </div>
  );
}
