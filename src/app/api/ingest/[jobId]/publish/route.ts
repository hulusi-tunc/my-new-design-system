import { NextResponse } from "next/server";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import type { DSManifest } from "@/lib/types";
import type { Json } from "@/lib/supabase/types";

interface RouteContext {
  params: Promise<{ jobId: string }>;
}

interface Body {
  slug?: string;
  name?: string;
  description?: string;
}

export async function POST(request: Request, { params }: RouteContext) {
  const { jobId } = await params;

  let body: Body;
  try {
    body = (await request.json().catch(() => ({}))) as Body;
  } catch {
    body = {};
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
    .select("*")
    .eq("id", jobId)
    .eq("owner_id", user.id)
    .maybeSingle();

  if (error || !job) {
    return NextResponse.json({ error: "job not found" }, { status: 404 });
  }
  if (job.status !== "done" || !job.draft_manifest) {
    return NextResponse.json(
      { error: `job not ready to publish (status: ${job.status})` },
      { status: 409 }
    );
  }

  const draft = job.draft_manifest as unknown as DSManifest;
  const manifest: DSManifest = {
    ...draft,
    ...(body.name ? { name: body.name } : {}),
    ...(body.description ? { description: body.description } : {}),
    ...(body.slug ? { slug: body.slug } : {}),
    updatedAt: new Date().toISOString().split("T")[0],
  };

  const { data: ds, error: dsErr } = await admin
    .from("design_systems")
    .insert({
      slug: manifest.slug,
      name: manifest.name,
      description: manifest.description,
      version: manifest.version ?? "0.1.0",
      owner_id: user.id,
      repository_url: manifest.repository,
      install_path: manifest.installPath ?? null,
      default_branch: manifest.defaultBranch ?? "main",
      platform: manifest.platform ?? job.platform,
      technology: manifest.technology ?? [],
      tags: manifest.tags ?? [],
      architecture: manifest.architecture ?? null,
      license: manifest.license ?? "MIT",
      manifest: manifest as unknown as Json,
      published: true,
    })
    .select("id")
    .single();

  if (dsErr || !ds) {
    const msg = dsErr?.message ?? "failed to publish";
    const isDup = msg.toLowerCase().includes("duplicate");
    return NextResponse.json(
      {
        error: isDup
          ? `Slug "${manifest.slug}" is already taken. Pick a different slug and try again.`
          : msg,
      },
      { status: isDup ? 409 : 500 }
    );
  }

  await admin
    .from("ingest_jobs")
    .update({ design_system_id: ds.id })
    .eq("id", jobId);

  return NextResponse.json({ slug: manifest.slug, designSystemId: ds.id });
}
