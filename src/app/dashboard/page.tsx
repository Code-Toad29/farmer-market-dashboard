import {
  getDashboardStats,
  getListingsByCategory,
  getOrderStatusDistribution,
  getRecentOrders,
} from "@/lib/data";
import { DashboardOverview } from "@/components/dashboard/DashboardOverview";

export default async function DashboardPage() {
  const [stats, categoryData, statusData, recentOrders] = await Promise.all([
    getDashboardStats(),
    getListingsByCategory(),
    getOrderStatusDistribution(),
    getRecentOrders(5),
  ]);

  return (
    <DashboardOverview
      stats={stats}
      categoryData={categoryData}
      statusData={statusData}
      recentOrders={recentOrders}
    />
  );
}