"use client";

import * as React from "react";
import Link from "next/link";
import {
  ShoppingCart, Users, Package, CreditCard,
  ArrowUpRight, Eye, Factory, BarChart3,
  Building2, Cog, Tag, AlertTriangle,
  Shield, CheckCircle, Activity, Key, Settings2
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency, getStatusColor } from "@/lib/utils";
import { roleLabels, type Role } from "@/lib/roles";

interface DashboardStats {
  totalOrders: number;
  activeCustomers: number;
  inProduction: number;
  monthlyRevenue: number;
  recentOrders: any[];
  productionJobs: any[];
  totalUsers?: number;
  totalProducts?: number;
  totalMaterials?: number;
  totalBranches?: number;
  totalMachines?: number;
  activeMachines?: number;
  lowStockMaterials?: number;
}

interface DashboardContentProps {
  role: string;
}

export function DashboardContent({ role }: DashboardContentProps) {
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

  const s = stats || { totalOrders: 0, activeCustomers: 0, inProduction: 0, monthlyRevenue: 0, recentOrders: [], productionJobs: [] };

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground">Loading...</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse space-y-2">
                  <div className="h-4 bg-muted rounded w-24" />
                  <div className="h-8 bg-muted rounded w-16" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (role === "CUSTOMER") return <CustomerDashboard stats={s} />;
  if (role === "OPERATOR") return <OperatorDashboard stats={s} />;
  if (role === "SALES") return <SalesDashboard stats={s} />;
  if (role === "MANAGER") return <ManagerDashboard stats={s} />;
  if (role === "DEV") return <DevSuperAdminDashboard stats={s} />;
  return <AdminDashboard stats={s} role={role} />;
}

function AdminDashboard({ stats: s, role }: { stats: DashboardStats; role: string }) {
  const label = roleLabels[role as Role] || role;
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground">Welcome back, {label}. Here&apos;s your full overview.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Orders" value={s.totalOrders.toString()} icon={ShoppingCart} color="blue" />
        <StatCard title="Active Customers" value={s.activeCustomers.toString()} icon={Users} color="green" />
        <StatCard title="In Production" value={s.inProduction.toString()} icon={Factory} color="yellow" />
        <StatCard title="Revenue (This Month)" value={formatCurrency(s.monthlyRevenue)} icon={CreditCard} color="purple" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Users" value={(s.totalUsers || 0).toString()} icon={Users} color="green" />
        <StatCard title="Products" value={(s.totalProducts || 0).toString()} icon={Package} color="blue" />
        <StatCard title="Materials" value={(s.totalMaterials || 0).toString()} icon={Tag} color="yellow" />
        <StatCard title="Branches" value={(s.totalBranches || 0).toString()} icon={Building2} color="purple" />
      </div>

      {(s.lowStockMaterials || 0) > 0 && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-5 w-5 text-yellow-600" />
              <div>
                <p className="font-medium text-yellow-800">Low Stock Alert</p>
                <p className="text-sm text-yellow-600">{s.lowStockMaterials} material(s) are below their minimum stock level.</p>
              </div>
              <Link href="/inventory" className="ml-auto text-sm font-medium text-yellow-700 hover:underline">
                View Inventory
              </Link>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RecentOrdersCard orders={s.recentOrders} />
        <ProductionStatusCard jobs={s.productionJobs} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Machines</CardTitle>
            <Link href="/machines" className="text-sm text-blue-600 hover:underline">Manage</Link>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Total Machines</span>
                <span className="font-medium">{s.totalMachines || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Available Now</span>
                <span className="font-medium text-green-600">{s.activeMachines || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">In Use / Maintenance</span>
                <span className="font-medium text-yellow-600">{(s.totalMachines || 0) - (s.activeMachines || 0)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Admin Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <Link href="/users" className="flex flex-col items-center p-4 rounded-lg border-2 border-dashed border-border hover:border-green-400 hover:bg-green-50 transition-colors">
                <Users className="h-8 w-8 text-green-500 mb-2" />
                <span className="text-sm font-medium text-gray-700">Manage Users</span>
              </Link>
              <Link href="/product-categories" className="flex flex-col items-center p-4 rounded-lg border-2 border-dashed border-border hover:border-blue-400 hover:bg-blue-50 transition-colors">
                <Tag className="h-8 w-8 text-blue-500 mb-2" />
                <span className="text-sm font-medium text-gray-700">Categories</span>
              </Link>
              <Link href="/branches" className="flex flex-col items-center p-4 rounded-lg border-2 border-dashed border-border hover:border-purple-400 hover:bg-purple-50 transition-colors">
                <Building2 className="h-8 w-8 text-purple-500 mb-2" />
                <span className="text-sm font-medium text-gray-700">Branches</span>
              </Link>
              <Link href="/settings" className="flex flex-col items-center p-4 rounded-lg border-2 border-dashed border-border hover:border-gray-400 hover:bg-gray-50 transition-colors">
                <Cog className="h-8 w-8 text-gray-500 mb-2" />
                <span className="text-sm font-medium text-gray-700">Settings</span>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function DevSuperAdminDashboard({ stats: s }: { stats: DashboardStats }) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Super Admin Dashboard</h1>
        <p className="text-muted-foreground">Full system control and monitoring.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Orders" value={s.totalOrders.toString()} icon={ShoppingCart} color="blue" />
        <StatCard title="Active Customers" value={s.activeCustomers.toString()} icon={Users} color="green" />
        <StatCard title="In Production" value={s.inProduction.toString()} icon={Factory} color="yellow" />
        <StatCard title="Revenue (This Month)" value={formatCurrency(s.monthlyRevenue)} icon={CreditCard} color="purple" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Users" value={(s.totalUsers || 0).toString()} icon={Users} color="green" />
        <StatCard title="Products" value={(s.totalProducts || 0).toString()} icon={Package} color="blue" />
        <StatCard title="Materials" value={(s.totalMaterials || 0).toString()} icon={Tag} color="yellow" />
        <StatCard title="Branches" value={(s.totalBranches || 0).toString()} icon={Building2} color="purple" />
      </div>

      {(s.lowStockMaterials || 0) > 0 && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-5 w-5 text-yellow-600" />
              <div>
                <p className="font-medium text-yellow-800">Low Stock Alert</p>
                <p className="text-sm text-yellow-600">{s.lowStockMaterials} material(s) are below their minimum stock level.</p>
              </div>
              <Link href="/inventory" className="ml-auto text-sm font-medium text-yellow-700 hover:underline">View Inventory</Link>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RecentOrdersCard orders={s.recentOrders} />
        <ProductionStatusCard jobs={s.productionJobs} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Machines</CardTitle>
            <Link href="/machines" className="text-sm text-blue-600 hover:underline">Manage</Link>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Total Machines</span>
                <span className="font-medium">{s.totalMachines || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Available Now</span>
                <span className="font-medium text-green-600">{s.activeMachines || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">In Use / Maintenance</span>
                <span className="font-medium text-yellow-600">{(s.totalMachines || 0) - (s.activeMachines || 0)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Super Admin Controls</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <Link href="/audit-logs" className="flex flex-col items-center p-4 rounded-lg border-2 border-dashed border-border hover:border-red-400 hover:bg-red-50 transition-colors">
                <Shield className="h-8 w-8 text-red-500 mb-2" />
                <span className="text-sm font-medium text-gray-700">Audit Logs</span>
              </Link>
              <Link href="/system-settings" className="flex flex-col items-center p-4 rounded-lg border-2 border-dashed border-border hover:border-blue-400 hover:bg-blue-50 transition-colors">
                <Settings2 className="h-8 w-8 text-blue-500 mb-2" />
                <span className="text-sm font-medium text-gray-700">System Settings</span>
              </Link>
              <Link href="/approvals" className="flex flex-col items-center p-4 rounded-lg border-2 border-dashed border-border hover:border-green-400 hover:bg-green-50 transition-colors">
                <CheckCircle className="h-8 w-8 text-green-500 mb-2" />
                <span className="text-sm font-medium text-gray-700">Approvals</span>
              </Link>
              <Link href="/system-health" className="flex flex-col items-center p-4 rounded-lg border-2 border-dashed border-border hover:border-purple-400 hover:bg-purple-50 transition-colors">
                <Activity className="h-8 w-8 text-purple-500 mb-2" />
                <span className="text-sm font-medium text-gray-700">System Health</span>
              </Link>
              <Link href="/api-keys" className="flex flex-col items-center p-4 rounded-lg border-2 border-dashed border-border hover:border-yellow-400 hover:bg-yellow-50 transition-colors">
                <Key className="h-8 w-8 text-yellow-500 mb-2" />
                <span className="text-sm font-medium text-gray-700">API Keys</span>
              </Link>
              <Link href="/users" className="flex flex-col items-center p-4 rounded-lg border-2 border-dashed border-border hover:border-gray-400 hover:bg-gray-50 transition-colors">
                <Users className="h-8 w-8 text-gray-500 mb-2" />
                <span className="text-sm font-medium text-gray-700">Manage Users</span>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function ManagerDashboard({ stats: s }: { stats: DashboardStats }) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Manager Dashboard</h1>
        <p className="text-muted-foreground">Production, orders and inventory overview.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard title="Total Orders" value={s.totalOrders.toString()} icon={ShoppingCart} color="blue" />
        <StatCard title="In Production" value={s.inProduction.toString()} icon={Factory} color="yellow" />
        <StatCard title="Revenue (This Month)" value={formatCurrency(s.monthlyRevenue)} icon={CreditCard} color="purple" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ProductionStatusCard jobs={s.productionJobs} />
        <RecentOrdersCard orders={s.recentOrders} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <Link href="/orders/new" className="flex flex-col items-center p-4 rounded-lg border-2 border-dashed border-border hover:border-blue-400 hover:bg-blue-50 transition-colors">
              <ShoppingCart className="h-8 w-8 text-blue-500 mb-2" />
              <span className="text-sm font-medium text-gray-700">New Order</span>
            </Link>
            <Link href="/production" className="flex flex-col items-center p-4 rounded-lg border-2 border-dashed border-border hover:border-yellow-400 hover:bg-yellow-50 transition-colors">
              <Factory className="h-8 w-8 text-yellow-500 mb-2" />
              <span className="text-sm font-medium text-gray-700">Production</span>
            </Link>
            <Link href="/inventory" className="flex flex-col items-center p-4 rounded-lg border-2 border-dashed border-border hover:border-green-400 hover:bg-green-50 transition-colors">
              <Package className="h-8 w-8 text-green-500 mb-2" />
              <span className="text-sm font-medium text-gray-700">Inventory</span>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function SalesDashboard({ stats: s }: { stats: DashboardStats }) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Sales Dashboard</h1>
        <p className="text-muted-foreground">Customers, orders and invoicing overview.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard title="Total Orders" value={s.totalOrders.toString()} icon={ShoppingCart} color="blue" />
        <StatCard title="Active Customers" value={s.activeCustomers.toString()} icon={Users} color="green" />
        <StatCard title="Revenue (This Month)" value={formatCurrency(s.monthlyRevenue)} icon={CreditCard} color="purple" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RecentOrdersCard orders={s.recentOrders} />
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Top Customers</CardTitle>
            <Link href="/customers" className="text-sm text-blue-600 hover:underline">View all</Link>
          </CardHeader>
          <CardContent>
            {s.recentOrders.length === 0 ? (
              <p className="text-center p-4 text-muted-foreground text-sm">No customer data yet.</p>
            ) : (
              <div className="space-y-3">
                {[...new Map(s.recentOrders.map((o: any) => [o.customer?.id, o.customer])).values()]
                  .filter(Boolean)
                  .slice(0, 5)
                  .map((customer: any) => (
                    <Link key={customer.id} href={`/customers/${customer.id}`} className="flex items-center justify-between p-3 rounded-lg bg-accent hover:bg-accent transition-colors">
                      <div>
                        <p className="font-medium text-foreground">{customer.name}</p>
                        <p className="text-sm text-muted-foreground">{customer.company || customer.email || customer.phone}</p>
                      </div>
                      <ArrowUpRight className="h-4 w-4 text-gray-400" />
                    </Link>
                  ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <Link href="/customers/new" className="flex flex-col items-center p-4 rounded-lg border-2 border-dashed border-border hover:border-green-400 hover:bg-green-50 transition-colors">
              <Users className="h-8 w-8 text-green-500 mb-2" />
              <span className="text-sm font-medium text-gray-700">Add Customer</span>
            </Link>
            <Link href="/orders/new" className="flex flex-col items-center p-4 rounded-lg border-2 border-dashed border-border hover:border-blue-400 hover:bg-blue-50 transition-colors">
              <ShoppingCart className="h-8 w-8 text-blue-500 mb-2" />
              <span className="text-sm font-medium text-gray-700">New Order</span>
            </Link>
            <Link href="/invoicing" className="flex flex-col items-center p-4 rounded-lg border-2 border-dashed border-border hover:border-purple-400 hover:bg-purple-50 transition-colors">
              <CreditCard className="h-8 w-8 text-purple-500 mb-2" />
              <span className="text-sm font-medium text-gray-700">Invoicing</span>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function OperatorDashboard({ stats: s }: { stats: DashboardStats }) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Production Dashboard</h1>
        <p className="text-muted-foreground">Your assigned production jobs.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <StatCard title="In Production" value={s.inProduction.toString()} icon={Factory} color="yellow" />
        <StatCard title="Total Orders" value={s.totalOrders.toString()} icon={ShoppingCart} color="blue" />
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Active Production Jobs</CardTitle>
          <Link href="/production" className="text-sm text-blue-600 hover:underline">View all</Link>
        </CardHeader>
        <CardContent>
          {s.productionJobs.length === 0 ? (
            <p className="text-center p-4 text-muted-foreground text-sm">No active production jobs.</p>
          ) : (
            <div className="space-y-3">
              {s.productionJobs.map((job: any) => (
                <div key={job.id} className="p-3 rounded-lg bg-accent">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <p className="font-medium">{job.order?.orderNumber}</p>
                      <p className="text-sm text-muted-foreground">{job.machine?.name || "Unassigned"}</p>
                    </div>
                    <span className="text-sm text-muted-foreground">{job.progress}%</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${job.progress}%` }} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function CustomerDashboard({ stats: s }: { stats: DashboardStats }) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">My Orders</h1>
        <p className="text-muted-foreground">Track your orders and proofs.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <StatCard title="My Orders" value={s.totalOrders.toString()} icon={ShoppingCart} color="blue" />
        <StatCard title="In Production" value={s.inProduction.toString()} icon={Factory} color="yellow" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RecentOrdersCard orders={s.recentOrders} />
        <ProductionStatusCard jobs={s.productionJobs} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3">
            <Link href="/orders" className="flex flex-col items-center p-4 rounded-lg border-2 border-dashed border-border hover:border-blue-400 hover:bg-blue-50 transition-colors">
              <ShoppingCart className="h-8 w-8 text-blue-500 mb-2" />
              <span className="text-sm font-medium text-gray-700">View Orders</span>
            </Link>
            <Link href="/proofs" className="flex flex-col items-center p-4 rounded-lg border-2 border-dashed border-border hover:border-purple-400 hover:bg-purple-50 transition-colors">
              <Eye className="h-8 w-8 text-purple-500 mb-2" />
              <span className="text-sm font-medium text-gray-700">View Proofs</span>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function StatCard({ title, value, icon: Icon, color }: { title: string; value: string; icon: any; color: string }) {
  const colorMap: Record<string, string> = {
    blue: "bg-blue-500",
    green: "bg-green-500",
    yellow: "bg-yellow-500",
    purple: "bg-purple-500",
  };
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold text-foreground">{value}</p>
          </div>
          <div className={`p-3 rounded-xl ${colorMap[color] || "bg-accent0"}`}>
            <Icon className="h-6 w-6 text-white" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function RecentOrdersCard({ orders }: { orders: any[] }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Recent Orders</CardTitle>
        <Link href="/orders" className="text-sm text-blue-600 hover:underline">View all</Link>
      </CardHeader>
      <CardContent>
        {orders.length === 0 ? (
          <p className="text-center p-4 text-muted-foreground text-sm">No orders yet.</p>
        ) : (
          <div className="space-y-3">
            {orders.map((order: any) => (
              <Link key={order.id} href={`/orders/${order.id}`} className="flex items-center justify-between p-3 rounded-lg bg-accent hover:bg-accent transition-colors">
                <div>
                  <p className="font-medium text-foreground">{order.orderNumber}</p>
                  <p className="text-sm text-muted-foreground">{order.customer?.name}</p>
                </div>
                <div className="text-right">
                  <p className="font-medium text-foreground">{formatCurrency(Number(order.totalAmount))}</p>
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
  );
}

function ProductionStatusCard({ jobs }: { jobs: any[] }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Production Status</CardTitle>
        <Link href="/production" className="text-sm text-blue-600 hover:underline">View all</Link>
      </CardHeader>
      <CardContent>
        {jobs.length === 0 ? (
          <p className="text-center p-4 text-muted-foreground text-sm">No production jobs yet.</p>
        ) : (
          <div className="space-y-3">
            {jobs.map((job: any) => (
              <div key={job.id} className="p-3 rounded-lg bg-accent">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <p className="font-medium">{job.order?.orderNumber}</p>
                    <p className="text-sm text-muted-foreground">{job.machine?.name || "Unassigned"}</p>
                  </div>
                  <span className="text-sm text-muted-foreground">{job.progress}%</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${job.progress}%` }} />
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
