import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { OrderDetailContent } from "@/components/orders/order-detail-content";

export const dynamic = "force-dynamic";

export default async function OrderDetailPage() {
  const session = await auth();
  if (!session) redirect("/login");

  return <OrderDetailContent />;
}
