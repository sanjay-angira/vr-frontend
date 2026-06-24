type DashboardStatsCardProps = {
  title: string;
  value: string;
  change: string;
  trend: "up" | "down";
  icon: React.ReactNode;
};

export function DashboardStatsCard({
  title,
  value,
  change,
  trend,
  icon,
}: DashboardStatsCardProps) {
  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-zinc-500">{title}</p>
          <p className="mt-2 text-2xl font-bold text-zinc-900">{value}</p>
        </div>
        <div className="rounded-lg bg-zinc-100 p-2.5 text-zinc-700">{icon}</div>
      </div>

      <p className="mt-4 text-sm">
        <span
          className={`font-medium ${
            trend === "up" ? "text-green-600" : "text-red-600"
          }`}
        >
          {change}
        </span>
        <span className="text-zinc-500"> vs last month</span>
      </p>
    </div>
  );
}
