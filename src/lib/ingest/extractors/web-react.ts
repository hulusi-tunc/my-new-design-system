import type {
  Extractor,
  ExtractorInput,
  DraftManifest,
  ExtractionWarning,
  TreeEntry,
} from "../types";
import type { DSComponent } from "@/lib/types";
import { commonAncestor, dirname, suggestSlug, toTitleCase } from "./_shared";

const TSX_EXT = /\.tsx$/;
const SOURCE_EXT = /\.(tsx|ts|jsx|js)$/;
const TEST_FILE = /\.(test|spec|stories)\.(tsx|ts|jsx|js)$/;
const SKIP_PATH =
  /(?:^|\/)(?:node_modules|\.next|\.turbo|dist|build|out|coverage|__tests__|__mocks__|storybook-static)\//;

const COMPONENT_DIR_HINT = /\/components\//;
const APP_OR_PAGES_DIR = /(?:^|\/)(?:app|pages)\//;

const USE_CLIENT = /^\s*["']use client["']/;
const REACT_NATIVE_IMPORT = /from\s+["']react-native["']/;

const EXPORT_FN = /export\s+(?:default\s+)?function\s+([A-Z][a-z]\w*)\s*[(<]/g;
const EXPORT_CONST = /export\s+(?:default\s+)?const\s+([A-Z][a-z]\w*)\s*[:=]/g;
// Catches `forwardRef(...)` / `memo(...)` assignment patterns that don't use `function`/`const`
const FORWARDREF_DECLARATION = /\bforwardRef\s*</;

const NON_COMPONENT_SUFFIX =
  /(?:Context|Provider|Config|Constants|Utils|Theme|Hook|Store|Schema|Reducer|Selector)$/;

// Token + provider + globals filename patterns
const TOKEN_FILENAME =
  /(?:^|\/)(?:design[-_]?tokens?|tokens?|theme(?!\-?provider)|palette|colou?rs?|nothing[-_]tokens?|brand[-_]tokens?)\.(?:tsx?|jsx?)$/i;
const COLOR_UTILS_FILENAME =
  /(?:^|\/)(?:colou?r[-_]utils?|colou?r[-_]helpers?)\.(?:tsx?|jsx?)$/i;
const THEME_PROVIDER_FILENAME =
  /(?:^|\/)theme[-_]?provider\.(?:tsx|jsx)$/i;
const ROLE_PROVIDER_FILENAME =
  /(?:^|\/)(?:role|brand|view|mode)[-_]?provider\.(?:tsx|jsx)$/i;
const GLOBALS_CSS_PATH =
  /(?:^|\/)(?:app|src\/app|styles|src\/styles)\/globals?\.css$/i;
const TAILWIND_CONFIG_PATH =
  /(?:^|\/)tailwind\.config\.(?:tsx?|jsx?|mjs|cjs)$/i;

// Color literal patterns
const COLOR_HEX_QUOTED =
  /(\w+)\s*:\s*["']#([0-9a-fA-F]{3,8})["']/g;
const COLOR_HEX_CONST =
  /(?:export\s+)?(?:const|let|var)\s+(\w+)\s*=\s*["']#([0-9a-fA-F]{3,8})["']/g;
// Functional colors: `name: "oklch(...)"`, `name: "hsl(...)"`, `name: "rgb(...)"`
const COLOR_FUNCTIONAL_QUOTED =
  /(\w+)\s*:\s*["']((?:oklch|hsla?|rgba?)\([^)"']+\))["']/g;
const COLOR_FUNCTIONAL_CONST =
  /(?:export\s+)?(?:const|let|var)\s+(\w+)\s*=\s*["']((?:oklch|hsla?|rgba?)\([^)"']+\))["']/g;
const COLOR_OKLCH = /oklch\(\s*[^)]+\)/g;
const COLOR_HSL = /hsla?\(\s*[^)]+\)/g;

// Architecture signals
const INLINE_STYLE_PROP = /\bstyle\s*=\s*\{/g;
const TAILWIND_COLOR_CLASS =
  /className\s*=\s*["'`][^"'`]*\b(?:bg|text|border|ring|from|to|via)-[a-z]+-\d{2,3}\b/g;

const FILE_SIZE_CAP = 256 * 1024;
const MIN_COMPONENT_DIR_FILES = 2;

export const webReactExtractor: Extractor = {
  platform: "web-react",
  async extract(input: ExtractorInput): Promise<DraftManifest> {
    const warnings: ExtractionWarning[] = [];
    const subpath = (input.subpath ?? "").replace(/^\/+|\/+$/g, "");

    const scoped = input.tree.filter((e) =>
      isScannableSource(e, subpath)
    );

    if (scoped.length === 0) {
      warnings.push({
        kind: "no_source_files",
        message: subpath
          ? `No .ts/.tsx files found under ${subpath}.`
          : "No .ts/.tsx files found in the repo tree.",
      });
    }

    // ── Pass 1: classify role files via filename ─────────────────────
    const candidates = {
      tokens: [] as string[],
      colorUtils: [] as string[],
      themeProvider: [] as string[],
      roleProvider: [] as string[],
      globalsCss: [] as string[],
      tailwindConfig: [] as string[],
    };

    const allFiles = input.tree.filter((e) => {
      if (e.type !== "blob") return false;
      if (SKIP_PATH.test("/" + e.path)) return false;
      if (subpath && !e.path.startsWith(subpath + "/")) return false;
      return true;
    });

    for (const e of allFiles) {
      if (TOKEN_FILENAME.test(e.path)) candidates.tokens.push(e.path);
      if (COLOR_UTILS_FILENAME.test(e.path)) candidates.colorUtils.push(e.path);
      if (THEME_PROVIDER_FILENAME.test(e.path)) candidates.themeProvider.push(e.path);
      if (ROLE_PROVIDER_FILENAME.test(e.path)) candidates.roleProvider.push(e.path);
      if (GLOBALS_CSS_PATH.test(e.path)) candidates.globalsCss.push(e.path);
      if (TAILWIND_CONFIG_PATH.test(e.path)) candidates.tailwindConfig.push(e.path);
    }

    // ── Pass 2: scan .tsx files for components, scoring tokens ───────
    const componentFiles: Array<{
      name: string;
      file: string;
      variants: number;
      fullPath: string;
      inlineStyleHits: number;
      tailwindColorHits: number;
    }> = [];

    const tokenContent: Array<{ path: string; content: string }> = [];

    for (const entry of scoped) {
      const content = await input.readFile(entry.path);
      if (!content) continue;

      // React Native files would be picked up by their own extractor — skip.
      if (REACT_NATIVE_IMPORT.test(content)) continue;

      const isTokensFile = candidates.tokens.includes(entry.path);
      if (isTokensFile) tokenContent.push({ path: entry.path, content });

      // Component detection — only .tsx files, must be inside a /components/ dir,
      // must NOT be inside an app/ or pages/ route.
      if (!TSX_EXT.test(entry.path)) continue;
      if (!COMPONENT_DIR_HINT.test("/" + entry.path)) continue;
      if (APP_OR_PAGES_DIR.test("/" + entry.path)) continue;

      const isClient = USE_CLIENT.test(content);
      const hasForwardRef = FORWARDREF_DECLARATION.test(content);

      const stripped = stripBlockComments(content);
      const found = collectExportedComponents(stripped);

      // Heuristic: component file is either marked client, uses forwardRef,
      // or exports at least one PascalCase identifier from a /components/ dir.
      if (!isClient && !hasForwardRef && found.size === 0) continue;
      if (found.size === 0) continue;

      const names = Array.from(found);
      const fileName = entry.path.split("/").pop() ?? entry.path;
      componentFiles.push({
        name: names[0],
        file: fileName,
        variants: names.length,
        fullPath: entry.path,
        inlineStyleHits: countMatches(content, INLINE_STYLE_PROP),
        tailwindColorHits: countMatches(content, TAILWIND_COLOR_CLASS),
      });
    }

    // ── Pass 3: pick the canonical components directory ──────────────
    const componentsDir = pickComponentsDir(
      componentFiles.map((c) => c.fullPath),
      subpath
    );

    // Drop component files that aren't inside the chosen dir (avoids
    // pulling in shells like ds-topnav.tsx from elsewhere in /components/).
    const inDir = componentsDir
      ? componentFiles.filter((c) => dirname(c.fullPath) === componentsDir)
      : componentFiles;

    if (inDir.length === 0 && componentFiles.length > 0) {
      warnings.push({
        kind: "ambiguous_components_dir",
        message: `Found ${componentFiles.length} component-shaped files but none clustered into a clear components directory.`,
      });
    }

    // ── Pass 4: pick best token file (most color literals) ───────────
    const bestTokens = pickBestTokenFile(tokenContent);

    const colors = bestTokens
      ? extractColors(bestTokens.content)
      : ({} as Record<string, string>);

    if (Object.keys(colors).length === 0) {
      if (bestTokens) {
        warnings.push({
          kind: "no_colors",
          message: `Found token file ${bestTokens.path} but couldn't parse named color tokens (looking for hex, oklch, hsl, or rgb literals keyed by name).`,
        });
      } else {
        warnings.push({
          kind: "no_token_files",
          message:
            "No tokens/theme/palette file found by name. Tokens may live in CSS, a non-conventional file, or be computed at runtime.",
        });
      }
    }

    if (inDir.length === 0) {
      warnings.push({
        kind: "no_components",
        message:
          "No React components detected. Extractor looks for .tsx files under a /components/ dir that export PascalCase identifiers, use \"use client\", or wrap forwardRef.",
      });
    }

    // ── Build sourceLayout files ─────────────────────────────────────
    const sourceFiles: Array<{ path: string; role: string }> = [];
    if (bestTokens) sourceFiles.push({ path: bestTokens.path, role: "tokens" });
    if (candidates.colorUtils[0])
      sourceFiles.push({ path: candidates.colorUtils[0], role: "colorUtils" });
    if (candidates.themeProvider[0])
      sourceFiles.push({ path: candidates.themeProvider[0], role: "themeProvider" });
    if (candidates.roleProvider[0])
      sourceFiles.push({ path: candidates.roleProvider[0], role: "roleProvider" });
    if (candidates.globalsCss[0])
      sourceFiles.push({ path: candidates.globalsCss[0], role: "globalsCss" });
    if (candidates.tailwindConfig[0])
      sourceFiles.push({ path: candidates.tailwindConfig[0], role: "tailwindConfig" });

    // ── Tech + architecture inference ────────────────────────────────
    const technology = await inferTechnology(allFiles, input.readFile);
    const architecture = inferArchitecture(inDir);

    const components: DSComponent[] = inDir.map((c) => ({
      name: c.name,
      file: c.file,
      variants: c.variants > 1 ? c.variants : undefined,
    }));

    const slug = suggestSlug(input.ref.repo);
    const today = new Date().toISOString().split("T")[0];

    return {
      platform: "web-react",
      slug,
      name: toTitleCase(input.ref.repo),
      description: `React + Tailwind design system imported from ${input.ref.owner}/${input.ref.repo}`,
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
      technology,
      architecture,
      sourceLayout: {
        platform: "web-react",
        componentsDir: componentsDir ?? (subpath || "src/components"),
        files: sourceFiles,
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
      tags: ["imported", "react", "web"],
      warnings,
    };
  },
};

// ── Helpers ────────────────────────────────────────────────────────────

function isScannableSource(e: TreeEntry, subpath: string): boolean {
  if (e.type !== "blob") return false;
  if (!SOURCE_EXT.test(e.path)) return false;
  if (TEST_FILE.test(e.path)) return false;
  if (SKIP_PATH.test("/" + e.path)) return false;
  if (subpath && !e.path.startsWith(subpath + "/")) return false;
  if (e.size > FILE_SIZE_CAP) return false;
  return true;
}

function collectExportedComponents(source: string): Set<string> {
  const found = new Set<string>();
  EXPORT_FN.lastIndex = 0;
  let m: RegExpExecArray | null;
  while ((m = EXPORT_FN.exec(source)) !== null) {
    if (!NON_COMPONENT_SUFFIX.test(m[1])) found.add(m[1]);
  }
  EXPORT_CONST.lastIndex = 0;
  while ((m = EXPORT_CONST.exec(source)) !== null) {
    if (!NON_COMPONENT_SUFFIX.test(m[1])) found.add(m[1]);
  }
  return found;
}

function pickComponentsDir(
  paths: string[],
  subpath: string
): string | null {
  if (paths.length === 0) return subpath || null;

  // Tally files by their parent directory.
  const counts = new Map<string, number>();
  for (const p of paths) {
    const d = dirname(p);
    counts.set(d, (counts.get(d) ?? 0) + 1);
  }

  // Pick the dir with the most component files; tiebreak by deepest path
  // so /src/components/hub wins over /src/components.
  let best: { dir: string; count: number } | null = null;
  for (const [dir, count] of counts) {
    if (
      !best ||
      count > best.count ||
      (count === best.count && dir.length > best.dir.length)
    ) {
      best = { dir, count };
    }
  }

  if (!best || best.count < MIN_COMPONENT_DIR_FILES) {
    // Fall back to the common ancestor if no single dir dominates.
    return commonAncestor(paths.map(dirname));
  }
  return best.dir;
}

function pickBestTokenFile(
  candidates: Array<{ path: string; content: string }>
): { path: string; content: string } | null {
  if (candidates.length === 0) return null;
  if (candidates.length === 1) return candidates[0];

  // Score by: hex literals + functional color references + token keyword density.
  let best: { entry: (typeof candidates)[number]; score: number } | null = null;
  for (const entry of candidates) {
    const hex = (entry.content.match(/#[0-9a-fA-F]{6}\b/g) ?? []).length;
    const okl = (entry.content.match(COLOR_OKLCH) ?? []).length;
    const hsl = (entry.content.match(COLOR_HSL) ?? []).length;
    const kw = (
      entry.content.match(/\b(?:colors?|palette|tokens?|brand|accent)\b/gi) ?? []
    ).length;
    const score = hex * 3 + okl * 2 + hsl * 2 + kw;
    if (!best || score > best.score) best = { entry, score };
  }
  return best?.entry ?? candidates[0];
}

function extractColors(content: string): Record<string, string> {
  const result: Record<string, string> = {};
  COLOR_HEX_QUOTED.lastIndex = 0;
  let m: RegExpExecArray | null;
  while ((m = COLOR_HEX_QUOTED.exec(content)) !== null) {
    const [, name, hex] = m;
    if (name && hex && !result[name]) result[name] = normalizeHex(hex);
  }
  COLOR_HEX_CONST.lastIndex = 0;
  while ((m = COLOR_HEX_CONST.exec(content)) !== null) {
    const [, name, hex] = m;
    if (name && hex && !result[name]) result[name] = normalizeHex(hex);
  }
  COLOR_FUNCTIONAL_QUOTED.lastIndex = 0;
  while ((m = COLOR_FUNCTIONAL_QUOTED.exec(content)) !== null) {
    const [, name, value] = m;
    if (name && value && !result[name]) result[name] = value.trim();
  }
  COLOR_FUNCTIONAL_CONST.lastIndex = 0;
  while ((m = COLOR_FUNCTIONAL_CONST.exec(content)) !== null) {
    const [, name, value] = m;
    if (name && value && !result[name]) result[name] = value.trim();
  }
  return result;
}

function normalizeHex(raw: string): string {
  let h = raw;
  if (h.length === 3) h = h.split("").map((c) => c + c).join("");
  if (h.length === 8) h = h.slice(0, 6);
  return ("#" + h.toUpperCase()).slice(0, 7);
}

function stripBlockComments(s: string): string {
  return s.replace(/\/\*[\s\S]*?\*\//g, "");
}

async function inferTechnology(
  allFiles: TreeEntry[],
  readFile: (path: string) => Promise<string | null>
): Promise<string[]> {
  const tech = new Set<string>(["react"]);
  const hasTypeScript = allFiles.some((e) => /\.tsx?$/.test(e.path));
  if (hasTypeScript) tech.add("typescript");

  const pkgEntry = allFiles.find((e) => e.path === "package.json");
  if (pkgEntry) {
    const pkgRaw = await readFile(pkgEntry.path);
    if (pkgRaw) {
      try {
        const pkg = JSON.parse(pkgRaw) as {
          dependencies?: Record<string, string>;
          devDependencies?: Record<string, string>;
        };
        const deps = { ...pkg.dependencies, ...pkg.devDependencies };
        if (deps["next"]) tech.add(matchVersion("next", deps["next"]));
        if (deps["react"]) tech.add(matchVersion("react", deps["react"]));
        if (deps["tailwindcss"])
          tech.add(matchVersion("tailwind", deps["tailwindcss"]));
        if (deps["@radix-ui/react-primitive"]) tech.add("radix-ui");
        if (deps["framer-motion"]) tech.add("framer-motion");
      } catch {
        // fall through — pkg malformed, return what we have
      }
    }
  }

  return Array.from(tech);
}

function matchVersion(name: string, raw: string): string {
  const major = raw.match(/\d+/)?.[0];
  if (!major) return name;
  if (name === "tailwind") return `tailwind-v${major}`;
  return `${name}-${major}`;
}

function inferArchitecture(
  componentFiles: Array<{ inlineStyleHits: number; tailwindColorHits: number }>
): string {
  if (componentFiles.length === 0) return "unknown";
  let inline = 0;
  let tailwind = 0;
  for (const c of componentFiles) {
    inline += c.inlineStyleHits;
    tailwind += c.tailwindColorHits;
  }
  // Need at least a handful of signals to call it confidently; otherwise mixed.
  if (inline + tailwind < 3) return "mixed";
  if (inline >= tailwind * 3) return "inline-styles";
  if (tailwind >= inline * 3) return "tailwind-classes";
  return "mixed";
}

function countMatches(content: string, re: RegExp): number {
  re.lastIndex = 0;
  let count = 0;
  while (re.exec(content) !== null) count++;
  return count;
}
