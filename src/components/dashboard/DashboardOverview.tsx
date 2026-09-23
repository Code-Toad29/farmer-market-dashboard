"use client";

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface DashboardStats {
  listings: number;
  farmers: number;
  orders: number;
  revenue: number;
}

interface CategoryDatum {
  category: string;
  listings: number;
}

interface StatusDatum {
  name: string;
  value: number;
  color: string;
}

interface RecentOrder {
  id: number;
  order_id: number;
  buyer: string;
  product: string;
  total: number;
  status: string;
}

interface DashboardOverviewProps {
  stats: DashboardStats;
  categoryData: CategoryDatum[];
  statusData: StatusDatum[];
  recentOrders: RecentOrder[];
}

export function DashboardOverview({
  stats,
  categoryData,
  statusData,
  recentOrders,
}: DashboardOverviewProps) {
  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-primary font-headline-lg">📊 Overview</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-surface-white rounded-xl border border-border-light p-6">
          <p className="text-sm text-on-surface-variant uppercase">Total Listings</p>
          <h3 className="text-3xl font-bold text-primary mt-2">{stats.listings}</h3>
        </div>
        <div className="bg-surface-white rounded-xl border border-border-light p-6">
          <p className="text-sm text-on-surface-variant uppercase">Registered Farmers</p>
          <h3 className="text-3xl font-bold text-primary mt-2">{stats.farmers}</h3>
        </div>
        <div className="bg-surface-white rounded-xl border border-border-light p-6">
          <p className="text-sm text-on-surface-variant uppercase">Active Orders</p>
          <h3 className="text-3xl font-bold text-primary mt-2">{stats.orders}</h3>
        </div>
        <div className="bg-surface-white rounded-xl border border-border-light p-6">
          <p className="text-sm text-on-surface-variant uppercase">Revenue</p>
          <h3 className="text-3xl font-bold text-primary mt-2">R {stats.revenue.toLocaleString()}</h3>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-surface-white rounded-xl border border-border-light p-6">
          <h3 className="text-lg font-medium text-primary mb-4">Listings by Category</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={categoryData}>
              <XAxis dataKey="category" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="listings" fill="#1A3685" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-surface-white rounded-xl border border-border-light p-6">
          <h3 className="text-lg font-medium text-primary mb-4">Order Status</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={statusData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                {statusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-surface-white rounded-xl border border-border-light overflow-hidden">
        <h3 className="text-lg font-medium text-primary p-4 border-b border-border-light">Recent Orders</h3>
        <Table>
          <TableHeader>
            <TableRow className="bg-[#F9F9F9]">
              <TableHead>Order ID</TableHead>
              <TableHead>Buyer</TableHead>
              <TableHead>Product</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {recentOrders.map((order) => (
              <TableRow key={order.id} className="hover:bg-hover-blue">
                <TableCell>{order.order_id}</TableCell>
                <TableCell>{order.buyer}</TableCell>
                <TableCell>{order.product}</TableCell>
                <TableCell>R {order.total.toFixed(2)}</TableCell>
                <TableCell><Badge variant="outline">{order.status}</Badge></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
