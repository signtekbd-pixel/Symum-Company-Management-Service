"use client";

import * as React from "react";
import { Plus, Search, AlertTriangle, Package, Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatCurrency, getStatusColor } from "@/lib/utils";
import { MaterialFormModal } from "./material-form-modal";
import toast from "react-hot-toast";

interface Material {
  id: string;
  name: string;
  code: string;
  categoryId: string;
  unit: string;
  costPrice: number;
  minStockLevel: number;
  maxStockLevel: number;
  reorderPoint: number;
  category: { name: string };
}

export function InventoryContent() {
  const [materials, setMaterials] = React.useState<Material[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [search, setSearch] = React.useState("");
  const [modalOpen, setModalOpen] = React.useState(false);
  const [editMaterial, setEditMaterial] = React.useState<Material | null>(null);

  React.useEffect(() => {
    fetchMaterials();
  }, [search]);

  async function fetchMaterials() {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      const res = await fetch(`/api/inventory?${params}`);
      const data = await res.json();
      setMaterials(data.materials || []);
    } catch (error) {
      console.error("Failed to fetch materials:", error);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to delete this material?")) return;
    try {
      const res = await fetch(`/api/inventory/${id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Material deleted");
        fetchMaterials();
      }
    } catch {
      toast.error("Failed to delete material");
    }
  }

  function getStockStatus(material: Material) {
    if (material.reorderPoint <= 0) return { label: "Unknown", color: "bg-gray-100 text-gray-800" };
    // Since we don't have actual stock quantities from movements, estimate from min/max
    if (material.minStockLevel <= 0) return { label: "In Stock", color: "bg-green-100 text-green-800" };
    return { label: "Configured", color: "bg-blue-100 text-blue-800" };
  }

  const totalCategories = [...new Set(materials.map((m) => m.category.name))].length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Inventory</h1>
          <p className="text-gray-500">Track materials and stock levels</p>
        </div>
        <Button onClick={() => { setEditMaterial(null); setModalOpen(true); }}>
          <Plus className="mr-2 h-4 w-4" /> Add Material
        </Button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-gray-500">Total Materials</p>
            <p className="text-2xl font-bold">{materials.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-gray-500">Low Stock Items</p>
            <p className="text-2xl font-bold text-orange-600">
              {materials.filter((m) => m.minStockLevel > 0 && m.reorderPoint > m.minStockLevel).length}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-gray-500">Categories</p>
            <p className="text-2xl font-bold text-blue-600">{totalCategories}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-gray-500">Total Value</p>
            <p className="text-2xl font-bold text-green-600">
              {formatCurrency(materials.reduce((sum, m) => sum + m.costPrice, 0))}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input placeholder="Search materials..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Materials</CardTitle></CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center p-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
            </div>
          ) : materials.length === 0 ? (
            <div className="text-center p-8 text-gray-500">No materials found. Add your first material to get started.</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Material</TableHead>
                  <TableHead>Code</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Unit</TableHead>
                  <TableHead>Cost Price</TableHead>
                  <TableHead>Min Stock</TableHead>
                  <TableHead>Reorder Point</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-24">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {materials.map((material) => {
                  const stock = getStockStatus(material);
                  return (
                    <TableRow key={material.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Package className="h-4 w-4 text-gray-400" />
                          <span className="font-medium">{material.name}</span>
                        </div>
                      </TableCell>
                      <TableCell className="font-mono text-sm">{material.code}</TableCell>
                      <TableCell>{material.category.name}</TableCell>
                      <TableCell>{material.unit}</TableCell>
                      <TableCell>{formatCurrency(material.costPrice)}</TableCell>
                      <TableCell>{material.minStockLevel}</TableCell>
                      <TableCell>{material.reorderPoint}</TableCell>
                      <TableCell>
                        <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${stock.color}`}>{stock.label}</span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button variant="ghost" size="icon" onClick={() => { setEditMaterial(material); setModalOpen(true); }}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="text-red-600" onClick={() => handleDelete(material.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <MaterialFormModal open={modalOpen} onClose={() => { setModalOpen(false); setEditMaterial(null); }} onSuccess={fetchMaterials} material={editMaterial} />
    </div>
  );
}
