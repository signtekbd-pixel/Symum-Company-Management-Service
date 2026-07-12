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
  { title: "Customers", href: "/customers", icon: Users },
  { title: "Orders", href: "/orders", icon: ShoppingCart },
  { title: "Products", href: "/products", icon: Package },
  { title: "Inventory", href: "/inventory", icon: Package },
  { title: "Invoicing", href: "/invoicing", icon: CreditCard },
  { title: "Production", href: "/production", icon: Factory },
  { title: "Proofs", href: "/proofs", icon: Eye },
  { title: "Reports", href: "/reports", icon: BarChart3 },
  { title: "Settings", href: "/settings", icon: Settings },
];

const roleNavItems: Record<Role, string[]> = {
  DEV: allNavItems.map((i) => i.href),
  ADMIN: allNavItems.map((i) => i.href),
  MANAGER: ["/dashboard", "/orders", "/products", "/inventory", "/production", "/proofs", "/reports", "/settings"],
  SALES: ["/dashboard", "/customers", "/orders", "/invoicing", "/proofs", "/reports", "/settings"],
  OPERATOR: ["/dashboard", "/production", "/proofs", "/settings"],
  CUSTOMER: ["/dashboard", "/orders", "/proofs", "/settings"],
};

export const roleAllowedRoutes: Record<Role, string[]> = {
  DEV: ["/dashboard", "/customers", "/orders", "/products", "/inventory", "/invoicing", "/production", "/proofs", "/reports", "/settings"],
  ADMIN: ["/dashboard", "/customers", "/orders", "/products", "/inventory", "/invoicing", "/production", "/proofs", "/reports", "/settings"],
  MANAGER: ["/dashboard", "/orders", "/products", "/inventory", "/production", "/proofs", "/reports", "/settings"],
  SALES: ["/dashboard", "/customers", "/orders", "/invoicing", "/proofs", "/reports", "/settings"],
  OPERATOR: ["/dashboard", "/production", "/proofs", "/settings"],
  CUSTOMER: ["/dashboard", "/orders", "/proofs", "/settings"],
};

export function getNavItemsForRole(role: string | undefined): NavItem[] {
  if (!role) return [];
  const allowed = roleAllowedRoutes[role as Role] || [];
  return allNavItems.filter((item) => allowed.includes(item.href));
}

export const roleLabels: Record<Role, string> = {
  DEV: "Developer",
  ADMIN: "Admin",
  MANAGER: "Manager",
  SALES: "Sales",
  OPERATOR: "Operator",
  CUSTOMER: "Customer",
};
