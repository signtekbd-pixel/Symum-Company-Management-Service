"use client";

import * as React from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface ProductCategory {
  id: string;
  name: string;
}

interface ProductFormData {
  name: string;
  categoryId: string;
  description: string;
  basePrice: string;
  unit: string;
  minQuantity: string;
  leadTimeDays: string;
}

interface ProductFormModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  product?: {
    id: string;
    name: string;
    categoryId: string;
    description?: string;
    basePrice: number;
    unit: string;
    minQuantity: number;
    leadTimeDays: number;
  } | null;
}

export function ProductFormModal({ open, onClose, onSuccess, product }: ProductFormModalProps) {
  const [categories, setCategories] = React.useState<ProductCategory[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState("");
  const [form, setForm] = React.useState<ProductFormData>({
    name: "",
    categoryId: "",
    description: "",
    basePrice: "",
    unit: "piece",
    minQuantity: "1",
    leadTimeDays: "1",
  });

  React.useEffect(() => {
    if (open) {
      fetch("/api/products")
        .then((r) => r.json())
        .then((data) => {
          const cats = data.products?.reduce((acc: ProductCategory[], p: any) => {
            if (!acc.find((c) => c.id === p.category.id)) acc.push(p.category);
            return acc;
          }, []) || [];
          setCategories(cats);
        })
        .catch(() => {});

      if (product) {
        setForm({
          name: product.name,
          categoryId: product.categoryId,
          description: product.description || "",
          basePrice: product.basePrice.toString(),
          unit: product.unit,
          minQuantity: product.minQuantity.toString(),
          leadTimeDays: product.leadTimeDays.toString(),
        });
      } else {
        setForm({ name: "", categoryId: "", description: "", basePrice: "", unit: "piece", minQuantity: "1", leadTimeDays: "1" });
      }
    }
  }, [open, product]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const url = product ? `/api/products/${product.id}` : "/api/products";
      const method = product ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          basePrice: parseFloat(form.basePrice),
          minQuantity: parseInt(form.minQuantity),
          leadTimeDays: parseInt(form.leadTimeDays),
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to save product");
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
          <h2 className="text-lg font-semibold">{product ? "Edit Product" : "Add Product"}</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && <div className="text-sm text-red-600 bg-red-50 p-3 rounded-lg">{error}</div>}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Product Name *</label>
            <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
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
                <option value="piece">Piece</option>
                <option value="sqft">Sq Ft</option>
                <option value="sqm">Sq M</option>
                <option value="sheet">Sheet</option>
                <option value="roll">Roll</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <Input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Base Price *</label>
              <Input type="number" step="0.01" value={form.basePrice} onChange={(e) => setForm({ ...form, basePrice: e.target.value })} required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Min Qty</label>
              <Input type="number" value={form.minQuantity} onChange={(e) => setForm({ ...form, minQuantity: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Lead Time (days)</label>
              <Input type="number" value={form.leadTimeDays} onChange={(e) => setForm({ ...form, leadTimeDays: e.target.value })} />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={loading}>{loading ? "Saving..." : product ? "Update" : "Create"}</Button>
          </div>
        </form>
      </div>
    </div>
  );
}
