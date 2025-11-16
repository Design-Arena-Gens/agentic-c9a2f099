import { redirect } from "next/navigation";
import { getUserFromCookies } from "@/lib/auth";
import { DashboardShell } from "@/components/dashboard/DashboardShell";

export default async function DashboardPage() {
  const user = await getUserFromCookies();
  if (!user) {
    redirect("/login");
  }
  return <DashboardShell initialUser={user} />;
}
