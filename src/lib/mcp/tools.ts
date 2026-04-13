import {
  getAllManifests,
  getManifestBySlug,
} from "@/lib/registry";
import type { DSManifest } from "@/lib/types";
import {
  fetchCoreFiles,
  fetchComponentFile,
  hasRemoteSource,
  type FileEntry,
} from "./github-reader";
import {
  resolveComponentFiles,
  needsRoleProvider,
} from "./dependency-resolver";

// ── Types ──

export interface RegistrySummary {
  name: string;
  slug: string;
  version: string;
  description: string;
  author: string;
  technology: string[];
  architecture: string;
  componentCount: number;
  tags: string[];
  hasLocalSource: boolean;
}

export interface InstallResult {
  designSystem: string;
  slug: string;
  version: string;
  files: FileEntry[];
  setupInstructions: string[];
  importAliasNote: string;
}

// ── Helper: summarize a manifest for list/search results ──

function summarize(manifest: DSManifest): RegistrySummary {
  return {
    name: manifest.name,
    slug: manifest.slug,
    version: manifest.version,
    description: manifest.description,
    author: manifest.author.name,
    technology: manifest.technology,
    architecture: manifest.architecture,
    componentCount: manifest.components.length,
    tags: manifest.tags,
    // Source is served remotely via GitHub; truly "available" requires a fetch
    // which we avoid for list views. The install tools check before serving.
    hasLocalSource: Boolean(manifest.sourceLayout?.components),
  };
}

// ── Tool Schemas ──

export const TOOL_SCHEMAS = [
  {
    name: "browse_registry",
    description:
      "List all available design systems in the registry with summary info. Optionally filter by technology or architecture.",
    inputSchema: {
      type: "object" as const,
      properties: {
        technology: {
          type: "string",
          description: 'Filter by technology (e.g. "react-19", "tailwind-v4")',
        },
        architecture: {
          type: "string",
          description:
            'Filter by architecture (e.g. "inline-styles", "css-variables")',
        },
      },
    },
  },
  {
    name: "get_design_system",
    description:
      "Get detailed information about a specific design system including tokens, components, and metadata.",
    inputSchema: {
      type: "object" as const,
      properties: {
        slug: {
          type: "string",
          description: 'Design system slug (e.g. "octopus", "cesp")',
        },
      },
      required: ["slug"],
    },
  },
  {
    name: "search_registry",
    description:
      "Search design systems by name, description, tags, technology, or component names.",
    inputSchema: {
      type: "object" as const,
      properties: {
        query: { type: "string", description: "Search query" },
      },
      required: ["query"],
    },
  },
  {
    name: "get_tokens",
    description:
      "Get the design token values (colors, typography, spacing, radius) from a design system. Read-only reference — does not install files.",
    inputSchema: {
      type: "object" as const,
      properties: {
        slug: {
          type: "string",
          description: 'Design system slug (e.g. "octopus", "cesp")',
        },
      },
      required: ["slug"],
    },
  },
  {
    name: "install_design_system",
    description:
      "Install a complete design system into a project. Returns all source files (tokens, providers, components, globals.css) with setup instructions. Claude Code should write these files to the target project.",
    inputSchema: {
      type: "object" as const,
      properties: {
        slug: {
          type: "string",
          description: 'Design system slug (e.g. "octopus")',
        },
      },
      required: ["slug"],
    },
  },
  {
    name: "install_component",
    description:
      "Install a single component from a design system, along with its required dependencies (tokens, providers, globals.css). Skip files that already exist in the target project.",
    inputSchema: {
      type: "object" as const,
      properties: {
        slug: {
          type: "string",
          description: 'Design system slug (e.g. "octopus")',
        },
        componentName: {
          type: "string",
          description:
            'Component file name (e.g. "button.tsx") or display name (e.g. "Button")',
        },
        includeDependencies: {
          type: "boolean",
          description:
            "Include core dependency files (tokens, providers, globals.css). Default: true",
        },
      },
      required: ["slug", "componentName"],
    },
  },
];

// ── Tool Handlers ──

export async function browseRegistry(args: {
  technology?: string;
  architecture?: string;
}): Promise<RegistrySummary[]> {
  let manifests = await getAllManifests();

  if (args.technology) {
    const tech = args.technology.toLowerCase();
    manifests = manifests.filter((m) =>
      m.technology.some((t) => t.toLowerCase().includes(tech))
    );
  }

  if (args.architecture) {
    const arch = args.architecture.toLowerCase();
    manifests = manifests.filter((m) =>
      m.architecture.toLowerCase().includes(arch)
    );
  }

  return manifests.map(summarize);
}

export async function getDesignSystem(args: {
  slug: string;
}): Promise<{ manifest: DSManifest; hasRemoteSource: boolean } | null> {
  const manifest = await getManifestBySlug(args.slug);
  if (!manifest) return null;
  return { manifest, hasRemoteSource: await hasRemoteSource(manifest) };
}

export async function searchRegistry(args: {
  query: string;
}): Promise<RegistrySummary[]> {
  const q = args.query.toLowerCase();
  const manifests = await getAllManifests();

  const matches = manifests.filter(
    (m) =>
      m.name.toLowerCase().includes(q) ||
      m.description.toLowerCase().includes(q) ||
      m.tags.some((t) => t.toLowerCase().includes(q)) ||
      m.technology.some((t) => t.toLowerCase().includes(q)) ||
      m.architecture.toLowerCase().includes(q) ||
      m.components.some((c) => c.name.toLowerCase().includes(q))
  );

  return matches.map(summarize);
}

export async function getTokens(args: { slug: string }): Promise<
  { designSystem: string; tokens: DSManifest["tokens"] } | null
> {
  const manifest = await getManifestBySlug(args.slug);
  if (!manifest) return null;
  return { designSystem: manifest.name, tokens: manifest.tokens };
}

const SETUP_INSTRUCTIONS_FULL = [
  "Install peer dependencies: npm install framer-motion remixicon-react",
  "Wrap your root layout with <ThemeProvider> (and optionally <RoleProvider>)",
  "Import globals.css in your root layout",
  "Ensure tsconfig.json has path alias: { '@/*': ['./src/*'] }",
  "Tailwind CSS v4 is required with @tailwindcss/postcss plugin",
];

export async function installDesignSystem(args: {
  slug: string;
}): Promise<InstallResult | { error: string; repository?: string }> {
  const manifest = await getManifestBySlug(args.slug);
  if (!manifest) {
    return { error: `Design system "${args.slug}" not found in registry.` };
  }

  if (!manifest.sourceLayout?.components) {
    return {
      error: `"${manifest.name}" has no sourceLayout configured. Source files cannot be fetched from the registry.`,
      repository: manifest.repository,
    };
  }

  const files = await fetchCoreFiles(manifest);

  for (const component of manifest.components) {
    const entry = await fetchComponentFile(
      manifest,
      component.file,
      component.name
    );
    if (entry) files.push(entry);
  }

  if (files.length === 0) {
    return {
      error: `Unable to fetch any source files for "${manifest.name}" from ${manifest.repository}. Check the repository URL and sourceLayout paths.`,
      repository: manifest.repository,
    };
  }

  return {
    designSystem: manifest.name,
    slug: manifest.slug,
    version: manifest.version,
    files,
    setupInstructions: SETUP_INSTRUCTIONS_FULL,
    importAliasNote:
      "All files use @/* import aliases. Ensure your project has the same path alias, or adjust imports to match.",
  };
}

function normalizeFileName(input: string): string {
  let name = input.toLowerCase().trim();
  if (!name.includes(".")) {
    name = name.replace(/([a-z])([A-Z])/g, "$1-$2").toLowerCase();
    name += ".tsx";
  }
  return name;
}

export async function installComponent(args: {
  slug: string;
  componentName: string;
  includeDependencies?: boolean;
}): Promise<InstallResult | { error: string }> {
  const manifest = await getManifestBySlug(args.slug);
  if (!manifest) {
    return { error: `Design system "${args.slug}" not found in registry.` };
  }

  if (!manifest.sourceLayout?.components) {
    return {
      error: `"${manifest.name}" has no sourceLayout configured. Source files cannot be fetched from the registry.`,
    };
  }

  const fileName = normalizeFileName(args.componentName);
  const componentMeta = manifest.components.find(
    (c) =>
      c.file.toLowerCase() === fileName ||
      c.name.toLowerCase() === args.componentName.toLowerCase()
  );
  if (!componentMeta) {
    const available = manifest.components.map((c) => c.name).join(", ");
    return {
      error: `Component "${args.componentName}" not found in ${manifest.name}. Available: ${available}`,
    };
  }

  const actualFileName = componentMeta.file;
  const componentFiles = resolveComponentFiles(actualFileName);
  const files: FileEntry[] = [];

  const includeDeps = args.includeDependencies !== false;
  if (includeDeps) {
    const coreFiles = await fetchCoreFiles(manifest);
    const needsRole = componentFiles.some((f) => needsRoleProvider(f));
    for (const core of coreFiles) {
      if (
        core.relativePath === "components/providers/role-provider.tsx" &&
        !needsRole
      ) {
        continue;
      }
      files.push(core);
    }
  }

  for (const compFile of componentFiles) {
    const meta = manifest.components.find((c) => c.file === compFile);
    const entry = await fetchComponentFile(
      manifest,
      compFile,
      meta?.name ?? compFile
    );
    if (entry) files.push(entry);
  }

  const setupInstructions = includeDeps
    ? [
        "Install peer dependencies: npm install framer-motion remixicon-react",
        "Wrap your root layout with <ThemeProvider>",
        "Import globals.css in your root layout",
        "Skip writing any files that already exist in your project",
      ]
    : [
        "This component requires the core design system files (tokens, providers, globals.css) to already be installed.",
      ];

  return {
    designSystem: manifest.name,
    slug: manifest.slug,
    version: manifest.version,
    files,
    setupInstructions,
    importAliasNote:
      "All files use @/* import aliases. Adjust if your project uses a different alias.",
  };
}

// ── Dispatcher ──

type ToolName =
  | "browse_registry"
  | "get_design_system"
  | "search_registry"
  | "get_tokens"
  | "install_design_system"
  | "install_component";

export async function callTool(
  name: string,
  args: Record<string, unknown>
): Promise<unknown> {
  switch (name as ToolName) {
    case "browse_registry":
      return browseRegistry(args as { technology?: string; architecture?: string });
    case "get_design_system":
      return getDesignSystem(args as { slug: string });
    case "search_registry":
      return searchRegistry(args as { query: string });
    case "get_tokens":
      return getTokens(args as { slug: string });
    case "install_design_system":
      return installDesignSystem(args as { slug: string });
    case "install_component":
      return installComponent(
        args as {
          slug: string;
          componentName: string;
          includeDependencies?: boolean;
        }
      );
    default:
      throw new Error(`Unknown tool: ${name}`);
  }
}
