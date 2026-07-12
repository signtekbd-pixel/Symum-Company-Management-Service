import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { InventoryContent } from "@/components/inventory/inventory-content";

export const dynamic = "force-dynamic";

export default async function InventoryPage() {
  const session = await auth();
  if (!session) redirect("/login");

  return <InventoryContent />;
}
