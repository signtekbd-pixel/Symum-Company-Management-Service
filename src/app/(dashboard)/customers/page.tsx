import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { CustomersContent } from "@/components/customers/customers-content";

export default async function CustomersPage() {
  const session = await auth();
  if (!session) redirect("/login");

  return <CustomersContent />;
}
