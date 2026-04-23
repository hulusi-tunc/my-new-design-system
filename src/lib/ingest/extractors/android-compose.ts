import type {
  Extractor,
  ExtractorInput,
  DraftManifest,
  ExtractionWarning,
} from "../types";
import type { DSComponent } from "@/lib/types";
import {
  commonAncestor,
  dirname,
  relativeTo,
  suggestSlug,
  toTitleCase,
} from "./_shared";

const KT_EXT = /\.kt$/;
const SKIP_PATH =
  /(?:^|\/)(?:build|\.gradle|\.idea|test|androidTest|src\/test|src\/androidTest)\//;

const COMPOSABLE_FN =
  /@Composable[\s\S]{0,80}?fun\s+(?:[A-Z]\w*\s*\.\s*)?([A-Z]\w*)\s*\(/g;

const COLOR_VAL =
  /(?:val|var)\s+(\w+)(?:\s*:\s*Color)?\s*=\s*Color\(\s*0x([0-9a-fA-F]{6,8})\s*\)/g;

// Material theme files — Color.kt, Theme.kt, Type(ography).kt, Shape(s).kt
const TOKEN_FILENAME =
  /(?:^|\/)(?:Colou?rs?|Theme|Typography|Type|Shapes?|Tokens?)\.kt$/;

const FILE_SIZE_CAP = 256 * 1024;

export const androidComposeExtractor: Extractor = {
  platform: "android-compose",
  async extract(input: ExtractorInput): Promise<DraftManifest> {
    const warnings: ExtractionWarning[] = [];

    const subpath = (input.subpath ?? "").replace(/^\/+|\/+$/g, "");
    const scoped = input.tree.filter((e) => {
      if (e.type !== "blob") return false;
      if (!KT_EXT.test(e.path)) return false;
      if (SKIP_PATH.test("/" + e.path)) return false;
      if (subpath && !e.path.startsWith(subpath + "/")) return false;
      if (e.size > FILE_SIZE_CAP) return false;
      return true;
    });

    if (scoped.length === 0) {
      warnings.push({
        kind: "no_kotlin_files",
        message: subpath
          ? `No .kt files found under ${subpath}.`
          : "No .kt files found in the repo tree.",
      });
    }

    const componentEntries: Array<{
      name: string;
      variants: number;
      fullPath: string;
    }> = [];
    const tokenFiles: Array<{ path: string; content: string; role: string }> = [];

    for (const entry of scoped) {
      const content = await input.readFile(entry.path);
      if (!content) continue;

      const isTokenFile =
        TOKEN_FILENAME.test(entry.path) || hasManyColorLiterals(content);

      if (isTokenFile) {
        tokenFiles.push({
          path: entry.path,
          content,
          role: roleFor(entry.path),
        });
        continue;
      }

      COMPOSABLE_FN.lastIndex = 0;
      const matches = [...content.matchAll(COMPOSABLE_FN)];
      if (matches.length === 0) continue;

      componentEntries.push({
        name: matches[0][1],
        variants: matches.length,
        fullPath: entry.path,
      });
    }

    const componentsDir =
      commonAncestor(componentEntries.map((c) => dirname(c.fullPath))) ||
      (subpath || "src/main/java");

    const colors = extractColors(tokenFiles);

    const components: DSComponent[] = componentEntries.map((c) => ({
      name: c.name,
      file: relativeTo(componentsDir, c.fullPath),
      variants: c.variants > 1 ? c.variants : undefined,
    }));

    if (components.length === 0) {
      warnings.push({
        kind: "no_components",
        message:
          "No @Composable functions detected. Extractor looks for `@Composable fun PascalName(...)`.",
      });
    }
    if (Object.keys(colors).length === 0 && tokenFiles.length > 0) {
      warnings.push({
        kind: "no_colors",
        message:
          "Found theme/color files but couldn't parse named Color tokens (looking for `val X = Color(0xFF...)`).",
      });
    } else if (tokenFiles.length === 0) {
      warnings.push({
        kind: "no_token_files",
        message:
          "No Color/Theme/Typography/Shape .kt file found. Tokens may live elsewhere.",
      });
    }

    const slug = suggestSlug(input.ref.repo);
    const today = new Date().toISOString().split("T")[0];

    return {
      platform: "android-compose",
      slug,
      name: toTitleCase(input.ref.repo),
      description: `Jetpack Compose design system imported from ${input.ref.owner}/${input.ref.repo}`,
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
      technology: ["jetpack-compose", "kotlin"],
      architecture: "material3",
      sourceLayout: {
        platform: "android-compose",
        componentsDir,
        files: tokenFiles.map((f) => ({ path: f.path, role: f.role })),
      },
      tokens: {
        colors:
          Object.keys(colors).length > 0
            ? (colors as Record<string, string>)
            : {},
        typography: {
          fontFamily: "Roboto",
          weights: ["400", "500", "600", "700"],
          scaleSteps: 6,
        },
        spacing: { unit: "dp", steps: 8 },
        radius: { steps: 5, full: 9999 },
      },
      components,
      screenshots: { preview: "", gallery: [] },
      tags: ["imported", "jetpack-compose"],
      warnings,
    };
  },
};

function roleFor(path: string): string {
  const file = path.split("/").pop() ?? path;
  if (/^Theme\.kt$/i.test(file)) return "themeKt";
  if (/^(?:Typography|Type)\.kt$/i.test(file)) return "typographyKt";
  if (/^Shapes?\.kt$/i.test(file)) return "shapesKt";
  return "colorKt";
}

function hasManyColorLiterals(content: string): boolean {
  COLOR_VAL.lastIndex = 0;
  let count = 0;
  while (COLOR_VAL.exec(content) !== null) {
    if (++count >= 3) return true;
  }
  return false;
}

function extractColors(
  files: Array<{ path: string; content: string }>
): Record<string, string> {
  const result: Record<string, string> = {};
  for (const { content } of files) {
    COLOR_VAL.lastIndex = 0;
    let m: RegExpExecArray | null;
    while ((m = COLOR_VAL.exec(content)) !== null) {
      const [, name, hex] = m;
      if (name && hex) result[name] = normalizeKotlinHex(hex);
    }
  }
  return result;
}

// Kotlin Color(0xAARRGGBB) — alpha at the front, like Flutter.
function normalizeKotlinHex(raw: string): string {
  let h = raw.toUpperCase();
  if (h.length === 8) h = h.slice(2);
  return ("#" + h).slice(0, 7);
}
