import type { RepoRef } from "@/lib/ingest/types";

export function parseGitHubRepo(
  url: string
): { owner: string; repo: string } | null {
  const m = url.match(/github\.com[:/]([^/]+)\/([^/.]+)(?:\.git)?\/?$/);
  if (!m) return null;
  return { owner: m[1], repo: m[2] };
}

function rawUrl(ref: RepoRef, path: string): string {
  const cleaned = path.startsWith("/") ? path.slice(1) : path;
  return `https://raw.githubusercontent.com/${ref.owner}/${ref.repo}/${ref.branch}/${cleaned}`;
}

export async function fetchRawFile(
  ref: RepoRef,
  path: string
): Promise<string | null> {
  try {
    const headers: Record<string, string> = {
      "User-Agent": "hubera-registry/0.1",
    };
    const token = process.env.GITHUB_TOKEN;
    if (token) headers.Authorization = `Bearer ${token}`;
    const res = await fetch(rawUrl(ref, path), {
      headers,
      next: { revalidate: 3600 },
    });
    if (!res.ok) return null;
    return await res.text();
  } catch {
    return null;
  }
}
