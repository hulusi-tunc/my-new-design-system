import type { DSManifest } from "@/lib/types";

export interface FileEntry {
  relativePath: string;
  content: string;
  description: string;
  coreDependency?: boolean;
}

// ── Parse GitHub repository URL ──

interface RepoRef {
  owner: string;
  repo: string;
  branch: string;
}

function parseRepoRef(manifest: DSManifest): RepoRef | null {
  const url = manifest.repository;
  if (!url) return null;
  // Accept forms: https://github.com/OWNER/REPO, https://github.com/OWNER/REPO.git
  const match = url.match(/github\.com[:/]([^/]+)\/([^/.]+)(?:\.git)?\/?$/);
  if (!match) return null;
  return {
    owner: match[1],
    repo: match[2],
    branch: manifest.defaultBranch ?? "main",
  };
}

// ── Fetch a raw file from GitHub ──

function rawUrl(ref: RepoRef, filePath: string): string {
  const path = filePath.startsWith("/") ? filePath.slice(1) : filePath;
  return `https://raw.githubusercontent.com/${ref.owner}/${ref.repo}/${ref.branch}/${path}`;
}

async function fetchRawFile(url: string): Promise<string | null> {
  try {
    const headers: Record<string, string> = {
      "User-Agent": "ds-registry-mcp/0.1",
    };
    // Use GITHUB_TOKEN if available to avoid rate limits (60/hr unauthenticated)
    const token = process.env.GITHUB_TOKEN;
    if (token) headers.Authorization = `Bearer ${token}`;

    const res = await fetch(url, {
      headers,
      // Edge-runtime friendly cache (Next.js fetch cache)
      next: { revalidate: 3600 },
    });
    if (!res.ok) return null;
    return await res.text();
  } catch {
    return null;
  }
}

// ── Core files (tokens, utils, providers, globals.css) ──

interface CoreFileSpec {
  relativePath: string;
  layoutKey: keyof NonNullable<DSManifest["sourceLayout"]>;
  description: string;
}

const CORE_FILE_SPECS: CoreFileSpec[] = [
  {
    relativePath: "styles/design-tokens.ts",
    layoutKey: "tokens",
    description:
      "Token system — color palettes, typography, spacing, radius, semantic tokens via getSemanticTokens(mode, brandOverride?)",
  },
  {
    relativePath: "styles/color-utils.ts",
    layoutKey: "colorUtils",
    description:
      "HSL conversion, generateBrandPalette(hex), validation, brand presets",
  },
  {
    relativePath: "components/providers/theme-provider.tsx",
    layoutKey: "themeProvider",
    description:
      "ThemeProvider context — light/dark mode, brand color customization, localStorage persistence",
  },
  {
    relativePath: "components/providers/role-provider.tsx",
    layoutKey: "roleProvider",
    description:
      "RoleProvider context — developer/designer view toggle",
  },
  {
    relativePath: "app/globals.css",
    layoutKey: "globalsCss",
    description:
      "Base styles — Tailwind v4 import, dark mode variant, scrollbar, selection colors",
  },
];

export async function fetchCoreFiles(
  manifest: DSManifest
): Promise<FileEntry[]> {
  const ref = parseRepoRef(manifest);
  if (!ref) return [];

  const layout = manifest.sourceLayout;
  if (!layout) return [];

  const entries: FileEntry[] = [];
  for (const spec of CORE_FILE_SPECS) {
    const repoPath = layout[spec.layoutKey];
    if (!repoPath) continue;

    const content = await fetchRawFile(rawUrl(ref, repoPath));
    if (content !== null) {
      entries.push({
        relativePath: spec.relativePath,
        content,
        description: spec.description,
        coreDependency: true,
      });
    }
  }

  return entries;
}

// ── Component files ──

export async function fetchComponentFile(
  manifest: DSManifest,
  fileName: string,
  componentName: string
): Promise<FileEntry | null> {
  const ref = parseRepoRef(manifest);
  if (!ref) return null;

  const componentsDir = manifest.sourceLayout?.components;
  if (!componentsDir) return null;

  const repoPath = `${componentsDir}/${fileName}`;
  const content = await fetchRawFile(rawUrl(ref, repoPath));
  if (content === null) return null;

  return {
    relativePath: `components/ui/${fileName}`,
    content,
    description: `${componentName} component`,
  };
}

// ── Availability check ──

export async function hasRemoteSource(manifest: DSManifest): Promise<boolean> {
  const ref = parseRepoRef(manifest);
  if (!ref) return false;

  const componentsDir = manifest.sourceLayout?.components;
  if (!componentsDir) return false;

  const first = manifest.components[0];
  if (!first) return false;

  // HEAD request to check file existence without downloading content
  try {
    const headers: Record<string, string> = {
      "User-Agent": "ds-registry-mcp/0.1",
    };
    const token = process.env.GITHUB_TOKEN;
    if (token) headers.Authorization = `Bearer ${token}`;

    const res = await fetch(rawUrl(ref, `${componentsDir}/${first.file}`), {
      method: "HEAD",
      headers,
      next: { revalidate: 3600 },
    });
    return res.ok;
  } catch {
    return false;
  }
}
