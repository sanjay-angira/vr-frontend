"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CheckCircle2 } from "lucide-react";
import {
  getOrderByNumber,
  type PlacedOrder,
} from "@/services/website/checkoutService";

function formatInr(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value || 0);
}

export function OrderSuccessContent() {
  const searchParams = useSearchParams();
  const orderNumber = searchParams.get("order") || "";
  const [order, setOrder] = useState<PlacedOrder | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(Boolean(orderNumber));

  useEffect(() => {
    if (!orderNumber) {
      setLoading(false);
      return;
    }

    let cancelled = false;

    (async () => {
      try {
        setLoading(true);
        const data = await getOrderByNumber(orderNumber);
        if (!cancelled) setOrder(data);
      } catch (err) {
        if (!cancelled) {
          const message =
            err && typeof err === "object" && "message" in err
              ? String((err as { message?: string }).message)
              : "Unable to load order";
          setError(message);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [orderNumber]);

  if (!orderNumber) {
    return (
      <div className="commerce-page">
        <div className="commerce-container commerce-empty">
          <h1>No order selected</h1>
          <Link href="/products" className="btn btn-primary">
            Continue shopping
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="commerce-page">
        <div className="commerce-container">
          <p className="commerce-muted">Loading order details…</p>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="commerce-page">
        <div className="commerce-container commerce-empty">
          <h1>Order confirmation</h1>
          <p>{error || "Order details unavailable."}</p>
          <p className="commerce-muted">Order number: {orderNumber}</p>
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
        <div className="commerce-success">
          <CheckCircle2 size={42} aria-hidden />
          <p className="commerce-eyebrow">Thank you</p>
          <h1>Order placed successfully</h1>
          <p>
            Your order <strong>{order.orderNumber}</strong> is confirmed.
            {order.paymentMethod === "cod"
              ? " Pay cash on delivery."
              : null}
          </p>
        </div>

        <div className="commerce-grid checkout">
          <section className="commerce-form-section">
            <h2>Delivery</h2>
            <p>
              <strong>{order.customerName}</strong>
              <br />
              {order.phone}
              {order.email ? (
                <>
                  <br />
                  {order.email}
                </>
              ) : null}
            </p>
            <p>
              {order.addressLine1}
              {order.addressLine2 ? `, ${order.addressLine2}` : ""}
              <br />
              {order.city}, {order.state} {order.pincode}
            </p>
            <p className="commerce-muted">
              Status: {order.orderStatus} · Payment: {order.paymentStatus}
            </p>
          </section>

          <aside className="commerce-summary">
            <h2>Items</h2>
            <ul className="commerce-summary-items">
              {order.items.map((item) => (
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
                  <em>{formatInr(item.subtotal)}</em>
                </li>
              ))}
            </ul>
            <div className="commerce-summary-row total">
              <span>Total paid / due</span>
              <strong>{formatInr(order.total)}</strong>
            </div>
            <Link href="/products" className="btn btn-primary commerce-checkout-btn">
              Continue shopping
            </Link>
          </aside>
        </div>
      </div>
    </div>
  );
}
