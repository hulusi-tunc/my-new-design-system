import type {
  Extractor,
  ExtractorInput,
  DraftManifest,
  ExtractionWarning,
} from "../types";
import type { DSComponent } from "@/lib/types";
import { commonAncestor, dirname, suggestSlug, toTitleCase } from "./_shared";

const SOURCE_EXT = /\.(tsx|ts|jsx|js)$/;
const TEST_FILE = /\.(test|spec|stories)\.(tsx|ts|jsx|js)$/;
const SKIP_PATH = /(?:^|\/)(?:node_modules|__tests__|__mocks__|dist|build|\.expo)\//;

const RN_IMPORT = /from\s+["']react-native["']/;
const STYLESHEET_CREATE = /\bStyleSheet\.create\b/;

// Component name = starts with uppercase + lowercase next char (PascalCase),
// excluding SCREAMING_CASE constants like DEFAULT_HEIGHT.
const EXPORT_FN = /export\s+(?:default\s+)?function\s+([A-Z][a-z]\w*)\s*[(<]/g;
const EXPORT_CONST = /export\s+(?:default\s+)?const\s+([A-Z][a-z]\w*)\s*[:=]/g;

// Skip names that look like React Contexts or Providers — they're glue, not components.
const NON_COMPONENT_SUFFIX = /(?:Context|Provider|Config|Constants|Utils|Theme)$/;

const TOKEN_FILENAME =
  /(?:^|\/)(?:colou?rs?|tokens?|theme|palette|design[-_]tokens?)\.(?:tsx?|jsx?)$/i;

const COLOR_HEX_QUOTED =
  /(\w+)\s*:\s*["']#([0-9a-fA-F]{3,8})["']/g;
const COLOR_HEX_CONST =
  /(?:export\s+)?(?:const|let|var)\s+(\w+)\s*=\s*["']#([0-9a-fA-F]{3,8})["']/g;

const FILE_SIZE_CAP = 256 * 1024;

export const reactNativeExtractor: Extractor = {
  platform: "react-native",
  async extract(input: ExtractorInput): Promise<DraftManifest> {
    const warnings: ExtractionWarning[] = [];

    const subpath = (input.subpath ?? "").replace(/^\/+|\/+$/g, "");
    const scoped = input.tree.filter((e) => {
      if (e.type !== "blob") return false;
      if (!SOURCE_EXT.test(e.path)) return false;
      if (TEST_FILE.test(e.path)) return false;
      if (SKIP_PATH.test("/" + e.path)) return false;
      if (subpath && !e.path.startsWith(subpath + "/")) return false;
      if (e.size > FILE_SIZE_CAP) return false;
      return true;
    });

    if (scoped.length === 0) {
      warnings.push({
        kind: "no_source_files",
        message: subpath
          ? `No .ts/.tsx/.js/.jsx files found under ${subpath}.`
          : "No .ts/.tsx/.js/.jsx files found in the repo tree.",
      });
    }

    const componentEntries: Array<{
      name: string;
      file: string;
      variants: number;
      fullPath: string;
    }> = [];
    const tokenFiles: Array<{ path: string; content: string; role: string }> = [];

    for (const entry of scoped) {
      const content = await input.readFile(entry.path);
      if (!content) continue;

      if (TOKEN_FILENAME.test(entry.path)) {
        const lower = entry.path.toLowerCase();
        const role = /theme/.test(lower) ? "theme" : "tokens";
        tokenFiles.push({ path: entry.path, content, role });
        continue;
      }

      const usesRN = RN_IMPORT.test(content) || STYLESHEET_CREATE.test(content);
      if (!usesRN) continue;

      const stripped = stripBlockComments(content);
      const found = new Set<string>();
      EXPORT_FN.lastIndex = 0;
      let m: RegExpExecArray | null;
      while ((m = EXPORT_FN.exec(stripped)) !== null) {
        if (!NON_COMPONENT_SUFFIX.test(m[1])) found.add(m[1]);
      }
      EXPORT_CONST.lastIndex = 0;
      while ((m = EXPORT_CONST.exec(stripped)) !== null) {
        if (!NON_COMPONENT_SUFFIX.test(m[1])) found.add(m[1]);
      }

      if (found.size === 0) continue;

      const names = Array.from(found);
      const fileName = entry.path.split("/").pop() ?? entry.path;
      componentEntries.push({
        name: names[0],
        file: fileName,
        variants: names.length,
        fullPath: entry.path,
      });
    }

    const componentsDir =
      commonAncestor(componentEntries.map((c) => dirname(c.fullPath))) ||
      (subpath || "src");

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
          "No React Native components detected. Extractor looks for exported PascalCase functions/consts in files that import 'react-native'.",
      });
    }
    if (Object.keys(colors).length === 0 && tokenFiles.length > 0) {
      warnings.push({
        kind: "no_colors",
        message:
          "Found token files but couldn't parse named color tokens (looking for `key: '#hex'` or `const name = '#hex'`).",
      });
    } else if (tokenFiles.length === 0) {
      warnings.push({
        kind: "no_token_files",
        message:
          "No theme/colors/tokens file found by name. Tokens may be declared inline or under a non-conventional name.",
      });
    }

    const slug = suggestSlug(input.ref.repo);
    const today = new Date().toISOString().split("T")[0];
    const usesTypeScript = scoped.some((e) => /\.tsx?$/.test(e.path));

    return {
      platform: "react-native",
      slug,
      name: toTitleCase(input.ref.repo),
      description: `React Native design system imported from ${input.ref.owner}/${input.ref.repo}`,
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
      technology: usesTypeScript
        ? ["react-native", "typescript"]
        : ["react-native", "javascript"],
      architecture: "stylesheet-create",
      sourceLayout: {
        platform: "react-native",
        componentsDir,
        files: tokenFiles.map((f) => ({ path: f.path, role: f.role })),
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
        spacing: { unit: "px", steps: 8 },
        radius: { steps: 5, full: 9999 },
      },
      components,
      screenshots: { preview: "", gallery: [] },
      tags: ["imported", "react-native"],
      warnings,
    };
  },
};

function stripBlockComments(src: string): string {
  return src.replace(/\/\*[\s\S]*?\*\//g, "");
}

function extractColors(
  files: Array<{ path: string; content: string }>
): Record<string, string> {
  const result: Record<string, string> = {};
  for (const { content } of files) {
    COLOR_HEX_QUOTED.lastIndex = 0;
    let m: RegExpExecArray | null;
    while ((m = COLOR_HEX_QUOTED.exec(content)) !== null) {
      const [, name, hex] = m;
      if (name && hex) result[name] = normalizeHex(hex);
    }
    COLOR_HEX_CONST.lastIndex = 0;
    while ((m = COLOR_HEX_CONST.exec(content)) !== null) {
      const [, name, hex] = m;
      if (name && hex) result[name] = normalizeHex(hex);
    }
  }
  return result;
}

function normalizeHex(raw: string): string {
  let h = raw;
  if (h.length === 3) {
    h = h.split("").map((c) => c + c).join("");
  }
  if (h.length === 8) h = h.slice(0, 6); // drop trailing alpha (#RRGGBBAA)
  return ("#" + h.toUpperCase()).slice(0, 7);
}
