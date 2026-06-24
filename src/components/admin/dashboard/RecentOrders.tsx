import Link from "next/link";
const recentOrders = [
  {
    id: "ORD-1042",
    customer: "Rahul Sharma",
    amount: "₹2,499",
    status: "pending" as const,
    date: "2 min ago",
  },
  {
    id: "ORD-1041",
    customer: "Priya Patel",
    amount: "₹1,850",
    status: "processing" as const,
    date: "15 min ago",
  },
  {
    id: "ORD-1040",
    customer: "Amit Kumar",
    amount: "₹4,320",
    status: "shipped" as const,
    date: "1 hr ago",
  },
  {
    id: "ORD-1039",
    customer: "Sneha Reddy",
    amount: "₹980",
    status: "delivered" as const,
    date: "3 hr ago",
  },
  {
    id: "ORD-1038",
    customer: "Vikram Singh",
    amount: "₹3,150",
    status: "cancelled" as const,
    date: "5 hr ago",
  },
];

export function RecentOrders() {
  return (
    <div className="rounded-xl border border-zinc-200 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-zinc-100 px-5 py-4">
        <div>
          <h2 className="text-base font-semibold text-zinc-900">Recent orders</h2>
          <p className="text-sm text-zinc-500">Latest transactions</p>
        </div>
        <Link
          href={"/admin/orders"}
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
            {recentOrders.map((order) => (
              <tr
                key={order.id}
                className="border-b border-zinc-50 last:border-0 hover:bg-zinc-50/80"
              >
                <td className="px-5 py-3.5 font-medium text-zinc-900">
                  {order.id}
                </td>
                <td className="px-5 py-3.5 text-zinc-600">{order.customer}</td>
                <td className="px-5 py-3.5 font-medium text-zinc-900">
                  {order.amount}
                </td>
                <td className="px-5 py-3.5">ggggggggggg
                </td>
                <td className="px-5 py-3.5 text-zinc-500">{order.date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
