import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { CreateCustomerForm } from "@/components/customers/create-customer-form";

export default async function NewCustomerPage() {
  const session = await auth();
  if (!session) redirect("/login");

  return (
    <DashboardLayout>
      <CreateCustomerForm />
    </DashboardLayout>
  );
}
