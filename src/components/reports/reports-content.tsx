"use client";

import * as React from "react";
import {
  BarChart3,
  TrendingUp,
  Users,
  ShoppingCart,
  Download,
  Calendar,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";

const reportTypes = [
  {
    id: "sales",
    title: "Sales Report",
    description: "Track revenue and sales performance",
    icon: TrendingUp,
    color: "bg-blue-500",
  },
  {
    id: "orders",
    title: "Order Report",
    description: "Analyze order volume and status",
    icon: ShoppingCart,
    color: "bg-green-500",
  },
  {
    id: "customers",
    title: "Customer Report",
    description: "View customer activity and history",
    icon: Users,
    color: "bg-purple-500",
  },
  {
    id: "production",
    title: "Production Report",
    description: "Monitor production efficiency",
    icon: BarChart3,
    color: "bg-yellow-500",
  },
];

const salesData = [
  { month: "Jan", revenue: 850000 },
  { month: "Feb", revenue: 920000 },
  { month: "Mar", revenue: 1100000 },
  { month: "Apr", revenue: 980000 },
  { month: "May", revenue: 1250000 },
  { month: "Jun", revenue: 1400000 },
];

const topProducts = [
  { name: "Business Cards", orders: 45, revenue: 225000 },
  { name: "Brochures", orders: 32, revenue: 256000 },
  { name: "Banners", orders: 18, revenue: 270000 },
  { name: "Flyers", orders: 28, revenue: 84000 },
  { name: "Letterheads", orders: 15, revenue: 45000 },
];

export function ReportsContent() {
  const [dateRange, setDateRange] = React.useState("month");

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reports</h1>
          <p className="text-gray-500">Analyze your business performance</p>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm"
          >
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="quarter">This Quarter</option>
            <option value="year">This Year</option>
          </select>
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Report Types */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {reportTypes.map((report) => (
          <Card key={report.id} className="cursor-pointer hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-xl ${report.color}`}>
                  <report.icon className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold">{report.title}</h3>
                  <p className="text-sm text-gray-500">{report.description}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Revenue Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {salesData.map((item) => (
                <div key={item.month} className="flex items-center gap-4">
                  <span className="w-8 text-sm text-gray-500">{item.month}</span>
                  <div className="flex-1">
                    <div className="w-full bg-gray-100 rounded-full h-6">
                      <div
                        className="bg-blue-500 h-6 rounded-full flex items-center justify-end pr-2"
                        style={{ width: `${(item.revenue / 1500000) * 100}%` }}
                      >
                        <span className="text-xs text-white font-medium">
                          {formatCurrency(item.revenue)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Top Products */}
        <Card>
          <CardHeader>
            <CardTitle>Top Products</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topProducts.map((product, index) => (
                <div key={product.name} className="flex items-center gap-4">
                  <span className="text-lg font-bold text-gray-300 w-6">
                    {index + 1}
                  </span>
                  <div className="flex-1">
                    <p className="font-medium">{product.name}</p>
                    <p className="text-sm text-gray-500">{product.orders} orders</p>
                  </div>
                  <span className="font-medium">{formatCurrency(product.revenue)}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Summary Stats */}
      <Card>
        <CardHeader>
          <CardTitle>Monthly Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
            <div>
              <p className="text-sm text-gray-500">Total Revenue</p>
              <p className="text-2xl font-bold">{formatCurrency(6500000)}</p>
              <p className="text-sm text-green-600">+12.5% vs last month</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Orders</p>
              <p className="text-2xl font-bold">138</p>
              <p className="text-sm text-green-600">+8.2% vs last month</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Avg. Order Value</p>
              <p className="text-2xl font-bold">{formatCurrency(47101)}</p>
              <p className="text-sm text-green-600">+3.8% vs last month</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">New Customers</p>
              <p className="text-2xl font-bold">24</p>
              <p className="text-sm text-green-600">+15.4% vs last month</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
