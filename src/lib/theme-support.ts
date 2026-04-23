import type { DSManifest, DSTokenColors } from "./types";

export type ThemeSupport = "both" | "dark" | "light";

const IS_RENDERABLE = /^(#|rgb|hsl|oklch)/i;

function hasLightShades(colors: DSTokenColors): boolean {
  for (const value of Object.values(colors)) {
    if (!value || typeof value !== "object") continue;
    const record = value as Record<string, string>;
    for (const key of ["0", "25", "50", "100", "lighter", "light"]) {
      const v = record[key];
      if (typeof v === "string" && IS_RENDERABLE.test(v.trim())) return true;
    }
  }
  return false;
}

function hasDarkShades(colors: DSTokenColors): boolean {
  for (const value of Object.values(colors)) {
    if (!value || typeof value !== "object") continue;
    const record = value as Record<string, string>;
    for (const key of ["800", "900", "950", "darker", "dark"]) {
      const v = record[key];
      if (typeof v === "string" && IS_RENDERABLE.test(v.trim())) return true;
    }
  }
  return false;
}

export function getThemeSupport(manifest: DSManifest): ThemeSupport {
  const hasThemeProvider = manifest.sourceLayout.files.some(
    (f) => f.role === "themeProvider"
  );
  const colors = manifest.tokens?.colors ?? {};
  const light = hasLightShades(colors);
  const dark = hasDarkShades(colors);

  if (hasThemeProvider && light && dark) return "both";
  if (light && dark) return "both";
  if (dark) return "dark";
  return "light";
}
