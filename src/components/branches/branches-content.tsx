"use client";

import * as React from "react";
import { Plus, Search, Edit, Trash2, Building2 } from "lucide-react";
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
import toast from "react-hot-toast";

interface Branch {
  id: string;
  name: string;
  code: string;
  address: string | null;
  phone: string | null;
  email: string | null;
  isActive: boolean;
  _count: { users: number; orders: number; machines: number };
}

export function BranchesContent() {
  const [branches, setBranches] = React.useState<Branch[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [search, setSearch] = React.useState("");
  const [modalOpen, setModalOpen] = React.useState(false);
  const [editBranch, setEditBranch] = React.useState<Branch | null>(null);
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState("");

  const [formName, setFormName] = React.useState("");
  const [formCode, setFormCode] = React.useState("");
  const [formAddress, setFormAddress] = React.useState("");
  const [formPhone, setFormPhone] = React.useState("");
  const [formEmail, setFormEmail] = React.useState("");

  React.useEffect(() => { fetchBranches(); }, [search]);

  async function fetchBranches() {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      const res = await fetch(`/api/branches?${params}`);
      const data = await res.json();
      setBranches(data.branches || []);
    } catch (error) {
      console.error("Failed to fetch branches:", error);
    } finally {
      setLoading(false);
    }
  }

  function openCreate() {
    setEditBranch(null); setFormName(""); setFormCode(""); setFormAddress(""); setFormPhone(""); setFormEmail(""); setError(""); setModalOpen(true);
  }

  function openEdit(b: Branch) {
    setEditBranch(b); setFormName(b.name); setFormCode(b.code); setFormAddress(b.address || ""); setFormPhone(b.phone || ""); setFormEmail(b.email || ""); setError(""); setModalOpen(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true); setError("");
    try {
      const url = editBranch ? `/api/branches/${editBranch.id}` : "/api/branches";
      const method = editBranch ? "PATCH" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: formName, code: formCode, address: formAddress, phone: formPhone, email: formEmail }),
      });
      if (!res.ok) { const data = await res.json(); throw new Error(data.error || "Failed to save"); }
      toast.success(editBranch ? "Branch updated" : "Branch created");
      setModalOpen(false); fetchBranches();
    } catch (err: any) { setError(err.message); } finally { setSaving(false); }
  }

  async function handleToggleActive(b: Branch) {
    try {
      const res = await fetch(`/api/branches/${b.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !b.isActive }),
      });
      if (res.ok) { toast.success(b.isActive ? "Branch deactivated" : "Branch activated"); fetchBranches(); }
    } catch { toast.error("Failed to update branch"); }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Branches</h1>
          <p className="text-gray-500">Manage company locations and branches</p>
        </div>
        <Button onClick={openCreate}><Plus className="mr-2 h-4 w-4" /> Add Branch</Button>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input placeholder="Search branches..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>All Branches</CardTitle></CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center p-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" /></div>
          ) : branches.length === 0 ? (
            <div className="text-center p-8 text-gray-500">No branches found.</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Branch</TableHead>
                  <TableHead>Code</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Users / Orders / Machines</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-24">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {branches.map((b) => (
                  <TableRow key={b.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Building2 className="h-4 w-4 text-gray-400" />
                        <div>
                          <p className="font-medium">{b.name}</p>
                          <p className="text-sm text-muted-foreground">{b.address || "\u2014"}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="font-mono text-sm">{b.code}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{b.phone || b.email || "\u2014"}</TableCell>
                    <TableCell className="text-sm">{b._count.users} / {b._count.orders} / {b._count.machines}</TableCell>
                    <TableCell>
                      <span className={`text-xs font-medium ${b.isActive ? "text-green-600" : "text-red-600"}`}>
                        {b.isActive ? "Active" : "Inactive"}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="icon" onClick={() => openEdit(b)}><Edit className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" className={b.isActive ? "text-red-600" : "text-green-600"} onClick={() => handleToggleActive(b)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg mx-4">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-lg font-semibold">{editBranch ? "Edit Branch" : "Add Branch"}</h2>
              <Button variant="ghost" size="icon" onClick={() => setModalOpen(false)}>&times;</Button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {error && <div className="text-sm text-red-600 bg-red-50 p-3 rounded-lg">{error}</div>}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                  <Input value={formName} onChange={(e) => setFormName(e.target.value)} required placeholder="e.g. Main Office" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Code *</label>
                  <Input value={formCode} onChange={(e) => setFormCode(e.target.value)} required placeholder="e.g. HQ" disabled={!!editBranch} />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                <Input value={formAddress} onChange={(e) => setFormAddress(e.target.value)} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                  <Input value={formPhone} onChange={(e) => setFormPhone(e.target.value)} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <Input type="email" value={formEmail} onChange={(e) => setFormEmail(e.target.value)} />
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t">
                <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>Cancel</Button>
                <Button type="submit" disabled={saving}>{saving ? "Saving..." : editBranch ? "Update" : "Create"}</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
