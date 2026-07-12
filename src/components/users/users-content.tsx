"use client";

import * as React from "react";
import { Plus, Search, Edit, Trash2, UserCheck, UserX } from "lucide-react";
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

interface User {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  isActive: boolean;
  role: { name: string };
  createdAt: string;
}

interface Role {
  id: string;
  name: string;
}

interface Branch {
  id: string;
  name: string;
}

export function UsersContent() {
  const [users, setUsers] = React.useState<User[]>([]);
  const [roles, setRoles] = React.useState<Role[]>([]);
  const [branches, setBranches] = React.useState<Branch[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [search, setSearch] = React.useState("");
  const [modalOpen, setModalOpen] = React.useState(false);
  const [editUser, setEditUser] = React.useState<User | null>(null);
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState("");

  const [formName, setFormName] = React.useState("");
  const [formEmail, setFormEmail] = React.useState("");
  const [formPhone, setFormPhone] = React.useState("");
  const [formPassword, setFormPassword] = React.useState("");
  const [formRoleId, setFormRoleId] = React.useState("");
  const [formBranchId, setFormBranchId] = React.useState("");

  React.useEffect(() => {
    fetchUsers();
    fetch("/api/users").then(r => r.json()).then(data => setUsers(data || [])).catch(() => {});
    fetch("/api/product-categories").then(() => {}).catch(() => {});
    Promise.all([
      fetch("/api/users").then(r => r.json()),
      fetch("/api/branches").then(r => r.json()).catch(() => ({ branches: [] })),
    ]).then(([userData, branchData]) => {
      setUsers(userData || []);
      setBranches((branchData as any).branches || []);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  React.useEffect(() => {
    fetchUsers();
  }, [search]);

  async function fetchUsers() {
    setLoading(true);
    try {
      const res = await fetch("/api/users");
      const data = await res.json();
      let filtered = data || [];
      if (search) {
        const q = search.toLowerCase();
        filtered = filtered.filter((u: User) =>
          u.name.toLowerCase().includes(q) ||
          u.email.toLowerCase().includes(q) ||
          u.role.name.toLowerCase().includes(q)
        );
      }
      setUsers(filtered);
    } catch (error) {
      console.error("Failed to fetch users:", error);
    } finally {
      setLoading(false);
    }
  }

  function openCreate() {
    setEditUser(null);
    setFormName("");
    setFormEmail("");
    setFormPhone("");
    setFormPassword("");
    setFormRoleId("");
    setFormBranchId("");
    setError("");
    setModalOpen(true);
  }

  function openEdit(user: User) {
    setEditUser(user);
    setFormName(user.name);
    setFormEmail(user.email);
    setFormPhone(user.phone || "");
    setFormPassword("");
    setFormRoleId("");
    setFormBranchId("");
    setError("");
    setModalOpen(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");

    try {
      if (editUser) {
        const body: any = {
          name: formName,
          email: formEmail,
          phone: formPhone || null,
        };
        if (formPassword) body.password = formPassword;
        if (formRoleId) body.roleId = formRoleId;
        if (formBranchId) body.branchId = formBranchId;

        const res = await fetch(`/api/users/${editUser.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });

        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || "Failed to update user");
        }
        toast.success("User updated");
      } else {
        if (!formPassword) {
          throw new Error("Password is required for new users");
        }
        const res = await fetch("/api/users", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: formName,
            email: formEmail,
            phone: formPhone || null,
            password: formPassword,
            roleId: formRoleId || undefined,
          }),
        });

        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || "Failed to create user");
        }
        toast.success("User created");
      }

      setModalOpen(false);
      fetchUsers();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleToggleActive(user: User) {
    try {
      const res = await fetch(`/api/users/${user.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !user.isActive }),
      });
      if (res.ok) {
        toast.success(user.isActive ? "User deactivated" : "User activated");
        fetchUsers();
      }
    } catch {
      toast.error("Failed to update user");
    }
  }

  const roleBadgeColor = (role: string) => {
    switch (role) {
      case "DEV": return "bg-purple-100 text-purple-700";
      case "ADMIN": return "bg-red-100 text-red-700";
      case "MANAGER": return "bg-blue-100 text-blue-700";
      case "SALES": return "bg-green-100 text-green-700";
      case "OPERATOR": return "bg-yellow-100 text-yellow-700";
      case "CUSTOMER": return "bg-gray-100 text-gray-700";
      default: return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Users</h1>
          <p className="text-gray-500">Manage staff accounts and roles</p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="mr-2 h-4 w-4" /> Add User
        </Button>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input placeholder="Search users by name, email, or role..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>All Users ({users.length})</CardTitle></CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center p-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
            </div>
          ) : users.length === 0 ? (
            <div className="text-center p-8 text-gray-500">No users found.</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead className="w-24">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{user.name}</p>
                        <p className="text-sm text-muted-foreground">{user.email}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${roleBadgeColor(user.role.name)}`}>
                        {user.role.name}
                      </span>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{user.phone || "\u2014"}</TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center gap-1 text-xs font-medium ${user.isActive ? "text-green-600" : "text-red-600"}`}>
                        {user.isActive ? <UserCheck className="h-3 w-3" /> : <UserX className="h-3 w-3" />}
                        {user.isActive ? "Active" : "Inactive"}
                      </span>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="icon" onClick={() => openEdit(user)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className={user.isActive ? "text-red-600" : "text-green-600"} onClick={() => handleToggleActive(user)}>
                          {user.isActive ? <Trash2 className="h-4 w-4" /> : <UserCheck className="h-4 w-4" />}
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
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-lg font-semibold">{editUser ? "Edit User" : "Add User"}</h2>
              <Button variant="ghost" size="icon" onClick={() => setModalOpen(false)}>
                &times;
              </Button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {error && <div className="text-sm text-red-600 bg-red-50 p-3 rounded-lg">{error}</div>}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                  <Input value={formName} onChange={(e) => setFormName(e.target.value)} required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                  <Input type="email" value={formEmail} onChange={(e) => setFormEmail(e.target.value)} required />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                  <Input value={formPhone} onChange={(e) => setFormPhone(e.target.value)} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Password {editUser ? "(leave blank to keep)" : "*"}
                  </label>
                  <Input type="password" value={formPassword} onChange={(e) => setFormPassword(e.target.value)} required={!editUser} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                  <select value={formRoleId} onChange={(e) => setFormRoleId(e.target.value)} className="h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm">
                    <option value="">Keep current role</option>
                    <option value="DEV">Developer</option>
                    <option value="ADMIN">Admin</option>
                    <option value="MANAGER">Manager</option>
                    <option value="SALES">Sales</option>
                    <option value="OPERATOR">Operator</option>
                    <option value="CUSTOMER">Customer</option>
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
              <div className="flex justify-end gap-3 pt-4 border-t">
                <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>Cancel</Button>
                <Button type="submit" disabled={saving}>{saving ? "Saving..." : editUser ? "Update" : "Create"}</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
