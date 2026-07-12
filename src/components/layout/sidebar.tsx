"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { cn } from "@/lib/utils";
import { getNavItemsForRole, devOnlyNavItems } from "@/lib/roles";
import {
  Printer,
} from "lucide-react";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const role = (session?.user as any)?.role;
  const navItems = getNavItemsForRole(role);

  const mainItems = navItems.filter((item) => !devOnlyNavItems.find((d) => d.href === item.href));
  const adminItems = role === "ADMIN" ? devOnlyNavItems.filter((i) => i.href === "/approvals") : [];
  const devItems = role === "DEV" ? devOnlyNavItems : [];

  function renderItem(item: any, index: number | string) {
    const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
    return (
      <Link
        key={item.href || index}
        href={item.href}
        onClick={onClose}
        className={cn(
          "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
          isActive
            ? "bg-primary/10 text-primary"
            : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
        )}
      >
        <item.icon className={cn("h-5 w-5", isActive ? "text-primary" : "text-muted-foreground")} />
        {item.title}
      </Link>
    );
  }

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={cn(
          "fixed left-0 top-0 z-40 h-screen w-64 bg-card border-r border-border transition-transform lg:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-16 items-center gap-2 border-b border-border px-6">
          <Printer className="h-8 w-8 text-primary" />
          <span className="text-xl font-bold text-foreground">PrintERP</span>
        </div>

        <nav className="flex flex-col gap-1 p-4 overflow-y-auto h-[calc(100vh-4rem)]">
          {mainItems.map((item) => renderItem(item, item.href))}

          {adminItems.length > 0 && (
            <>
              <div className="my-2 border-t border-border" />
              <p className="px-3 py-1 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Admin</p>
              {adminItems.map((item) => renderItem(item, item.href))}
            </>
          )}

          {devItems.length > 0 && (
            <>
              <div className="my-2 border-t border-border" />
              <p className="px-3 py-1 text-xs font-semibold text-red-500 uppercase tracking-wider">Super Admin</p>
              {devItems.map((item) => renderItem(item, item.href))}
            </>
          )}
        </nav>
      </aside>
    </>
  );
}
