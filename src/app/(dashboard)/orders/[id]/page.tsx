import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { OrderDetailContent } from "@/components/orders/order-detail-content";

export default async function OrderDetailPage() {
  const session = await auth();
  if (!session) redirect("/login");

  return (
    <DashboardLayout>
      <OrderDetailContent />
    </DashboardLayout>
  );
}
