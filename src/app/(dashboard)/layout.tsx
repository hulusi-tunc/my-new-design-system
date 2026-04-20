import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { DashboardShell } from "@/components/dashboard-shell";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  const user = userData.user;

  // Unauthenticated → send to login.
  if (!user) {
    redirect("/login");
  }

  // Approval gate. If the profile row doesn't exist yet (brief race between
  // auth.users insert and the handle_new_user trigger), treat as pending.
  const { data: profile } = await supabase
    .from("profiles")
    .select("approval_status")
    .eq("id", user.id)
    .single();

  const status = profile?.approval_status ?? "pending";
  if (status !== "approved") {
    redirect("/pending");
  }

  return <DashboardShell>{children}</DashboardShell>;
}
