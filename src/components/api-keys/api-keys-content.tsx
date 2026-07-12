"use client";

import * as React from "react";
import { Plus, Trash2, Key, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import toast from "react-hot-toast";

interface ApiKey {
  id: string;
  name: string;
  keyPrefix: string;
  scopes: string[];
  isActive: boolean;
  expiresAt: string | null;
  lastUsedAt: string | null;
  createdAt: string;
}

export function ApiKeysContent({ userId }: { userId: string }) {
  const [keys, setKeys] = React.useState<ApiKey[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [modalOpen, setModalOpen] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const [newKey, setNewKey] = React.useState<string | null>(null);

  const [formName, setFormName] = React.useState("");
  const [formScopes, setFormScopes] = React.useState("orders:read,products:read");

  React.useEffect(() => { fetchKeys(); }, []);

  async function fetchKeys() {
    try {
      const res = await fetch("/api/api-keys");
      const data = await res.json();
      setKeys(data.keys || []);
    } catch { console.error("Failed to fetch API keys"); } finally { setLoading(false); }
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/api-keys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: formName, scopes: formScopes.split(",").map((s) => s.trim()), userId }),
      });
      if (res.ok) {
        const data = await res.json();
        setNewKey(data.key);
        toast.success("API key created — copy it now, it won't be shown again!");
        setModalOpen(false); setFormName(""); setFormScopes("orders:read,products:read");
        fetchKeys();
      } else {
        const data = await res.json();
        toast.error(data.error || "Failed to create key");
      }
    } catch { toast.error("Failed to create key"); } finally { setSaving(false); }
  }

  async function handleDelete(id: string, name: string) {
    if (!confirm(`Delete API key "${name}"?`)) return;
    try {
      const res = await fetch(`/api/api-keys/${id}`, { method: "DELETE" });
      if (res.ok) { toast.success("Key deleted"); fetchKeys(); }
    } catch { toast.error("Failed to delete key"); }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">API Keys</h1>
          <p className="text-gray-500">Manage API keys for external integrations</p>
        </div>
        <Button onClick={() => setModalOpen(true)}><Plus className="mr-2 h-4 w-4" /> Create Key</Button>
      </div>

      {newKey && (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-green-800">New API Key Created</p>
                <p className="text-sm text-green-600 font-mono break-all">{newKey}</p>
              </div>
              <Button variant="outline" size="sm" onClick={() => { navigator.clipboard.writeText(newKey); toast.success("Copied!"); }}>Copy</Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader><CardTitle>All API Keys</CardTitle></CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center p-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" /></div>
          ) : keys.length === 0 ? (
            <div className="text-center p-8 text-gray-500">No API keys found. Create one to get started.</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Key Prefix</TableHead>
                  <TableHead>Scopes</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="w-16">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {keys.map((k) => (
                  <TableRow key={k.id}>
                    <TableCell className="font-medium">{k.name}</TableCell>
                    <TableCell className="font-mono text-sm">{k.keyPrefix}...</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{k.scopes.join(", ")}</TableCell>
                    <TableCell>
                      <span className={`text-xs font-medium ${k.isActive ? "text-green-600" : "text-red-600"}`}>
                        {k.isActive ? "Active" : "Revoked"}
                      </span>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">{new Date(k.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <Button variant="ghost" size="icon" className="text-red-600" onClick={() => handleDelete(k.id, k.name)}><Trash2 className="h-4 w-4" /></Button>
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
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-lg font-semibold">Create API Key</h2>
              <Button variant="ghost" size="icon" onClick={() => setModalOpen(false)}>&times;</Button>
            </div>
            <form onSubmit={handleCreate} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                <Input value={formName} onChange={(e) => setFormName(e.target.value)} required placeholder="e.g. Mobile App Integration" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Scopes (comma separated)</label>
                <Input value={formScopes} onChange={(e) => setFormScopes(e.target.value)} placeholder="orders:read, products:read" />
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t">
                <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>Cancel</Button>
                <Button type="submit" disabled={saving}>{saving ? "Creating..." : "Create Key"}</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
