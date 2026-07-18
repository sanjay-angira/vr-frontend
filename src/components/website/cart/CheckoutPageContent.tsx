"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "@/components/website/hooks/useCart";
import { useAppSelector } from "@/services/redux/hooks";
import {
  placeOrder,
  type CheckoutPayload,
} from "@/services/website/checkoutService";

function formatInr(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value || 0);
}

const EMPTY_FORM: CheckoutPayload = {
  customerName: "",
  phone: "",
  email: "",
  addressLine1: "",
  addressLine2: "",
  city: "",
  state: "",
  pincode: "",
  notes: "",
  paymentMethod: "cod",
};

export function CheckoutPageContent() {
  const router = useRouter();
  const user = useAppSelector((state) => state.userAuth.user);
  const { items, total, loading, fetchCart, setItems } = useCart();
  const [form, setForm] = useState<CheckoutPayload>(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void fetchCart();
  }, [fetchCart]);

  useEffect(() => {
    if (!user) return;
    setForm((prev) => ({
      ...prev,
      customerName: prev.customerName || user.name || "",
      phone: prev.phone || user.phone || "",
      email: prev.email || user.email || "",
    }));
  }, [user]);

  const canSubmit = useMemo(() => {
    return (
      items.length > 0 &&
      form.customerName.trim().length >= 2 &&
      form.phone.trim().length >= 10 &&
      form.addressLine1.trim().length >= 5 &&
      form.city.trim().length >= 2 &&
      form.state.trim().length >= 2 &&
      form.pincode.trim().length >= 6 &&
      !submitting
    );
  }, [form, items.length, submitting]);

  const updateField = <K extends keyof CheckoutPayload>(
    key: K,
    value: CheckoutPayload[K]
  ) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!canSubmit) return;

    setSubmitting(true);
    setError(null);

    try {
      const order = await placeOrder({
        ...form,
        customerName: form.customerName.trim(),
        phone: form.phone.trim(),
        email: form.email?.trim() || undefined,
        addressLine1: form.addressLine1.trim(),
        addressLine2: form.addressLine2?.trim() || undefined,
        city: form.city.trim(),
        state: form.state.trim(),
        pincode: form.pincode.trim(),
        notes: form.notes?.trim() || undefined,
      });

      setItems([]);
      router.push(
        `/order-success?order=${encodeURIComponent(order.orderNumber)}`
      );
    } catch (err) {
      const message =
        err && typeof err === "object" && "message" in err
          ? String((err as { message?: string }).message)
          : "Unable to place order";
      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading && items.length === 0) {
    return (
      <div className="commerce-page">
        <div className="commerce-container">
          <p className="commerce-muted">Preparing checkout…</p>
        </div>
      </div>
    );
  }

  if (!loading && items.length === 0) {
    return (
      <div className="commerce-page">
        <div className="commerce-container commerce-empty">
          <h1>Nothing to checkout</h1>
          <p>Your cart is empty. Add products before placing an order.</p>
          <Link href="/products" className="btn btn-primary">
            Browse products
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
            <p className="commerce-eyebrow">Checkout</p>
            <h1>Shipping & payment</h1>
            <p className="commerce-muted">
              Review your details and place your order.
            </p>
          </div>
          <Link href="/cart" className="commerce-text-btn">
            Back to cart
          </Link>
        </header>

        {error ? <p className="commerce-alert error">{error}</p> : null}

        <div className="commerce-grid checkout">
          <form className="commerce-form" onSubmit={handleSubmit}>
            <section className="commerce-form-section">
              <h2>Contact</h2>
              <div className="commerce-form-grid">
                <label>
                  Full name
                  <input
                    required
                    value={form.customerName}
                    onChange={(e) => updateField("customerName", e.target.value)}
                    placeholder="Your name"
                  />
                </label>
                <label>
                  Phone
                  <input
                    required
                    value={form.phone}
                    onChange={(e) => updateField("phone", e.target.value)}
                    placeholder="10-digit mobile"
                    inputMode="tel"
                  />
                </label>
                <label className="span-2">
                  Email (optional)
                  <input
                    type="email"
                    value={form.email || ""}
                    onChange={(e) => updateField("email", e.target.value)}
                    placeholder="you@example.com"
                  />
                </label>
              </div>
            </section>

            <section className="commerce-form-section">
              <h2>Delivery address</h2>
              <div className="commerce-form-grid">
                <label className="span-2">
                  Address line 1
                  <input
                    required
                    value={form.addressLine1}
                    onChange={(e) =>
                      updateField("addressLine1", e.target.value)
                    }
                    placeholder="House / street"
                  />
                </label>
                <label className="span-2">
                  Address line 2
                  <input
                    value={form.addressLine2 || ""}
                    onChange={(e) =>
                      updateField("addressLine2", e.target.value)
                    }
                    placeholder="Landmark (optional)"
                  />
                </label>
                <label>
                  City
                  <input
                    required
                    value={form.city}
                    onChange={(e) => updateField("city", e.target.value)}
                  />
                </label>
                <label>
                  State
                  <input
                    required
                    value={form.state}
                    onChange={(e) => updateField("state", e.target.value)}
                  />
                </label>
                <label>
                  PIN code
                  <input
                    required
                    value={form.pincode}
                    onChange={(e) => updateField("pincode", e.target.value)}
                    inputMode="numeric"
                  />
                </label>
                <label className="span-2">
                  Order notes
                  <textarea
                    rows={3}
                    value={form.notes || ""}
                    onChange={(e) => updateField("notes", e.target.value)}
                    placeholder="Delivery instructions (optional)"
                  />
                </label>
              </div>
            </section>

            <section className="commerce-form-section">
              <h2>Payment</h2>
              <div className="commerce-payment-options">
                <label className="commerce-payment-option">
                  <input
                    type="radio"
                    name="paymentMethod"
                    checked={form.paymentMethod === "cod"}
                    onChange={() => updateField("paymentMethod", "cod")}
                  />
                  <span>
                    <strong>Cash on delivery</strong>
                    <em>Pay when your order arrives</em>
                  </span>
                </label>
                <label className="commerce-payment-option disabled">
                  <input type="radio" name="paymentMethod" disabled />
                  <span>
                    <strong>Online payment</strong>
                    <em>Coming soon</em>
                  </span>
                </label>
              </div>
            </section>

            <button
              type="submit"
              className="btn btn-primary commerce-checkout-btn"
              disabled={!canSubmit}
            >
              {submitting ? "Placing order…" : `Place order · ${formatInr(total)}`}
            </button>
          </form>

          <aside className="commerce-summary">
            <h2>Your items</h2>
            <ul className="commerce-summary-items">
              {items.map((item) => (
                <li key={item.id}>
                  <div className="commerce-summary-thumb">
                    {item.image ? (
                      <Image
                        src={item.image}
                        alt=""
                        width={48}
                        height={48}
                        unoptimized
                      />
                    ) : null}
                  </div>
                  <div>
                    <strong>{item.productName}</strong>
                    <span>
                      Qty {item.quantity}
                      {item.variantName ? ` · ${item.variantName}` : ""}
                    </span>
                  </div>
                  <em>
                    {formatInr(
                      Number(item.subtotal) ||
                        item.quantity * Number(item.priceAtTime || 0)
                    )}
                  </em>
                </li>
              ))}
            </ul>
            <div className="commerce-summary-row">
              <span>Subtotal</span>
              <strong>{formatInr(total)}</strong>
            </div>
            <div className="commerce-summary-row">
              <span>Shipping</span>
              <span>Free</span>
            </div>
            <div className="commerce-summary-row total">
              <span>Total</span>
              <strong>{formatInr(total)}</strong>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
