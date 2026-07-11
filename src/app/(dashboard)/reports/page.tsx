import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { ReportsContent } from "@/components/reports/reports-content";

export default async function ReportsPage() {
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  return (
    <DashboardLayout>
      <ReportsContent />
    </DashboardLayout>
  );
}
