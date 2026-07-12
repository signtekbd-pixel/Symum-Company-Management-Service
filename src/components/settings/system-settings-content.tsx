"use client";

import * as React from "react";
import { Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import toast from "react-hot-toast";

interface Setting {
  id: string;
  key: string;
  value: string;
  description: string | null;
}

const defaultSettings = [
  { key: "business_name", value: "PrintERP Ltd", description: "Company name displayed on invoices and reports" },
  { key: "business_email", value: "info@prinerp.com", description: "Primary business email" },
  { key: "business_phone", value: "+8801712345678", description: "Primary business phone" },
  { key: "business_address", value: "123 Print Street, Dhaka", description: "Business address" },
  { key: "currency", value: "BDT", description: "Currency code (BDT, USD, EUR)" },
  { key: "tax_rate", value: "15", description: "Default tax rate percentage" },
  { key: "low_stock_threshold", value: "10", description: "Alert when material stock falls below this" },
  { key: "order_prefix", value: "ORD", description: "Prefix for order numbers" },
  { key: "invoice_prefix", value: "INV", description: "Prefix for invoice numbers" },
  { key: "require_approval_deletes", value: "true", description: "Require DEV approval for bulk deletes" },
];

export function SystemSettingsContent() {
  const [settings, setSettings] = React.useState<Setting[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [formValues, setFormValues] = React.useState<Record<string, string>>({});

  React.useEffect(() => { fetchSettings(); }, []);

  async function fetchSettings() {
    try {
      const res = await fetch("/api/system-settings");
      const data = await res.json();
      const fetched = data.settings || [];
      setSettings(fetched);
      const vals: Record<string, string> = {};
      fetched.forEach((s: Setting) => { vals[s.key] = s.value; });
      defaultSettings.forEach((d) => { if (!vals[d.key]) vals[d.key] = d.value; });
      setFormValues(vals);
    } catch (error) {
      console.error("Failed to fetch settings");
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    setSaving(true);
    try {
      const settingsArray = Object.entries(formValues).map(([key, value]) => {
        const def = defaultSettings.find((d) => d.key === key);
        return { key, value, description: def?.description };
      });
      const res = await fetch("/api/system-settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ settings: settingsArray }),
      });
      if (res.ok) {
        toast.success("System settings saved");
        fetchSettings();
      } else {
        toast.error("Failed to save settings");
      }
    } catch {
      toast.error("Failed to save settings");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div><h1 className="text-2xl font-bold text-gray-900">System Settings</h1><p className="text-gray-500">Configure global business settings</p></div>
        <div className="flex items-center justify-center p-16"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" /></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">System Settings</h1>
          <p className="text-gray-500">Configure global business settings (DEV only)</p>
        </div>
        <Button onClick={handleSave} disabled={saving}><Save className="mr-2 h-4 w-4" />{saving ? "Saving..." : "Save All"}</Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {defaultSettings.map((def) => (
          <Card key={def.key}>
            <CardContent className="p-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">{def.key.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}</label>
              <Input value={formValues[def.key] || ""} onChange={(e) => setFormValues({ ...formValues, [def.key]: e.target.value })} />
              <p className="text-xs text-muted-foreground mt-1">{def.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
