import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { ProductsContent } from "@/components/products/products-content";

export default async function ProductsPage() {
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  return (
    <DashboardLayout>
      <ProductsContent />
    </DashboardLayout>
  );
}
