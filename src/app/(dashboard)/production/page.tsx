import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { ProductionContent } from "@/components/production/production-content";

export default async function ProductionPage() {
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  return (
    <DashboardLayout>
      <ProductionContent />
    </DashboardLayout>
  );
}
