import { parseGitHubRepo, fetchRawFile } from "@/lib/github/fetch-file";
import type { DSPlatform } from "@/lib/types";
import { fetchRepoTree } from "./fetch-tree";
import { iosSwiftuiExtractor } from "./extractors/ios-swiftui";
import type { DraftManifest, Extractor, RepoRef } from "./types";

export * from "./types";

const EXTRACTORS: Partial<Record<DSPlatform, Extractor>> = {
  "ios-swiftui": iosSwiftuiExtractor,
};

export interface ExtractRequest {
  repoUrl: string;
  platform: DSPlatform;
  branch?: string;
  subpath?: string;
}

export type ExtractOutcome =
  | { ok: true; draft: DraftManifest }
  | { ok: false; error: string };

export async function extractManifest(
  req: ExtractRequest
): Promise<ExtractOutcome> {
  const extractor = EXTRACTORS[req.platform];
  if (!extractor) {
    return {
      ok: false,
      error: `Extractor for platform "${req.platform}" is not implemented yet.`,
    };
  }

  const repo = parseGitHubRepo(req.repoUrl);
  if (!repo) {
    return {
      ok: false,
      error: "Repository URL must be a public GitHub URL (https://github.com/owner/repo).",
    };
  }

  const ref: RepoRef = {
    owner: repo.owner,
    repo: repo.repo,
    branch: req.branch ?? "main",
  };

  const treeResult = await fetchRepoTree(ref);
  if (!treeResult.ok) {
    return { ok: false, error: treeResult.error };
  }

  const draft = await extractor.extract({
    ref,
    tree: treeResult.tree,
    readFile: (path) => fetchRawFile(ref, path),
    subpath: req.subpath,
  });

  return { ok: true, draft };
}
