import type { DSManifest, DSPlatform, DSSourceLayout } from "@/lib/types";

export interface RepoRef {
  owner: string;
  repo: string;
  branch: string;
}

export interface TreeEntry {
  path: string;
  size: number;
  type: "blob" | "tree";
}

export interface ExtractionWarning {
  kind: string;
  message: string;
  path?: string;
}

export type DraftManifest = Partial<DSManifest> & {
  platform: DSPlatform;
  sourceLayout: DSSourceLayout;
  warnings: ExtractionWarning[];
};

export interface ExtractorInput {
  ref: RepoRef;
  tree: TreeEntry[];
  readFile: (path: string) => Promise<string | null>;
  subpath?: string;
}

export interface Extractor {
  platform: DSPlatform;
  extract(input: ExtractorInput): Promise<DraftManifest>;
}
