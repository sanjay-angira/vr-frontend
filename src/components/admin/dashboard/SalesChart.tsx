"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { DashboardSalesPoint } from "@/services/admin/dashboardService";

type SalesChartProps = {
  series: DashboardSalesPoint[];
  change: string;
  trend: "up" | "down";
  loading?: boolean;
};

const CHART_COLOR = "#c59d5f";

function formatInrCompact(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(Number(value) || 0);
}

function formatInr(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(value) || 0);
}

export function SalesChart({
  series,
  change,
  trend,
  loading = false,
}: SalesChartProps) {
  const data = series.map((item) => ({
    label: item.label,
    monthKey: item.monthKey,
    value: Number(item.value) || 0,
  }));
  const hasSales = data.some((item) => item.value > 0);

  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm">
      <div className="mb-5 flex items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-zinc-900">Sales overview</h2>
          <p className="text-sm text-zinc-500">Monthly revenue trend</p>
        </div>
        {loading ? (
          <span className="h-6 w-16 animate-pulse rounded-full bg-zinc-100" />
        ) : (
          <span
            className={`rounded-full px-2.5 py-1 text-xs font-medium ${
              trend === "up"
                ? "bg-emerald-50 text-emerald-700"
                : "bg-red-50 text-red-700"
            }`}
          >
            {change}
          </span>
        )}
      </div>

      {loading ? (
        <div className="h-[260px] animate-pulse rounded-lg bg-zinc-100" />
      ) : data.length === 0 ? (
        <div className="flex h-[260px] items-center justify-center text-sm text-zinc-500">
          No sales data yet
        </div>
      ) : (
        <div className="h-[260px] w-full">
          {!hasSales ? (
            <p className="mb-2 text-xs text-zinc-500">
              No revenue in the last 6 months yet.
            </p>
          ) : null}

          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={data}
              margin={{ top: 12, right: 8, left: 0, bottom: 0 }}
            >
              <defs>
                <linearGradient id="salesAreaFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={CHART_COLOR} stopOpacity={0.35} />
                  <stop offset="100%" stopColor={CHART_COLOR} stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="4 4" stroke="#e4e4e7" vertical={false} />
              <XAxis
                dataKey="label"
                tickLine={false}
                axisLine={false}
                tick={{ fill: "#71717a", fontSize: 12 }}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                width={52}
                tick={{ fill: "#71717a", fontSize: 11 }}
                tickFormatter={(value: number) => formatInrCompact(value)}
              />
              <Tooltip
                cursor={{ stroke: "#d4d4d8", strokeDasharray: "4 4" }}
                contentStyle={{
                  borderRadius: 8,
                  border: "1px solid #e4e4e7",
                  boxShadow: "0 8px 20px rgba(0,0,0,0.06)",
                  fontSize: 12,
                }}
                formatter={(value) => [
                  formatInr(Number(value) || 0),
                  "Revenue",
                ]}
                labelFormatter={(label) => String(label)}
              />
              <Area
                type="monotone"
                dataKey="value"
                stroke={CHART_COLOR}
                strokeWidth={3}
                fill="url(#salesAreaFill)"
                dot={{
                  r: 4,
                  fill: "#ffffff",
                  stroke: CHART_COLOR,
                  strokeWidth: 2,
                }}
                activeDot={{
                  r: 6,
                  fill: CHART_COLOR,
                  stroke: "#ffffff",
                  strokeWidth: 2,
                }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
