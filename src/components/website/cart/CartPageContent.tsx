"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, Trash2, ShoppingBag } from "lucide-react";
import { useCart } from "@/components/website/hooks/useCart";

function formatInr(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value || 0);
}

export function CartPageContent() {
  const {
    items,
    total,
    loading,
    error,
    fetchCart,
    updateQuantity,
    removeItem,
    clearCart,
  } = useCart();
  const [busyId, setBusyId] = useState<number | null>(null);

  useEffect(() => {
    void fetchCart();
  }, [fetchCart]);

  const itemCountLabel = useMemo(() => {
    const qty = items.reduce((sum, item) => sum + item.quantity, 0);
    return `${items.length} item${items.length === 1 ? "" : "s"} · ${qty} unit${qty === 1 ? "" : "s"}`;
  }, [items]);

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
      <div className="commerce-page">
        <div className="commerce-container">
          <p className="commerce-muted">Loading your cart…</p>
        </div>
      </div>
    );
  }

  if (!loading && items.length === 0) {
    return (
      <div className="commerce-page">
        <div className="commerce-container commerce-empty">
          <ShoppingBag size={40} aria-hidden />
          <h1>Your cart is empty</h1>
          <p>Browse the store and add something sacred to your basket.</p>
          <Link href="/products" className="btn btn-primary">
            Continue shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="commerce-page">
      <div className="commerce-container">
        <header className="commerce-header">
          <div>
            <p className="commerce-eyebrow">Shopping bag</p>
            <h1>Your cart</h1>
            <p className="commerce-muted">{itemCountLabel}</p>
          </div>
          <button
            type="button"
            className="commerce-text-btn"
            onClick={() => void clearCart()}
            disabled={loading}
          >
            Clear cart
          </button>
        </header>

        {error ? <p className="commerce-alert error">{error}</p> : null}

        <div className="commerce-grid">
          <div className="commerce-list">
            {items.map((item) => {
              const unit = Number(item.priceAtTime) || 0;
              const line =
                Number(item.subtotal) || unit * Number(item.quantity || 0);
              const slug = item.variant?.product?.productSlug;
              const href = slug ? `/product/${slug}` : "/products";
              const busy = busyId === item.id || loading;

              return (
                <article key={item.id} className="commerce-line">
                  <Link href={href} className="commerce-line-media">
                    {item.image ? (
                      <Image
                        src={item.image}
                        alt={item.productName || "Product"}
                        width={96}
                        height={96}
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
                          <p className="commerce-muted">{item.variantName}</p>
                        ) : null}
                      </div>
                      <p className="commerce-line-price">{formatInr(line)}</p>
                    </div>

                    <div className="commerce-line-actions">
                      <div className="commerce-qty">
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

                      <p className="commerce-muted">
                        {formatInr(unit)} each
                      </p>

                      <button
                        type="button"
                        className="commerce-remove"
                        disabled={busy}
                        onClick={() => void handleRemove(item.id)}
                      >
                        <Trash2 size={16} />
                        Remove
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>

          <aside className="commerce-summary">
            <h2>Order summary</h2>
            <div className="commerce-summary-row">
              <span>Subtotal</span>
              <strong>{formatInr(total)}</strong>
            </div>
            <div className="commerce-summary-row">
              <span>Shipping</span>
              <span>Calculated at checkout</span>
            </div>
            <div className="commerce-summary-row total">
              <span>Total</span>
              <strong>{formatInr(total)}</strong>
            </div>
            <Link href="/checkout" className="btn btn-primary commerce-checkout-btn">
              Proceed to checkout
            </Link>
            <Link href="/products" className="commerce-text-btn center">
              Continue shopping
            </Link>
          </aside>
        </div>
      </div>
    </div>
  );
}
