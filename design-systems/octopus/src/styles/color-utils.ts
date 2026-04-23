// ── Color space conversion ────────────────────────────

export function hexToHSL(hex: string): { h: number; s: number; l: number } {
  const clean = hex.replace("#", "");
  const r = parseInt(clean.slice(0, 2), 16) / 255;
  const g = parseInt(clean.slice(2, 4), 16) / 255;
  const b = parseInt(clean.slice(4, 6), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  let h = 0;
  let s = 0;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
    else if (max === g) h = ((b - r) / d + 2) / 6;
    else h = ((r - g) / d + 4) / 6;
  }

  return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
}

function hueToRgb(p: number, q: number, t: number): number {
  if (t < 0) t += 1;
  if (t > 1) t -= 1;
  if (t < 1 / 6) return p + (q - p) * 6 * t;
  if (t < 1 / 2) return q;
  if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
  return p;
}

export function hslToHex(h: number, s: number, l: number): string {
  const sn = s / 100;
  const ln = l / 100;
  const hn = h / 360;

  let r: number, g: number, b: number;

  if (sn === 0) {
    r = g = b = ln;
  } else {
    const q = ln < 0.5 ? ln * (1 + sn) : ln + sn - ln * sn;
    const p = 2 * ln - q;
    r = hueToRgb(p, q, hn + 1 / 3);
    g = hueToRgb(p, q, hn);
    b = hueToRgb(p, q, hn - 1 / 3);
  }

  const toHex = (v: number) =>
    Math.round(Math.min(255, Math.max(0, v * 255)))
      .toString(16)
      .padStart(2, "0");

  return `#${toHex(r)}${toHex(g)}${toHex(b)}`.toUpperCase();
}

// ── Palette generation ────────────────────────────────

export type BrandPalette = Record<25 | 50 | 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900 | 950, string>;

// Lightness offsets from the 600 shade (derived from default purple palette)
const SHADE_CONFIG: { shade: keyof BrandPalette; lOffset: number; sMult: number }[] = [
  { shade: 25,  lOffset: +39.6, sMult: 1.65 },
  { shade: 50,  lOffset: +38.4, sMult: 1.65 },
  { shade: 100, lOffset: +36.5, sMult: 1.65 },
  { shade: 200, lOffset: +32.8, sMult: 1.61 },
  { shade: 300, lOffset: +26.9, sMult: 1.54 },
  { shade: 400, lOffset: +17.9, sMult: 1.40 },
  { shade: 500, lOffset: +10.4, sMult: 1.31 },
  { shade: 600, lOffset: 0,     sMult: 1.00 },
  { shade: 700, lOffset: -7.6,  sMult: 0.86 },
  { shade: 800, lOffset: -17.2, sMult: 0.78 },
  { shade: 900, lOffset: -25.3, sMult: 0.73 },
  { shade: 950, lOffset: -35.1, sMult: 0.89 },
];

function clamp(v: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, v));
}

export function generateBrandPalette(baseHex: string): BrandPalette {
  const { h, s, l } = hexToHSL(baseHex);
  const palette = {} as Record<number, string>;

  for (const { shade, lOffset, sMult } of SHADE_CONFIG) {
    const newL = clamp(l + lOffset, 1, 99);
    const newS = clamp(s * sMult, 5, 100);
    palette[shade] = hslToHex(h, newS, newL);
  }

  return palette as BrandPalette;
}

// ── Validation ────────────────────────────────────────

export function isValidHex(hex: string): boolean {
  return /^#?[0-9A-Fa-f]{6}$/.test(hex);
}

function luminance(hex: string): number {
  const clean = hex.replace("#", "");
  const r = parseInt(clean.slice(0, 2), 16) / 255;
  const g = parseInt(clean.slice(2, 4), 16) / 255;
  const b = parseInt(clean.slice(4, 6), 16) / 255;
  const toLinear = (c: number) => (c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4));
  return 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b);
}

function contrastRatio(hex1: string, hex2: string): number {
  const l1 = luminance(hex1);
  const l2 = luminance(hex2);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

export function validateBrandColor(hex: string): string[] {
  const warnings: string[] = [];
  if (!isValidHex(hex)) return ["Invalid hex color format."];

  const normalized = hex.startsWith("#") ? hex : `#${hex}`;
  const { s, l } = hexToHSL(normalized);

  if (l > 80) warnings.push("This color is very light. Primary buttons will lack contrast against white backgrounds.");
  if (l < 25) warnings.push("This color is very dark. Lighter tints (25–200) will look muddy.");
  if (s < 15) warnings.push("This color is very desaturated. Brand elements may not stand out from neutral grays.");

  const ratio = contrastRatio(normalized, "#FFFFFF");
  if (ratio < 3) warnings.push(`Low contrast against white (${ratio.toFixed(1)}:1). Text readability may suffer.`);

  return warnings;
}

// ── Constants ─────────────────────────────────────────

export const DEFAULT_BRAND_HEX = "#6E56CF";

export const PRESETS: { name: string; hex: string }[] = [
  { name: "Purple", hex: "#7F56D9" },
  { name: "Soft Violet", hex: "#7C5CFC" },
  { name: "Muted Plum", hex: "#6E56CF" },
  { name: "Dusty Iris", hex: "#6B5BD2" },
  { name: "Blue", hex: "#1570EF" },
  { name: "Teal", hex: "#0E9384" },
  { name: "Rose", hex: "#E31B54" },
  { name: "Orange", hex: "#E04F16" },
  { name: "Green", hex: "#079455" },
];
