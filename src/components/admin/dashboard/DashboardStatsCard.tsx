type DashboardStatsCardProps = {
  title: string;
  value: string;
  change: string;
  trend: "up" | "down";
  icon: React.ReactNode;
  loading?: boolean;
};

export function DashboardStatsCard({
  title,
  value,
  change,
  trend,
  icon,
  loading = false,
}: DashboardStatsCardProps) {
  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between">
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-zinc-500">{title}</p>
          {loading ? (
            <div className="mt-3 h-8 w-28 animate-pulse rounded bg-zinc-100" />
          ) : (
            <p className="mt-2 text-2xl font-bold text-zinc-900">{value}</p>
          )}
        </div>
        <div className="rounded-lg bg-zinc-100 p-2.5 text-zinc-700">{icon}</div>
      </div>

      <p className="mt-4 text-sm">
        {loading ? (
          <span className="inline-block h-4 w-36 animate-pulse rounded bg-zinc-100" />
        ) : (
          <>
            <span
              className={`font-medium ${
                trend === "up" ? "text-green-600" : "text-red-600"
              }`}
            >
              {change}
            </span>
            <span className="text-zinc-500"> vs last month</span>
          </>
        )}
      </p>
    </div>
  );
}
