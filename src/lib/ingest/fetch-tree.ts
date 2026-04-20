import type { RepoRef, TreeEntry } from "./types";

interface GitTreesResponse {
  tree: Array<{ path: string; type: string; size?: number }>;
  truncated: boolean;
  message?: string;
}

export const MAX_TREE_ENTRIES = 5000;

export interface FetchTreeResult {
  ok: true;
  tree: TreeEntry[];
  truncated: boolean;
}

export interface FetchTreeError {
  ok: false;
  error: string;
}

/**
 * Fetches a repo's entire tree recursively via GitHub's Git Trees API.
 * One network call returns paths for every file — extractors can filter
 * locally before doing any per-file fetches.
 */
export async function fetchRepoTree(
  ref: RepoRef
): Promise<FetchTreeResult | FetchTreeError> {
  const headers: Record<string, string> = {
    Accept: "application/vnd.github+json",
    "User-Agent": "hubera-registry/0.1",
  };
  const token = process.env.GITHUB_TOKEN;
  if (token) headers.Authorization = `Bearer ${token}`;

  const url = `https://api.github.com/repos/${ref.owner}/${ref.repo}/git/trees/${ref.branch}?recursive=1`;
  let res: Response;
  try {
    res = await fetch(url, { headers, next: { revalidate: 3600 } });
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "fetch failed" };
  }

  if (!res.ok) {
    return {
      ok: false,
      error: `GitHub API ${res.status}: ${res.statusText}. ${
        res.status === 403 && !token
          ? "Set GITHUB_TOKEN to raise the rate limit."
          : ""
      }`,
    };
  }

  const data = (await res.json()) as GitTreesResponse;
  if (!Array.isArray(data.tree)) {
    return { ok: false, error: data.message ?? "Invalid tree response" };
  }

  const tree: TreeEntry[] = data.tree
    .filter((e) => e.type === "blob" || e.type === "tree")
    .map((e) => ({
      path: e.path,
      size: e.size ?? 0,
      type: e.type as "blob" | "tree",
    }));

  if (tree.length > MAX_TREE_ENTRIES) {
    return {
      ok: false,
      error: `Repo is too large (${tree.length} entries, max ${MAX_TREE_ENTRIES}). Try importing a subpath.`,
    };
  }

  return { ok: true, tree, truncated: data.truncated === true };
}
