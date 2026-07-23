"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  getAdminModuleApiPath,
  type AdminModuleKey,
} from "@/components/admin/commonTable/adminModuleTable.config";
import type { AdminViewProps } from "@/components/admin/views/adminViewRegistry";
import { resolveImageUrl } from "@/components/admin/forms/shared/resolveImageUrl";
import { getData } from "@/services/api/apiService";

type OrderItemRecord = {
  id: number;
  productId?: number | null;
  variationId?: number | null;
  productName: string;
  variantName?: string | null;
  sku?: string | null;
  quantity: number;
  listUnitPrice: number;
  unitPrice: number;
  discountAmount: number;
  subtotal: number;
  listSubtotal: number;
  image?: string | null;
  appliedOffer?: { offerName?: string } | null;
};

type OrderRecord = {
  id: number;
  orderNumber: string;
  customerName?: string;
  phone?: string;
  email?: string | null;
  addressLine1?: string;
  addressLine2?: string | null;
  city?: string;
  state?: string;
  pincode?: string;
  notes?: string | null;
  orderStatus: string;
  paymentMethod: string;
  paymentStatus: string;
  listSubtotal: number;
  discountTotal: number;
  subtotal: number;
  shippingFee: number;
  total: number;
  razorpayOrderId?: string | null;
  razorpayPaymentId?: string | null;
  items: OrderItemRecord[];
  createdAt?: string;
};

function formatInr(value: unknown) {
  const num = Number(value);
  if (!Number.isFinite(num)) return "—";
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(num);
}

function formatDate(value?: string) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function StatusBadge({
  label,
  tone = "neutral",
}: {
  label: string;
  tone?: "neutral" | "success" | "warn" | "danger" | "info";
}) {
  const className =
    tone === "success"
      ? "bg-emerald-50 text-emerald-700"
      : tone === "warn"
        ? "bg-amber-50 text-amber-800"
        : tone === "danger"
          ? "bg-red-50 text-red-700"
          : tone === "info"
            ? "bg-sky-50 text-sky-800"
            : "bg-zinc-100 text-zinc-700";

  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-xs font-medium capitalize ${className}`}
    >
      {label}
    </span>
  );
}

function orderStatusTone(status: string) {
  const value = status.toLowerCase();
  if (value === "delivered" || value === "confirmed") return "success" as const;
  if (value === "cancelled") return "danger" as const;
  if (value === "shipped" || value === "processing") return "info" as const;
  return "warn" as const;
}

function paymentStatusTone(status: string) {
  const value = status.toLowerCase();
  if (value === "paid") return "success" as const;
  if (value === "failed" || value === "refunded") return "danger" as const;
  return "warn" as const;
}

function InfoItem({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="min-w-0">
      <p className="text-xs font-medium uppercase tracking-wide text-zinc-400">
        {label}
      </p>
      <p className="mt-1 break-words text-sm text-zinc-900">{value}</p>
    </div>
  );
}

function ItemImage({ src, alt }: { src?: string | null; alt: string }) {
  const [failed, setFailed] = useState(false);
  const resolved = src ? resolveImageUrl(src) : "";

  if (!resolved || failed) {
    return (
      <div className="flex h-14 w-14 items-center justify-center rounded-md bg-zinc-100 text-[10px] text-zinc-500">
        No image
      </div>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={resolved}
      alt={alt}
      className="h-14 w-14 rounded-md object-cover"
      loading="lazy"
      onError={() => setFailed(true)}
    />
  );
}

export function OrderView({ module, recordId }: AdminViewProps) {
  const apiPath = getAdminModuleApiPath(module as AdminModuleKey);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [order, setOrder] = useState<OrderRecord | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchOrder() {
      setLoading(true);
      setLoadError("");

      try {
        const response = await getData(`${apiPath}/${recordId}`);
        const data = response?.data;
        const record =
          data && typeof data === "object" && !Array.isArray(data)
            ? (data as OrderRecord)
            : null;

        if (!cancelled) {
          if (!record) {
            setLoadError("Order not found.");
            setOrder(null);
          } else {
            setOrder({
              ...record,
              items: Array.isArray(record.items) ? record.items : [],
            });
          }
        }
      } catch {
        if (!cancelled) {
          setLoadError("Failed to load order.");
          setOrder(null);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void fetchOrder();

    return () => {
      cancelled = true;
    };
  }, [apiPath, recordId]);

  if (loading) {
    return (
      <div className="rounded-xl border border-zinc-200 bg-white p-6 text-sm text-zinc-500">
        Loading order…
      </div>
    );
  }

  if (loadError || !order) {
    return (
      <div className="space-y-4">
        <Link
          href="/admin/orders"
          className="text-sm font-medium text-zinc-700 hover:underline"
        >
          ← Back to orders
        </Link>
        <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">
          {loadError || "Order not found."}
        </div>
      </div>
    );
  }

  const address = [
    order.addressLine1,
    order.addressLine2,
    [order.city, order.state].filter(Boolean).join(", "),
    order.pincode,
  ]
    .filter(Boolean)
    .join("\n");

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <Link
            href="/admin/orders"
            className="text-sm font-medium text-zinc-700 hover:underline"
          >
            ← Back to orders
          </Link>
          <h1 className="mt-2 text-2xl font-semibold text-zinc-900">
            {order.orderNumber}
          </h1>
          <p className="mt-1 text-sm text-zinc-500">
            Placed {formatDate(order.createdAt)}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <StatusBadge
            label={order.orderStatus}
            tone={orderStatusTone(order.orderStatus)}
          />
          <StatusBadge
            label={order.paymentStatus}
            tone={paymentStatusTone(order.paymentStatus)}
          />
          <StatusBadge
            label={order.paymentMethod === "cod" ? "Cash on delivery" : "Online"}
            tone="neutral"
          />
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <section className="rounded-xl border border-zinc-200 bg-white p-5 lg:col-span-2">
          <h2 className="text-base font-semibold text-zinc-900">
            Products ({order.items.length})
          </h2>

          {order.items.length === 0 ? (
            <p className="mt-4 text-sm text-zinc-500">No products on this order.</p>
          ) : (
            <ul className="mt-4 divide-y divide-zinc-100">
              {order.items.map((item) => {
                const hasDiscount =
                  Number(item.listUnitPrice) > Number(item.unitPrice);
                return (
                  <li
                    key={item.id}
                    className="flex flex-wrap items-start gap-4 py-4 first:pt-0 last:pb-0"
                  >
                    <ItemImage src={item.image} alt={item.productName} />
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-zinc-900">
                        {item.productName}
                      </p>
                      <p className="mt-1 text-sm text-zinc-500">
                        Qty {item.quantity}
                        {item.variantName ? ` · ${item.variantName}` : ""}
                        {item.sku ? ` · SKU ${item.sku}` : ""}
                      </p>
                      {item.appliedOffer?.offerName ? (
                        <p className="mt-1 text-xs font-medium text-amber-700">
                          Offer: {item.appliedOffer.offerName}
                        </p>
                      ) : null}
                      <p className="mt-1 text-xs text-zinc-400">
                        {item.productId != null
                          ? `Product #${item.productId}`
                          : null}
                        {item.variationId != null
                          ? `${item.productId != null ? " · " : ""}Variant #${item.variationId}`
                          : null}
                      </p>
                    </div>
                    <div className="text-right">
                      {hasDiscount ? (
                        <p className="text-xs text-zinc-400 line-through">
                          {formatInr(item.listSubtotal)}
                        </p>
                      ) : null}
                      <p className="font-semibold text-zinc-900">
                        {formatInr(item.subtotal)}
                      </p>
                      <p className="mt-1 text-xs text-zinc-500">
                        {formatInr(item.unitPrice)} each
                      </p>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        <div className="space-y-4">
          <section className="rounded-xl border border-zinc-200 bg-white p-5">
            <h2 className="text-base font-semibold text-zinc-900">Customer</h2>
            <div className="mt-4 grid gap-4">
              <InfoItem label="Name" value={order.customerName || "—"} />
              <InfoItem label="Phone" value={order.phone || "—"} />
              <InfoItem label="Email" value={order.email || "—"} />
              <InfoItem
                label="Shipping address"
                value={
                  <span className="whitespace-pre-line">
                    {address || "—"}
                  </span>
                }
              />
              {order.notes ? (
                <InfoItem label="Notes" value={order.notes} />
              ) : null}
            </div>
          </section>

          <section className="rounded-xl border border-zinc-200 bg-white p-5">
            <h2 className="text-base font-semibold text-zinc-900">Totals</h2>
            <dl className="mt-4 space-y-2 text-sm">
              <div className="flex justify-between gap-3">
                <dt className="text-zinc-500">List subtotal</dt>
                <dd className="font-medium text-zinc-900">
                  {formatInr(order.listSubtotal)}
                </dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-zinc-500">Discount</dt>
                <dd className="font-medium text-zinc-900">
                  −{formatInr(order.discountTotal)}
                </dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-zinc-500">Subtotal</dt>
                <dd className="font-medium text-zinc-900">
                  {formatInr(order.subtotal)}
                </dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-zinc-500">Shipping</dt>
                <dd className="font-medium text-zinc-900">
                  {formatInr(order.shippingFee)}
                </dd>
              </div>
              <div className="flex justify-between gap-3 border-t border-zinc-100 pt-2">
                <dt className="font-semibold text-zinc-900">Total</dt>
                <dd className="font-semibold text-zinc-900">
                  {formatInr(order.total)}
                </dd>
              </div>
            </dl>

            {(order.razorpayOrderId || order.razorpayPaymentId) && (
              <div className="mt-4 grid gap-3 border-t border-zinc-100 pt-4">
                {order.razorpayOrderId ? (
                  <InfoItem
                    label="Razorpay order"
                    value={order.razorpayOrderId}
                  />
                ) : null}
                {order.razorpayPaymentId ? (
                  <InfoItem
                    label="Razorpay payment"
                    value={order.razorpayPaymentId}
                  />
                ) : null}
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
