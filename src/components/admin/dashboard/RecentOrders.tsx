"use client";

import Link from "next/link";
import type { DashboardRecentOrder } from "@/services/admin/dashboardService";

type RecentOrdersProps = {
  orders: DashboardRecentOrder[];
  loading?: boolean;
};

function formatInr(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(value) || 0);
}

function formatRelative(value?: string) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";

  const diffMs = Date.now() - date.getTime();
  const minutes = Math.floor(diffMs / 60000);
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hr ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
  });
}

function statusClass(status: string) {
  const value = status.toLowerCase();
  if (value === "delivered" || value === "confirmed") {
    return "bg-emerald-50 text-emerald-700";
  }
  if (value === "cancelled") return "bg-red-50 text-red-700";
  if (value === "shipped" || value === "processing") {
    return "bg-sky-50 text-sky-800";
  }
  return "bg-amber-50 text-amber-800";
}

export function RecentOrders({ orders, loading = false }: RecentOrdersProps) {
  return (
    <div className="rounded-xl border border-zinc-200 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-zinc-100 px-5 py-4">
        <div>
          <h2 className="text-base font-semibold text-zinc-900">Recent orders</h2>
          <p className="text-sm text-zinc-500">Latest transactions</p>
        </div>
        <Link
          href="/admin/orders"
          className="text-sm font-medium text-zinc-900 hover:underline"
        >
          View all
        </Link>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[520px] text-left text-sm">
          <thead>
            <tr className="border-b border-zinc-100 text-xs uppercase tracking-wide text-zinc-500">
              <th className="px-5 py-3 font-medium">Order</th>
              <th className="px-5 py-3 font-medium">Customer</th>
              <th className="px-5 py-3 font-medium">Amount</th>
              <th className="px-5 py-3 font-medium">Status</th>
              <th className="px-5 py-3 font-medium">Time</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} className="px-5 py-8 text-center text-zinc-500">
                  Loading orders…
                </td>
              </tr>
            ) : orders.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-5 py-8 text-center text-zinc-500">
                  No orders yet
                </td>
              </tr>
            ) : (
              orders.map((order) => (
                <tr
                  key={order.id}
                  className="border-b border-zinc-50 last:border-0 hover:bg-zinc-50/80"
                >
                  <td className="px-5 py-3.5 font-medium text-zinc-900">
                    <Link
                      href={`/admin/orders/view/${order.id}`}
                      className="hover:underline"
                    >
                      {order.orderNumber}
                    </Link>
                  </td>
                  <td className="px-5 py-3.5 text-zinc-600">
                    {order.customerName || "—"}
                  </td>
                  <td className="px-5 py-3.5 font-medium text-zinc-900">
                    {formatInr(order.total)}
                  </td>
                  <td className="px-5 py-3.5">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium capitalize ${statusClass(order.orderStatus)}`}
                    >
                      {order.orderStatus}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-zinc-500">
                    {formatRelative(order.createdAt)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
