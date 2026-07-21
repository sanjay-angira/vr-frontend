"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CheckCircle2, Package } from "lucide-react";
import {
  getOrderByNumber,
  type PlacedOrder,
} from "@/services/website/checkoutService";
import { useUserAuth } from "@/services/website/useUserAuth";
import {
  formatInr,
  getOrderItemMoney,
  getOrderMoney,
} from "@/components/website/account/orderMoney";

function paymentLabel(order: PlacedOrder) {
  if (order.paymentMethod === "cod") return "Cash on delivery";
  if (order.paymentStatus === "paid") return "Paid online";
  return "Online payment";
}

export function OrderSuccessContent() {
  const searchParams = useSearchParams();
  const orderNumber = searchParams.get("order") || "";
  const { isAuthenticated } = useUserAuth();
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
      <div className="commerce-page thankyou-page">
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
      <div className="commerce-page thankyou-page">
        <div className="commerce-container">
          <p className="commerce-muted">Loading your thank-you details…</p>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="commerce-page thankyou-page">
        <div className="commerce-container commerce-empty">
          <h1>Thank you</h1>
          <p>{error || "Order details unavailable."}</p>
          <p className="commerce-muted">Order number: {orderNumber}</p>
          <div className="thankyou-actions">
            {isAuthenticated ? (
              <Link href="/account/orders" className="btn btn-primary">
                View my orders
              </Link>
            ) : null}
            <Link href="/products" className="btn btn-outline">
              Continue shopping
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const paidOnline =
    order.paymentMethod === "online" && order.paymentStatus === "paid";
  const money = getOrderMoney(order);

  return (
    <div className="commerce-page thankyou-page">
      <div className="commerce-container">
        <div className="commerce-success thankyou-hero">
          <CheckCircle2 size={48} aria-hidden />
          <p className="commerce-eyebrow">Purchase complete</p>
          <h1>Thank you for your purchase!</h1>
          <p>
            Your order <strong>{order.orderNumber}</strong>{" "}
            {paidOnline
              ? "has been paid and confirmed."
              : order.paymentMethod === "cod"
                ? "is confirmed. Please keep cash ready for delivery."
                : "has been received."}
          </p>
          <p className="commerce-muted">
            {paymentLabel(order)} · Status: {order.orderStatus}
          </p>
          <div className="thankyou-actions">
            {isAuthenticated ? (
              <Link href="/account/orders" className="btn btn-primary">
                <Package size={16} aria-hidden />
                View my orders
              </Link>
            ) : null}
            <Link href="/products" className="btn btn-outline">
              Continue shopping
            </Link>
          </div>
        </div>

        <div className="thankyou-grid">
          <section className="thankyou-panel">
            <h2>Delivery address</h2>
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
          </section>

          <aside className="thankyou-panel thankyou-summary">
            <h2>Order summary</h2>
            <ul className="commerce-summary-items">
              {order.items.map((item) => {
                const itemMoney = getOrderItemMoney(item);
                return (
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
                      {itemMoney.offerName ? (
                        <span className="account-line-offer">
                          Offer: {itemMoney.offerName}
                        </span>
                      ) : null}
                    </div>
                    <em className="account-line-price">
                      {itemMoney.hasDiscount ? (
                        <span className="account-order-list-price">
                          {formatInr(itemMoney.listLine)}
                        </span>
                      ) : null}
                      {formatInr(itemMoney.payableLine)}
                    </em>
                  </li>
                );
              })}
            </ul>
            <div className="commerce-summary-row">
              <span>Price</span>
              <strong>{formatInr(money.listSubtotal)}</strong>
            </div>
            {money.hasDiscount ? (
              <div className="commerce-summary-row order-summary-discount">
                <span>Offer discount</span>
                <strong>− {formatInr(money.discountTotal)}</strong>
              </div>
            ) : null}
            <div className="commerce-summary-row">
              <span>Shipping</span>
              <strong>
                {money.shippingFee > 0
                  ? formatInr(money.shippingFee)
                  : "Free"}
              </strong>
            </div>
            <div className="commerce-summary-row total">
              <span>Total</span>
              <strong>{formatInr(money.total)}</strong>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
