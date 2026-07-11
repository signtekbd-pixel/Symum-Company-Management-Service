import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { InvoicingContent } from "@/components/invoicing/invoicing-content";

export default async function InvoicingPage() {
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  return (
    <DashboardLayout>
      <InvoicingContent />
    </DashboardLayout>
  );
}
