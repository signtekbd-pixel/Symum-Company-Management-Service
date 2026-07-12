"use client";

import { useSession } from "next-auth/react";
import { UsersContent } from "@/components/users/users-content";

export default function UsersPage() {
  const { data: session } = useSession();
  const role = (session?.user as any)?.role || "";
  return <UsersContent currentRole={role} />;
}
