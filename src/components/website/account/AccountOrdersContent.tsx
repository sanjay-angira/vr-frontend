"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Package } from "lucide-react";
import {
  getUserOrders,
  type PlacedOrder,
} from "@/services/website/checkoutService";
import { AccountOrdersSkeleton } from "@/components/website/account/AccountSkeletons";

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

function statusLabel(order: PlacedOrder) {
  if (order.paymentMethod === "online" && order.paymentStatus === "pending") {
    return "Payment pending";
  }
  return order.orderStatus;
}

export function AccountOrdersContent() {
  const [orders, setOrders] = useState<PlacedOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getUserOrders();
        if (!cancelled) setOrders(data);
      } catch (err) {
        if (!cancelled) {
          const message =
            err && typeof err === "object" && "message" in err
              ? String((err as { message?: string }).message)
              : "Unable to load orders";
          setError(message);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <>
      {loading ? <AccountOrdersSkeleton /> : null}

      {error ? <p className="account-error">{error}</p> : null}

      {!loading && !error && orders.length === 0 ? (
        <div className="account-empty">
          <Package size={36} aria-hidden />
          <h2>No orders yet</h2>
          <p className="commerce-muted">
            When you place an order, it will show up here.
          </p>
          <Link href="/products" className="btn btn-primary">
            Start shopping
          </Link>
        </div>
      ) : null}

      {!loading ? (
      <ul className="account-order-list">
        {orders.map((order) => {
          const first = order.items[0];
          const extraCount = Math.max(0, order.items.length - 1);
          return (
            <li key={order.id} className="account-order-card">
              <Link
                href={`/account/orders/${encodeURIComponent(order.orderNumber)}`}
                className="account-order-card-link"
              >
                <div className="account-order-thumb">
                  {first?.image ? (
                    <Image
                      src={first.image}
                      alt=""
                      width={72}
                      height={72}
                      unoptimized
                    />
                  ) : (
                    <Package size={28} aria-hidden />
                  )}
                </div>
                <div className="account-order-body">
                  <div className="account-order-meta">
                    <strong>{order.orderNumber}</strong>
                    <span>{formatDate(order.createdAt)}</span>
                  </div>
                  <p>
                    {first?.productName || "Order"}
                    {extraCount > 0 ? ` + ${extraCount} more` : ""}
                  </p>
                  <div className="account-order-footer">
                    <span className="account-status">{statusLabel(order)}</span>
                    <em>{formatInr(order.total)}</em>
                  </div>
                </div>
              </Link>
            </li>
          );
        })}
      </ul>
      ) : null}
    </>
  );
}
