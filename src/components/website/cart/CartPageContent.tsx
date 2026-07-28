"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { CommerceLayout } from "@/components/website/cart/CommerceLayout";
import {
  CartClearSkeleton,
  CartSkeleton,
} from "@/components/website/cart/CartSkeleton";
import { usePlaceOrderContext } from "@/components/website/cart/PlaceOrderFlowWrapper";
import {
  formatInr,
  formatItemCountLabel,
  getCartCounts,
  getCartItemPricing,
} from "@/components/website/cart/commerceUtils";

export function CartPageContent() {
  const {
    items,
    loading,
    error,
    updateQuantity,
    removeItem,
    clearCart,
  } = usePlaceOrderContext();
  const [busyId, setBusyId] = useState<number | null>(null);

  const { itemCount, unitCount } = useMemo(
    () => getCartCounts(items),
    [items],
  );
  const itemCountLabel = formatItemCountLabel(itemCount, unitCount);

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

  if (loading && items.length === 0) {
    return (
      <CommerceLayout
        eyebrow="Shopping bag"
        title="Your Cart"
        headerAction={<CartClearSkeleton />}
      >
        <CartSkeleton />
      </CommerceLayout>
    );
  }

  if (!loading && items.length === 0) {
    return (
      <CommerceLayout
        eyebrow="Shopping bag"
        title="Your Cart"
        empty={{
          icon: <ShoppingBag size={36} />,
          title: "Your cart is empty",
          description:
            "Browse the store and add something sacred to your basket.",
          action: (
            <Link href="/products" className="cart-btn cart-btn-primary">
              Continue shopping
            </Link>
          ),
        }}
      />
    );
  }

  return (
    <CommerceLayout
      eyebrow="Shopping bag"
      title="Your Cart"
      subtitle={itemCountLabel}
      error={error}
      headerAction={
        <button
          type="button"
          className="cart-clear-btn"
          onClick={() => void clearCart()}
          disabled={loading}
        >
          <Trash2 size={15} strokeWidth={2} />
          Clear cart
        </button>
      }
    >
      <div className="commerce-list cart-list">
        {items.map((item) => {
          const { unit, listUnit, line, listLine, hasDiscount, offerName } =
            getCartItemPricing(item);
          const slug = item.variant?.product?.productSlug;
          const href = slug ? `/product/${slug}` : "/products";
          const busy = busyId === item.id || loading;

          return (
            <article key={item.id} className="commerce-line cart-line">
              <Link href={href} className="commerce-line-media cart-line-media">
                {item.image ? (
                  <Image
                    src={item.image}
                    alt={item.productName || "Product"}
                    width={112}
                    height={112}
                    unoptimized
                  />
                ) : (
                  <div className="commerce-line-placeholder" />
                )}
              </Link>

              <div className="commerce-line-body">
                <div className="commerce-line-top">
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
                  <div className="commerce-line-price-wrap">
                    <p className="commerce-line-price">{formatInr(line)}</p>
                    {hasDiscount ? (
                      <p className="commerce-line-mrp">{formatInr(listLine)}</p>
                    ) : null}
                  </div>
                </div>

                <div className="commerce-line-actions cart-line-actions">
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
            </article>
          );
        })}
      </div>
    </CommerceLayout>
  );
}
