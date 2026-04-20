"use server";

import { revalidatePath } from "next/cache";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { isAdminEmail } from "@/lib/auth/admin";

async function assertAdmin() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  const email = data.user?.email;
  if (!isAdminEmail(email)) {
    throw new Error("Unauthorized");
  }
  return data.user!;
}

export async function approveUser(userId: string): Promise<void> {
  const admin = await assertAdmin();
  const supabaseAdmin = createAdminClient();

  const { error } = await supabaseAdmin
    .from("profiles")
    .update({
      approval_status: "approved",
      approved_at: new Date().toISOString(),
      approved_by: admin.id,
    })
    .eq("id", userId);

  if (error) throw new Error(error.message);
  revalidatePath("/admin");
}

export async function rejectUser(userId: string): Promise<void> {
  const admin = await assertAdmin();
  const supabaseAdmin = createAdminClient();

  const { error } = await supabaseAdmin
    .from("profiles")
    .update({
      approval_status: "rejected",
      approved_at: new Date().toISOString(),
      approved_by: admin.id,
    })
    .eq("id", userId);

  if (error) throw new Error(error.message);
  revalidatePath("/admin");
}
