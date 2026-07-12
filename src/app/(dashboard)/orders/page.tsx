import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { OrdersContent } from "@/components/orders/orders-content";

export default async function OrdersPage() {
  const session = await auth();
  if (!session) redirect("/login");

  return <OrdersContent />;
}
