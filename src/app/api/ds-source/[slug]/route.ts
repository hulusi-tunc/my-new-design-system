/**
 * Fetches one or more source files from a design system's GitHub repo
 * and returns them as a map { path: content }.
 *
 * Usage:
 *   POST /api/ds-source/[slug]
 *   Body: { paths: ["src/components/ui/button.tsx", ...] }
 *
 * Responds:
 *   { files: Record<path, string>, repo: string, branch: string }
 *
 * This proxy avoids CORS issues when the browser tries to fetch
 * raw.githubusercontent.com, and centralises caching.
 */

import { NextResponse } from "next/server";
import { getManifestBySlug } from "@/lib/registry";

const GITHUB_RAW = "https://raw.githubusercontent.com";

type Body = {
  paths: string[];
};

function parseGitHubRepo(repoUrl: string): { owner: string; repo: string } | null {
  // Accepts https://github.com/owner/repo or git@github.com:owner/repo.git
  const cleaned = repoUrl
    .trim()
    .replace(/^git@github\.com:/, "https://github.com/")
    .replace(/\.git$/, "");
  const m = cleaned.match(/github\.com\/([^/]+)\/([^/]+)/);
  if (!m) return null;
  return { owner: m[1], repo: m[2] };
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  let body: Body;
  try {
    body = (await request.json()) as Body;
  } catch {
    return NextResponse.json({ error: "invalid body" }, { status: 400 });
  }

  if (!Array.isArray(body.paths) || body.paths.length === 0) {
    return NextResponse.json({ error: "paths is required" }, { status: 400 });
  }

  // Hard-cap the number of files so we can't be used to scrape repos
  if (body.paths.length > 30) {
    return NextResponse.json(
      { error: "too many paths (max 30)" },
      { status: 400 }
    );
  }

  const manifest = await getManifestBySlug(slug);
  if (!manifest) {
    return NextResponse.json({ error: "design system not found" }, { status: 404 });
  }

  const repo = parseGitHubRepo(manifest.repository);
  if (!repo) {
    return NextResponse.json(
      { error: "invalid repository URL in manifest" },
      { status: 500 }
    );
  }

  const branch = manifest.defaultBranch ?? "main";
  const headers: HeadersInit = process.env.GITHUB_TOKEN
    ? { Authorization: `Bearer ${process.env.GITHUB_TOKEN}` }
    : {};

  const files: Record<string, string> = {};
  const errors: Record<string, string> = {};

  await Promise.all(
    body.paths.map(async (rawPath) => {
      // Prevent path traversal
      const path = rawPath.replace(/\.\.\//g, "").replace(/^\/+/, "");
      const url = `${GITHUB_RAW}/${repo.owner}/${repo.repo}/${branch}/${path}`;

      try {
        const res = await fetch(url, {
          headers,
          // Cache for 1 hour on the server — DS repos don't change often
          next: { revalidate: 3600 },
        });
        if (!res.ok) {
          errors[path] = `${res.status} ${res.statusText}`;
          return;
        }
        files[path] = await res.text();
      } catch (err) {
        errors[path] = err instanceof Error ? err.message : "fetch failed";
      }
    })
  );

  return NextResponse.json({
    slug: manifest.slug,
    repo: `${repo.owner}/${repo.repo}`,
    branch,
    files,
    errors: Object.keys(errors).length > 0 ? errors : undefined,
  });
}
