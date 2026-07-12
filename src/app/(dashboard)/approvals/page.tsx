"use client";

import { useSession } from "next-auth/react";
import { ApprovalsContent } from "@/components/approvals/approvals-content";

export default function ApprovalsPage() {
  const { data: session } = useSession();
  const userId = (session?.user as any)?.id || "";
  const role = (session?.user as any)?.role || "";
  return <ApprovalsContent currentUserId={userId} isDev={role === "DEV"} />;
}
