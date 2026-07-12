"use client";

import * as React from "react";
import { Search, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface AuditLog {
  id: string;
  action: string;
  entity: string;
  entityId: string | null;
  oldValues: any;
  newValues: any;
  ipAddress: string | null;
  createdAt: string;
  user: { name: string; email: string };
}

const actionColors: Record<string, string> = {
  create: "text-green-600",
  update: "text-blue-600",
  delete: "text-red-600",
  login: "text-purple-600",
  impersonate: "text-orange-600",
  export: "text-yellow-600",
};

export function AuditLogsContent() {
  const [logs, setLogs] = React.useState<AuditLog[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [entityFilter, setEntityFilter] = React.useState("");
  const [actionFilter, setActionFilter] = React.useState("");

  React.useEffect(() => { fetchLogs(); }, [entityFilter, actionFilter]);

  async function fetchLogs() {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (entityFilter) params.set("entity", entityFilter);
      if (actionFilter) params.set("action", actionFilter);
      const res = await fetch(`/api/audit-logs?${params}`);
      const data = await res.json();
      setLogs(data.logs || []);
    } catch (error) {
      console.error("Failed to fetch audit logs:", error);
    } finally {
      setLoading(false);
    }
  }

  function formatChanges(oldVals: any, newVals: any) {
    if (!oldVals && !newVals) return "—";
    const changes: string[] = [];
    if (newVals && typeof newVals === "object") {
      Object.entries(newVals).forEach(([key, val]) => {
        if (oldVals?.[key] !== undefined && oldVals[key] !== val) {
          changes.push(`${key}: ${oldVals[key]} → ${val}`);
        } else if (oldVals?.[key] === undefined) {
          changes.push(`${key}: ${val}`);
        }
      });
    }
    return changes.length > 0 ? changes.join(", ") : "—";
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Audit Logs</h1>
        <p className="text-gray-500">Track all system activity and changes</p>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <select value={entityFilter} onChange={(e) => setEntityFilter(e.target.value)} className="h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm">
              <option value="">All Entities</option>
              <option value="user">Users</option>
              <option value="order">Orders</option>
              <option value="product">Products</option>
              <option value="material">Materials</option>
              <option value="system">System</option>
            </select>
            <select value={actionFilter} onChange={(e) => setActionFilter(e.target.value)} className="h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm">
              <option value="">All Actions</option>
              <option value="create">Create</option>
              <option value="update">Update</option>
              <option value="delete">Delete</option>
              <option value="login">Login</option>
              <option value="impersonate">Impersonate</option>
              <option value="export">Export</option>
            </select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Activity Log ({logs.length} entries)</CardTitle></CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center p-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" /></div>
          ) : logs.length === 0 ? (
            <div className="text-center p-8 text-gray-500">No audit logs found.</div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Action</TableHead>
                    <TableHead>Entity</TableHead>
                    <TableHead>Changes</TableHead>
                    <TableHead>Time</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {logs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium text-sm">{log.user.name}</p>
                          <p className="text-xs text-muted-foreground">{log.user.email}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className={`text-sm font-medium capitalize ${actionColors[log.action] || "text-gray-600"}`}>
                          {log.action}
                        </span>
                      </TableCell>
                      <TableCell className="text-sm capitalize">{log.entity}{log.entityId ? ` (${log.entityId.slice(0, 8)}...)` : ""}</TableCell>
                      <TableCell className="text-xs text-muted-foreground max-w-xs truncate">{formatChanges(log.oldValues, log.newValues)}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">{new Date(log.createdAt).toLocaleString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
