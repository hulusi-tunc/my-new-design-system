import type { DSManifest } from "@/lib/types";
import {
  componentWriteDir,
  describeRole,
  writeTargetFor,
} from "@/lib/ingest/roles";

export interface FileEntry {
  relativePath: string;
  content: string;
  description: string;
  coreDependency?: boolean;
  role?: string;
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
    const token = process.env.GITHUB_TOKEN;
    if (token) headers.Authorization = `Bearer ${token}`;

    const res = await fetch(url, {
      headers,
      next: { revalidate: 3600 },
    });
    if (!res.ok) return null;
    return await res.text();
  } catch {
    return null;
  }
}

// ── Core files (tokens, utils, providers, globals.css) ──

export async function fetchCoreFiles(
  manifest: DSManifest
): Promise<FileEntry[]> {
  const ref = parseRepoRef(manifest);
  if (!ref) return [];

  const { platform, files } = manifest.sourceLayout;
  const entries: FileEntry[] = [];

  for (const file of files) {
    const content = await fetchRawFile(rawUrl(ref, file.path));
    if (content === null) continue;

    entries.push({
      relativePath: writeTargetFor(platform, file),
      content,
      description: file.description ?? describeRole(platform, file.role),
      coreDependency: true,
      role: file.role,
    });
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

  const { platform, componentsDir } = manifest.sourceLayout;
  const repoPath = `${componentsDir}/${fileName}`;
  const content = await fetchRawFile(rawUrl(ref, repoPath));
  if (content === null) return null;

  const targetDir = componentWriteDir(platform, componentsDir);
  return {
    relativePath: `${targetDir}/${fileName}`,
    content,
    description: `${componentName} component`,
  };
}

// ── Availability check ──

export async function hasRemoteSource(manifest: DSManifest): Promise<boolean> {
  const ref = parseRepoRef(manifest);
  if (!ref) return false;

  const { componentsDir } = manifest.sourceLayout;
  const first = manifest.components[0];
  if (!first) return false;

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
