import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { DashboardClient } from "./dashboard-client";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const profileQuery = await supabase
    .from("profiles")
    .select("display_name")
    .eq("id", user.id)
    .maybeSingle();

  const systemsQuery = await supabase
    .from("design_systems")
    .select("slug, name, description, version, technology, tags, published, updated_at")
    .eq("owner_id", user.id)
    .order("updated_at", { ascending: false });

  const profile = profileQuery.data as { display_name: string | null } | null;
  const mySystems = systemsQuery.data as
    | Array<{
        slug: string;
        name: string;
        description: string | null;
        version: string;
        technology: string[];
        tags: string[];
        published: boolean;
        updated_at: string;
      }>
    | null;

  return (
    <DashboardClient
      user={{
        email: user.email ?? "",
        githubUsername:
          (user.user_metadata?.user_name as string | undefined) ??
          (user.user_metadata?.preferred_username as string | undefined) ??
          "",
        avatarUrl: user.user_metadata?.avatar_url as string | undefined,
        displayName:
          (profile?.display_name as string | null) ??
          (user.user_metadata?.full_name as string | undefined) ??
          "",
      }}
      systems={mySystems ?? []}
    />
  );
}
