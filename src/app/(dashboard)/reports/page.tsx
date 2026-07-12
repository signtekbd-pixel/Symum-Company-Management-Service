import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { ReportsContent } from "@/components/reports/reports-content";

export default async function ReportsPage() {
  const session = await auth();
  if (!session) redirect("/login");

  return <ReportsContent />;
}
