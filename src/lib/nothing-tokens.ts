/**
 * Modern SaaS design token system for Hubera.
 *
 * Aesthetic: Linear / Vercel / Mobbin. Cool neutrals, subtle borders,
 * single Hubera-blue accent (#1072F5), Space Grotesk everywhere, dark-first.
 *
 * Function name `getNd` is kept for API compatibility.
 */

export const swatchTokens = {
  dark: {
    // Page surfaces — cool near-black
    black: "oklch(0.145 0.006 260)", // page background
    surface: "oklch(0.175 0.007 260)", // raised surface / cards
    surfaceRaised: "oklch(0.21 0.008 260)", // hover / elevated cards
    surfaceInk: "oklch(0.125 0.006 260)", // deepest inset

    // Borders — very subtle
    border: "oklch(0.24 0.008 260)", // hairline
    borderVisible: "oklch(0.3 0.01 260)", // visible border
    borderStrong: "oklch(0.38 0.012 260)", // emphasis border

    // Text
    textDisabled: "oklch(0.42 0.008 260)",
    textSecondary: "oklch(0.62 0.01 260)",
    textPrimary: "oklch(0.82 0.012 260)",
    textDisplay: "oklch(0.97 0.005 260)",

    // Accent — Hubera electric blue (#1072F5)
    accent: "oklch(0.6 0.21 254)",
    accentHover: "oklch(0.66 0.2 254)",
    accentSoft: "oklch(0.5 0.18 254)",
    accentSubtle: "oklch(0.24 0.06 254)",
    accentFg: "oklch(0.98 0.005 260)",

    // State colors
    success: "oklch(0.72 0.16 155)",
    warning: "oklch(0.78 0.15 80)",
    danger: "oklch(0.64 0.21 25)",
    interactive: "oklch(0.68 0.18 240)",
  },
  light: {
    // Page surfaces — cool near-white
    black: "oklch(0.985 0.002 260)", // page background (API name kept)
    surface: "oklch(1 0 0)", // pure white for cards
    surfaceRaised: "oklch(0.98 0.003 260)", // hover
    surfaceInk: "oklch(0.965 0.004 260)", // inset

    // Borders
    border: "oklch(0.92 0.006 260)",
    borderVisible: "oklch(0.86 0.008 260)",
    borderStrong: "oklch(0.72 0.01 260)",

    // Text
    textDisabled: "oklch(0.68 0.008 260)",
    textSecondary: "oklch(0.48 0.01 260)",
    textPrimary: "oklch(0.24 0.01 260)",
    textDisplay: "oklch(0.15 0.008 260)",

    // Accent — Hubera electric blue (#1072F5)
    accent: "oklch(0.5 0.22 254)",
    accentHover: "oklch(0.42 0.22 254)",
    accentSoft: "oklch(0.62 0.18 254)",
    accentSubtle: "oklch(0.95 0.04 254)",
    accentFg: "oklch(1 0 0)",

    success: "oklch(0.58 0.15 155)",
    warning: "oklch(0.65 0.15 80)",
    danger: "oklch(0.58 0.2 25)",
    interactive: "oklch(0.55 0.18 240)",
  },
} as const;

export type SwatchTheme = {
  black: string;
  surface: string;
  surfaceRaised: string;
  surfaceInk: string;
  border: string;
  borderVisible: string;
  borderStrong: string;
  textDisabled: string;
  textSecondary: string;
  textPrimary: string;
  textDisplay: string;
  accent: string;
  accentHover: string;
  accentSoft: string;
  accentSubtle: string;
  accentFg: string;
  success: string;
  warning: string;
  danger: string;
  interactive: string;
};

/**
 * Get the token set for the current theme.
 * Name `getNd` is kept for API compatibility during refactors.
 */
export function getNd(theme: string): SwatchTheme {
  return theme === "dark" ? swatchTokens.dark : swatchTokens.light;
}

/**
 * Shared font stacks. Space Grotesk for everything, Space Mono for code/tertiary labels.
 */
export const editorialFonts = {
  display: "var(--font-space-grotesk), system-ui, sans-serif",
  body: "var(--font-space-grotesk), system-ui, sans-serif",
  mono: "var(--font-space-mono), ui-monospace, 'SFMono-Regular', Menlo, monospace",
} as const;

/**
 * Shared radii — Linear-style: small, consistent.
 */
export const swatchRadii = {
  none: 0,
  sm: 4,
  md: 6,
  lg: 8,
  xl: 12,
  full: 9999,
} as const;
