"use client";

import * as React from "react";
import { CheckCircle, XCircle, Clock, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import toast from "react-hot-toast";

interface ApprovalRequest {
  id: string;
  type: string;
  description: string;
  targetId: string | null;
  status: string;
  reviewedAt: string | null;
  createdAt: string;
  requester: { id: string; name: string; email: string };
  approver: { id: string; name: string; email: string } | null;
}

const statusColors: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-700",
  APPROVED: "bg-green-100 text-green-700",
  REJECTED: "bg-red-100 text-red-700",
};

export function ApprovalsContent({ currentUserId, isDev }: { currentUserId: string; isDev: boolean }) {
  const [requests, setRequests] = React.useState<ApprovalRequest[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [statusFilter, setStatusFilter] = React.useState("");
  const [modalOpen, setModalOpen] = React.useState(false);
  const [saving, setSaving] = React.useState(false);

  const [formType, setFormType] = React.useState("delete_user");
  const [formDescription, setFormDescription] = React.useState("");
  const [formTargetId, setFormTargetId] = React.useState("");

  React.useEffect(() => { fetchRequests(); }, [statusFilter]);

  async function fetchRequests() {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter) params.set("status", statusFilter);
      const res = await fetch(`/api/approval-requests?${params}`);
      const data = await res.json();
      let filtered = data.requests || [];
      if (!isDev) {
        filtered = filtered.filter((r: ApprovalRequest) => r.requester.id === currentUserId);
      }
      setRequests(filtered);
    } catch (error) {
      console.error("Failed to fetch requests:", error);
    } finally {
      setLoading(false);
    }
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/approval-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ requesterId: currentUserId, type: formType, description: formDescription, targetId: formTargetId || null }),
      });
      if (res.ok) {
        toast.success("Approval request submitted");
        setModalOpen(false); setFormDescription(""); setFormTargetId("");
        fetchRequests();
      } else {
        const data = await res.json();
        toast.error(data.error || "Failed to submit request");
      }
    } catch { toast.error("Failed to submit request"); } finally { setSaving(false); }
  }

  async function handleReview(id: string, status: "APPROVED" | "REJECTED") {
    try {
      const res = await fetch(`/api/approval-requests/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, approverId: currentUserId }),
      });
      if (res.ok) {
        toast.success(`Request ${status.toLowerCase()}`);
        fetchRequests();
      } else {
        const data = await res.json();
        toast.error(data.error || "Failed to review");
      }
    } catch { toast.error("Failed to review request"); }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Approvals</h1>
          <p className="text-gray-500">{isDev ? "Review and approve requests from admins" : "Submit requests for admin approval"}</p>
        </div>
        <div className="flex gap-2">
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm">
            <option value="">All Status</option>
            <option value="PENDING">Pending</option>
            <option value="APPROVED">Approved</option>
            <option value="REJECTED">Rejected</option>
          </select>
          {!isDev && (
            <Button onClick={() => setModalOpen(true)}><Plus className="mr-2 h-4 w-4" /> New Request</Button>
          )}
        </div>
      </div>

      <Card>
        <CardHeader><CardTitle>Requests ({requests.length})</CardTitle></CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center p-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" /></div>
          ) : requests.length === 0 ? (
            <div className="text-center p-8 text-gray-500">No approval requests found.</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Requester</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  {isDev && <TableHead className="w-24">Actions</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {requests.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell><p className="font-medium text-sm">{r.requester.name}</p></TableCell>
                    <TableCell className="text-sm capitalize">{r.type.replace(/_/g, " ")}</TableCell>
                    <TableCell className="text-sm text-muted-foreground max-w-xs truncate">{r.description}</TableCell>
                    <TableCell>
                      <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[r.status]}`}>
                        {r.status}
                      </span>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">{new Date(r.createdAt).toLocaleDateString()}</TableCell>
                    {isDev && (
                      <TableCell>
                        {r.status === "PENDING" && (
                          <div className="flex gap-1">
                            <Button variant="ghost" size="icon" className="text-green-600" onClick={() => handleReview(r.id, "APPROVED")}><CheckCircle className="h-4 w-4" /></Button>
                            <Button variant="ghost" size="icon" className="text-red-600" onClick={() => handleReview(r.id, "REJECTED")}><XCircle className="h-4 w-4" /></Button>
                          </div>
                        )}
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-lg font-semibold">New Approval Request</h2>
              <Button variant="ghost" size="icon" onClick={() => setModalOpen(false)}>&times;</Button>
            </div>
            <form onSubmit={handleCreate} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Request Type *</label>
                <select value={formType} onChange={(e) => setFormType(e.target.value)} className="h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm" required>
                  <option value="delete_user">Delete User</option>
                  <option value="export_data">Export Data</option>
                  <option value="system_change">System Change</option>
                  <option value="bulk_operation">Bulk Operation</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
                <Input value={formDescription} onChange={(e) => setFormDescription(e.target.value)} required placeholder="Explain why you need this..." />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Target ID (optional)</label>
                <Input value={formTargetId} onChange={(e) => setFormTargetId(e.target.value)} placeholder="ID of the entity (if applicable)" />
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t">
                <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>Cancel</Button>
                <Button type="submit" disabled={saving}>{saving ? "Submitting..." : "Submit Request"}</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
