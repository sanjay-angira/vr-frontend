const salesData = [
  { label: "Jan", value: 42 },
  { label: "Feb", value: 58 },
  { label: "Mar", value: 51 },
  { label: "Apr", value: 67 },
  { label: "May", value: 74 },
  { label: "Jun", value: 82 },
];

export function SalesChart() {
  const maxValue = Math.max(...salesData.map((item) => item.value));

  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold text-zinc-900">Sales overview</h2>
          <p className="text-sm text-zinc-500">Monthly revenue trend</p>
        </div>
        <span className="rounded-full bg-green-50 px-2.5 py-1 text-xs font-medium text-green-700">
          +18.2%
        </span>
      </div>

      <div className="flex h-48 items-end justify-between gap-2">
        {salesData.map((item) => (
          <div key={item.label} className="flex flex-1 flex-col items-center gap-2">
            <div className="flex w-full flex-1 items-end">
              <div
                className="w-full rounded-t-md bg-admin-primary transition-all"
                style={{ height: `${(item.value / maxValue) * 100}%` }}
                title={`${item.label}: ${item.value}%`}
              />
            </div>
            <span className="text-xs text-zinc-500">{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
