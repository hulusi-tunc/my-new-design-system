import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PendingClient } from "./pending-client";

export default async function PendingPage() {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  const user = userData.user;

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, approval_status")
    .eq("id", user.id)
    .single();

  // If already approved, send them to the dashboard — don't park them here.
  if (profile?.approval_status === "approved") {
    redirect("/dashboard");
  }

  return (
    <PendingClient
      fullName={profile?.full_name ?? null}
      email={user.email ?? ""}
      status={profile?.approval_status ?? "pending"}
    />
  );
}
