"use client";

import * as React from "react";
import { Plus, Search, Edit, Trash2, Cog } from "lucide-react";
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

interface Machine {
  id: string;
  name: string;
  code: string;
  type: string;
  status: string;
  branch: { name: string } | null;
  _count: { jobs: number };
}

interface Branch {
  id: string;
  name: string;
}

const statusColors: Record<string, string> = {
  AVAILABLE: "bg-green-100 text-green-700",
  IN_USE: "bg-blue-100 text-blue-700",
  MAINTENANCE: "bg-yellow-100 text-yellow-700",
  OUT_OF_SERVICE: "bg-red-100 text-red-700",
};

const machineTypes = [
  { value: "digital_press", label: "Digital Press" },
  { value: "offset", label: "Offset Press" },
  { value: "cutter", label: "Cutter" },
  { value: "laminator", label: "Laminator" },
  { value: "printer", label: "Printer" },
  { value: "finishing", label: "Finishing" },
];

export function MachinesContent() {
  const [machines, setMachines] = React.useState<Machine[]>([]);
  const [branches, setBranches] = React.useState<Branch[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [search, setSearch] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState("");
  const [modalOpen, setModalOpen] = React.useState(false);
  const [editMachine, setEditMachine] = React.useState<Machine | null>(null);
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState("");

  const [formName, setFormName] = React.useState("");
  const [formCode, setFormCode] = React.useState("");
  const [formType, setFormType] = React.useState("digital_press");
  const [formBranchId, setFormBranchId] = React.useState("");
  const [formStatus, setFormStatus] = React.useState("AVAILABLE");

  React.useEffect(() => {
    fetchMachines();
    fetch("/api/branches").then(r => r.json()).then(d => setBranches(d.branches || [])).catch(() => {});
  }, [search, statusFilter]);

  async function fetchMachines() {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (statusFilter) params.set("status", statusFilter);
      const res = await fetch(`/api/machines?${params}`);
      const data = await res.json();
      setMachines(data.machines || []);
    } catch (error) {
      console.error("Failed to fetch machines:", error);
    } finally {
      setLoading(false);
    }
  }

  function openCreate() {
    setEditMachine(null); setFormName(""); setFormCode(""); setFormType("digital_press"); setFormBranchId(""); setFormStatus("AVAILABLE"); setError(""); setModalOpen(true);
  }

  function openEdit(m: Machine) {
    setEditMachine(m); setFormName(m.name); setFormCode(m.code); setFormType(m.type); setFormBranchId(""); setFormStatus(m.status); setError(""); setModalOpen(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true); setError("");
    try {
      const url = editMachine ? `/api/machines/${editMachine.id}` : "/api/machines";
      const method = editMachine ? "PATCH" : "POST";
      const body: any = { name: formName, code: formCode, type: formType, branchId: formBranchId || null };
      if (editMachine) body.status = formStatus;

      const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      if (!res.ok) { const data = await res.json(); throw new Error(data.error || "Failed to save"); }
      toast.success(editMachine ? "Machine updated" : "Machine created");
      setModalOpen(false); fetchMachines();
    } catch (err: any) { setError(err.message); } finally { setSaving(false); }
  }

  async function handleDelete(id: string, name: string) {
    if (!confirm(`Delete machine "${name}"?`)) return;
    try {
      const res = await fetch(`/api/machines/${id}`, { method: "DELETE" });
      if (res.ok) { toast.success("Machine deleted"); fetchMachines(); }
      else { const data = await res.json(); toast.error(data.error || "Failed to delete"); }
    } catch { toast.error("Failed to delete machine"); }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Machines</h1>
          <p className="text-gray-500">Manage production equipment and machines</p>
        </div>
        <Button onClick={openCreate}><Plus className="mr-2 h-4 w-4" /> Add Machine</Button>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input placeholder="Search machines..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
            </div>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm">
              <option value="">All Status</option>
              <option value="AVAILABLE">Available</option>
              <option value="IN_USE">In Use</option>
              <option value="MAINTENANCE">Maintenance</option>
              <option value="OUT_OF_SERVICE">Out of Service</option>
            </select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>All Machines</CardTitle></CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center p-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" /></div>
          ) : machines.length === 0 ? (
            <div className="text-center p-8 text-gray-500">No machines found.</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Machine</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Branch</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Jobs</TableHead>
                  <TableHead className="w-24">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {machines.map((m) => (
                  <TableRow key={m.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Cog className="h-4 w-4 text-gray-400" />
                        <div>
                          <p className="font-medium">{m.name}</p>
                          <p className="text-sm text-muted-foreground font-mono">{m.code}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">{machineTypes.find(t => t.value === m.type)?.label || m.type}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{m.branch?.name || "\u2014"}</TableCell>
                    <TableCell>
                      <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[m.status] || "bg-gray-100 text-gray-700"}`}>
                        {m.status.replace(/_/g, " ")}
                      </span>
                    </TableCell>
                    <TableCell className="text-sm">{m._count.jobs}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="icon" onClick={() => openEdit(m)}><Edit className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" className="text-red-600" onClick={() => handleDelete(m.id, m.name)}><Trash2 className="h-4 w-4" /></Button>
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
              <h2 className="text-lg font-semibold">{editMachine ? "Edit Machine" : "Add Machine"}</h2>
              <Button variant="ghost" size="icon" onClick={() => setModalOpen(false)}>&times;</Button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {error && <div className="text-sm text-red-600 bg-red-50 p-3 rounded-lg">{error}</div>}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                  <Input value={formName} onChange={(e) => setFormName(e.target.value)} required placeholder="e.g. HP Indigo 12000" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Code *</label>
                  <Input value={formCode} onChange={(e) => setFormCode(e.target.value)} required placeholder="e.g. DIG-001" disabled={!!editMachine} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Type *</label>
                  <select value={formType} onChange={(e) => setFormType(e.target.value)} className="h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm" required>
                    {machineTypes.map((t) => (
                      <option key={t.value} value={t.value}>{t.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Branch</label>
                  <select value={formBranchId} onChange={(e) => setFormBranchId(e.target.value)} className="h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm">
                    <option value="">No branch</option>
                    {branches.map((b) => (
                      <option key={b.id} value={b.id}>{b.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              {editMachine && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select value={formStatus} onChange={(e) => setFormStatus(e.target.value)} className="h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm">
                    <option value="AVAILABLE">Available</option>
                    <option value="IN_USE">In Use</option>
                    <option value="MAINTENANCE">Maintenance</option>
                    <option value="OUT_OF_SERVICE">Out of Service</option>
                  </select>
                </div>
              )}
              <div className="flex justify-end gap-3 pt-4 border-t">
                <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>Cancel</Button>
                <Button type="submit" disabled={saving}>{saving ? "Saving..." : editMachine ? "Update" : "Create"}</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
