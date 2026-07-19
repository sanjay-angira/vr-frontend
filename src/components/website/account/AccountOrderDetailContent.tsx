"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import {
  getOrderByNumber,
  type PlacedOrder,
} from "@/services/website/checkoutService";
import { AccountShell } from "@/components/website/account/AccountShell";

function formatInr(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value || 0);
}

function formatDate(value?: string) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function AccountOrderDetailContent() {
  const params = useParams();
  const orderNumber = decodeURIComponent(String(params?.id || ""));
  const [order, setOrder] = useState<PlacedOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!orderNumber) {
      setLoading(false);
      setError("Order not found");
      return;
    }

    let cancelled = false;

    (async () => {
      try {
        setLoading(true);
        setError(null);
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

  return (
    <AccountShell title="Order details">
      <Link href="/account/orders" className="account-back">
        <ArrowLeft size={16} aria-hidden />
        Back to orders
      </Link>

      {loading ? (
        <p className="commerce-muted">Loading order…</p>
      ) : null}

      {error ? <p className="account-error">{error}</p> : null}

      {order ? (
        <div className="account-order-detail">
          <div className="account-order-detail-head">
            <div>
              <strong>{order.orderNumber}</strong>
              <p className="commerce-muted">{formatDate(order.createdAt)}</p>
            </div>
            <div className="account-order-detail-badges">
              <span className="account-status">{order.orderStatus}</span>
              <span className="account-status is-muted">
                {order.paymentMethod === "cod"
                  ? "Cash on delivery"
                  : order.paymentStatus === "paid"
                    ? "Paid online"
                    : "Online"}
              </span>
            </div>
          </div>

          <section className="thankyou-panel">
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
              <span>Total</span>
              <strong>{formatInr(order.total)}</strong>
            </div>
          </section>

          <section className="thankyou-panel">
            <h2>Delivery</h2>
            <p>
              <strong>{order.customerName}</strong>
              <br />
              {order.phone}
            </p>
            <p>
              {order.addressLine1}
              {order.addressLine2 ? `, ${order.addressLine2}` : ""}
              <br />
              {order.city}, {order.state} {order.pincode}
            </p>
          </section>
        </div>
      ) : null}
    </AccountShell>
  );
}
