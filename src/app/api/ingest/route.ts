import { NextResponse, after } from "next/server";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { extractManifest } from "@/lib/ingest";
import { isValidPlatform } from "@/lib/platforms";
import type { DSPlatform } from "@/lib/types";
import type { Json } from "@/lib/supabase/types";

export const maxDuration = 60;

interface Body {
  repoUrl?: string;
  platform?: string;
  branch?: string;
  subpath?: string;
}

export async function POST(request: Request) {
  let body: Body;
  try {
    body = (await request.json()) as Body;
  } catch {
    return NextResponse.json({ error: "invalid body" }, { status: 400 });
  }

  if (!body.repoUrl || !body.platform) {
    return NextResponse.json(
      { error: "repoUrl and platform are required" },
      { status: 400 }
    );
  }
  if (!isValidPlatform(body.platform)) {
    return NextResponse.json({ error: "invalid platform" }, { status: 400 });
  }

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
    .insert({
      owner_id: user.id,
      repo_url: body.repoUrl,
      platform: body.platform,
      branch: body.branch ?? null,
      subpath: body.subpath ?? null,
      status: "queued",
    })
    .select("id")
    .single();

  if (error || !job) {
    return NextResponse.json(
      { error: error?.message ?? "failed to create job" },
      { status: 500 }
    );
  }

  const jobId = job.id;
  const platform = body.platform as DSPlatform;
  const repoUrl = body.repoUrl;
  const branch = body.branch;
  const subpath = body.subpath;

  after(async () => {
    await runExtraction({ jobId, repoUrl, platform, branch, subpath });
  });

  return NextResponse.json({ jobId });
}

async function runExtraction(args: {
  jobId: string;
  repoUrl: string;
  platform: DSPlatform;
  branch?: string;
  subpath?: string;
}) {
  const admin = createAdminClient();
  await admin
    .from("ingest_jobs")
    .update({ status: "running" })
    .eq("id", args.jobId);

  const result = await extractManifest({
    repoUrl: args.repoUrl,
    platform: args.platform,
    branch: args.branch,
    subpath: args.subpath,
  });

  if (!result.ok) {
    await admin
      .from("ingest_jobs")
      .update({ status: "failed", error: result.error })
      .eq("id", args.jobId);
    return;
  }

  const { warnings, ...manifestWithoutWarnings } = result.draft;
  await admin
    .from("ingest_jobs")
    .update({
      status: "done",
      draft_manifest: manifestWithoutWarnings as unknown as Json,
      warnings: warnings as unknown as Json,
      error: null,
    })
    .eq("id", args.jobId);
}
