import { NextResponse } from "next/server";
import { extractManifest } from "@/lib/ingest";
import { isValidPlatform } from "@/lib/platforms";
import type { DSPlatform } from "@/lib/types";

export const maxDuration = 60;

export async function GET(request: Request) {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "dev only" }, { status: 404 });
  }

  const url = new URL(request.url);
  const repoUrl = url.searchParams.get("repo");
  const platform = url.searchParams.get("platform");
  const branch = url.searchParams.get("branch") ?? undefined;
  const subpath = url.searchParams.get("subpath") ?? undefined;

  if (!repoUrl || !platform) {
    return NextResponse.json(
      { error: "repo and platform query params required" },
      { status: 400 }
    );
  }
  if (!isValidPlatform(platform)) {
    return NextResponse.json({ error: "invalid platform" }, { status: 400 });
  }

  const result = await extractManifest({
    repoUrl,
    platform: platform as DSPlatform,
    branch,
    subpath,
  });

  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 422 });
  }

  return NextResponse.json(result.draft);
}
