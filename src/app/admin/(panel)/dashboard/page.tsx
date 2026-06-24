import { DashboardStatsCard } from "@/components/admin/dashboard/DashboardStatsCard";
import { LowStockProducts } from "@/components/admin/dashboard/LowStockProducts";
import { RecentOrders } from "@/components/admin/dashboard/RecentOrders";
import { SalesChart } from "@/components/admin/dashboard/SalesChart";

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <DashboardStatsCard
          title="Total revenue"
          value="₹4,82,350"
          change="+12.5%"
          trend="up"
          icon={
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8V7m0 10v-2m-8-2h16" />
            </svg>
          }
        />
        <DashboardStatsCard
          title="Orders"
          value="1,284"
          change="+8.2%"
          trend="up"
          icon={
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
          }
        />
        <DashboardStatsCard
          title="Customers"
          value="3,542"
          change="+5.4%"
          trend="up"
          icon={
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          }
        />
        <DashboardStatsCard
          title="Products"
          value="186"
          change="-2.1%"
          trend="down"
          icon={
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          }
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <SalesChart />
        </div>
        <LowStockProducts />
      </div>

      <RecentOrders />
    </div>
  );
}
