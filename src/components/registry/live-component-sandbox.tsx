"use client";

import { useEffect, useState, useMemo, type CSSProperties } from "react";
import {
  SandpackProvider,
  SandpackPreview,
  SandpackLayout,
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
  /** Preview height — number is pixels, string can be e.g. "100%". Default 360. */
  height?: number | string;
  /**
   * If true, strips the sandbox's own border and radius so it can be
   * embedded inside another container (like a component tile).
   */
  bare?: boolean;
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

/**
 * Skip globals.css — Sandpack's bundler can't handle Tailwind/PostCSS
 * directives, and inline-styled components render fine without it.
 */
const SANDBOX_ROLES = ["tokens", "colorUtils", "themeProvider", "roleProvider"];

/**
 * Given the manifest and the component being previewed, returns the list of
 * paths in the source repo that need to be fetched.
 */
function buildFilePaths(manifest: DSManifest, component: DSComponent): string[] {
  const paths: string[] = [];
  const layout = manifest.sourceLayout;

  paths.push(`${layout.componentsDir}/${component.file}`);

  for (const role of SANDBOX_ROLES) {
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

  return content.replace(
    /(from\s+|import\s+)(["'])@\/([^"']+)\2/g,
    (_match, prefix: string, quote: string, importPath: string) => {
      // Everything lives at sandbox root now, so @/x -> /x
      const targetAbsolute = `/${importPath}`;
      const relative = relativePathFromTo(fromDir, targetAbsolute);
      return `${prefix}${quote}${relative}${quote}`;
    }
  );
}

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
    } else {
      files[sandboxPath] = contents;
    }
  }

  const layout = manifest.sourceLayout;
  // Compute paths without the leading "src/" now — everything lives at root
  const compDir = layout.componentsDir.replace(/^src\//, "");
  const componentImportPath = `./${compDir}/${component.file.replace(/\.tsx?$/, "")}`;

  const Comp = toPascalCase(component.name);

  const themeProviderPath = findByRole(manifest, "themeProvider");
  const themeProviderImport = themeProviderPath
    ? `./${themeProviderPath.replace(/^src\//, "").replace(/\.tsx?$/, "")}`
    : null;

  const appTsx = buildAppEntry({
    componentName: Comp,
    componentImportPath,
    themeProviderImport,
    exampleJsx: buildOpts.exampleJsx,
    examples: buildOpts.examples,
    mode: buildOpts.mode,
    displaySize: buildOpts.displaySize,
    // We intentionally DON'T import the DS's globals.css — many design
    // systems use Tailwind v4 or PostCSS features that Sandpack's bundler
    // can't compile, which crashes the sandbox. Components using inline
    // styles (like Octopus) render just fine without it.
    hasGlobalsCss: false,
    globalsCssPath: null,
  });

  // Sandpack's react-ts template provides its own /index.tsx that imports
  // from "./App" — so we just supply /App.tsx and let the template handle
  // the React DOM mount. This avoids a class of subtle file-resolution
  // errors from trying to fight the template.
  files["/App.tsx"] = appTsx;

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

interface AppEntryOptions {
  componentName: string;
  componentImportPath: string;
  themeProviderImport: string | null;
  /** Used when mode === "single" */
  exampleJsx?: string;
  /** Used when mode === "gallery" */
  examples?: SandboxExample[];
  mode: SandboxMode;
  /** Inferred displaySize used to choose horizontal vs vertical gallery layout */
  displaySize: "sm" | "md" | "lg" | "xl";
  hasGlobalsCss: boolean;
  globalsCssPath: string | null;
}

/**
 * Escape a JS string for embedding inside a backtick template string.
 */
function escapeBackticks(s: string): string {
  return s.replace(/\\/g, "\\\\").replace(/`/g, "\\`").replace(/\$\{/g, "\\${");
}

function buildAppEntry(opts: AppEntryOptions): string {
  const imports: string[] = [];
  const wrapperOpen: string[] = [];
  const wrapperClose: string[] = [];

  imports.push(`import { ${opts.componentName} } from "${opts.componentImportPath}";`);

  if (opts.themeProviderImport) {
    imports.push(
      `import { ThemeProvider } from "${opts.themeProviderImport}";`
    );
    wrapperOpen.push("<ThemeProvider>");
    wrapperClose.unshift("</ThemeProvider>");
  }

  if (opts.hasGlobalsCss && opts.globalsCssPath) {
    imports.push(`import "${opts.globalsCssPath}";`);
  }

  const stageCore =
    opts.mode === "gallery" && opts.examples && opts.examples.length > 0
      ? buildGalleryStage(opts.examples, opts.displaySize)
      : buildSingleStage(opts.exampleJsx ?? `<${opts.componentName} />`);

  return `${imports.join("\n")}

export default function App() {
  return (
    ${wrapperOpen.join("\n      ")}
      <>
        <style>{\`
          html, body, #root { margin: 0; padding: 0; height: 100%; overflow: auto; font-family: system-ui, sans-serif; }
          * { box-sizing: border-box; }
        \`}</style>
        ${stageCore}
      </>
    ${wrapperClose.join("\n      ")}
  );
}
`;
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
  height = 360,
  bare = false,
}: LiveComponentSandboxProps) {
  const { theme } = useTheme();
  const t = getNd(theme);
  const ds = useMemo(
    () => resolveDsTokens(manifest.tokens, theme === "light" ? "light" : "dark"),
    [manifest.tokens, theme]
  );

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

    const paths = buildFilePaths(manifest, component);
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

        // The component file itself is required
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

        const jsx = exampleCode ?? defaultExampleCode(component.name);
        const sandboxFiles = buildSandboxFiles(data.files, manifest, component, {
          mode: effectiveMode,
          exampleJsx: jsx,
          examples,
          displaySize,
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
  }, [manifest, component, exampleCode, examples, effectiveMode, displaySize]);

  /* ── styles ──────────────────────────────── */

  // When a string height (e.g. "100%") is passed, the wrapper and Sandpack
  // layout need to stretch to fill the parent. When a number is passed, the
  // wrapper flows naturally and the preview iframe is the sized element.
  const isFluidHeight = typeof height === "string";

  const wrapperStyle: CSSProperties = {
    background: ds.pageBg,
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
        theme={theme === "dark" ? "dark" : "light"}
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
            ...(isFluidHeight
              ? { height: "100%", flex: 1, minHeight: 0 }
              : {}),
          }}
        >
          <SandpackPreview
            showNavigator={false}
            showOpenInCodeSandbox={false}
            showRefreshButton={false}
            showRestartButton={false}
            style={{
              height: isFluidHeight ? "100%" : (height as number),
              background: ds.pageBg,
              flex: isFluidHeight ? 1 : undefined,
            }}
          />
        </SandpackLayout>
      </SandpackProvider>
    </div>
  );
}
