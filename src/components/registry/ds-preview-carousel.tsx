"use client";

import {
  useEffect,
  useMemo,
  useState,
  useCallback,
  type CSSProperties,
} from "react";
import { useTheme } from "@/components/providers/theme-provider";
import { getNd, editorialFonts, swatchRadii } from "@/lib/nothing-tokens";
import { resolveDsTokens } from "@/lib/resolve-ds-tokens";
import { loadGoogleFont } from "@/lib/font-loader";
import { LiveComponentSandbox } from "@/components/registry/live-component-sandbox";
import type { DSComponent, DSManifest, DSTokenColors } from "@/lib/types";

// Remix icons
import ArrowLeftSLineIcon from "remixicon-react/ArrowLeftSLineIcon";
import ArrowRightSLineIcon from "remixicon-react/ArrowRightSLineIcon";

/* ── Helpers ────────────────────────────────────────── */

/**
 * A named color group: primary / secondary / tertiary / neutral.
 * - `mainHex` is the representative shade (usually 500 or 600).
 * - `shades` is the ordered ramp for the gradient strip.
 */
type ColorGroup = {
  name: string;
  mainHex: string;
  shades: string[];
};

const HEX_LIKE = /^(#|rgb|hsl|oklch)/i;
function isRenderableColor(value: unknown): value is string {
  return typeof value === "string" && HEX_LIKE.test(value.trim());
}

function pickColorGroup(
  colors: DSTokenColors,
  name: string,
  candidates: string[],
  exclude: Set<string>
): ColorGroup | null {
  for (const key of candidates) {
    if (exclude.has(key)) continue;
    const scale = colors[key];
    if (!scale || typeof scale !== "object") continue;
    const record = scale as Record<string, string>;
    const renderable = Object.values(record).filter(isRenderableColor);
    if (renderable.length < 2) continue;

    const mainHex =
      record["500"] ??
      record["600"] ??
      record["base"] ??
      renderable[Math.floor(renderable.length / 2)];

    // Build an ordered ramp from numeric keys if present, else insertion order.
    const numericKeys = Object.keys(record)
      .filter((k) => /^\d+$/.test(k))
      .sort((a, b) => Number(a) - Number(b));
    const shades = (
      numericKeys.length > 0
        ? numericKeys.map((k) => record[k])
        : Object.values(record)
    ).filter(isRenderableColor);

    exclude.add(key);
    return { name, mainHex, shades };
  }
  return null;
}

/** Return the four canonical color groups, falling back gracefully. */
function resolveOverviewColors(colors: DSTokenColors): {
  primary: ColorGroup | null;
  secondary: ColorGroup | null;
  tertiary: ColorGroup | null;
  neutral: ColorGroup | null;
} {
  const exclude = new Set<string>();
  const primary = pickColorGroup(colors, "Primary", ["brand", "primary", "blue", "cyan", "teal", "indigo"], exclude);
  const secondary = pickColorGroup(
    colors,
    "Secondary",
    ["secondary", "accent", "orange", "red", "rose", "pink"],
    exclude
  );
  const tertiary = pickColorGroup(
    colors,
    "Tertiary",
    ["tertiary", "yellow", "lime", "green", "amber", "emerald"],
    exclude
  );
  const neutral = pickColorGroup(
    colors,
    "Neutral",
    ["neutral", "gray", "grey", "slate", "zinc", "stone"],
    exclude
  );
  return { primary, secondary, tertiary, neutral };
}

/** Shorten a color string into a displayable label (hex only) */
function displayHex(color: string): string {
  const trimmed = color.trim();
  if (trimmed.startsWith("#")) return trimmed.toUpperCase();
  // For non-hex (oklch, rgb, etc.) return a short slice
  return trimmed.slice(0, 9);
}

function extractBrandColor(colors: DSTokenColors): string {
  const candidates = ["brand", "primary", "blue", "indigo", "violet", "purple"];
  for (const key of candidates) {
    const scale = colors[key];
    if (scale && typeof scale === "object") {
      const record = scale as Record<string, string>;
      const shade =
        record["600"] ?? record["500"] ?? record["700"] ?? Object.values(record)[0];
      if (shade) return shade;
    }
  }
  for (const value of Object.values(colors)) {
    if (value && typeof value === "object") {
      const record = value as Record<string, string>;
      const shade = record["600"] ?? record["500"] ?? Object.values(record)[0];
      if (shade) return shade;
    }
  }
  return "#6E56CF";
}

function extractPalette(colors: DSTokenColors, count = 18): string[] {
  const result: string[] = [];
  const priorityKeys = [
    "brand",
    "primary",
    "secondary",
    "accent",
    "blue",
    "indigo",
    "violet",
    "purple",
    "pink",
    "rose",
    "red",
    "orange",
    "yellow",
    "green",
    "teal",
    "cyan",
  ];
  const seen = new Set<string>();

  const pick = (record: Record<string, string>) => {
    const shade =
      record["500"] ??
      record["600"] ??
      record["base"] ??
      Object.values(record)[0];
    if (shade && !seen.has(shade)) {
      result.push(shade);
      seen.add(shade);
    }
  };

  for (const key of priorityKeys) {
    const scale = colors[key];
    if (scale && typeof scale === "object") pick(scale as Record<string, string>);
    if (result.length >= count) break;
  }
  if (result.length < count) {
    for (const [key, value] of Object.entries(colors)) {
      if (priorityKeys.includes(key)) continue;
      if (value && typeof value === "object") {
        pick(value as Record<string, string>);
      }
      if (result.length >= count) break;
    }
  }
  return result.slice(0, count);
}

/* ── Slide components ───────────────────────────────── */

type SlideProps = {
  manifest: DSManifest;
  brand: string;
  dsFont: string;
  ds: ReturnType<typeof resolveDsTokens>;
  /** Hubera's own theme tokens — used for slide chrome (inner borders, neutral
   *  backgrounds, hairlines) so they remain visible against the Hubera card
   *  background regardless of the DS's own dark/light neutral scale. */
  t: ReturnType<typeof getNd>;
  /** True when the containing card is hovered — slides can brighten chrome on hover. */
  hovered: boolean;
  /** True once the card has entered the viewport. Gates expensive live-render
   *  iframes (Sandpack in the Components slide) so off-screen cards stay cheap. */
  inView: boolean;
};

function TypographySlide({ manifest, brand, dsFont, ds }: SlideProps) {
  const typography = manifest.tokens.typography;
  const family = typography.fontFamily || "System";

  // Pick up to 3 representative weights: lightest, mid, heaviest.
  const allWeights = (typography.weights ?? ["400", "500", "700"])
    .map((w) => Number(w))
    .filter((n) => !Number.isNaN(n))
    .sort((a, b) => a - b);
  const sampleWeights =
    allWeights.length <= 3
      ? allWeights
      : [allWeights[0], allWeights[Math.floor(allWeights.length / 2)], allWeights[allWeights.length - 1]];

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "grid",
        gridTemplateRows: "auto 1px 1fr",
        gap: "3cqw",
        padding: "5cqw 6cqw",
        background: "transparent",
      }}
    >
      {/* Hero specimen + family name */}
      <div
        style={{
          display: "flex",
          alignItems: "baseline",
          gap: "3cqw",
          minHeight: 0,
        }}
      >
        <span
          style={{
            fontFamily: dsFont,
            fontSize: "clamp(40px, 14cqw, 100px)",
            fontWeight: Number(ds.weightBold),
            color: ds.textDisplay,
            lineHeight: 0.9,
            letterSpacing: "-0.045em",
          }}
        >
          Aa
        </span>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.6cqw", minWidth: 0 }}>
          <span
            style={{
              fontFamily: editorialFonts.mono,
              fontSize: "clamp(9px, 2cqw, 11px)",
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              color: ds.textDisabled,
              fontWeight: 500,
            }}
          >
            Typography
          </span>
          <span
            style={{
              fontFamily: dsFont,
              fontSize: "clamp(12px, 3cqw, 17px)",
              fontWeight: Number(ds.weightSemibold),
              color: ds.textDisplay,
              letterSpacing: "-0.01em",
              lineHeight: 1.1,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {family}
          </span>
          <span
            style={{
              fontFamily: editorialFonts.mono,
              fontSize: "clamp(9px, 2.2cqw, 12px)",
              color: ds.textDisabled,
              letterSpacing: "-0.005em",
            }}
          >
            {(typography.weights ?? []).join(" · ") || "Regular"}
          </span>
        </div>
      </div>

      <span style={{ background: ds.border, height: 1 }} />

      {/* Weight specimens — simplified version of the Foundation view */}
      <div
        style={{
          display: "grid",
          gridTemplateRows: `repeat(${Math.max(sampleWeights.length, 1)}, 1fr)`,
          gap: "1cqw",
          minHeight: 0,
          alignContent: "center",
        }}
      >
        {sampleWeights.map((w) => (
          <div
            key={w}
            style={{
              display: "grid",
              gridTemplateColumns: "clamp(40px, 12cqw, 70px) 1fr",
              gap: "3cqw",
              alignItems: "baseline",
              overflow: "hidden",
            }}
          >
            <span
              style={{
                fontFamily: editorialFonts.mono,
                fontSize: "clamp(9px, 2cqw, 11px)",
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                color: ds.textDisabled,
              }}
            >
              {w}
            </span>
            <span
              style={{
                fontFamily: dsFont,
                fontSize: "clamp(13px, 3.2cqw, 20px)",
                fontWeight: w,
                color: ds.textPrimary,
                letterSpacing: "-0.01em",
                lineHeight: 1.25,
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              The quick brown fox.
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function ButtonsSlide({ brand, dsFont, ds }: SlideProps) {
  const btnFont = "clamp(12px, 3.2cqw, 18px)";
  const btnPadY = "clamp(8px, 2.2cqw, 14px)";
  const btnPadX = "clamp(14px, 4.5cqw, 26px)";
  const smFont = "clamp(11px, 2.8cqw, 16px)";
  const smPadY = "clamp(6px, 1.8cqw, 11px)";
  const smPadX = "clamp(10px, 3.5cqw, 20px)";

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        gap: "3.5cqw",
        padding: "8cqw",
      }}
    >
      <div style={{ display: "flex", gap: "2.5cqw", flexWrap: "wrap", justifyContent: "center" }}>
        <span
          style={{
            padding: `${btnPadY} ${btnPadX}`,
            fontSize: btnFont,
            fontWeight: Number(ds.weightMedium),
            fontFamily: dsFont,
            color: ds.textOnBrand,
            background: brand,
            borderRadius: ds.radiusMd,
            border: "none",
          }}
        >
          Primary
        </span>
        <span
          style={{
            padding: `${btnPadY} ${btnPadX}`,
            fontSize: btnFont,
            fontWeight: Number(ds.weightMedium),
            fontFamily: dsFont,
            color: brand,
            background: "transparent",
            border: `1.5px solid ${brand}`,
            borderRadius: ds.radiusMd,
          }}
        >
          Secondary
        </span>
      </div>
      <div style={{ display: "flex", gap: "2.5cqw", flexWrap: "wrap", justifyContent: "center" }}>
        <span
          style={{
            padding: `${smPadY} ${smPadX}`,
            fontSize: smFont,
            fontWeight: Number(ds.weightMedium),
            fontFamily: dsFont,
            color: ds.textPrimary,
            background: ds.surface,
            borderRadius: ds.radiusSm,
            border: `1px solid ${ds.border}`,
          }}
        >
          Ghost
        </span>
        <span
          style={{
            padding: `${smPadY} ${smPadX}`,
            fontSize: smFont,
            fontWeight: Number(ds.weightMedium),
            fontFamily: dsFont,
            color: ds.textDisabled,
            borderRadius: ds.radiusSm,
            border: `1px dashed ${ds.border}`,
          }}
        >
          Disabled
        </span>
      </div>
    </div>
  );
}

function ColorsSlide({ manifest, brand, dsFont, ds }: SlideProps) {
  // Pick up to 4 named color scales from the manifest, each with an ordered
  // ramp — matches the Foundation palette's intent in a compact card form.
  const scales = useMemo(() => {
    const groups = resolveOverviewColors(manifest.tokens.colors);
    return [groups.primary, groups.secondary, groups.tertiary, groups.neutral].filter(
      (g): g is ColorGroup => g !== null
    );
  }, [manifest.tokens.colors]);

  // Fallback: if we found nothing, render a single generated ramp from brand.
  const rows =
    scales.length > 0
      ? scales
      : [
          {
            name: "Brand",
            mainHex: brand,
            shades: Array.from({ length: 10 }, (_, i) => brand),
          } as ColorGroup,
        ];

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "grid",
        gridTemplateRows: "auto 1px 1fr",
        gap: "3cqw",
        padding: "5cqw 6cqw",
        background: "transparent",
      }}
    >
      {/* Eyebrow + count */}
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: "2cqw" }}>
        <span
          style={{
            fontFamily: editorialFonts.mono,
            fontSize: "clamp(9px, 2cqw, 11px)",
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            color: ds.textDisabled,
            fontWeight: 500,
          }}
        >
          Colors
        </span>
        <span
          style={{
            fontFamily: editorialFonts.mono,
            fontSize: "clamp(9px, 2cqw, 11px)",
            letterSpacing: "0.05em",
            color: ds.textDisabled,
          }}
        >
          {rows.length} {rows.length === 1 ? "scale" : "scales"}
        </span>
      </div>

      <span style={{ background: ds.border, height: 1 }} />

      {/* Scale rows — name · hex on the left, horizontal ramp on the right */}
      <div
        style={{
          display: "grid",
          gridTemplateRows: `repeat(${rows.length}, 1fr)`,
          gap: "2.2cqw",
          minHeight: 0,
          alignContent: "center",
        }}
      >
        {rows.map((group) => (
          <div
            key={group.name}
            style={{
              display: "grid",
              gridTemplateColumns: "clamp(70px, 18cqw, 110px) 1fr",
              gap: "2.5cqw",
              alignItems: "center",
              minHeight: 0,
            }}
          >
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5cqw", minWidth: 0 }}>
              <span
                style={{
                  fontFamily: dsFont,
                  fontSize: "clamp(11px, 2.8cqw, 15px)",
                  fontWeight: Number(ds.weightSemibold),
                  color: ds.textDisplay,
                  letterSpacing: "-0.005em",
                  lineHeight: 1.1,
                }}
              >
                {group.name}
              </span>
              <span
                style={{
                  fontFamily: editorialFonts.mono,
                  fontSize: "clamp(9px, 2cqw, 11px)",
                  color: ds.textDisabled,
                  letterSpacing: "-0.005em",
                }}
              >
                {displayHex(group.mainHex)}
              </span>
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: `repeat(${Math.max(group.shades.length, 1)}, 1fr)`,
                borderRadius: "clamp(3px, 0.8cqw, 6px)",
                overflow: "hidden",
                minHeight: 0,
                height: "clamp(22px, 6cqw, 38px)",
              }}
            >
              {group.shades.map((c, i) => (
                <span key={i} style={{ background: c }} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Pick the best component to show as a live preview. Prefer a real "Button"
 * since every DS has one and it renders in a small space — fall back to the
 * first component in the manifest if no button is declared.
 */
function pickLivePreviewComponent(manifest: DSManifest): DSComponent | null {
  const button = manifest.components.find((c) =>
    /^button$/i.test(c.name.replace(/[\s_-]/g, ""))
  );
  if (button) return button;
  return manifest.components[0] ?? null;
}

function ComponentsSlide({ manifest, ds, t, inView }: SlideProps) {
  const count = manifest.components.length;
  const previewComponent = useMemo(
    () => pickLivePreviewComponent(manifest),
    [manifest]
  );

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "grid",
        gridTemplateRows: "auto 1px 1fr auto",
        gap: "2cqw",
        padding: "4cqw 5cqw",
        background: "transparent",
      }}
    >
      {/* Eyebrow + count */}
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: "2cqw" }}>
        <span
          style={{
            fontFamily: editorialFonts.mono,
            fontSize: "clamp(9px, 2cqw, 11px)",
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            color: t.textDisabled,
            fontWeight: 500,
          }}
        >
          Components
        </span>
        <span
          style={{
            fontFamily: editorialFonts.mono,
            fontSize: "clamp(9px, 2cqw, 11px)",
            letterSpacing: "0.05em",
            color: t.textDisabled,
          }}
        >
          {count} total
        </span>
      </div>

      <span style={{ background: `color-mix(in oklch, ${t.textDisplay} 4%, ${t.surface})`, height: 1 }} />

      {/* Live preview — mounts a Sandpack iframe only once the card has
          entered the viewport and the user is viewing this slide. Falls back
          to a static placeholder otherwise. */}
      <div
        style={{
          minHeight: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: "clamp(8px, 1.8cqw, 14px)",
          overflow: "hidden",
          background: t.surfaceInk,
        }}
      >
        {inView && previewComponent ? (
          <LiveComponentSandbox
            manifest={manifest}
            component={previewComponent}
            height="100%"
            bare
          />
        ) : (
          <span
            style={{
              fontFamily: editorialFonts.mono,
              fontSize: "clamp(10px, 2.4cqw, 13px)",
              color: t.textDisabled,
              letterSpacing: "0.05em",
              textTransform: "uppercase",
            }}
          >
            {previewComponent ? "Live preview loads in view" : "No components"}
          </span>
        )}
      </div>

      {/* Component pill */}
      <div style={{ display: "flex", justifyContent: "flex-start" }}>
        {previewComponent && (
          <span
            style={{
              fontFamily: editorialFonts.mono,
              fontSize: "clamp(9px, 2cqw, 12px)",
              color: t.textSecondary,
              letterSpacing: "-0.005em",
            }}
          >
            {previewComponent.name}
            <span style={{ color: t.textDisabled, margin: "0 6px" }}>·</span>
            {previewComponent.file}
          </span>
        )}
      </div>
    </div>
  );
}

/* ── Overview slide ─────────────────────────────────── */

/**
 * Hubera-style "design system at a glance" slide.
 * Four quadrants separated by hairline rules (no rounded cells, no filled
 * backgrounds) — echoing the Linear/Vercel editorial structure of the rest
 * of the app. Each quadrant has a small mono eyebrow label and one clear
 * artefact from the DS:
 *   Type · Palette
 *   Buttons · Components
 * Every dimension uses container-query units so it scales cleanly across
 * 3-col / 2-col / 1-col responsive grids.
 */
function OverviewSlide({ manifest, brand, dsFont, ds, t, hovered }: SlideProps) {
  const groups = useMemo(
    () => resolveOverviewColors(manifest.tokens.colors),
    [manifest.tokens.colors]
  );
  const palette = useMemo(
    () => extractPalette(manifest.tokens.colors, 10),
    [manifest.tokens.colors]
  );
  const secondary = groups.secondary?.mainHex ?? brand;

  // Font name to show in the Type quadrant — always the primary family, no fallbacks.
  const fontName =
    manifest.tokens.typography?.fontFamily?.split(",")[0]?.replace(/['"]/g, "").trim() ||
    "System";

  const eyebrow: CSSProperties = {
    fontFamily: editorialFonts.mono,
    fontSize: "clamp(9px, 2cqw, 11px)",
    letterSpacing: "0.1em",
    textTransform: "uppercase",
    color: ds.textDisabled,
    fontWeight: 500,
  };

  const quadrant: CSSProperties = {
    position: "relative",
    padding: "5cqw 5cqw 4cqw",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    minHeight: 0,
    overflow: "hidden",
    transition: "border-color 200ms ease-out",
  };

  // Chrome colors — use Hubera tokens (not DS tokens) so borders and neutral
  // fills stay visible against the Hubera-themed card background.
  //
  // Quadrant hairlines are a single derived color (~4% off the card bg) and
  // do NOT darken on hover — the card already has its own lift motion, the
  // lines shouldn't also shift. Inner-element borders (secondary button,
  // search, Draft chip) still step up on hover since those are the "things"
  // that should read more clearly.
  const hair = `color-mix(in oklch, ${t.textDisplay} 4%, ${t.surface})`;
  const innerBg = t.surfaceInk;
  const innerBorder = hovered ? t.borderStrong : t.borderVisible;

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gridTemplateRows: "1fr 1fr",
        background: "transparent",
      }}
    >
      {/* ── Top-left: Type ───────────────────────────── */}
      <div style={{ ...quadrant, borderRight: `1px solid ${hair}`, borderBottom: `1px solid ${hair}` }}>
        <span style={eyebrow}>Type</span>
        <div
          style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            minHeight: 0,
          }}
        >
          <span
            style={{
              fontFamily: dsFont,
              fontSize: "clamp(48px, 18cqw, 132px)",
              fontWeight: Number(ds.weightBold),
              color: ds.textDisplay,
              lineHeight: 0.92,
              letterSpacing: "-0.045em",
            }}
          >
            Aa
          </span>
        </div>
        <span
          style={{
            fontFamily: dsFont,
            fontSize: "clamp(10px, 2.4cqw, 14px)",
            fontWeight: Number(ds.weightMedium),
            color: ds.textSecondary,
            letterSpacing: "-0.005em",
          }}
        >
          {fontName}
        </span>
      </div>

      {/* ── Top-right: Palette ───────────────────────── */}
      <div style={{ ...quadrant, borderBottom: `1px solid ${hair}` }}>
        <span style={eyebrow}>Palette</span>
        <div style={{ flex: 1, display: "flex", alignItems: "center", minHeight: 0 }}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: `repeat(${Math.max(palette.length, 1)}, 1fr)`,
              width: "100%",
              aspectRatio: `${palette.length} / 1`,
              maxHeight: "55%",
              borderRadius: "clamp(3px, 0.8cqw, 6px)",
              overflow: "hidden",
            }}
          >
            {palette.map((c, i) => (
              <span key={`${c}-${i}`} style={{ background: c }} />
            ))}
          </div>
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "2cqw",
            fontFamily: editorialFonts.mono,
            fontSize: "clamp(9px, 2cqw, 12px)",
            color: ds.textSecondary,
            letterSpacing: "-0.005em",
          }}
        >
          <span>{displayHex(brand)}</span>
          <span style={{ color: ds.textDisabled }}>
            {palette.length} shades
          </span>
        </div>
      </div>

      {/* ── Bottom-left: Buttons ─────────────────────── */}
      <div style={{ ...quadrant, borderRight: `1px solid ${hair}` }}>
        <span style={eyebrow}>Buttons</span>
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "flex-start",
            gap: "2.2cqw",
            minHeight: 0,
          }}
        >
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "1.4cqw",
              padding: "clamp(6px, 1.8cqw, 11px) clamp(12px, 3.2cqw, 20px)",
              background: brand,
              color: ds.textOnBrand,
              borderRadius: ds.radiusMd,
              fontFamily: dsFont,
              fontSize: "clamp(11px, 2.8cqw, 15px)",
              fontWeight: Number(ds.weightSemibold),
              letterSpacing: "-0.005em",
            }}
          >
            Get started
          </span>
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "1.4cqw",
              padding: "clamp(5px, 1.6cqw, 10px) clamp(12px, 3.2cqw, 20px)",
              background: innerBg,
              color: ds.textPrimary,
              border: `1px solid ${innerBorder}`,
              borderRadius: ds.radiusMd,
              fontFamily: dsFont,
              fontSize: "clamp(11px, 2.8cqw, 15px)",
              fontWeight: Number(ds.weightMedium),
              letterSpacing: "-0.005em",
              transition: "border-color 200ms ease-out, background 200ms ease-out",
            }}
          >
            Secondary
          </span>
        </div>
        <span
          style={{
            fontFamily: editorialFonts.mono,
            fontSize: "clamp(9px, 2cqw, 12px)",
            color: ds.textDisabled,
            letterSpacing: "-0.005em",
          }}
        >
          r {typeof ds.radiusMd === "number" ? `${ds.radiusMd}px` : ds.radiusMd}
        </span>
      </div>

      {/* ── Bottom-right: Components ─────────────────── */}
      <div style={quadrant}>
        <span style={eyebrow}>Components</span>
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            gap: "2.4cqw",
            minHeight: 0,
          }}
        >
          {/* Search input */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "1.6cqw",
              padding: "clamp(5px, 1.6cqw, 10px) clamp(10px, 2.8cqw, 16px)",
              background: innerBg,
              border: `1px solid ${innerBorder}`,
              borderRadius: ds.radiusMd,
              width: "100%",
              transition: "border-color 200ms ease-out, background 200ms ease-out",
            }}
          >
            <SearchIcon color={t.textSecondary} />
            <span
              style={{
                fontFamily: dsFont,
                fontSize: "clamp(11px, 2.8cqw, 14px)",
                color: ds.textDisabled,
              }}
            >
              Search
            </span>
          </div>
          {/* Chip row */}
          <div style={{ display: "flex", gap: "1.2cqw", flexWrap: "wrap" }}>
            <Chip label="Active" bg={brand} color={ds.textOnBrand} dsFont={dsFont} ds={ds} />
            <Chip label="Pending" bg={secondary} color={readableOn(secondary)} dsFont={dsFont} ds={ds} />
            <Chip label="Draft" bg={innerBg} color={t.textSecondary} border={innerBorder} dsFont={dsFont} ds={ds} />
          </div>
        </div>
        <span
          style={{
            fontFamily: editorialFonts.mono,
            fontSize: "clamp(9px, 2cqw, 12px)",
            color: ds.textDisabled,
            letterSpacing: "-0.005em",
          }}
        >
          {manifest.components.length} components
        </span>
      </div>
    </div>
  );
}

function Chip({
  label,
  bg,
  color,
  border,
  dsFont,
  ds,
}: {
  label: string;
  bg: string;
  color: string;
  border?: string;
  dsFont: string;
  ds: SlideProps["ds"];
}) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        padding: "clamp(3px, 0.9cqw, 5px) clamp(8px, 2.2cqw, 12px)",
        background: bg,
        color,
        border: border ? `1px solid ${border}` : "none",
        borderRadius: 999,
        fontFamily: dsFont,
        fontSize: "clamp(9px, 2.2cqw, 12px)",
        fontWeight: Number(ds.weightMedium),
        letterSpacing: "-0.005em",
        transition: "border-color 200ms ease-out, background 200ms ease-out",
      }}
    >
      {label}
    </span>
  );
}

/** Luminance-based text color picker for readability on top of a swatch. */
function readableOn(bg: string): string {
  if (!bg.startsWith("#")) return "#ffffff";
  const cleaned = bg.replace("#", "");
  const full =
    cleaned.length === 3
      ? cleaned
          .split("")
          .map((c) => c + c)
          .join("")
      : cleaned.slice(0, 6);
  const r = parseInt(full.slice(0, 2), 16);
  const g = parseInt(full.slice(2, 4), 16);
  const b = parseInt(full.slice(4, 6), 16);
  const lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return lum > 0.6 ? "#0B0F1C" : "#ffffff";
}

/* Inline icon — small, no external deps */
function SearchIcon({ color = "currentColor" }: { color?: string } = {}) {
  return (
    <svg
      width="1em"
      height="1em"
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ fontSize: "clamp(10px, 2.8cqw, 16px)" }}
    >
      <circle cx={11} cy={11} r={7} />
      <path d="M20 20l-3.5-3.5" />
    </svg>
  );
}

/* ── Carousel ───────────────────────────────────────── */

export type CarouselSlide = {
  key: string;
  label: string;
  render: (props: SlideProps) => React.ReactElement;
};

const SLIDES: CarouselSlide[] = [
  { key: "overview", label: "Overview", render: (p) => <OverviewSlide {...p} /> },
  { key: "typography", label: "Typography", render: (p) => <TypographySlide {...p} /> },
  { key: "buttons", label: "Buttons", render: (p) => <ButtonsSlide {...p} /> },
  { key: "colors", label: "Colors", render: (p) => <ColorsSlide {...p} /> },
  { key: "components", label: "Components", render: (p) => <ComponentsSlide {...p} /> },
];

export function DSPreviewCarousel({
  manifest,
  hovered,
  inView = true,
}: {
  manifest: DSManifest;
  hovered: boolean;
  inView?: boolean;
}) {
  const { theme } = useTheme();
  const t = getNd(theme);
  const [index, setIndex] = useState(0);

  // Resolve the DS's own token context so the carousel surface matches
  // the design system's actual background.
  const ds = useMemo(
    () => resolveDsTokens(manifest.tokens, theme === "light" ? "light" : "dark"),
    [manifest.tokens, theme]
  );

  const brand = ds.brand;
  const dsFont = ds.font;

  // Fetch the DS's declared font from Google Fonts so the preview renders
  // in the real face instead of falling back to system-ui. Weights come
  // from the manifest; the loader dedupes per family across every card.
  useEffect(() => {
    loadGoogleFont(dsFont, manifest.tokens.typography?.weights);
  }, [dsFont, manifest.tokens.typography?.weights]);

  const go = useCallback(
    (direction: 1 | -1) => {
      setIndex((prev) => {
        const next = prev + direction;
        if (next < 0) return SLIDES.length - 1;
        if (next >= SLIDES.length) return 0;
        return next;
      });
    },
    []
  );

  const handleArrowClick = (e: React.MouseEvent, direction: 1 | -1) => {
    e.preventDefault();
    e.stopPropagation();
    go(direction);
  };

  const currentSlide = SLIDES[index];

  /* ── styles ───────────────────────────────────────── */

  // Uniform card background — a single warm-gray step away from the page,
  // same for every DS. Uses `surface` so the card stays light (gray-100 in
  // light mode, just above the near-black page in dark mode) and never reads
  // as a dark slab.
  const cardBg = t.surface;

  const wrapperStyle: CSSProperties = {
    position: "relative",
    width: "100%",
    height: "100%",
    background: cardBg,
    color: ds.textPrimary,
    overflow: "hidden",
  };

  const slideStyle: CSSProperties = {
    position: "absolute",
    inset: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  };

  const dotsStyle: CSSProperties = {
    position: "absolute",
    top: 12,
    right: 14,
    display: "flex",
    gap: 6,
    alignItems: "center",
    pointerEvents: "none",
    opacity: hovered ? 1 : 0,
    transition: "opacity 160ms ease-out",
  };

  const arrowBase: CSSProperties = {
    position: "absolute",
    top: "50%",
    transform: "translateY(-50%)",
    width: 36,
    height: 36,
    borderRadius: swatchRadii.full,
    background: "rgba(255,255,255,0.95)",
    color: "#111",
    border: "none",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    opacity: hovered ? 1 : 0,
    pointerEvents: hovered ? "auto" : "none",
    transition: "opacity 160ms ease-out, background 120ms ease-out",
    zIndex: 3,
    padding: 0,
  };

  const leftArrowStyle: CSSProperties = {
    ...arrowBase,
    left: 10,
  };
  const rightArrowStyle: CSSProperties = {
    ...arrowBase,
    right: 10,
  };

  /* ── render ──────────────────────────────────────── */

  return (
    <div style={wrapperStyle}>
      {/* Current slide */}
      <div key={currentSlide.key} style={slideStyle}>
        {currentSlide.render({ manifest, brand, dsFont, ds, t, hovered, inView })}
      </div>

      {/* Dots indicator */}
      <div style={dotsStyle} aria-hidden>
        {SLIDES.map((s, i) => (
          <span
            key={s.key}
            style={{
              width: 6,
              height: 6,
              borderRadius: "50%",
              background:
                i === index ? ds.textDisplay : ds.border,
              transition: "background 120ms ease-out",
            }}
          />
        ))}
      </div>

      {/* Left arrow */}
      <button
        type="button"
        onClick={(e) => handleArrowClick(e, -1)}
        style={leftArrowStyle}
        aria-label="Previous preview"
      >
        <ArrowLeftSLineIcon size={22} />
      </button>

      {/* Right arrow */}
      <button
        type="button"
        onClick={(e) => handleArrowClick(e, 1)}
        style={rightArrowStyle}
        aria-label="Next preview"
      >
        <ArrowRightSLineIcon size={22} />
      </button>

      {/* Label pill — shows which slide you're on, bottom-center. Only
          appears on hover (in sync with the nav arrows and dots). */}
      <div
        style={{
          position: "absolute",
          bottom: 12,
          left: "50%",
          transform: "translateX(-50%)",
          background: "rgba(0,0,0,0.6)",
          color: "#fff",
          fontFamily: editorialFonts.body,
          fontSize: 11,
          fontWeight: 500,
          padding: "4px 10px",
          borderRadius: swatchRadii.full,
          backdropFilter: "blur(6px)",
          pointerEvents: "none",
          zIndex: 2,
          opacity: hovered ? 1 : 0,
          transition: "opacity 160ms ease-out",
        }}
      >
        {currentSlide.label}
      </div>
    </div>
  );
}
