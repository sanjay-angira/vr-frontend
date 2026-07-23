"use client";

import Link from "next/link";
import type { DashboardLowStockItem } from "@/services/admin/dashboardService";

type LowStockProductsProps = {
  items: DashboardLowStockItem[];
  loading?: boolean;
};

export function LowStockProducts({
  items,
  loading = false,
}: LowStockProductsProps) {
  return (
    <div className="rounded-xl border border-zinc-200 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-zinc-100 px-5 py-4">
        <div>
          <h2 className="text-base font-semibold text-zinc-900">Low stock</h2>
          <p className="text-sm text-zinc-500">Products running low</p>
        </div>
        <Link
          href="/admin/products"
          className="text-sm font-medium text-zinc-900 hover:underline"
        >
          View All
        </Link>
      </div>

      {loading ? (
        <ul className="divide-y divide-zinc-100">
          {Array.from({ length: 4 }, (_, index) => (
            <li key={`low-skel-${index}`} className="px-5 py-4">
              <div className="h-4 w-40 animate-pulse rounded bg-zinc-100" />
              <div className="mt-2 h-3 w-24 animate-pulse rounded bg-zinc-100" />
            </li>
          ))}
        </ul>
      ) : items.length === 0 ? (
        <p className="px-5 py-8 text-center text-sm text-zinc-500">
          All variants are above the stock threshold
        </p>
      ) : (
        <ul className="divide-y divide-zinc-100">
          {items.map((product) => (
            <li
              key={product.id}
              className="flex items-center justify-between gap-4 px-5 py-4"
            >
              <div className="min-w-0">
                <p className="truncate font-medium text-zinc-900">
                  {product.name}
                </p>
                <p className="text-xs text-zinc-500">SKU: {product.sku}</p>
              </div>

              <div className="text-right">
                <p className="text-sm font-semibold text-red-600">
                  {product.stock} left
                </p>
                <p className="text-xs text-zinc-500">
                  Min: {product.threshold}
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
