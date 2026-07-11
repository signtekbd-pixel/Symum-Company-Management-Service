"use client";

import * as React from "react";
import { Plus, Search, Eye, Check, X, MessageSquare } from "lucide-react";
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
import { formatDate, getStatusColor } from "@/lib/utils";

interface Proof {
  id: string;
  version: number;
  status: string;
  fileUrl: string;
  notes: string | null;
  order: {
    orderNumber: string;
  };
  customer: {
    name: string;
  };
  createdAt: string;
}

export function ProofsContent() {
  const [proofs, setProofs] = React.useState<Proof[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [search, setSearch] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState("");

  React.useEffect(() => {
    fetchProofs();
  }, [search, statusFilter]);

  async function fetchProofs() {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (statusFilter) params.set("status", statusFilter);

      const res = await fetch(`/api/proofs?${params}`);
      const data = await res.json();
      setProofs(data.proofs || []);
    } catch (error) {
      console.error("Failed to fetch proofs:", error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Proofs</h1>
          <p className="text-gray-500">Review and approve print proofs</p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Upload Proof
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-gray-500">Pending Review</p>
            <p className="text-2xl font-bold text-yellow-600">
              {proofs.filter((p) => p.status === "PENDING").length}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-gray-500">Approved</p>
            <p className="text-2xl font-bold text-green-600">
              {proofs.filter((p) => p.status === "APPROVED").length}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-gray-500">Rejected</p>
            <p className="text-2xl font-bold text-red-600">
              {proofs.filter((p) => p.status === "REJECTED").length}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-gray-500">Revision Needed</p>
            <p className="text-2xl font-bold text-orange-600">
              {proofs.filter((p) => p.status === "REVISION_NEEDED").length}
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
                  placeholder="Search proofs..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm"
            >
              <option value="">All Status</option>
              <option value="PENDING">Pending</option>
              <option value="APPROVED">Approved</option>
              <option value="REJECTED">Rejected</option>
              <option value="REVISION_NEEDED">Revision Needed</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Proofs Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Proofs</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center p-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
            </div>
          ) : proofs.length === 0 ? (
            <div className="text-center p-8 text-gray-500">
              No proofs found. Upload your first proof to get started.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Version</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Notes</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {proofs.map((proof) => (
                  <TableRow key={proof.id}>
                    <TableCell>
                      <span className="font-medium font-mono">{proof.order.orderNumber}</span>
                    </TableCell>
                    <TableCell>{proof.customer.name}</TableCell>
                    <TableCell>v{proof.version}</TableCell>
                    <TableCell>
                      <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(proof.status)}`}>
                        {proof.status.replace(/_/g, " ")}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <MessageSquare className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-500 truncate max-w-[100px]">
                          {proof.notes || "-"}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>{formatDate(proof.createdAt)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="icon">
                          <Eye className="h-4 w-4" />
                        </Button>
                        {proof.status === "PENDING" && (
                          <>
                            <Button variant="ghost" size="icon" className="text-green-600">
                              <Check className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="text-red-600">
                              <X className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                      </div>
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
