import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { ProofsContent } from "@/components/proofs/proofs-content";

export default async function ProofsPage() {
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  return (
    <DashboardLayout>
      <ProofsContent />
    </DashboardLayout>
  );
}
