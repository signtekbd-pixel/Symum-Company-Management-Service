"use client";

import * as React from "react";
import { Activity, Users, ShoppingCart, Package, Building2, Cog, AlertTriangle, Database } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface SystemHealth {
  totalUsers: number;
  activeUsers: number;
  totalCustomers: number;
  totalOrders: number;
  totalProducts: number;
  totalMaterials: number;
  totalBranches: number;
  totalMachines: number;
  machinesByStatus: { status: string; count: number }[];
  recentAuditLogs: number;
  pendingApprovals: number;
  dbSize: string;
  uptime: number;
}

const machineStatusColors: Record<string, string> = {
  AVAILABLE: "text-green-600",
  IN_USE: "text-blue-600",
  MAINTENANCE: "text-yellow-600",
  OUT_OF_SERVICE: "text-red-600",
};

export function SystemHealthContent() {
  const [health, setHealth] = React.useState<SystemHealth | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    fetch("/api/system-health")
      .then((r) => r.json())
      .then((data) => setHealth(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div><h1 className="text-2xl font-bold text-gray-900">System Health</h1><p className="text-gray-500">Loading...</p></div>
        <div className="flex items-center justify-center p-16"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" /></div>
      </div>
    );
  }

  if (!health) return <div className="text-center p-8 text-gray-500">Failed to load system health.</div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">System Health</h1>
        <p className="text-gray-500">System overview and database statistics</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card><CardContent className="p-6"><div className="flex items-center justify-between"><div><p className="text-sm text-muted-foreground">Database Size</p><p className="text-2xl font-bold">{health.dbSize}</p></div><Database className="h-8 w-8 text-blue-500" /></div></CardContent></Card>
        <Card><CardContent className="p-6"><div className="flex items-center justify-between"><div><p className="text-sm text-muted-foreground">Uptime</p><p className="text-2xl font-bold">{Math.floor(health.uptime / 3600)}h {Math.floor((health.uptime % 3600) / 60)}m</p></div><Activity className="h-8 w-8 text-green-500" /></div></CardContent></Card>
        <Card><CardContent className="p-6"><div className="flex items-center justify-between"><div><p className="text-sm text-muted-foreground">Active Users (24h)</p><p className="text-2xl font-bold">{health.recentAuditLogs}</p></div><Users className="h-8 w-8 text-purple-500" /></div></CardContent></Card>
        <Card><CardContent className="p-6"><div className="flex items-center justify-between"><div><p className="text-sm text-muted-foreground">Pending Approvals</p><p className="text-2xl font-bold">{health.pendingApprovals}</p></div><AlertTriangle className="h-8 w-8 text-yellow-500" /></div></CardContent></Card>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card><CardContent className="p-4"><div className="flex items-center gap-3"><Users className="h-5 w-5 text-gray-400" /><div><p className="text-sm text-muted-foreground">Users</p><p className="text-lg font-bold">{health.activeUsers} / {health.totalUsers}</p></div></div></CardContent></Card>
        <Card><CardContent className="p-4"><div className="flex items-center gap-3"><ShoppingCart className="h-5 w-5 text-gray-400" /><div><p className="text-sm text-muted-foreground">Orders</p><p className="text-lg font-bold">{health.totalOrders}</p></div></div></CardContent></Card>
        <Card><CardContent className="p-4"><div className="flex items-center gap-3"><Package className="h-5 w-5 text-gray-400" /><div><p className="text-sm text-muted-foreground">Products</p><p className="text-lg font-bold">{health.totalProducts}</p></div></div></CardContent></Card>
        <Card><CardContent className="p-4"><div className="flex items-center gap-3"><Building2 className="h-5 w-5 text-gray-400" /><div><p className="text-sm text-muted-foreground">Branches</p><p className="text-lg font-bold">{health.totalBranches}</p></div></div></CardContent></Card>
      </div>

      <Card>
        <CardHeader><CardTitle>Machines by Status</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {health.machinesByStatus.map((m) => (
              <div key={m.status} className="text-center p-4 rounded-lg bg-accent">
                <Cog className={`h-6 w-6 mx-auto mb-2 ${machineStatusColors[m.status] || "text-gray-400"}`} />
                <p className="text-2xl font-bold">{m.count}</p>
                <p className="text-xs text-muted-foreground capitalize">{m.status.replace(/_/g, " ")}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
