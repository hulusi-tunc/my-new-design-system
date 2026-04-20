import { NextResponse } from "next/server";
import { createClient, createAdminClient } from "@/lib/supabase/server";

interface RouteContext {
  params: Promise<{ jobId: string }>;
}

export async function GET(_request: Request, { params }: RouteContext) {
  const { jobId } = await params;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "sign in required" }, { status: 401 });
  }

  const admin = createAdminClient();
  const { data: job, error } = await admin
    .from("ingest_jobs")
    .select("*")
    .eq("id", jobId)
    .eq("owner_id", user.id)
    .maybeSingle();

  if (error || !job) {
    return NextResponse.json({ error: "job not found" }, { status: 404 });
  }

  return NextResponse.json(job);
}
