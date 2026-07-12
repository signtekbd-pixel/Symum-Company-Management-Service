"use client";

import { useSession } from "next-auth/react";
import { ApiKeysContent } from "@/components/api-keys/api-keys-content";

export default function ApiKeysPage() {
  const { data: session } = useSession();
  const userId = (session?.user as any)?.id || "";
  return <ApiKeysContent userId={userId} />;
}
