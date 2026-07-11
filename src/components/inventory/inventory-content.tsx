"use client";

import * as React from "react";
import { Plus, Search, AlertTriangle, Package } from "lucide-react";
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
import { formatCurrency } from "@/lib/utils";

interface Material {
  id: string;
  name: string;
  code: string;
  unit: string;
  costPrice: number;
  minStockLevel: number;
  maxStockLevel: number;
  reorderPoint: number;
  category: {
    name: string;
  };
}

export function InventoryContent() {
  const [materials, setMaterials] = React.useState<Material[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [search, setSearch] = React.useState("");

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

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Inventory</h1>
          <p className="text-gray-500">Track materials and stock levels</p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Material
        </Button>
      </div>

      {/* Stats Cards */}
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
              {materials.filter((m) => m.reorderPoint > 0).length}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-gray-500">Categories</p>
            <p className="text-2xl font-bold text-blue-600">
              {[...new Set(materials.map((m) => m.category.name))].length}
            </p>
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

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="Search materials..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Materials Table */}
      <Card>
        <CardHeader>
          <CardTitle>Materials</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center p-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
            </div>
          ) : materials.length === 0 ? (
            <div className="text-center p-8 text-gray-500">
              No materials found. Add your first material to get started.
            </div>
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
                </TableRow>
              </TableHeader>
              <TableBody>
                {materials.map((material) => (
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
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        In Stock
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
