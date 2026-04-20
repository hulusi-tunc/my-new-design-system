export interface DSAuthor {
  name: string;
  github: string;
  avatar?: string;
}

/**
 * Size hint for a component's live preview frame. Determines how much
 * space the component gets in the explorer's preview pane.
 *
 *   sm  — buttons, badges, icons — 480 × 320
 *   md  — inputs, dropdowns, tabs — 640 × 400
 *   lg  — cards, code blocks, step indicators — 800 × 480
 *   xl  — tables, sidebars, modals, app navigation — full width × 640
 */
export type DSComponentSize = "sm" | "md" | "lg" | "xl";

/**
 * One named example of a component in action — the primitive that fuels the
 * explorer's Gallery view. The `code` string is a JSX snippet that will be
 * compiled inside Sandpack; it can assume the component is already imported.
 */
export interface DSComponentExample {
  name: string;
  code: string;
  /**
   * Optional longer description shown under the example label.
   */
  description?: string;
}

/**
 * Prop type definitions that drive the Playground controls panel.
 * Discriminated union so each variant has the right metadata.
 */
export type DSPropType =
  | { type: "enum"; values: string[]; default?: string; description?: string }
  | { type: "boolean"; default?: boolean; description?: string }
  | { type: "string"; default?: string; description?: string; multiline?: boolean }
  | { type: "number"; default?: number; description?: string; min?: number; max?: number; step?: number };

export interface DSComponent {
  name: string;
  variants?: number;
  sizes?: number;
  file: string;
  /**
   * Optional explicit size hint for the live preview. If omitted, the
   * explorer infers a size from the component name.
   */
  displaySize?: DSComponentSize;
  /**
   * Named examples shown in the Gallery view (all rendered side-by-side in
   * a single live sandbox).
   */
  examples?: DSComponentExample[];
  /**
   * Prop declarations for the Playground controls panel. Each key is a prop
   * name; the value describes its type and default. `children` is handled
   * specially — it becomes the component's inner JSX rather than an attribute.
   */
  props?: Record<string, DSPropType>;
}

export interface DSTokenColors {
  [key: string]: Record<string, string> | string;
}

export interface DSTokens {
  colors: DSTokenColors;
  typography: {
    fontFamily: string;
    weights: string[];
    scaleSteps: number;
  };
  spacing: {
    unit: string;
    steps: number;
  };
  radius: {
    steps: number;
    full: number;
  };
}

export interface DSScreenshots {
  preview: string;
  gallery?: string[];
}

export type DSPlatform =
  | "web-react"
  | "ios-swiftui"
  | "android-compose"
  | "flutter"
  | "react-native";

export interface DSSourceFile {
  /** Repo-relative path to the file */
  path: string;
  /** Platform-defined role (see src/lib/ingest/roles.ts) */
  role: string;
  /** Optional target path in the consuming project; overrides the default derivation */
  writeTo?: string;
  /** Optional human-readable description (falls back to role description) */
  description?: string;
}

export interface DSSourceLayout {
  platform: DSPlatform;
  /** Repo-relative path to the directory holding component files */
  componentsDir: string;
  /** Tokens, providers, globals — anything that isn't a component */
  files: DSSourceFile[];
  /** Platform-specific install hints (pkg name, SPM target, gradle module, etc.) */
  importHints?: Record<string, string>;
}

export interface DSManifest {
  name: string;
  slug: string;
  version: string;
  description: string;
  author: DSAuthor;
  license: string;
  createdAt: string;
  updatedAt: string;
  parent: string | null;
  platform: DSPlatform;
  repository: string;
  defaultBranch?: string;
  installPath: string;
  sourceLayout: DSSourceLayout;
  technology: string[];
  architecture: string;
  tokens: DSTokens;
  components: DSComponent[];
  screenshots: DSScreenshots;
  tags: string[];
}
