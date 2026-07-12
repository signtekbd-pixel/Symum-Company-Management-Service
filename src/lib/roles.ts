import {
  LayoutDashboard,
  Users,
  ShoppingCart,
  Package,
  CreditCard,
  Factory,
  Eye,
  BarChart3,
  Settings,
  Tag,
  Building2,
  Cog,
  Truck,
  Shield,
  CheckCircle,
  Activity,
  Key,
  Settings2,
  type LucideIcon,
} from "lucide-react";

export type Role = "DEV" | "ADMIN" | "MANAGER" | "SALES" | "OPERATOR" | "CUSTOMER";

export interface NavItem {
  title: string;
  href: string;
  icon: LucideIcon;
}

export const allNavItems: NavItem[] = [
  { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { title: "Users", href: "/users", icon: Users },
  { title: "Branches", href: "/branches", icon: Building2 },
  { title: "Customers", href: "/customers", icon: Users },
  { title: "Orders", href: "/orders", icon: ShoppingCart },
  { title: "Products", href: "/products", icon: Package },
  { title: "Product Categories", href: "/product-categories", icon: Tag },
  { title: "Inventory", href: "/inventory", icon: Package },
  { title: "Material Categories", href: "/material-categories", icon: Tag },
  { title: "Suppliers", href: "/suppliers", icon: Truck },
  { title: "Invoicing", href: "/invoicing", icon: CreditCard },
  { title: "Production", href: "/production", icon: Factory },
  { title: "Machines", href: "/machines", icon: Cog },
  { title: "Proofs", href: "/proofs", icon: Eye },
  { title: "Reports", href: "/reports", icon: BarChart3 },
  { title: "Settings", href: "/settings", icon: Settings },
];

export const devOnlyNavItems: NavItem[] = [
  { title: "Audit Logs", href: "/audit-logs", icon: Shield },
  { title: "System Settings", href: "/system-settings", icon: Settings2 },
  { title: "Approvals", href: "/approvals", icon: CheckCircle },
  { title: "System Health", href: "/system-health", icon: Activity },
  { title: "API Keys", href: "/api-keys", icon: Key },
];

const roleNavItems: Record<Role, string[]> = {
  DEV: [...allNavItems.map((i) => i.href), ...devOnlyNavItems.map((i) => i.href)],
  ADMIN: [...allNavItems.map((i) => i.href), "/approvals"],
  MANAGER: ["/dashboard", "/orders", "/products", "/product-categories", "/inventory", "/material-categories", "/production", "/proofs", "/reports", "/settings"],
  SALES: ["/dashboard", "/customers", "/orders", "/invoicing", "/proofs", "/reports", "/settings"],
  OPERATOR: ["/dashboard", "/production", "/machines", "/proofs", "/settings"],
  CUSTOMER: ["/dashboard", "/orders", "/proofs", "/settings"],
};

export const roleAllowedRoutes: Record<Role, string[]> = {
  DEV: [...allNavItems.map((i) => i.href), ...devOnlyNavItems.map((i) => i.href)],
  ADMIN: [...allNavItems.map((i) => i.href), "/approvals"],
  MANAGER: ["/dashboard", "/orders", "/products", "/product-categories", "/inventory", "/material-categories", "/production", "/proofs", "/reports", "/settings"],
  SALES: ["/dashboard", "/customers", "/orders", "/invoicing", "/proofs", "/reports", "/settings"],
  OPERATOR: ["/dashboard", "/production", "/machines", "/proofs", "/settings"],
  CUSTOMER: ["/dashboard", "/orders", "/proofs", "/settings"],
};

export function getNavItemsForRole(role: string | undefined): NavItem[] {
  if (!role) return [];
  const allowed = roleAllowedRoutes[role as Role] || [];
  const baseItems = allNavItems.filter((item) => allowed.includes(item.href));
  if (role === "DEV") {
    return [...baseItems, ...devOnlyNavItems];
  }
  if (role === "ADMIN") {
    return [...baseItems, ...devOnlyNavItems.filter((i) => i.href === "/approvals")];
  }
  return baseItems;
}

export const roleLabels: Record<Role, string> = {
  DEV: "Super Admin",
  ADMIN: "Admin",
  MANAGER: "Manager",
  SALES: "Sales",
  OPERATOR: "Operator",
  CUSTOMER: "Customer",
};
