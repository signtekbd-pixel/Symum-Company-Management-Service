"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import { DashboardLayout } from "@/components/layout/dashboard-layout";

export default function DashboardGroupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <DashboardLayout>{children}</DashboardLayout>;
}
