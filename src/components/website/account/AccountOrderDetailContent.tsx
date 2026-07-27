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
import { AccountOrderDetailSkeleton } from "@/components/website/account/AccountSkeletons";
import {
  formatInr,
  getOrderItemMoney,
  getOrderMoney,
} from "@/components/website/account/orderMoney";

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

  const money = order ? getOrderMoney(order) : null;
  const appliedOffers =
    order?.offerJson?.offers?.filter((offer) => offer?.offerName) ||
    order?.items
      .map((item) => item.appliedOffer)
      .filter((offer): offer is NonNullable<typeof offer> => Boolean(offer?.offerName))
      .filter(
        (offer, index, list) =>
          list.findIndex((row) => row?.id === offer?.id) === index,
      ) ||
    [];

  return (
    <>
      {loading ? <AccountOrderDetailSkeleton /> : null}

      {!loading && error ? <p className="account-error">{error}</p> : null}

      {!loading && order && money ? (
        <>
          <Link href="/orders" className="account-back">
            <ArrowLeft size={16} aria-hidden />
            Back to orders
          </Link>

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
              <span>Total paid</span>
              <strong>{formatInr(money.total)}</strong>
            </div>

            {appliedOffers.length > 0 ? (
              <div className="account-applied-offers">
                <p className="commerce-muted">Applied offers</p>
                <ul>
                  {appliedOffers.map((offer, index) => (
                    <li key={String(offer?.id ?? index)}>
                      {offer?.offerName}
                      {offer?.discountType === "percentage"
                        ? ` · ${offer.discountValue}% off`
                        : offer?.discountType === "flat" ||
                            offer?.discountType === "fixed"
                          ? ` · ${formatInr(Number(offer.discountValue || 0))} off`
                          : null}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
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
        </>
      ) : null}
    </>
  );
}
