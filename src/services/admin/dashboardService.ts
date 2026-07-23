import { getData } from "@/services/api/apiService";
import { API_ENDPOINTS } from "@/services/api/API_ENDPOINT";

export type DashboardStat = {
  value: number;
  label: string;
  change: string;
  trend: "up" | "down";
  changeValue: number;
};

export type DashboardSalesPoint = {
  label: string;
  value: number;
  monthKey: string;
};

export type DashboardLowStockItem = {
  id: number;
  productId: number | null;
  name: string;
  sku: string;
  stock: number;
  threshold: number;
};

export type DashboardRecentOrder = {
  id: number;
  orderNumber: string;
  customerName: string;
  total: number;
  orderStatus: string;
  paymentStatus?: string;
  createdAt?: string;
};

export type DashboardSummary = {
  stats: {
    revenue: DashboardStat;
    orders: DashboardStat;
    customers: DashboardStat;
    products: DashboardStat;
  };
  sales: {
    series: DashboardSalesPoint[];
    maxValue: number;
    change: string;
    trend: "up" | "down";
  };
  lowStock: DashboardLowStockItem[];
  recentOrders: DashboardRecentOrder[];
  lowStockThreshold: number;
};

type ApiEnvelope<T> = {
  success?: boolean;
  message?: string;
  data?: T;
};

export async function fetchDashboardSummary(): Promise<DashboardSummary> {
  const response = (await getData(
    API_ENDPOINTS.DASHBOARD.SUMMARY,
  )) as ApiEnvelope<DashboardSummary>;

  if (response?.success === false || !response?.data) {
    throw new Error(response?.message || "Failed to load dashboard");
  }

  return response.data;
}
