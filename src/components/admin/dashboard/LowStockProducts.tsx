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
    <div className="w-full rounded-xl border border-zinc-200 bg-white shadow-sm">
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

      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead>
            <tr className="border-b border-zinc-100 text-xs uppercase tracking-wide text-zinc-500">
              <th className="px-5 py-3 font-medium">Product</th>
              <th className="px-5 py-3 font-medium">Variant</th>
              <th className="px-5 py-3 font-medium">Product ID</th>
              <th className="px-5 py-3 font-medium">Variant ID</th>
              <th className="px-5 py-3 font-medium">SKU</th>
              <th className="px-5 py-3 font-medium">Stock</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 4 }, (_, index) => (
                <tr key={`low-skel-${index}`} className="border-b border-zinc-50">
                  <td className="px-5 py-3.5" colSpan={6}>
                    <div className="h-4 w-full max-w-md animate-pulse rounded bg-zinc-100" />
                  </td>
                </tr>
              ))
            ) : items.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-5 py-8 text-center text-zinc-500">
                  All variants are above the stock threshold
                </td>
              </tr>
            ) : (
              items.map((product) => (
                <tr
                  key={product.id}
                  className="border-b border-zinc-50 last:border-0 hover:bg-zinc-50/80"
                >
                  <td className="px-5 py-3.5 font-medium text-zinc-900">
                    {product.productId ? (
                      <Link
                        href={`/admin/products/view/${product.productId}`}
                        className="hover:underline"
                      >
                        {product.productName || product.name}
                      </Link>
                    ) : (
                      product.productName || product.name
                    )}
                  </td>
                  <td className="px-5 py-3.5 text-zinc-600">
                    {product.variantName || "—"}
                  </td>
                  <td className="px-5 py-3.5 text-zinc-600">
                    {product.productId ?? "—"}
                  </td>
                  <td className="px-5 py-3.5 text-zinc-600">
                    {product.variantId ?? product.id}
                  </td>
                  <td className="px-5 py-3.5 font-mono text-xs text-zinc-700">
                    {product.sku || "—"}
                  </td>
                  <td className="px-5 py-3.5">
                    <p className="font-semibold text-red-600">
                      {product.stock} left
                    </p>
                    <p className="text-xs text-zinc-500">
                      Min: {product.threshold}
                    </p>
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
