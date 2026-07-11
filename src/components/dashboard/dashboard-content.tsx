"use client";

import * as React from "react";
import Link from "next/link";
import {
  ShoppingCart, Users, Package, CreditCard,
  ArrowUpRight, ArrowDownRight, Eye
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatCurrency, getStatusColor } from "@/lib/utils";

interface DashboardStats {
  totalOrders: number;
  activeCustomers: number;
  inProduction: number;
  monthlyRevenue: number;
  recentOrders: any[];
  productionJobs: any[];
}

export function DashboardContent() {
  const [stats, setStats] = React.useState<DashboardStats | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    fetch("/api/reports/dashboard")
      .then((r) => r.json())
      .then((data) => setStats(data))
      .catch(() => {
        setStats({
          totalOrders: 0, activeCustomers: 0, inProduction: 0, monthlyRevenue: 0,
          recentOrders: [], productionJobs: [],
        });
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500">Welcome back! Here&apos;s what&apos;s happening today.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-24" />
                  <div className="h-8 bg-gray-200 rounded w-16" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const s = stats || { totalOrders: 0, activeCustomers: 0, inProduction: 0, monthlyRevenue: 0, recentOrders: [], productionJobs: [] };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500">Welcome back! Here&apos;s what&apos;s happening today.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Total Orders</p>
                <p className="text-2xl font-bold text-gray-900">{s.totalOrders}</p>
              </div>
              <div className="p-3 rounded-xl bg-blue-500">
                <ShoppingCart className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Active Customers</p>
                <p className="text-2xl font-bold text-gray-900">{s.activeCustomers}</p>
              </div>
              <div className="p-3 rounded-xl bg-green-500">
                <Users className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">In Production</p>
                <p className="text-2xl font-bold text-gray-900">{s.inProduction}</p>
              </div>
              <div className="p-3 rounded-xl bg-yellow-500">
                <Package className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Revenue (This Month)</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(s.monthlyRevenue)}</p>
              </div>
              <div className="p-3 rounded-xl bg-purple-500">
                <CreditCard className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Recent Orders</CardTitle>
            <Link href="/orders" className="text-sm text-blue-600 hover:underline">View all</Link>
          </CardHeader>
          <CardContent>
            {s.recentOrders.length === 0 ? (
              <p className="text-center p-4 text-gray-500 text-sm">No orders yet. Create your first order!</p>
            ) : (
              <div className="space-y-3">
                {s.recentOrders.map((order: any) => (
                  <Link
                    key={order.id}
                    href={`/orders/${order.id}`}
                    className="flex items-center justify-between p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
                  >
                    <div>
                      <p className="font-medium text-gray-900">{order.orderNumber}</p>
                      <p className="text-sm text-gray-500">{order.customer?.name}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-gray-900">{formatCurrency(Number(order.totalAmount))}</p>
                      <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                        {order.status.replace(/_/g, " ")}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Production Status */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Production Status</CardTitle>
            <Link href="/production" className="text-sm text-blue-600 hover:underline">View all</Link>
          </CardHeader>
          <CardContent>
            {s.productionJobs.length === 0 ? (
              <p className="text-center p-4 text-gray-500 text-sm">No production jobs yet.</p>
            ) : (
              <div className="space-y-3">
                {s.productionJobs.map((job: any) => (
                  <div key={job.id} className="p-3 rounded-lg bg-gray-50">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <p className="font-medium">{job.order?.orderNumber}</p>
                        <p className="text-sm text-gray-500">{job.machine?.name || "Unassigned"}</p>
                      </div>
                      <span className="text-sm text-gray-500">{job.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${job.progress}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <Link
              href="/orders/new"
              className="flex flex-col items-center p-4 rounded-lg border-2 border-dashed border-gray-200 hover:border-blue-400 hover:bg-blue-50 transition-colors"
            >
              <ShoppingCart className="h-8 w-8 text-blue-500 mb-2" />
              <span className="text-sm font-medium text-gray-700">New Order</span>
            </Link>
            <Link
              href="/customers/new"
              className="flex flex-col items-center p-4 rounded-lg border-2 border-dashed border-gray-200 hover:border-green-400 hover:bg-green-50 transition-colors"
            >
              <Users className="h-8 w-8 text-green-500 mb-2" />
              <span className="text-sm font-medium text-gray-700">Add Customer</span>
            </Link>
            <Link
              href="/inventory"
              className="flex flex-col items-center p-4 rounded-lg border-2 border-dashed border-gray-200 hover:border-yellow-400 hover:bg-yellow-50 transition-colors"
            >
              <Package className="h-8 w-8 text-yellow-500 mb-2" />
              <span className="text-sm font-medium text-gray-700">Check Stock</span>
            </Link>
            <Link
              href="/invoicing"
              className="flex flex-col items-center p-4 rounded-lg border-2 border-dashed border-gray-200 hover:border-purple-400 hover:bg-purple-50 transition-colors"
            >
              <CreditCard className="h-8 w-8 text-purple-500 mb-2" />
              <span className="text-sm font-medium text-gray-700">Create Invoice</span>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
