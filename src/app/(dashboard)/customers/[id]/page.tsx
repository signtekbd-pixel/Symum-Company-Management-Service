import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { CustomerDetailContent } from "@/components/customers/customer-detail-content";

export const dynamic = "force-dynamic";

export default async function CustomerDetailPage() {
  const session = await auth();
  if (!session) redirect("/login");

  return <CustomerDetailContent />;
}
