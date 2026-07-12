import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { SettingsContent } from "@/components/settings/settings-content";

export default async function SettingsPage() {
  const session = await auth();
  if (!session) redirect("/login");

  return <SettingsContent />;
}
