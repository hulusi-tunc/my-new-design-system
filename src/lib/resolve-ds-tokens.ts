/**
 * Resolves a design system's tokens into a complete rendering context.
 *
 * Each design system declares its tokens in different shapes:
 *   - Octopus-style: shades 25, 50, 100, ..., 950 on a `gray` scale
 *   - CESP-style: shades 0, 100, ..., 900 + lighter/light/base/dark/darker
 *
 * The resolver normalises either shape into a full semantic set that
 * component previews can consume without falling back to Hubera's tokens.
 * This is what lets each design system preview actually *look like* that DS.
 */

import type { DSTokens, DSTokenColors } from "./types";

export type ThemeMode = "light" | "dark";

export interface ResolvedDsTokens {
  font: string;
  fontMono: string;
  weightRegular: string;
  weightMedium: string;
  weightSemibold: string;
  weightBold: string;

  /** Page background (outermost surface) */
  pageBg: string;
  /** Card / input / raised-container background */
  surface: string;
  /** One step more elevated than surface (hover, active row, etc) */
  surfaceRaised: string;
  /** Inset / sunken surface (code blocks, input wells) */
  surfaceInk: string;

  /** Default border */
  border: string;
  /** More visible border (focus ring outline, hover) */
  borderVisible: string;

  /** Main text color */
  textPrimary: string;
  /** Muted text */
  textSecondary: string;
  /** Placeholder / disabled text */
  textDisabled: string;
  /** Brightest display text (e.g. on cards) */
  textDisplay: string;
  /** Text color that sits on top of `brand` */
  textOnBrand: string;

  /** Brand primary (mid) */
  brand: string;
  /** Brand lighter (tints, hover backgrounds) */
  brandLight: string;
  /** Brand darker (pressed states, dark text on light bg) */
  brandDark: string;

  success: string;
  warning: string;
  error: string;

  /** Radii in px */
  radiusSm: number;
  radiusMd: number;
  radiusLg: number;
  radiusFull: number;
}

/* ─── Helpers ─────────────────────────────────────── */

function isHex(value: unknown): value is string {
  return typeof value === "string" && /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6}|[0-9A-Fa-f]{8})$/.test(value);
}

function isRenderable(value: unknown): value is string {
  return typeof value === "string" && /^(#|rgb|hsl|oklch)/i.test(value.trim());
}

function pickScale(
  colors: DSTokenColors,
  candidates: string[]
): Record<string, string> | null {
  for (const key of candidates) {
    const scale = colors[key];
    if (scale && typeof scale === "object") {
      const record = scale as Record<string, string>;
      // Only take scales that have at least one renderable color
      if (Object.values(record).some(isRenderable)) return record;
    }
  }
  // Fallback: first object scale that has renderable colors
  for (const [key, value] of Object.entries(colors)) {
    if (candidates.includes(key)) continue;
    if (value && typeof value === "object") {
      const record = value as Record<string, string>;
      if (Object.values(record).some(isRenderable)) return record;
    }
  }
  return null;
}

/**
 * Pick a color from a scale by trying preferred keys in order.
 * Supports both numeric keys ("50", "100", ..., "950")
 * and named keys ("lighter", "light", "base", "dark", "darker").
 */
function pickShade(
  scale: Record<string, string> | null,
  preferred: string[],
  fallback = "#666666"
): string {
  if (!scale) return fallback;
  for (const key of preferred) {
    const v = scale[key];
    if (isRenderable(v)) return v;
  }
  // As a last resort return any renderable value
  for (const v of Object.values(scale)) {
    if (isRenderable(v)) return v;
  }
  return fallback;
}

function pickStatusColor(
  colors: DSTokenColors,
  candidates: string[],
  fallback: string
): string {
  const scale = pickScale(colors, candidates);
  return pickShade(scale, ["500", "600", "base", "400", "700"], fallback);
}

function getRadius(tokens: DSTokens, size: "sm" | "md" | "lg"): number {
  const full = tokens.radius?.full ?? 9999;
  // Heuristic: most systems have ~3-5px, 6-10px, 10-16px tiers
  if (size === "sm") return Math.min(4, full);
  if (size === "md") return Math.min(8, full);
  return Math.min(12, full);
}

/* ─── Main resolver ───────────────────────────────── */

export function resolveDsTokens(
  tokens: DSTokens,
  mode: ThemeMode = "dark"
): ResolvedDsTokens {
  const colors = tokens.colors ?? {};

  // Neutral scale — many aliases across different design systems
  const neutral = pickScale(colors, [
    "neutral",
    "gray",
    "grey",
    "slate",
    "stone",
    "zinc",
    "grayNeutral",
    "grayCool",
    "grayModern",
    "grayWarm",
    "grayIron",
    "grayTrue",
    "grayBlue",
  ]);

  // Brand scale
  const brand = pickScale(colors, [
    "brand",
    "primary",
    "accent",
    "blue",
    "indigo",
    "violet",
    "purple",
    "pink",
  ]);

  // Surfaces and text: derive from neutral scale based on theme mode.
  // Tries numeric keys first (Octopus shape), then named keys (CESP shape).
  let pageBg: string;
  let surface: string;
  let surfaceRaised: string;
  let surfaceInk: string;
  let borderC: string;
  let borderVisible: string;
  let textPrimary: string;
  let textSecondary: string;
  let textDisabled: string;
  let textDisplay: string;

  if (mode === "dark") {
    pageBg = pickShade(neutral, ["950", "900", "darker", "dark", "800"], "#0A0A0A");
    surface = pickShade(neutral, ["900", "800", "dark", "darker", "700"], "#141414");
    surfaceRaised = pickShade(neutral, ["800", "700", "dark", "darker"], "#1F1F1F");
    surfaceInk = pickShade(neutral, ["950", "900", "darker", "dark"], "#070707");
    borderC = pickShade(neutral, ["800", "700", "dark", "600"], "#2A2A2A");
    borderVisible = pickShade(neutral, ["700", "600", "dark"], "#3A3A3A");
    textPrimary = pickShade(neutral, ["100", "200", "light", "lighter", "50"], "#E5E5E5");
    textSecondary = pickShade(neutral, ["400", "500", "base", "light"], "#A0A0A0");
    textDisabled = pickShade(neutral, ["500", "600", "base"], "#6E6E6E");
    textDisplay = pickShade(neutral, ["50", "25", "lighter", "100", "0"], "#FAFAFA");
  } else {
    pageBg = pickShade(neutral, ["25", "50", "0", "lighter", "100"], "#FFFFFF");
    surface = pickShade(neutral, ["0", "25", "lighter", "50"], "#FFFFFF");
    surfaceRaised = pickShade(neutral, ["50", "25", "lighter", "100", "0"], "#FAFAFA");
    surfaceInk = pickShade(neutral, ["100", "200", "light", "50"], "#F0F0F0");
    borderC = pickShade(neutral, ["200", "100", "light"], "#E5E5E5");
    borderVisible = pickShade(neutral, ["300", "200", "light"], "#CCCCCC");
    textPrimary = pickShade(neutral, ["900", "800", "dark", "darker", "700"], "#1A1A1A");
    textSecondary = pickShade(neutral, ["600", "500", "base", "700"], "#6E6E6E");
    textDisabled = pickShade(neutral, ["400", "500", "base", "300"], "#A0A0A0");
    textDisplay = pickShade(neutral, ["950", "900", "darker", "800"], "#0A0A0A");
  }

  // Brand shades
  const brandColor = pickShade(brand, ["600", "500", "base", "700", "400"], "#6E56CF");
  const brandLight = pickShade(brand, ["100", "50", "25", "lighter", "200", "light"], "rgba(110,86,207,0.12)");
  const brandDark = pickShade(brand, ["700", "800", "darker", "dark", "900"], "#5A41BB");

  // Text-on-brand — usually white but check if brand is very light
  const textOnBrand = isLikelyLight(brandColor) ? "#000000" : "#FFFFFF";

  // Status colors
  const success = pickStatusColor(
    colors,
    ["success", "positive", "green", "greenLight", "emerald"],
    "#16a34a"
  );
  const warning = pickStatusColor(
    colors,
    ["warning", "caution", "yellow", "orange", "orangeDark"],
    "#eab308"
  );
  const error = pickStatusColor(
    colors,
    ["error", "danger", "destructive", "red", "rose"],
    "#dc2626"
  );

  // Typography — normalise the manifest font name into a proper CSS stack
  // with fallbacks. Manifests often declare bare names like "Geist Sans" or
  // "System UI" which are invalid on their own (spaces need quoting, and
  // without a fallback the browser drops to its default serif).
  const font = toFontStack(tokens.typography?.fontFamily);
  const weights = tokens.typography?.weights ?? ["400", "500", "600", "700"];
  const weightRegular = weights[0] ?? "400";
  const weightMedium = weights[1] ?? "500";
  const weightSemibold = weights[2] ?? "600";
  const weightBold = weights[3] ?? weights[weights.length - 1] ?? "700";

  return {
    font,
    fontMono: "ui-monospace, 'SFMono-Regular', Menlo, monospace",
    weightRegular,
    weightMedium,
    weightSemibold,
    weightBold,

    pageBg,
    surface,
    surfaceRaised,
    surfaceInk,
    border: borderC,
    borderVisible,

    textPrimary,
    textSecondary,
    textDisabled,
    textDisplay,
    textOnBrand,

    brand: brandColor,
    brandLight,
    brandDark,

    success,
    warning,
    error,

    radiusSm: getRadius(tokens, "sm"),
    radiusMd: getRadius(tokens, "md"),
    radiusLg: getRadius(tokens, "lg"),
    radiusFull: tokens.radius?.full ?? 9999,
  };
}

/* ─── Font stack normaliser ────────────────────────── */

/**
 * Turns a manifest's declared font-family string into a valid CSS stack
 * that always has a sans-serif fallback. Handles three input shapes:
 *   - undefined/empty  → `system-ui, sans-serif`
 *   - "System UI"      → `system-ui, sans-serif` (spaces-form of the keyword)
 *   - "Geist Sans"     → `"Geist Sans", system-ui, sans-serif`
 *   - "Inter, sans-serif" (already a stack) → passed through unchanged
 */
function toFontStack(name: string | undefined): string {
  if (!name) return "system-ui, sans-serif";
  const trimmed = name.trim();
  if (!trimmed) return "system-ui, sans-serif";
  // Already a stack (has a comma) — trust it
  if (trimmed.includes(",")) return trimmed;
  // Well-known generic keyword spelt with a space
  if (/^system\s*ui$/i.test(trimmed)) return "system-ui, sans-serif";
  if (/^sans[\s-]?serif$/i.test(trimmed)) return "sans-serif";
  if (/^serif$/i.test(trimmed)) return "serif";
  if (/^monospace$/i.test(trimmed)) return "ui-monospace, monospace";
  // Quote multi-word names and append a sans fallback
  const needsQuotes = /\s/.test(trimmed);
  const quoted = needsQuotes ? `"${trimmed}"` : trimmed;
  return `${quoted}, system-ui, sans-serif`;
}

/* ─── Color heuristics ─────────────────────────────── */

function isLikelyLight(color: string): boolean {
  if (!isHex(color)) return false;
  const cleaned = color.replace("#", "");
  const full =
    cleaned.length === 3
      ? cleaned
          .split("")
          .map((ch) => ch + ch)
          .join("")
      : cleaned;
  const r = parseInt(full.slice(0, 2), 16);
  const g = parseInt(full.slice(2, 4), 16);
  const b = parseInt(full.slice(4, 6), 16);
  // Perceived luminance
  const lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return lum > 0.65;
}
