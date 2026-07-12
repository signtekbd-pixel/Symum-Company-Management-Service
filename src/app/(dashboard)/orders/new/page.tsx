import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { CreateOrderForm } from "@/components/orders/create-order-form";

export default async function NewOrderPage() {
  const session = await auth();
  if (!session) redirect("/login");

  return <CreateOrderForm />;
}
