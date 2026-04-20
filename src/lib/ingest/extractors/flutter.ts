import type {
  Extractor,
  ExtractorInput,
  DraftManifest,
  ExtractionWarning,
} from "../types";
import type { DSComponent } from "@/lib/types";
import { commonAncestor, dirname, suggestSlug, toTitleCase } from "./_shared";

const DART_EXT = /\.dart$/;
const SKIP_PATH = /(?:^|\/)(?:\.dart_tool|build|\.pub-cache|test|integration_test)\//;
const GENERATED_FILE = /\.(g|freezed)\.dart$/;

const WIDGET_CLASS =
  /class\s+(\w+)\s+extends\s+(?:StatelessWidget|StatefulWidget|ConsumerWidget|HookWidget|HookConsumerWidget)\b/g;

const COLOR_LITERAL =
  /(?:static\s+)?(?:const|final)\s+(?:Color\s+)?(\w+)\s*=\s*Color\(\s*0x([0-9a-fA-F]{6,8})\s*\)/g;

const TOKEN_FILENAME =
  /(?:^|\/)(?:colou?rs?|tokens?|theme|themes|palette|app_colou?rs?|app_theme)\.dart$/i;

const FILE_SIZE_CAP = 256 * 1024;

export const flutterExtractor: Extractor = {
  platform: "flutter",
  async extract(input: ExtractorInput): Promise<DraftManifest> {
    const warnings: ExtractionWarning[] = [];

    const subpath = (input.subpath ?? "").replace(/^\/+|\/+$/g, "");
    const scoped = input.tree.filter((e) => {
      if (e.type !== "blob") return false;
      if (!DART_EXT.test(e.path)) return false;
      if (GENERATED_FILE.test(e.path)) return false;
      if (SKIP_PATH.test("/" + e.path)) return false;
      if (subpath && !e.path.startsWith(subpath + "/")) return false;
      if (e.size > FILE_SIZE_CAP) return false;
      return true;
    });

    if (scoped.length === 0) {
      warnings.push({
        kind: "no_dart_files",
        message: subpath
          ? `No .dart files found under ${subpath}.`
          : "No .dart files found in the repo tree.",
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

      WIDGET_CLASS.lastIndex = 0;
      const widgetMatches = [...content.matchAll(WIDGET_CLASS)];
      const isNamedTokenFile = TOKEN_FILENAME.test(entry.path);
      COLOR_LITERAL.lastIndex = 0;
      const hasColorLiterals = COLOR_LITERAL.test(content);
      COLOR_LITERAL.lastIndex = 0;

      const isTokenFile =
        isNamedTokenFile || (widgetMatches.length === 0 && hasColorLiterals);

      if (isTokenFile) {
        const lower = entry.path.toLowerCase();
        const role = /theme/.test(lower)
          ? "themeData"
          : /typo|font/.test(lower)
            ? "typographyDart"
            : "colorsDart";
        tokenFiles.push({ path: entry.path, content, role });
        continue;
      }

      if (widgetMatches.length === 0) continue;

      const primaryName = widgetMatches[0][1];
      const fileName = entry.path.split("/").pop() ?? entry.path;
      componentEntries.push({
        name: primaryName,
        file: fileName,
        variants: widgetMatches.length,
        fullPath: entry.path,
      });
    }

    const componentsDir =
      commonAncestor(componentEntries.map((c) => dirname(c.fullPath))) ||
      (subpath || "lib");

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
          "No Flutter widgets detected. Extractor looks for `class X extends StatelessWidget|StatefulWidget`.",
      });
    }
    if (Object.keys(colors).length === 0 && tokenFiles.length > 0) {
      warnings.push({
        kind: "no_colors",
        message:
          "Found theme/color files but couldn't parse named Color tokens (looking for `const X = Color(0xFF...)`).",
      });
    } else if (tokenFiles.length === 0) {
      warnings.push({
        kind: "no_token_files",
        message:
          "No theme/colors/tokens .dart file found. ThemeData may live elsewhere.",
      });
    }

    const slug = suggestSlug(input.ref.repo);
    const today = new Date().toISOString().split("T")[0];

    return {
      platform: "flutter",
      slug,
      name: toTitleCase(input.ref.repo),
      description: `Flutter design system imported from ${input.ref.owner}/${input.ref.repo}`,
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
      technology: ["flutter", "dart"],
      architecture: "theme-data",
      sourceLayout: {
        platform: "flutter",
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
      tags: ["imported", "flutter"],
      warnings,
    };
  },
};

function extractColors(
  files: Array<{ path: string; content: string }>
): Record<string, string> {
  const result: Record<string, string> = {};
  for (const { content } of files) {
    COLOR_LITERAL.lastIndex = 0;
    let m: RegExpExecArray | null;
    while ((m = COLOR_LITERAL.exec(content)) !== null) {
      const [, name, hex] = m;
      if (name && hex) result[name] = normalizeFlutterHex(hex);
    }
  }
  return result;
}

// Flutter Color(0xAARRGGBB) — alpha at the FRONT. Strip leading AA when 8 chars.
function normalizeFlutterHex(raw: string): string {
  let h = raw.toUpperCase();
  if (h.length === 8) h = h.slice(2);
  return ("#" + h).slice(0, 7);
}
