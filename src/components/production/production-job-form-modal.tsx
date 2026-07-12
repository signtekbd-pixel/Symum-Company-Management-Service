"use client";

import * as React from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface Machine {
  id: string;
  name: string;
  code: string;
}

interface ProductionJobFormModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  preselectedOrderId?: string;
}

export function ProductionJobFormModal({ open, onClose, onSuccess, preselectedOrderId }: ProductionJobFormModalProps) {
  const [orders, setOrders] = React.useState<any[]>([]);
  const [machines, setMachines] = React.useState<Machine[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState("");
  const [form, setForm] = React.useState({
    orderId: preselectedOrderId || "",
    machineId: "",
    estimatedHours: "",
    notes: "",
  });

  React.useEffect(() => {
    if (open) {
      Promise.all([
        fetch("/api/orders").then((r) => r.json()),
        fetch("/api/production").then((r) => r.json()),
      ]).then(([ordersData]) => {
        setOrders(ordersData.orders || []);
      }).catch(() => {});
      setForm({ orderId: preselectedOrderId || "", machineId: "", estimatedHours: "", notes: "" });
    }
  }, [open, preselectedOrderId]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/production", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: form.orderId,
          machineId: form.machineId || undefined,
          estimatedHours: form.estimatedHours ? parseFloat(form.estimatedHours) : undefined,
          notes: form.notes || undefined,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to create job");
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-lg font-semibold">Create Production Job</h2>
          <Button variant="ghost" size="icon" onClick={onClose}><X className="h-5 w-5" /></Button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && <div className="text-sm text-red-600 bg-red-50 p-3 rounded-lg">{error}</div>}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Order *</label>
            <select value={form.orderId} onChange={(e) => setForm({ ...form, orderId: e.target.value })} className="h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm" required>
              <option value="">Select order</option>
              {orders.filter((o) => o.status === "CONFIRMED" || o.status === "IN_PRODUCTION").map((o) => (
                <option key={o.id} value={o.id}>{o.orderNumber} - {o.customer.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Machine</label>
            <select value={form.machineId} onChange={(e) => setForm({ ...form, machineId: e.target.value })} className="h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm">
              <option value="">Unassigned</option>
              {machines.filter((m) => m.code.startsWith("MCH")).map((m) => (
                <option key={m.id} value={m.id}>{m.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Estimated Hours</label>
            <Input type="number" step="0.5" value={form.estimatedHours} onChange={(e) => setForm({ ...form, estimatedHours: e.target.value })} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
            <Input value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={loading}>{loading ? "Creating..." : "Create Job"}</Button>
          </div>
        </form>
      </div>
    </div>
  );
}
