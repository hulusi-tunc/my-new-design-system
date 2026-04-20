import type { DSPlatform, DSSourceFile } from "@/lib/types";

export const ROLES_BY_PLATFORM = {
  "web-react": [
    "tokens",
    "colorUtils",
    "themeProvider",
    "roleProvider",
    "globalsCss",
    "tailwindConfig",
  ],
  "ios-swiftui": ["tokens", "colorExt", "fontExt", "themeModifier"],
  "android-compose": ["colorKt", "themeKt", "typographyKt", "shapesKt"],
  flutter: ["themeData", "colorsDart", "typographyDart"],
  "react-native": ["theme", "tokens", "themeProvider"],
} as const satisfies Record<DSPlatform, readonly string[]>;

type RoleDescriptions = Partial<Record<string, string>>;

const ROLE_DESCRIPTIONS: Record<DSPlatform, RoleDescriptions> = {
  "web-react": {
    tokens:
      "Token system — color palettes, typography, spacing, radius, semantic tokens",
    colorUtils:
      "Color utilities — HSL conversion, brand palette generation, validation",
    themeProvider:
      "ThemeProvider context — light/dark mode, brand customization, persistence",
    roleProvider: "RoleProvider context — developer/designer view toggle",
    globalsCss:
      "Base styles — Tailwind import, dark mode variant, global resets",
    tailwindConfig: "Tailwind configuration",
  },
  "ios-swiftui": {
    tokens: "Token values — colors, typography, spacing, radius",
    colorExt: "Color extension — named colors used across the system",
    fontExt: "Font extension — typography scale",
    themeModifier: "Theme modifier — light/dark mode adaptation",
  },
  "android-compose": {
    colorKt: "Color definitions",
    themeKt: "MaterialTheme customization",
    typographyKt: "Typography scale",
    shapesKt: "Shape system",
  },
  flutter: {
    themeData: "ThemeData configuration",
    colorsDart: "Color constants",
    typographyDart: "TextStyle definitions",
  },
  "react-native": {
    theme: "Theme object",
    tokens: "Token values",
    themeProvider: "ThemeProvider context",
  },
};

export function describeRole(
  platform: DSPlatform,
  role: string,
  fallback = "Source file"
): string {
  return ROLE_DESCRIPTIONS[platform]?.[role] ?? fallback;
}

export function writeTargetFor(
  platform: DSPlatform,
  file: DSSourceFile
): string {
  if (file.writeTo) return file.writeTo;
  if (file.path.startsWith("src/")) return file.path.slice(4);
  return file.path;
}

export function componentWriteDir(
  platform: DSPlatform,
  componentsDir: string
): string {
  if (componentsDir.startsWith("src/")) return componentsDir.slice(4);
  return componentsDir;
}

export function isRoleProviderRole(role: string): boolean {
  return role === "roleProvider";
}
