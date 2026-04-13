export interface DSAuthor {
  name: string;
  github: string;
  avatar?: string;
}

export interface DSComponent {
  name: string;
  variants?: number;
  sizes?: number;
  file: string;
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

export interface DSSourceLayout {
  /** Repo-relative path to the directory containing UI component files */
  components?: string;
  /** Repo-relative path to the design tokens file */
  tokens?: string;
  /** Repo-relative path to the color utilities file */
  colorUtils?: string;
  /** Repo-relative path to the theme provider file */
  themeProvider?: string;
  /** Repo-relative path to the role provider file */
  roleProvider?: string;
  /** Repo-relative path to the globals.css file */
  globalsCss?: string;
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
  repository: string;
  defaultBranch?: string;
  installPath: string;
  sourceLayout?: DSSourceLayout;
  technology: string[];
  architecture: string;
  tokens: DSTokens;
  components: DSComponent[];
  screenshots: DSScreenshots;
  tags: string[];
}
