"use client";

import { useEffect, useRef, useState, useMemo, type CSSProperties } from "react";
import {
  SandpackProvider,
  SandpackPreview,
  SandpackLayout,
  useSandpack,
  type SandpackPreviewRef,
} from "@codesandbox/sandpack-react";
import { useTheme } from "@/components/providers/theme-provider";
import { getNd, editorialFonts, swatchRadii } from "@/lib/nothing-tokens";
import { resolveDsTokens } from "@/lib/resolve-ds-tokens";
import type { DSManifest, DSComponent } from "@/lib/types";

/**
 * Live component sandbox — runs a design system's real component code inside
 * an isolated iframe via Sandpack. This renders the actual component, not a
 * name-based mock.
 *
 * Approach:
 *   1. Figure out which files the component needs (tokens, providers, etc).
 *   2. POST those paths to /api/ds-source/[slug] which fetches them from GitHub.
 *   3. Pass the files + a generated App.tsx entry to Sandpack.
 *   4. Sandpack bundles everything in an iframe and renders it.
 *
 * Today this only supports React design systems (the "web only" caveat of
 * Option B). The sandbox falls back gracefully if files can't be fetched.
 */

/** A named JSX snippet that will be rendered in the gallery. */
export interface SandboxExample {
  name: string;
  code: string;
}

/**
 * How the App.tsx entry is laid out inside the sandbox iframe.
 *
 *   - `single`: one example centered (default)
 *   - `gallery`: a grid/stack of multiple named examples, each labelled
 */
export type SandboxMode = "single" | "gallery";

interface LiveComponentSandboxProps {
  manifest: DSManifest;
  component: DSComponent;
  /** Override the generated example JSX usage (single mode only). */
  exampleCode?: string;
  /**
   * Multiple examples to render side-by-side in a labelled gallery.
   * When provided, mode becomes "gallery" regardless of mode prop.
   */
  examples?: SandboxExample[];
  /** Explicit mode. If `examples` is provided and mode is omitted, we use "gallery". */
  mode?: SandboxMode;
  /**
   * When provided (and length > 1), the sandbox bundles every listed component
   * once and the generated App.tsx cycles through them on a setInterval inside
   * the iframe — so the rotation is free after the one upfront bundle cost,
   * instead of re-bundling per swap. Used by the overview card to show the DS
   * reacting to multiple real components in rotation.
   */
  cycleComponents?: DSComponent[];
  /**
   * Controls whether the in-iframe cycle runs. When false the iframe pins to
   * the first cycle entry. Toggling this prop posts a message into the iframe
   * so no re-bundle happens. Default: true. Only has effect when
   * `cycleComponents.length > 1`.
   */
  cyclingEnabled?: boolean;
  /** Preview height — number is pixels, string can be e.g. "100%". Default 360. */
  height?: number | string;
  /**
   * If true, strips the sandbox's own border and radius so it can be
   * embedded inside another container (like a component tile).
   */
  bare?: boolean;
  /**
   * If true, the sandbox wrapper + iframe use a transparent background so the
   * host card's surface color shows through instead of the DS's page bg.
   * Used by the catalog card overview slide so the preview visually blends
   * with the card rather than reading as a solid slab.
   */
  transparentBg?: boolean;
  /**
   * Override the theme used to resolve the DS's own tokens (page bg, text,
   * borders) and the Sandpack chrome theme. When set, also posts a message
   * into the iframe toggling `.dark` / `.light` on the document element so
   * DS theme providers that key off those classes switch accordingly.
   * Default: follow Hubera's theme.
   */
  themeOverride?: "light" | "dark";
}

/* ── Example code generator ──────────────────────── */

/**
 * Generates a basic <Component /> JSX snippet based on the component name.
 * Design systems can override this by providing `component.examples[0].code`
 * in the future.
 */
function defaultExampleCode(name: string): string {
  const n = name.toLowerCase().replace(/[\s_-]/g, "");
  const Comp = toPascalCase(name);

  if (/button/.test(n) && !/close|utility|social|fancy|compact|link/.test(n)) {
    return `<${Comp} variant="primary">Click me</${Comp}>`;
  }
  if (/closebutton/.test(n)) {
    return `<${Comp} aria-label="Close" />`;
  }
  if (/linkbutton/.test(n)) {
    return `<${Comp}>Read more</${Comp}>`;
  }
  if (/socialbutton/.test(n)) {
    return `<${Comp} provider="github">Continue with GitHub</${Comp}>`;
  }
  if (/input/.test(n) && !/verification/.test(n)) {
    return `<${Comp} placeholder="hello@hubera.dev" label="Email" />`;
  }
  if (/textarea/.test(n)) {
    return `<${Comp} placeholder="Your message…" />`;
  }
  if (/badge/.test(n)) {
    return `<${Comp}>New</${Comp}>`;
  }
  if (/tag/.test(n)) {
    return `<${Comp}>design</${Comp}>`;
  }
  if (/tabs/.test(n)) {
    return `<${Comp} tabs={[{label: "Overview", id: "ov"}, {label: "Tokens", id: "tk"}]} defaultTab="ov" />`;
  }
  if (/card/.test(n)) {
    return `<${Comp} title="Card title">A short description inside the card.</${Comp}>`;
  }
  if (/checkbox/.test(n)) {
    return `<${Comp} label="Remember me" defaultChecked />`;
  }
  if (/verification/.test(n)) {
    return `<${Comp} length={6} />`;
  }
  if (/designtip/.test(n)) {
    return `<${Comp}>Use semantic tokens, not raw hex.</${Comp}>`;
  }
  if (/codeblock/.test(n)) {
    return `<${Comp}>{\`npm install @hubera/core\`}</${Comp}>`;
  }
  // Generic fallback: self-closing tag
  return `<${Comp} />`;
}

function toPascalCase(name: string): string {
  return name
    .split(/[\s_-]+/)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join("");
}

/* ── Figure out which files to fetch ─────────────── */

/**
 * Returns the repo path for a given role, or undefined if absent.
 */
function findByRole(
  manifest: DSManifest,
  role: string
): string | undefined {
  return manifest.sourceLayout.files.find((f) => f.role === role)?.path;
}

const BASE_ROLES = ["tokens", "colorUtils", "themeProvider", "roleProvider"];

/**
 * CSS-variables design systems keep their styling in globals.css (CSS custom
 * properties like `--blue-base`, `--radius-md`, etc). Skip it for inline-
 * styled DSes since their globals.css usually contains Tailwind directives
 * that Sandpack's bundler can't compile.
 */
function needsGlobalsCss(manifest: DSManifest): boolean {
  return manifest.architecture === "css-variables";
}

/**
 * Given the manifest and the components being previewed, returns the list of
 * paths in the source repo that need to be fetched. Accepts multiple
 * components so the carousel-mode sandbox can bundle several at once.
 */
function buildFilePaths(
  manifest: DSManifest,
  components: DSComponent[]
): string[] {
  const paths: string[] = [];
  const layout = manifest.sourceLayout;

  for (const c of components) {
    paths.push(`${layout.componentsDir}/${c.file}`);
  }

  const roles = needsGlobalsCss(manifest)
    ? [...BASE_ROLES, "globalsCss"]
    : BASE_ROLES;

  for (const role of roles) {
    const path = findByRole(manifest, role);
    if (path) paths.push(path);
  }

  return paths;
}

/* ── Build sandbox files ─────────────────────────── */

/**
 * Rewrites `@/…` imports in a file to relative paths that Sandpack can resolve.
 *
 * Design systems conventionally use `@/` as a path alias for their src root.
 * Sandpack's bundler doesn't honour tsconfig paths by default, so every
 * `@/foo` must be rewritten to a relative import based on the file's own
 * location in the sandbox.
 *
 *   e.g. inside /src/components/ui/button.tsx:
 *        import { useTheme } from "@/components/providers/theme-provider"
 *     → import { useTheme } from "../providers/theme-provider"
 */
function rewriteAliasImports(content: string, sandboxPath: string): string {
  // Directory containing the current file (e.g. "/components/ui")
  const fromDir = sandboxPath.slice(0, sandboxPath.lastIndexOf("/"));

  let rewritten = content.replace(
    /(from\s+|import\s+)(["'])@\/([^"']+)\2/g,
    (_match, prefix: string, quote: string, importPath: string) => {
      // Everything lives at sandbox root now, so @/x -> /x
      const targetAbsolute = `/${importPath}`;
      const relative = relativePathFromTo(fromDir, targetAbsolute);
      return `${prefix}${quote}${relative}${quote}`;
    }
  );

  // Sandpack doesn't have Next.js. Rewrite next/* imports to local shims
  // injected at /_shims/* by buildSandboxFiles. Without this, components
  // that reference next/link or next/image throw DependencyNotFoundError.
  rewritten = rewritten.replace(
    /(from\s+|import\s+)(["'])next\/(link|image|navigation)\2/g,
    (_match, prefix: string, quote: string, mod: string) => {
      const targetAbsolute = `/_shims/next-${mod}`;
      const relative = relativePathFromTo(fromDir, targetAbsolute);
      return `${prefix}${quote}${relative}${quote}`;
    }
  );

  return rewritten;
}

/**
 * Tiny stand-ins for the most common next/* imports used by component
 * libraries. Sandpack can't run the real Next.js bundler, so these provide
 * just enough surface area to keep components compiling and rendering.
 */
const NEXT_SHIMS: Record<string, string> = {
  "/_shims/next-link.tsx": `import * as React from "react";
type LinkProps = React.AnchorHTMLAttributes<HTMLAnchorElement> & {
  href: string;
  prefetch?: boolean;
  replace?: boolean;
  scroll?: boolean;
  shallow?: boolean;
};
const Link = React.forwardRef<HTMLAnchorElement, LinkProps>(
  ({ href, prefetch: _p, replace: _r, scroll: _s, shallow: _sh, children, ...rest }, ref) => (
    <a ref={ref} href={href} {...rest}>{children}</a>
  )
);
Link.displayName = "Link";
export default Link;
`,
  "/_shims/next-image.tsx": `import * as React from "react";
type ImageProps = React.ImgHTMLAttributes<HTMLImageElement> & {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  priority?: boolean;
  fill?: boolean;
};
const Image = React.forwardRef<HTMLImageElement, ImageProps>(
  ({ priority: _p, fill: _f, ...rest }, ref) => <img ref={ref} {...rest} />
);
Image.displayName = "Image";
export default Image;
`,
  "/_shims/next-navigation.ts": `export const useRouter = () => ({
  push: () => {}, replace: () => {}, back: () => {}, forward: () => {},
  refresh: () => {}, prefetch: () => {},
});
export const usePathname = () => "/";
export const useSearchParams = () => new URLSearchParams();
export const useParams = () => ({});
export const redirect = (_url: string) => { throw new Error("redirect called in sandbox"); };
export const notFound = () => { throw new Error("notFound called in sandbox"); };
`,
};

function relativePathFromTo(fromDir: string, to: string): string {
  const fromParts = fromDir.split("/").filter(Boolean);
  const toParts = to.split("/").filter(Boolean);

  let common = 0;
  while (
    common < fromParts.length &&
    common < toParts.length &&
    fromParts[common] === toParts[common]
  ) {
    common++;
  }

  const up = fromParts.length - common;
  const down = toParts.slice(common);

  const parts: string[] = [];
  if (up === 0) {
    parts.push(".");
  } else {
    for (let i = 0; i < up; i++) parts.push("..");
  }
  parts.push(...down);
  return parts.join("/");
}

/**
 * Reshapes the fetched repo files into Sandpack's `files` object,
 * keyed by sandbox paths (must start with /). Rewrites any `@/…` imports
 * found in .ts/.tsx files to relative paths.
 */
interface BuildOptions {
  mode: SandboxMode;
  exampleJsx?: string;
  examples?: SandboxExample[];
  displaySize: "sm" | "md" | "lg" | "xl";
  /** When set, App.tsx cycles through these (in order) on a setInterval. */
  cycleComponents?: DSComponent[];
}

/**
 * Strip directives Sandpack's CSS loader can't resolve. Without this,
 * v4-style `@import "tailwindcss"` crashes the bundler with a cryptic
 * "Path must be a string. Received null" (it tries to resolve the bare
 * package name and gets nothing back).
 *
 * We keep raw custom-property declarations (`--foo: #fff`) intact — those
 * are what CSS-variables DSes actually rely on for styling.
 *
 * Returns both the sanitized CSS and a flag indicating whether the file
 * used Tailwind in some form. The caller uses that flag to decide whether
 * to inject the Tailwind Play CDN so utility classes still render.
 */
function sanitizeCssForSandbox(css: string): {
  css: string;
  usedTailwind: boolean;
} {
  const usedTailwind =
    /@import\s+(?:url\()?\s*["'][^"']*(?:tailwind|tw-)[^"']*["']/i.test(css) ||
    /@tailwind\s+[a-z-]+/i.test(css) ||
    /@apply\s+/i.test(css);

  const cleaned = css
    // Strip ANY @import that points at a bare package name (no ./, no URL).
    // Sandpack's CSS loader crashes with "Path must be a string. Received
    // null" trying to resolve these. Keep relative imports + URLs intact.
    .replace(
      /@import\s+(?:url\()?\s*["']([^"']+)["']\s*\)?\s*;?/gi,
      (match, importPath: string) => {
        if (/^[./]/.test(importPath)) return match;
        if (/^https?:\/\//.test(importPath)) return match;
        return "";
      }
    )
    // Tailwind v3 `@tailwind base;` / `@tailwind utilities;` etc.
    .replace(/@tailwind\s+[a-z-]+\s*;?/gi, "")
    // v4 `@plugin` / `@config` directives — Sandpack doesn't run the compiler
    .replace(/@plugin\s+[^;]+;?/gi, "")
    .replace(/@config\s+[^;]+;?/gi, "")
    // v4 `@custom-variant dark (...)` — Tailwind-specific, no parser here
    .replace(/@custom-variant\s+[^;{]+(?:\([^)]*\))?\s*;?/gi, "")
    // v4 `@theme { ... }` / `@theme inline { ... }` blocks
    .replace(/@theme(?:\s+\w+)?\s*\{[\s\S]*?\}/gi, "")
    // `@apply foo bar;` — applies utilities that don't exist without Tailwind
    .replace(/@apply\s+[^;]+;?/gi, "");

  return { css: cleaned, usedTailwind };
}

function manifestUsesTailwind(manifest: DSManifest): boolean {
  return manifest.technology.some((t) => /tailwind/i.test(t));
}

function buildSandboxFiles(
  repoFiles: Record<string, string>,
  manifest: DSManifest,
  component: DSComponent,
  buildOpts: BuildOptions
): Record<string, string> {
  const files: Record<string, string> = {};

  // Mount every fetched file at the sandbox root (strip leading "src/").
  // Sandpack's react-ts template expects entry files at root, not /src/.
  for (const [repoPath, contents] of Object.entries(repoFiles)) {
    if (typeof contents !== "string") continue;
    const cleaned = repoPath.replace(/^src\//, "");
    const sandboxPath = `/${cleaned}`;

    if (/\.(ts|tsx|js|jsx|mjs|cjs)$/.test(sandboxPath)) {
      files[sandboxPath] = rewriteAliasImports(contents, sandboxPath);
    } else if (/\.css$/.test(sandboxPath)) {
      const { css } = sanitizeCssForSandbox(contents);
      files[sandboxPath] = css;
    } else {
      files[sandboxPath] = contents;
    }
  }

  const needsTailwindCdn = manifestUsesTailwind(manifest);

  const layout = manifest.sourceLayout;
  // Compute paths without the leading "src/" now — everything lives at root
  const compDir = layout.componentsDir.replace(/^src\//, "");

  const buildImportPath = (c: DSComponent) =>
    `./${compDir}/${c.file.replace(/\.tsx?$/, "")}`;

  const themeProviderPath = findByRole(manifest, "themeProvider");
  const themeProviderImport = themeProviderPath
    ? `./${themeProviderPath.replace(/^src\//, "").replace(/\.tsx?$/, "")}`
    : null;

  // For CSS-variables systems (CESP), include globals.css so component styles
  // backed by CSS custom properties actually render. Inline-styled systems
  // (Octopus) skip it because their globals.css contains Tailwind directives
  // the Sandpack bundler can't compile.
  const globalsCssRepoPath = findByRole(manifest, "globalsCss");
  const globalsCssSandboxPath =
    needsGlobalsCss(manifest) && globalsCssRepoPath
      ? `./${globalsCssRepoPath.replace(/^src\//, "")}`
      : null;

  const cycle = buildOpts.cycleComponents ?? [];
  const primary: AppComponentEntry = {
    name: toPascalCase(component.name),
    importPath: buildImportPath(component),
    exampleJsx: buildOpts.exampleJsx ?? defaultExampleCode(component.name),
  };
  const cycleEntries: AppComponentEntry[] = cycle.map((c) => ({
    name: toPascalCase(c.name),
    importPath: buildImportPath(c),
    exampleJsx: defaultExampleCode(c.name),
  }));

  const appTsx = buildAppEntry({
    primary,
    cycle: cycleEntries.length > 1 ? cycleEntries : [],
    themeProviderImport,
    examples: buildOpts.examples,
    mode: buildOpts.mode,
    displaySize: buildOpts.displaySize,
    globalsCssPath: globalsCssSandboxPath,
    needsTailwindCdn,
  });

  // Sandpack's react-ts template provides its own /index.tsx that imports
  // from "./App" — so we just supply /App.tsx and let the template handle
  // the React DOM mount. This avoids a class of subtle file-resolution
  // errors from trying to fight the template.
  files["/App.tsx"] = appTsx;

  // Always inject Next.js shims; rewriteAliasImports will only reference
  // them if the source actually imports next/link, next/image, etc.
  for (const [path, contents] of Object.entries(NEXT_SHIMS)) {
    files[path] = contents;
  }

  return files;
}

function buildDependencies(_manifest: DSManifest): Record<string, string> {
  // For now we install the minimum needed for Octopus/CESP style systems.
  // Future: parse the real package.json from the repo and install actual deps.
  return {
    react: "^19.0.0",
    "react-dom": "^19.0.0",
    "remixicon-react": "^1.0.0",
    "@remixicon/react": "^4.9.0",
  };
}

interface AppComponentEntry {
  /** Component identifier, PascalCase (e.g. "Button") */
  name: string;
  /** Import path inside the sandbox, without extension (e.g. "./components/ui/Button") */
  importPath: string;
  /** JSX snippet that instantiates the component (e.g. '<Button variant="primary">…</Button>') */
  exampleJsx: string;
}

interface AppEntryOptions {
  /** The component shown first (and the only one, if cycle is empty). */
  primary: AppComponentEntry;
  /**
   * If non-empty, App.tsx renders this rotation on a 2s interval inside the
   * iframe. Must include at least two entries to be a cycle; otherwise the
   * single `primary` is rendered.
   */
  cycle: AppComponentEntry[];
  themeProviderImport: string | null;
  /** Used when mode === "gallery" */
  examples?: SandboxExample[];
  mode: SandboxMode;
  /** Inferred displaySize used to choose horizontal vs vertical gallery layout */
  displaySize: "sm" | "md" | "lg" | "xl";
  /** Import specifier (with leading "./") for the DS's globals.css, or null to skip. */
  globalsCssPath: string | null;
  /** Inject the Tailwind Play CDN so utility classes render even without a build. */
  needsTailwindCdn: boolean;
}

/**
 * Escape a JS string for embedding inside a backtick template string.
 */
function escapeBackticks(s: string): string {
  return s.replace(/\\/g, "\\\\").replace(/`/g, "\\`").replace(/\$\{/g, "\\${");
}

function buildAppEntry(opts: AppEntryOptions): string {
  const hasCycle = opts.cycle.length > 1;
  const allEntries: AppComponentEntry[] = hasCycle
    ? opts.cycle
    : [opts.primary];

  // Deduplicate imports by component name (the DS might declare the same
  // component twice under different variant names — we only need one import).
  const seenNames = new Set<string>();
  const imports: string[] = [];
  for (const entry of allEntries) {
    if (seenNames.has(entry.name)) continue;
    seenNames.add(entry.name);
    imports.push(`import { ${entry.name} } from "${entry.importPath}";`);
  }

  const wrapperOpen: string[] = [];
  const wrapperClose: string[] = [];
  if (opts.themeProviderImport) {
    imports.unshift(
      `import { ThemeProvider } from "${opts.themeProviderImport}";`
    );
    wrapperOpen.push("<ThemeProvider>");
    wrapperClose.unshift("</ThemeProvider>");
  }

  if (opts.globalsCssPath) {
    imports.unshift(`import "${opts.globalsCssPath}";`);
  }

  // Gallery mode — multiple labelled examples laid out in a grid/stack. Cycle
  // mode wins over gallery if both are enabled (cycle is the newer pattern).
  if (!hasCycle && opts.mode === "gallery" && opts.examples && opts.examples.length > 0) {
    const stage = buildGalleryStage(opts.examples, opts.displaySize);
    return renderAppWrapper(imports, wrapperOpen, wrapperClose, stage, opts.needsTailwindCdn);
  }

  // Cycle mode — internal setInterval rotates the active snippet every 2s.
  if (hasCycle) {
    imports.unshift(`import { useEffect, useState } from "react";`);
    const stage = buildCycleStage(opts.cycle);
    return renderAppWrapper(imports, wrapperOpen, wrapperClose, stage, opts.needsTailwindCdn);
  }

  // Single snippet — the default, used by most previews.
  const stage = buildSingleStage(opts.primary.exampleJsx);
  return renderAppWrapper(imports, wrapperOpen, wrapperClose, stage, opts.needsTailwindCdn);
}

function renderAppWrapper(
  imports: string[],
  wrapperOpen: string[],
  wrapperClose: string[],
  stageCore: string,
  needsTailwindCdn: boolean
): string {
  // Always include React hooks for the theme-sync effect below; dedupe with
  // any existing useEffect/useState imports from cycle mode.
  if (!imports.some((l) => l.includes('from "react"'))) {
    imports.unshift(`import { useEffect } from "react";`);
  } else if (!imports.some((l) => /useEffect/.test(l))) {
    imports.unshift(`import { useEffect } from "react";`);
  }

  // When the DS relies on Tailwind classes (e.g. CESP's `bg-[var(--primary-base)]`),
  // inject the Tailwind Play CDN into the iframe's <head> so those classes
  // actually compile to styles. Without this, components render unstyled
  // because Sandpack's react-ts template doesn't run a Tailwind build.
  const tailwindLoader = needsTailwindCdn
    ? `
function useHuberaTailwind() {
  useEffect(() => {
    if (document.getElementById("hubera-tailwind-cdn")) return;
    const script = document.createElement("script");
    script.id = "hubera-tailwind-cdn";
    script.src = "https://cdn.tailwindcss.com";
    document.head.appendChild(script);
  }, []);
}`
    : "";

  const tailwindCall = needsTailwindCdn ? "useHuberaTailwind();" : "";

  return `${imports.join("\n")}

function useHuberaTheme() {
  useEffect(() => {
    const apply = (mode) => {
      const el = document.documentElement;
      el.classList.remove("dark", "light");
      el.classList.add(mode === "dark" ? "dark" : "light");
      el.dataset.theme = mode === "dark" ? "dark" : "light";
    };
    const onMsg = (e) => {
      const d = e && e.data;
      if (!d || typeof d !== "object") return;
      if (d.type !== "hubera:theme") return;
      apply(d.theme === "dark" ? "dark" : "light");
    };
    window.addEventListener("message", onMsg);
    return () => window.removeEventListener("message", onMsg);
  }, []);
}
${tailwindLoader}

export default function App() {
  useHuberaTheme();
  ${tailwindCall}
  return (
    ${wrapperOpen.join("\n      ")}
      <>
        <style>{\`
          html, body, #root { margin: 0; padding: 0; height: 100%; overflow: auto; font-family: system-ui, sans-serif; background: transparent; }
          * { box-sizing: border-box; }
        \`}</style>
        ${stageCore}
      </>
    ${wrapperClose.join("\n      ")}
  );
}
`;
}

/**
 * Generates the JSX for the cycle stage. The outer div is fixed to the
 * iframe viewport, an inner fragment swaps the active component every 2s
 * via setInterval. We render the snippet as literal JSX (not a string eval)
 * so the DS's real component functions mount, not serialised markup.
 */
function buildCycleStage(entries: AppComponentEntry[]): string {
  // Each entry becomes one JSX case inside a `switch` by index. The default
  // case leaves active as null so a misalignment never crashes the preview.
  const cases = entries
    .map(
      (entry, i) =>
        `      case ${i}: active = (${entry.exampleJsx}); break;`
    )
    .join("\n");

  // The outer `{ (() => {…})() }` is required because this snippet is spliced
  // inline into JSX — a bare IIFE is a JS expression, not a JSX node, so it
  // must sit inside curly braces.
  //
  // Cycling is gated on a `hubera:cycle` postMessage from the parent so the
  // host (e.g. a catalog card) can pause rotation until the user hovers. The
  // message is one-shot state, not a handshake — the parent re-sends on every
  // hover change.
  return `{(() => {
    const [index, setIndex] = useState(0);
    const [cycling, setCycling] = useState(false);
    useEffect(() => {
      const onMsg = (e) => {
        const data = e && e.data;
        if (!data || typeof data !== "object") return;
        if (data.type !== "hubera:cycle") return;
        const next = Boolean(data.enabled);
        setCycling(next);
        if (!next) setIndex(0);
      };
      window.addEventListener("message", onMsg);
      return () => window.removeEventListener("message", onMsg);
    }, []);
    useEffect(() => {
      if (!cycling) return;
      const id = setInterval(
        () => setIndex((i) => (i + 1) % ${entries.length}),
        2000
      );
      return () => clearInterval(id);
    }, [cycling]);
    let active = null;
    switch (index) {
${cases}
      default: active = null;
    }
    return (
      <div style={{
        position: "fixed",
        inset: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
        overflow: "hidden",
        boxSizing: "border-box",
        transition: "opacity 180ms ease-out",
      }}>
        <div
          key={index}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            animation: "hubera-cycle-in 220ms ease-out both",
          }}
        >
          {active}
        </div>
        <style>{\`@keyframes hubera-cycle-in { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: translateY(0); } }\`}</style>
      </div>
    );
  })()}`;
}

function buildSingleStage(jsx: string): string {
  return `<div style={{
          position: "fixed",
          inset: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "24px",
          overflow: "hidden",
          boxSizing: "border-box",
        }}>
          ${jsx}
        </div>`;
}

function buildGalleryStage(
  examples: SandboxExample[],
  displaySize: "sm" | "md" | "lg" | "xl"
): string {
  // Small/medium components → auto-fit grid; large/xl → stacked vertical
  const stackVertical = displaySize === "lg" || displaySize === "xl";
  const itemMinWidth = displaySize === "sm" ? 180 : 260;

  const gridStyle = stackVertical
    ? `{{
          display: "flex",
          flexDirection: "column",
          gap: 24,
          padding: 32,
          width: "100%",
        }}`
    : `{{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(${itemMinWidth}px, 1fr))",
          gap: 20,
          padding: 32,
          width: "100%",
        }}`;

  const items = examples
    .map(
      (ex) => `<div style={{
              display: "flex",
              flexDirection: "column",
              gap: 12,
              padding: 20,
              borderRadius: 10,
              border: "1px solid rgba(127,127,127,0.2)",
              minHeight: ${stackVertical ? 120 : 100},
              boxSizing: "border-box",
            }}>
              <span style={{
                fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
                fontSize: 10,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                color: "rgba(127,127,127,0.85)",
              }}>${escapeBackticks(ex.name)}</span>
              <div style={{
                flex: 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}>
                ${ex.code}
              </div>
            </div>`
    )
    .join("\n            ");

  return `<div style=${gridStyle}>
          ${items}
        </div>`;
}

/* entryIndexTsx removed — we let Sandpack's react-ts template provide it. */

/* ── Component ────────────────────────────────────── */

export function LiveComponentSandbox({
  manifest,
  component,
  exampleCode,
  examples,
  mode,
  cycleComponents,
  cyclingEnabled = true,
  height = 360,
  bare = false,
  transparentBg = false,
  themeOverride,
}: LiveComponentSandboxProps) {
  const { theme } = useTheme();
  const t = getNd(theme);
  const effectiveTheme: "light" | "dark" =
    themeOverride ?? (theme === "light" ? "light" : "dark");
  const ds = useMemo(
    () => resolveDsTokens(manifest.tokens, effectiveTheme),
    [manifest.tokens, effectiveTheme]
  );

  const previewRef = useRef<SandpackPreviewRef>(null);

  // Post messages to the already-bundled iframe to toggle cycling and switch
  // DS theme. Sandpack files are identical either way, so this avoids a
  // re-bundle on every change. On first mount the iframe may not have
  // finished loading yet — retry for a short window until the message lands.
  useEffect(() => {
    let cancelled = false;
    let attempt = 0;
    const post = () => {
      if (cancelled) return;
      const client = previewRef.current?.getClient();
      const iframe = (client as { iframe?: HTMLIFrameElement } | null)?.iframe;
      const target = iframe?.contentWindow;
      if (target) {
        target.postMessage(
          { type: "hubera:cycle", enabled: cyclingEnabled },
          "*"
        );
        target.postMessage(
          { type: "hubera:theme", theme: effectiveTheme },
          "*"
        );
      }
      attempt += 1;
      if (attempt < 20) {
        setTimeout(post, 200);
      }
    };
    post();
    return () => {
      cancelled = true;
    };
  }, [cyclingEnabled, effectiveTheme]);

  // Infer mode: if examples are provided and mode isn't specified, use gallery
  const effectiveMode: SandboxMode =
    mode ?? (examples && examples.length > 0 ? "gallery" : "single");

  // Pull the displaySize hint for gallery layout choices
  const displaySize = component.displaySize ?? "md";

  const [state, setState] = useState<
    | { status: "loading" }
    | { status: "ready"; files: Record<string, string> }
    | { status: "error"; message: string }
  >({ status: "loading" });

  useEffect(() => {
    let cancelled = false;
    setState({ status: "loading" });

    // Fetch the primary component plus (if set) every cycle component, with
    // the primary first so the required-file check below hits a stable path.
    const targetComponents = [component, ...(cycleComponents ?? [])];
    // De-dupe by file so we don't fetch the same file twice.
    const seen = new Set<string>();
    const uniqueTargets = targetComponents.filter((c) => {
      if (seen.has(c.file)) return false;
      seen.add(c.file);
      return true;
    });

    const paths = buildFilePaths(manifest, uniqueTargets);
    if (paths.length === 0) {
      setState({
        status: "error",
        message: "Design system has no componentsDir defined in sourceLayout.",
      });
      return;
    }

    fetch(`/api/ds-source/${manifest.slug}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ paths }),
    })
      .then(async (res) => {
        if (!res.ok) {
          const errorText = await res.text();
          throw new Error(`Fetch failed: ${res.status} ${errorText}`);
        }
        return res.json();
      })
      .then((data: { files: Record<string, string>; errors?: Record<string, string> }) => {
        if (cancelled) return;

        // The primary component file is required
        const componentPath = `${manifest.sourceLayout.componentsDir}/${component.file}`;

        if (!data.files[componentPath]) {
          setState({
            status: "error",
            message: `Could not fetch ${componentPath} from GitHub. ${
              data.errors?.[componentPath] ?? ""
            }`,
          });
          return;
        }

        // Cycle components that actually fetched successfully
        const availableCycle = (cycleComponents ?? []).filter((c) => {
          const p = `${manifest.sourceLayout.componentsDir}/${c.file}`;
          return Boolean(data.files[p]);
        });

        const jsx = exampleCode ?? defaultExampleCode(component.name);
        const sandboxFiles = buildSandboxFiles(data.files, manifest, component, {
          mode: effectiveMode,
          exampleJsx: jsx,
          examples,
          displaySize,
          cycleComponents: availableCycle,
        });
        setState({ status: "ready", files: sandboxFiles });
      })
      .catch((err) => {
        if (cancelled) return;
        setState({
          status: "error",
          message: err instanceof Error ? err.message : "Unknown error",
        });
      });

    return () => {
      cancelled = true;
    };
  }, [manifest, component, exampleCode, examples, effectiveMode, displaySize, cycleComponents]);

  /* ── styles ──────────────────────────────── */

  // When a string height (e.g. "100%") is passed, the wrapper and Sandpack
  // layout need to stretch to fill the parent. When a number is passed, the
  // wrapper flows naturally and the preview iframe is the sized element.
  const isFluidHeight = typeof height === "string";

  const wrapperStyle: CSSProperties = {
    background: transparentBg ? "transparent" : ds.pageBg,
    borderRadius: bare ? 0 : swatchRadii.lg,
    border: bare ? "none" : `1px solid ${t.border}`,
    overflow: "hidden",
    width: "100%",
    ...(isFluidHeight
      ? { height: "100%", display: "flex", flexDirection: "column" }
      : {}),
  };

  const statusStyle: CSSProperties = {
    padding: 24,
    minHeight: height,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontFamily: editorialFonts.mono,
    fontSize: 12,
    color: t.textSecondary,
    letterSpacing: "0.04em",
  };

  if (state.status === "loading") {
    return (
      <div style={wrapperStyle}>
        <div style={statusStyle}>Loading live preview…</div>
      </div>
    );
  }

  if (state.status === "error") {
    return (
      <div style={wrapperStyle}>
        <div style={{ ...statusStyle, flexDirection: "column", gap: 8 }}>
          <span style={{ color: t.textPrimary }}>Live preview unavailable</span>
          <span style={{ fontSize: 11, color: t.textDisabled, maxWidth: 480, textAlign: "center" }}>
            {state.message}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div style={wrapperStyle}>
      <SandpackProvider
        template="react-ts"
        files={state.files}
        theme={effectiveTheme}
        customSetup={{
          dependencies: buildDependencies(manifest),
        }}
        options={{
          activeFile: "/App.tsx",
          visibleFiles: ["/App.tsx"],
          recompileMode: "delayed",
          recompileDelay: 500,
          bundlerTimeOut: 30000,
        }}
      >
        <SandpackLayout
          style={{
            border: "none",
            borderRadius: 0,
            background: transparentBg ? "transparent" : undefined,
            position: "relative",
            ...(isFluidHeight
              ? { height: "100%", flex: 1, minHeight: 0 }
              : {}),
          }}
        >
          <SandpackPreview
            ref={previewRef}
            showNavigator={false}
            showOpenInCodeSandbox={false}
            showRefreshButton={false}
            showRestartButton={false}
            showSandpackErrorOverlay={false}
            style={{
              height: isFluidHeight ? "100%" : (height as number),
              background: transparentBg ? "transparent" : ds.pageBg,
              flex: isFluidHeight ? 1 : undefined,
            }}
          />
          <SandpackErrorSurface
            transparentBg={transparentBg}
            bareOverlay={bare}
          />
        </SandpackLayout>
      </SandpackProvider>
    </div>
  );
}

/**
 * Replaces Sandpack's opaque "Something's gone wrong" overlay with a
 * concise message that actually names the error. Rendered as a child of
 * SandpackProvider so it can read `sandpack.error` via `useSandpack`.
 *
 * Keeps the preview iframe beneath it visible at low opacity so the
 * user still has some sense of what the preview was trying to become.
 */
function SandpackErrorSurface({
  transparentBg,
  bareOverlay,
}: {
  transparentBg: boolean;
  bareOverlay: boolean;
}) {
  const { theme } = useTheme();
  const t = getNd(theme);
  const { sandpack } = useSandpack();
  if (!sandpack.error) return null;

  const message = sandpack.error.message?.trim() || "Preview failed to compile.";
  const shortened =
    message.length > 220 ? message.slice(0, 217).trimEnd() + "…" : message;

  return (
    <div
      role="alert"
      style={{
        position: "absolute",
        inset: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
        background: transparentBg
          ? "color-mix(in oklch, currentColor 4%, transparent)"
          : t.surfaceInk,
        zIndex: 5,
        pointerEvents: "none",
      }}
    >
      <div
        style={{
          maxWidth: 480,
          textAlign: "center",
          display: "flex",
          flexDirection: "column",
          gap: 8,
          padding: bareOverlay ? 0 : 16,
        }}
      >
        <span
          style={{
            fontFamily: editorialFonts.mono,
            fontSize: 10,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            color: t.textDisabled,
          }}
        >
          Preview error
        </span>
        <span
          style={{
            fontFamily: editorialFonts.body,
            fontSize: 13,
            lineHeight: 1.4,
            color: t.textPrimary,
            wordBreak: "break-word",
          }}
        >
          {shortened}
        </span>
      </div>
    </div>
  );
}
