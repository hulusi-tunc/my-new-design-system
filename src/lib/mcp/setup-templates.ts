import type { DSPlatform } from "@/lib/types";

export interface SetupTemplate {
  /** Shown when installing the full design system */
  full: string[];
  /** Shown when installing a single component (with core deps) */
  componentWithDeps: string[];
  /** Shown when installing a single component alone */
  componentAlone: string[];
  /** Trailing note about path aliases, package layout, etc. */
  importAliasNote: string;
}

const WEB_REACT: SetupTemplate = {
  full: [
    "Install peer dependencies: npm install framer-motion remixicon-react",
    "Wrap your root layout with <ThemeProvider> (and optionally <RoleProvider>)",
    "Import globals.css in your root layout",
    "Ensure tsconfig.json has path alias: { '@/*': ['./src/*'] }",
    "Tailwind CSS v4 is required with @tailwindcss/postcss plugin",
  ],
  componentWithDeps: [
    "Install peer dependencies: npm install framer-motion remixicon-react",
    "Wrap your root layout with <ThemeProvider>",
    "Import globals.css in your root layout",
    "Skip writing any files that already exist in your project",
  ],
  componentAlone: [
    "This component requires the core design system files (tokens, providers, globals.css) to already be installed.",
  ],
  importAliasNote:
    "All files use @/* import aliases. Ensure your project has the same path alias, or adjust imports to match.",
};

const IOS_SWIFTUI: SetupTemplate = {
  full: [
    "Add the Swift files to your Xcode project under a DesignSystem group (File → Add Files to…).",
    "If the system uses a Swift Package, add it to Package.swift or via Xcode's Package Dependencies.",
    "Import the DesignSystem module where you use components.",
  ],
  componentWithDeps: [
    "Add the Swift files to your Xcode project (File → Add Files to…).",
    "Make sure the token/theme files are added before the components.",
    "Skip any files that already exist.",
  ],
  componentAlone: [
    "This component assumes the design system's tokens and theme are already in your project.",
  ],
  importAliasNote:
    "Files use module-relative imports. Adjust the module name if your target differs.",
};

const ANDROID_COMPOSE: SetupTemplate = {
  full: [
    "Copy the Kotlin files into your app's UI module, typically under com/yourapp/ui/theme and com/yourapp/ui/components.",
    "Wrap your root composable with the provided Theme { }.",
    "Ensure Compose BOM is in your build.gradle dependencies.",
  ],
  componentWithDeps: [
    "Copy the files into your UI module.",
    "Make sure Theme.kt / Color.kt / Typography.kt are present.",
    "Skip files that already exist.",
  ],
  componentAlone: [
    "This component requires the design system's Theme to already be set up in your app.",
  ],
  importAliasNote:
    "Adjust package declarations to match your app's package structure.",
};

const FLUTTER: SetupTemplate = {
  full: [
    "Copy the Dart files into your project's lib/ui/ directory (or your chosen widget location).",
    "Wire the provided ThemeData into your MaterialApp's theme and darkTheme.",
    "Add any required pub packages listed in importHints to your pubspec.yaml.",
  ],
  componentWithDeps: [
    "Copy the files into lib/ui/.",
    "Make sure theme/colors/typography files are present before widgets.",
    "Skip files that already exist.",
  ],
  componentAlone: [
    "This widget assumes your app already has the design system's ThemeData wired up.",
  ],
  importAliasNote:
    "Adjust relative imports to match your project structure.",
};

const REACT_NATIVE: SetupTemplate = {
  full: [
    "Copy the source files into your app's src/ (or chosen) directory.",
    "Wrap your root <App/> with the provided <ThemeProvider>.",
    "Install any peer dependencies listed in importHints.",
  ],
  componentWithDeps: [
    "Copy the files into your source directory.",
    "Ensure the theme provider is mounted at the root.",
    "Skip files that already exist.",
  ],
  componentAlone: [
    "This component requires the design system's ThemeProvider to already be mounted.",
  ],
  importAliasNote:
    "Adjust imports if your project uses a different path alias or relative structure.",
};

export const SETUP_TEMPLATES: Record<DSPlatform, SetupTemplate> = {
  "web-react": WEB_REACT,
  "ios-swiftui": IOS_SWIFTUI,
  "android-compose": ANDROID_COMPOSE,
  flutter: FLUTTER,
  "react-native": REACT_NATIVE,
};

export function getSetupTemplate(platform: DSPlatform): SetupTemplate {
  return SETUP_TEMPLATES[platform] ?? WEB_REACT;
}
