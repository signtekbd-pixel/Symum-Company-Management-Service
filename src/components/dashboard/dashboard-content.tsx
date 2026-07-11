"use client";

import * as React from "react";
import {
  ShoppingCart,
  Users,
  Package,
  CreditCard,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";

const stats = [
  {
    title: "Total Orders",
    value: "1,234",
    change: "+12.5%",
    trend: "up",
    icon: ShoppingCart,
    color: "bg-blue-500",
  },
  {
    title: "Active Customers",
    value: "456",
    change: "+8.2%",
    trend: "up",
    icon: Users,
    color: "bg-green-500",
  },
  {
    title: "In Production",
    value: "23",
    change: "-2.1%",
    trend: "down",
    icon: Package,
    color: "bg-yellow-500",
  },
  {
    title: "Revenue (This Month)",
    value: formatCurrency(1250000),
    change: "+15.3%",
    trend: "up",
    icon: CreditCard,
    color: "bg-purple-500",
  },
];

const recentOrders = [
  { id: "ORD-2401-0001", customer: "Rahman Printers", amount: 45000, status: "IN_PRODUCTION" },
  { id: "ORD-2401-0002", customer: "ABC Corporation", amount: 125000, status: "CONFIRMED" },
  { id: "ORD-2401-0003", customer: "Digital World", amount: 8500, status: "DELIVERED" },
  { id: "ORD-2401-0004", customer: "Tech Solutions Ltd", amount: 32000, status: "READY" },
  { id: "ORD-2401-0005", customer: "Fashion Hub", amount: 67500, status: "IN_PRODUCTION" },
];

const productionJobs = [
  { order: "ORD-2401-0001", job: "Business Cards", progress: 85, machine: "HP Indigo" },
  { order: "ORD-2401-0005", job: "Brochures A4", progress: 45, machine: "Canon imagePRESS" },
  { order: "ORD-2401-0002", job: "Banner 4x8", progress: 20, machine: "Epson SureColor" },
];

function getStatusBadge(status: string) {
  const colors: Record<string, string> = {
    DRAFT: "bg-gray-100 text-gray-800",
    CONFIRMED: "bg-blue-100 text-blue-800",
    IN_PRODUCTION: "bg-yellow-100 text-yellow-800",
    READY: "bg-green-100 text-green-800",
    DELIVERED: "bg-green-100 text-green-800",
  };
  return colors[status] || "bg-gray-100 text-gray-800";
}

export function DashboardContent() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500">Welcome back! Here&apos;s what&apos;s happening today.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  <div className="flex items-center mt-1">
                    {stat.trend === "up" ? (
                      <ArrowUpRight className="h-4 w-4 text-green-500" />
                    ) : (
                      <ArrowDownRight className="h-4 w-4 text-red-500" />
                    )}
                    <span
                      className={`text-sm font-medium ${
                        stat.trend === "up" ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      {stat.change}
                    </span>
                    <span className="text-sm text-gray-500 ml-1">vs last month</span>
                  </div>
                </div>
                <div className={`p-3 rounded-xl ${stat.color}`}>
                  <stat.icon className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Recent Orders</CardTitle>
            <a href="/orders" className="text-sm text-blue-600 hover:underline">
              View all
            </a>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentOrders.map((order) => (
                <div
                  key={order.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-gray-50"
                >
                  <div>
                    <p className="font-medium text-gray-900">{order.id}</p>
                    <p className="text-sm text-gray-500">{order.customer}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-gray-900">
                      {formatCurrency(order.amount)}
                    </p>
                    <span
                      className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${getStatusBadge(
                        order.status
                      )}`}
                    >
                      {order.status.replace("_", " ")}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Production Status */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Production Status</CardTitle>
            <a href="/production" className="text-sm text-blue-600 hover:underline">
              View all
            </a>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {productionJobs.map((job) => (
                <div
                  key={job.order}
                  className="p-3 rounded-lg bg-gray-50"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <p className="font-medium text-gray-900">{job.job}</p>
                      <p className="text-sm text-gray-500">{job.order}</p>
                    </div>
                    <span className="text-sm text-gray-500">{job.machine}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all"
                      style={{ width: `${job.progress}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1 text-right">{job.progress}%</p>
                </div>
              ))}
            </div>
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
            <a
              href="/orders/new"
              className="flex flex-col items-center p-4 rounded-lg border-2 border-dashed border-gray-200 hover:border-blue-400 hover:bg-blue-50 transition-colors"
            >
              <ShoppingCart className="h-8 w-8 text-blue-500 mb-2" />
              <span className="text-sm font-medium text-gray-700">New Order</span>
            </a>
            <a
              href="/customers/new"
              className="flex flex-col items-center p-4 rounded-lg border-2 border-dashed border-gray-200 hover:border-green-400 hover:bg-green-50 transition-colors"
            >
              <Users className="h-8 w-8 text-green-500 mb-2" />
              <span className="text-sm font-medium text-gray-700">Add Customer</span>
            </a>
            <a
              href="/inventory"
              className="flex flex-col items-center p-4 rounded-lg border-2 border-dashed border-gray-200 hover:border-yellow-400 hover:bg-yellow-50 transition-colors"
            >
              <Package className="h-8 w-8 text-yellow-500 mb-2" />
              <span className="text-sm font-medium text-gray-700">Check Stock</span>
            </a>
            <a
              href="/invoicing"
              className="flex flex-col items-center p-4 rounded-lg border-2 border-dashed border-gray-200 hover:border-purple-400 hover:bg-purple-50 transition-colors"
            >
              <CreditCard className="h-8 w-8 text-purple-500 mb-2" />
              <span className="text-sm font-medium text-gray-700">Create Invoice</span>
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
