import Link from "next/link";

const lowStockProducts = [
  { id: "1", name: "Wireless Earbuds Pro", sku: "WEB-001", stock: 4, threshold: 10 },
  { id: "2", name: "Cotton T-Shirt (M)", sku: "CTS-M-002", stock: 7, threshold: 15 },
  { id: "3", name: "Running Shoes", sku: "RS-003", stock: 2, threshold: 8 },
  { id: "4", name: "Smart Watch Band", sku: "SWB-004", stock: 5, threshold: 12 },
];

export function LowStockProducts() {
  return (
    <div className="rounded-xl border border-zinc-200 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-zinc-100 px-5 py-4">
        <div>
          <h2 className="text-base font-semibold text-zinc-900">Low stock</h2>
          <p className="text-sm text-zinc-500">Products running low</p>
        </div>
        <Link
          href={"/admin/products"}
          className="text-sm font-medium text-zinc-900 hover:underline"
        >
          View All
        </Link>
      </div>

      <ul className="divide-y divide-zinc-100">
        {lowStockProducts.map((product) => (
          <li
            key={product.id}
            className="flex items-center justify-between gap-4 px-5 py-4"
          >
            <div className="min-w-0">
              <p className="truncate font-medium text-zinc-900">{product.name}</p>
              <p className="text-xs text-zinc-500">SKU: {product.sku}</p>
            </div>

            <div className="text-right">
              <p className="text-sm font-semibold text-red-600">
                {product.stock} left
              </p>
              <p className="text-xs text-zinc-500">Min: {product.threshold}</p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
