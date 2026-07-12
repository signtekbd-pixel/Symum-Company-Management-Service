"use client";

import * as React from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface MaterialCategory {
  id: string;
  name: string;
}

interface MaterialFormData {
  name: string;
  code: string;
  categoryId: string;
  unit: string;
  description: string;
  minStockLevel: string;
  maxStockLevel: string;
  reorderPoint: string;
  costPrice: string;
}

interface MaterialFormModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  material?: {
    id: string;
    name: string;
    code: string;
    categoryId: string;
    unit: string;
    description?: string;
    minStockLevel: number;
    maxStockLevel: number;
    reorderPoint: number;
    costPrice: number;
  } | null;
}

export function MaterialFormModal({ open, onClose, onSuccess, material }: MaterialFormModalProps) {
  const [categories, setCategories] = React.useState<MaterialCategory[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState("");
  const [form, setForm] = React.useState<MaterialFormData>({
    name: "",
    code: "",
    categoryId: "",
    unit: "sheet",
    description: "",
    minStockLevel: "10",
    maxStockLevel: "1000",
    reorderPoint: "50",
    costPrice: "",
  });

  React.useEffect(() => {
    if (open) {
      fetch("/api/material-categories")
        .then((r) => r.json())
        .then((data) => {
          setCategories(data.categories || []);
        })
        .catch(() => {});

      if (material) {
        setForm({
          name: material.name,
          code: material.code,
          categoryId: material.categoryId,
          unit: material.unit,
          description: material.description || "",
          minStockLevel: material.minStockLevel.toString(),
          maxStockLevel: material.maxStockLevel.toString(),
          reorderPoint: material.reorderPoint.toString(),
          costPrice: material.costPrice.toString(),
        });
      } else {
        setForm({ name: "", code: "", categoryId: "", unit: "sheet", description: "", minStockLevel: "10", maxStockLevel: "1000", reorderPoint: "50", costPrice: "" });
      }
    }
  }, [open, material]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const url = material ? `/api/inventory/${material.id}` : "/api/inventory";
      const method = material ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          minStockLevel: parseInt(form.minStockLevel),
          maxStockLevel: parseInt(form.maxStockLevel),
          reorderPoint: parseInt(form.reorderPoint),
          costPrice: parseFloat(form.costPrice),
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to save material");
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
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-lg font-semibold">{material ? "Edit Material" : "Add Material"}</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && <div className="text-sm text-red-600 bg-red-50 p-3 rounded-lg">{error}</div>}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Code *</label>
              <Input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} required />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
              <select value={form.categoryId} onChange={(e) => setForm({ ...form, categoryId: e.target.value })} className="h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm" required>
                <option value="">Select category</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Unit</label>
              <select value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })} className="h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm">
                <option value="sheet">Sheet</option>
                <option value="roll">Roll</option>
                <option value="kg">Kg</option>
                <option value="liter">Liter</option>
                <option value="box">Box</option>
                <option value="ream">Ream</option>
                <option value="set">Set</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <Input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Cost Price *</label>
              <Input type="number" step="0.01" value={form.costPrice} onChange={(e) => setForm({ ...form, costPrice: e.target.value })} required />
            </div>
            <div></div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Min Stock</label>
              <Input type="number" value={form.minStockLevel} onChange={(e) => setForm({ ...form, minStockLevel: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Max Stock</label>
              <Input type="number" value={form.maxStockLevel} onChange={(e) => setForm({ ...form, maxStockLevel: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Reorder Point</label>
              <Input type="number" value={form.reorderPoint} onChange={(e) => setForm({ ...form, reorderPoint: e.target.value })} />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={loading}>{loading ? "Saving..." : material ? "Update" : "Create"}</Button>
          </div>
        </form>
      </div>
    </div>
  );
}
