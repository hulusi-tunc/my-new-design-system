import type {
  Extractor,
  ExtractorInput,
  DraftManifest,
  ExtractionWarning,
} from "../types";
import type { DSComponent } from "@/lib/types";

const SWIFT_EXT = /\.swift$/;
const VIEW_STRUCT =
  /(?:public|internal|open|private|fileprivate)?\s*struct\s+(\w+)\s*:\s*(?:SwiftUI\.)?View\b/g;
const COLOR_EXT_MARKER = /extension\s+(?:SwiftUI\.)?Color\b/;
const FONT_EXT_MARKER = /extension\s+(?:SwiftUI\.)?Font\b/;

// static let|var <name> = ... Color(red: r, green: g, blue: b [, opacity: a])
const COLOR_RGB_LET =
  /static\s+(?:let|var)\s+(\w+)\s*[:=][^=\n]*?Color\(\s*red:\s*([0-9.]+)\s*,\s*green:\s*([0-9.]+)\s*,\s*blue:\s*([0-9.]+)/g;

// static let|var <name> = Color(hex: "#FFFFFF") — common extension
const COLOR_HEX_LET =
  /static\s+(?:let|var)\s+(\w+)\s*[:=][^=\n]*?Color\(\s*hex:\s*"?#?([0-9a-fA-F]{3,8})"?\s*\)/g;

const FILE_SIZE_CAP = 256 * 1024;

export const iosSwiftuiExtractor: Extractor = {
  platform: "ios-swiftui",
  async extract(input: ExtractorInput): Promise<DraftManifest> {
    const warnings: ExtractionWarning[] = [];

    const subpath = (input.subpath ?? "").replace(/^\/+|\/+$/g, "");
    const scoped = input.tree.filter((e) => {
      if (e.type !== "blob") return false;
      if (!SWIFT_EXT.test(e.path)) return false;
      if (subpath && !e.path.startsWith(subpath + "/")) return false;
      if (e.size > FILE_SIZE_CAP) return false;
      return true;
    });

    if (scoped.length === 0) {
      warnings.push({
        kind: "no_swift_files",
        message: subpath
          ? `No .swift files found under ${subpath}.`
          : "No .swift files found in the repo tree.",
      });
    }

    const componentEntries: Array<{
      name: string;
      file: string;
      variants: number;
      fullPath: string;
    }> = [];
    const tokenFiles: Array<{ path: string; content: string }> = [];

    for (const entry of scoped) {
      const content = await input.readFile(entry.path);
      if (!content) continue;

      const isTokenFile =
        COLOR_EXT_MARKER.test(content) || FONT_EXT_MARKER.test(content);

      if (isTokenFile) {
        tokenFiles.push({ path: entry.path, content });
        continue;
      }

      VIEW_STRUCT.lastIndex = 0;
      const matches = [...content.matchAll(VIEW_STRUCT)];
      if (matches.length === 0) continue;

      const primaryName = matches[0][1];
      const fileName = entry.path.split("/").pop() ?? entry.path;
      componentEntries.push({
        name: primaryName,
        file: fileName,
        variants: matches.length,
        fullPath: entry.path,
      });
    }

    const componentsDir =
      commonAncestor(componentEntries.map((c) => dirname(c.fullPath))) ||
      (subpath ? subpath : "Sources");

    const colors = extractColors(tokenFiles);

    const components: DSComponent[] = componentEntries.map((c) => ({
      name: c.name,
      file: c.file,
      variants: c.variants > 1 ? c.variants : undefined,
    }));

    if (components.length === 0) {
      warnings.push({
        kind: "no_components",
        message:
          "No SwiftUI View structs detected. Extractor looks for `struct X: View`.",
      });
    }
    if (Object.keys(colors).length === 0 && tokenFiles.length > 0) {
      warnings.push({
        kind: "no_colors",
        message:
          "Found Color extension files but couldn't parse any named color tokens.",
      });
    } else if (tokenFiles.length === 0) {
      warnings.push({
        kind: "no_token_files",
        message:
          "No Color/Font extension files found. Design tokens may be declared elsewhere.",
      });
    }

    const slug = suggestSlug(input.ref.repo);
    const today = new Date().toISOString().split("T")[0];

    return {
      platform: "ios-swiftui",
      slug,
      name: toTitleCase(input.ref.repo),
      description: `SwiftUI design system imported from ${input.ref.owner}/${input.ref.repo}`,
      version: "0.1.0",
      author: {
        name: input.ref.owner,
        github: input.ref.owner,
        avatar: `https://github.com/${input.ref.owner}.png`,
      },
      license: "MIT",
      createdAt: today,
      updatedAt: today,
      parent: null,
      repository: `https://github.com/${input.ref.owner}/${input.ref.repo}`,
      defaultBranch: input.ref.branch,
      installPath: `design-systems/${slug}`,
      technology: ["swift-5", "swiftui"],
      architecture: "swiftui-modifiers",
      sourceLayout: {
        platform: "ios-swiftui",
        componentsDir,
        files: tokenFiles.map((f) => ({
          path: f.path,
          role: /font/i.test(f.path) ? "fontExt" : "colorExt",
        })),
      },
      tokens: {
        colors:
          Object.keys(colors).length > 0
            ? (colors as Record<string, string>)
            : {},
        typography: {
          fontFamily: "System",
          weights: ["400", "500", "600", "700"],
          scaleSteps: 6,
        },
        spacing: { unit: "pt", steps: 8 },
        radius: { steps: 5, full: 9999 },
      },
      components,
      screenshots: { preview: "", gallery: [] },
      tags: ["imported", "swiftui"],
      warnings,
    };
  },
};

// ── Helpers ──

function extractColors(
  files: Array<{ path: string; content: string }>
): Record<string, string> {
  const result: Record<string, string> = {};
  for (const { content } of files) {
    COLOR_RGB_LET.lastIndex = 0;
    let m: RegExpExecArray | null;
    while ((m = COLOR_RGB_LET.exec(content)) !== null) {
      const [, name, r, g, b] = m;
      const hex = rgbFloatToHex(+r, +g, +b);
      if (name && hex) result[name] = hex;
    }
    COLOR_HEX_LET.lastIndex = 0;
    while ((m = COLOR_HEX_LET.exec(content)) !== null) {
      const [, name, hex] = m;
      if (name && hex) result[name] = normalizeHex(hex);
    }
  }
  return result;
}

function rgbFloatToHex(r: number, g: number, b: number): string | null {
  if (![r, g, b].every((v) => Number.isFinite(v))) return null;
  const to = (v: number) =>
    Math.round(Math.max(0, Math.min(1, v)) * 255)
      .toString(16)
      .padStart(2, "0");
  return ("#" + to(r) + to(g) + to(b)).toUpperCase();
}

function normalizeHex(raw: string): string {
  let h = raw;
  if (h.length === 3) {
    h = h.split("").map((c) => c + c).join("");
  }
  if (h.length === 8) h = h.slice(0, 6); // strip alpha
  return ("#" + h.toUpperCase()).slice(0, 7);
}

function commonAncestor(paths: string[]): string | null {
  if (paths.length === 0) return null;
  if (paths.length === 1) return paths[0];
  const segs = paths.map((p) => p.split("/"));
  const prefix: string[] = [];
  for (let i = 0; i < segs[0].length; i++) {
    const seg = segs[0][i];
    if (segs.every((s) => s[i] === seg)) prefix.push(seg);
    else break;
  }
  return prefix.join("/") || null;
}

function dirname(p: string): string {
  const idx = p.lastIndexOf("/");
  return idx === -1 ? "" : p.slice(0, idx);
}

function suggestSlug(repo: string): string {
  return repo
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);
}

function toTitleCase(s: string): string {
  return s
    .split(/[-_\s]+/)
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}
