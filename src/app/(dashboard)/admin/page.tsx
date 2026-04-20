import { notFound } from "next/navigation";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { isAdminEmail } from "@/lib/auth/admin";
import { AdminClient, type AdminUser } from "./admin-client";

export default async function AdminPage() {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  const me = userData.user;

  // Dashboard layout already enforces auth + approved status. This is the
  // second gate specifically for admin email.
  if (!isAdminEmail(me?.email)) {
    notFound();
  }

  // Service-role client — we need auth.users.email for each profile, which
  // anon clients can't see.
  const admin = createAdminClient();

  const { data: profiles } = await admin
    .from("profiles")
    .select(
      "id, full_name, display_name, github_username, approval_status, created_at, approved_at"
    )
    .order("created_at", { ascending: false });

  let users: AdminUser[] = [];
  if (profiles && profiles.length > 0) {
    // Bulk-fetch emails from auth.users via admin API.
    // admin.auth.admin.listUsers() paginates; for now fetch page 1 (up to 1000).
    const { data: authList } = await admin.auth.admin.listUsers({
      perPage: 1000,
    });
    const emailById = new Map(
      (authList?.users ?? []).map((u) => [u.id, u.email ?? ""])
    );
    users = profiles.map((p) => ({
      id: p.id,
      fullName: p.full_name ?? p.display_name ?? null,
      githubUsername: p.github_username ?? null,
      email: emailById.get(p.id) ?? "",
      status: p.approval_status,
      createdAt: p.created_at,
      approvedAt: p.approved_at,
    }));
  }

  return <AdminClient users={users} />;
}
