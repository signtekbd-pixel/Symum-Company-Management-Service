"use client";

import * as React from "react";
import { User, Building, Bell, Shield, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import toast from "react-hot-toast";

interface UserData {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  role: { name: string };
  branch: { name: string } | null;
}

export function SettingsContent() {
  const [activeTab, setActiveTab] = React.useState("profile");
  const [user, setUser] = React.useState<UserData | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [changingPassword, setChangingPassword] = React.useState(false);

  const [profileForm, setProfileForm] = React.useState({ name: "", email: "", phone: "" });
  const [passwordForm, setPasswordForm] = React.useState({ currentPassword: "", newPassword: "", confirmPassword: "" });

  const [companyForm, setCompanyForm] = React.useState({
    name: "PrintERP Ltd",
    email: "info@prinerp.com",
    phone: "+8801712345678",
    address: "123 Print Street, Dhaka",
  });

  const [notifForm, setNotifForm] = React.useState({
    emailOrders: true,
    smsStatus: true,
    dailyReports: false,
    lowStock: true,
  });

  React.useEffect(() => {
    fetchSettings();
    const savedCompany = localStorage.getItem("printerp_company");
    if (savedCompany) {
      try { setCompanyForm(JSON.parse(savedCompany)); } catch {}
    }
    const savedNotifs = localStorage.getItem("printerp_notifications");
    if (savedNotifs) {
      try { setNotifForm(JSON.parse(savedNotifs)); } catch {}
    }
  }, []);

  async function fetchSettings() {
    try {
      const res = await fetch("/api/settings");
      if (res.ok) {
        const data = await res.json();
        setUser(data);
        setProfileForm({
          name: data.name || "",
          email: data.email || "",
          phone: data.phone || "",
        });
      }
    } catch {
      console.error("Failed to fetch settings");
    } finally {
      setLoading(false);
    }
  }

  async function handleProfileSave() {
    setSaving(true);
    try {
      const res = await fetch("/api/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profileForm),
      });
      if (res.ok) {
        toast.success("Profile updated successfully");
        fetchSettings();
      } else {
        toast.error("Failed to update profile");
      }
    } catch {
      toast.error("Failed to update profile");
    } finally {
      setSaving(false);
    }
  }

  async function handlePasswordChange() {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }
    if (passwordForm.newPassword.length < 6) {
      toast.error("New password must be at least 6 characters");
      return;
    }

    setChangingPassword(true);
    try {
      const res = await fetch("/api/settings/password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success("Password updated successfully");
        setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
      } else {
        toast.error(data.error || "Failed to update password");
      }
    } catch {
      toast.error("Failed to update password");
    } finally {
      setChangingPassword(false);
    }
  }

  function handleCompanySave() {
    localStorage.setItem("printerp_company", JSON.stringify(companyForm));
    toast.success("Company settings saved");
  }

  function handleNotifSave() {
    localStorage.setItem("printerp_notifications", JSON.stringify(notifForm));
    toast.success("Notification settings saved");
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-500">Manage your account and system settings</p>
        </div>
        <div className="flex items-center justify-center p-16">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-500">Manage your account and system settings</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <Card className="lg:col-span-1">
          <CardContent className="p-4">
            <nav className="space-y-1">
              {[
                { key: "profile", icon: User, label: "Profile" },
                { key: "company", icon: Building, label: "Company" },
                { key: "notifications", icon: Bell, label: "Notifications" },
                { key: "security", icon: Shield, label: "Security" },
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    activeTab === tab.key ? "bg-blue-50 text-blue-700" : "text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  <tab.icon className="h-5 w-5" />
                  {tab.label}
                </button>
              ))}
            </nav>
          </CardContent>
        </Card>

        <div className="lg:col-span-3">
          {activeTab === "profile" && (
            <Card>
              <CardHeader>
                <CardTitle>Profile Settings</CardTitle>
                <CardDescription>Update your personal information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                    <Input value={profileForm.name} onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <Input type="email" value={profileForm.email} onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                    <Input value={profileForm.phone} onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                    <Input value={user?.role?.name || ""} disabled />
                  </div>
                </div>
                <Button onClick={handleProfileSave} disabled={saving}>
                  <Save className="mr-2 h-4 w-4" />
                  {saving ? "Saving..." : "Save Changes"}
                </Button>
              </CardContent>
            </Card>
          )}

          {activeTab === "company" && (
            <Card>
              <CardHeader>
                <CardTitle>Company Settings</CardTitle>
                <CardDescription>Manage your company information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Company Name</label>
                    <Input value={companyForm.name} onChange={(e) => setCompanyForm({ ...companyForm, name: e.target.value })} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Company Email</label>
                    <Input value={companyForm.email} onChange={(e) => setCompanyForm({ ...companyForm, email: e.target.value })} type="email" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                    <Input value={companyForm.phone} onChange={(e) => setCompanyForm({ ...companyForm, phone: e.target.value })} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                    <Input value={companyForm.address} onChange={(e) => setCompanyForm({ ...companyForm, address: e.target.value })} />
                  </div>
                </div>
                <Button onClick={handleCompanySave}>
                  <Save className="mr-2 h-4 w-4" /> Save Changes
                </Button>
              </CardContent>
            </Card>
          )}

          {activeTab === "notifications" && (
            <Card>
              <CardHeader>
                <CardTitle>Notification Settings</CardTitle>
                <CardDescription>Configure how you receive notifications</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <label className="flex items-center gap-3">
                    <input type="checkbox" checked={notifForm.emailOrders} onChange={(e) => setNotifForm({ ...notifForm, emailOrders: e.target.checked })} className="h-4 w-4 rounded border-gray-300" />
                    <span className="text-sm">Email notifications for new orders</span>
                  </label>
                  <label className="flex items-center gap-3">
                    <input type="checkbox" checked={notifForm.smsStatus} onChange={(e) => setNotifForm({ ...notifForm, smsStatus: e.target.checked })} className="h-4 w-4 rounded border-gray-300" />
                    <span className="text-sm">SMS notifications for order status changes</span>
                  </label>
                  <label className="flex items-center gap-3">
                    <input type="checkbox" checked={notifForm.dailyReports} onChange={(e) => setNotifForm({ ...notifForm, dailyReports: e.target.checked })} className="h-4 w-4 rounded border-gray-300" />
                    <span className="text-sm">Daily production reports</span>
                  </label>
                  <label className="flex items-center gap-3">
                    <input type="checkbox" checked={notifForm.lowStock} onChange={(e) => setNotifForm({ ...notifForm, lowStock: e.target.checked })} className="h-4 w-4 rounded border-gray-300" />
                    <span className="text-sm">Low stock alerts</span>
                  </label>
                </div>
                <Button onClick={handleNotifSave}>
                  <Save className="mr-2 h-4 w-4" /> Save Changes
                </Button>
              </CardContent>
            </Card>
          )}

          {activeTab === "security" && (
            <Card>
              <CardHeader>
                <CardTitle>Security Settings</CardTitle>
                <CardDescription>Change your password</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Current Password *</label>
                    <Input
                      type="password"
                      placeholder="Enter current password"
                      value={passwordForm.currentPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                    />
                  </div>
                  <div></div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">New Password *</label>
                    <Input
                      type="password"
                      placeholder="Enter new password (min 6 characters)"
                      value={passwordForm.newPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password *</label>
                    <Input
                      type="password"
                      placeholder="Confirm new password"
                      value={passwordForm.confirmPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                    />
                  </div>
                </div>
                <Button onClick={handlePasswordChange} disabled={changingPassword}>
                  <Save className="mr-2 h-4 w-4" /> {changingPassword ? "Updating..." : "Update Password"}
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
