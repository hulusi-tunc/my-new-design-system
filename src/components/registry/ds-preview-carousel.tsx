"use client";

import {
  useEffect,
  useMemo,
  useRef,
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
  const primary = pickColorGroup(colors, "Primary", ["brand", "primary", "blue", "cyan", "teal", "indigo", "accent"], exclude);
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

  // Flat-color fallback: if NO groups matched but the manifest has flat
  // string colors (auto-extracted manifests), synthesize a single neutral
  // group from them so something renders instead of empty swatches.
  if (!primary && !secondary && !tertiary && !neutral) {
    const flatShades = Object.values(colors)
      .filter(isRenderableColor)
      .slice(0, 12);
    if (flatShades.length >= 2) {
      const accentLike = (Object.entries(colors).find(
        ([k]) => /(accent|brand|primary|interactive)/i.test(k)
      )?.[1] ?? null) as string | null;
      const mid = flatShades[Math.floor(flatShades.length / 2)];
      return {
        primary: accentLike && isRenderableColor(accentLike)
          ? { name: "Accent", mainHex: accentLike, shades: [accentLike] }
          : null,
        secondary: null,
        tertiary: null,
        neutral: { name: "Palette", mainHex: mid, shades: flatShades },
      };
    }
  }

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
  /** True when the host device is a touch/coarse-pointer device. Slides use
   *  this to enable hover-equivalent affordances (e.g. auto-cycle) that
   *  would otherwise require hover. */
  coarsePointer: boolean;
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

/**
 * Real Button slide — renders the DS's actual Button component via Sandpack
 * using whatever examples the manifest declares, so what you see matches the
 * real component's appearance, not a CSS approximation.
 *
 * If the DS has no Button component we render nothing (the carousel skips
 * the slide) so we never show fake buttons alongside real ones.
 */
function ButtonsSlide({ manifest, ds, t, hovered, inView, coarsePointer }: SlideProps) {
  const buttonComponent = useMemo(() => {
    const normalise = (name: string) => name.toLowerCase().replace(/[\s_-]/g, "");
    return (
      manifest.components.find((c) => /^button$/.test(normalise(c.name))) ??
      manifest.components.find((c) => /button/.test(normalise(c.name))) ??
      null
    );
  }, [manifest.components]);

  if (!buttonComponent) {
    return (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "5cqw",
        }}
      >
        <span
          style={{
            fontFamily: editorialFonts.mono,
            fontSize: "clamp(10px, 2.4cqw, 13px)",
            color: t.textDisabled,
            letterSpacing: "0.05em",
            textTransform: "uppercase",
          }}
        >
          No button component
        </span>
      </div>
    );
  }

  // Cap at 4 examples so the slide doesn't get crowded in the small card.
  const examples = buttonComponent.examples?.slice(0, 4);

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        padding: "3cqw 4cqw 4cqw",
        display: "flex",
        alignItems: "stretch",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          width: "100%",
          height: "100%",
          borderRadius: "clamp(10px, 2.4cqw, 16px)",
          overflow: "hidden",
        }}
      >
        {inView ? (
          <LiveComponentSandbox
            manifest={manifest}
            component={buttonComponent}
            examples={examples}
            mode={examples && examples.length > 1 ? "gallery" : "single"}
            cyclingEnabled={hovered || coarsePointer}
            height="100%"
            bare
            transparentBg
          />
        ) : (
          <div
            style={{
              width: "100%",
              height: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: ds.surfaceInk,
            }}
          >
            <span
              style={{
                fontFamily: editorialFonts.mono,
                fontSize: "clamp(9px, 2.2cqw, 12px)",
                color: t.textDisabled,
                letterSpacing: "0.05em",
                textTransform: "uppercase",
              }}
            >
              Loads in view
            </span>
          </div>
        )}
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

/**
 * Pick up to 5 representative components to rotate through in the overview.
 * Keeps Button first (most universal), then picks one each from other
 * families by normalised name prefix so the rotation feels diverse — not
 * "Button · CompactButton · FancyButton" repeating the same shape.
 */
function pickCycleComponents(manifest: DSManifest, max = 5): DSComponent[] {
  const normalise = (name: string) => name.toLowerCase().replace(/[\s_-]/g, "");
  const all = manifest.components;
  const out: DSComponent[] = [];
  const seenFamilies = new Set<string>();

  // Always lead with the Button if the DS has one
  const button = all.find((c) => /^button$/.test(normalise(c.name)));
  if (button) {
    out.push(button);
    seenFamilies.add("button");
  }

  // Then, for each subsequent component, only take one per "family" keyword
  const familyKeywords = [
    "button",
    "input",
    "badge",
    "card",
    "tab",
    "checkbox",
    "switch",
    "select",
    "toast",
    "tooltip",
    "avatar",
    "tag",
    "chip",
    "menu",
    "alert",
    "table",
  ];

  for (const c of all) {
    if (out.length >= max) break;
    if (out.includes(c)) continue;
    const n = normalise(c.name);
    const family = familyKeywords.find((kw) => n.includes(kw)) ?? n;
    if (seenFamilies.has(family)) continue;
    seenFamilies.add(family);
    out.push(c);
  }

  // If we still don't have enough, fill from remaining in declaration order
  if (out.length < max) {
    for (const c of all) {
      if (out.length >= max) break;
      if (!out.includes(c)) out.push(c);
    }
  }

  return out;
}

function ComponentsSlide({ manifest, ds, t, hovered, inView }: SlideProps) {
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
 * "Signature" overview — three horizontal bands, each carrying exactly one
 * token choice the DS has actually made:
 *   1. Typography — the DS's own font, loaded via Google Fonts
 *   2. Brand — a single dominant color block with the hex
 *   3. Component — one large primary button showing radius + font + color
 * The earlier bento-grid version (tiny pills, 10-shade rainbow, stub search)
 * was visually generic because each cell communicated a weak signal. A DS's
 * identity is its font + brand + component feel, not a list of tokens.
 */
function OverviewSlide({ manifest, brand, dsFont, ds, t, hovered, inView, coarsePointer }: SlideProps) {
  const fontName =
    manifest.tokens.typography?.fontFamily?.split(",")[0]?.replace(/['"]/g, "").trim() ||
    "System";

  // The DS's actual Button component, rendered live in Sandpack — not a
  // CSS approximation. Falls back to the first component if the manifest
  // has no explicit Button entry.
  const previewComponent = useMemo(
    () => pickLivePreviewComponent(manifest),
    [manifest]
  );
  // Up to 5 real components, rotated every 2s inside the sandbox iframe.
  // Bundled together so the rotation is free after the upfront bundle cost.
  const cycleComponents = useMemo(
    () => pickCycleComponents(manifest, 5),
    [manifest]
  );

  const eyebrow: CSSProperties = {
    fontFamily: editorialFonts.mono,
    fontSize: "clamp(9px, 2cqw, 11px)",
    letterSpacing: "0.1em",
    textTransform: "uppercase",
    color: t.textDisabled,
    fontWeight: 500,
  };

  const hair = `color-mix(in oklch, ${t.textDisplay} 4%, ${t.surface})`;

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "grid",
        gridTemplateRows: "1.1fr auto 1fr",
        gap: 0,
        padding: 0,
        background: "transparent",
      }}
    >
      {/* ── 1. Typography band ─────────────────────────
          Big "Aa" in the DS's actual font. Differentiates sans-DSes
          (Space Grotesk vs Geist vs Inter) once Google Fonts load. */}
      <div
        style={{
          position: "relative",
          padding: "5cqw 6cqw",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden",
          borderBottom: `1px solid ${hair}`,
          gap: "3cqw",
        }}
      >
        <span
          style={{
            fontFamily: dsFont,
            fontSize: "clamp(48px, 20cqw, 150px)",
            fontWeight: Number(ds.weightBold),
            color: ds.textDisplay,
            lineHeight: 0.9,
            letterSpacing: "-0.045em",
          }}
        >
          Aa
        </span>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "0.6cqw",
            alignItems: "flex-start",
          }}
        >
          <span style={eyebrow}>Typeface</span>
          <span
            style={{
              fontFamily: dsFont,
              fontSize: "clamp(14px, 4cqw, 22px)",
              fontWeight: Number(ds.weightSemibold),
              color: ds.textDisplay,
              letterSpacing: "-0.01em",
              lineHeight: 1.05,
            }}
          >
            {fontName}
          </span>
        </div>
      </div>

      {/* ── 2. Brand color band ─────────────────────────
          One tall strip saturated in the DS's actual brand, with hex
          overlaid. Impossible to miss what color a DS leads with. */}
      <div
        style={{
          position: "relative",
          height: "clamp(48px, 14cqw, 96px)",
          background: brand,
          display: "flex",
          alignItems: "center",
          paddingLeft: "6cqw",
          paddingRight: "6cqw",
          justifyContent: "space-between",
          borderBottom: `1px solid ${hair}`,
        }}
      >
        <span
          style={{
            fontFamily: editorialFonts.mono,
            fontSize: "clamp(10px, 2.5cqw, 14px)",
            letterSpacing: "0.05em",
            color: readableOn(brand),
            opacity: 0.7,
            textTransform: "uppercase",
            fontWeight: 500,
          }}
        >
          Brand
        </span>
        <span
          style={{
            fontFamily: editorialFonts.mono,
            fontSize: "clamp(11px, 3cqw, 16px)",
            fontWeight: 500,
            color: readableOn(brand),
            letterSpacing: "-0.005em",
          }}
        >
          {displayHex(brand)}
        </span>
      </div>

      {/* ── 3. Component band ───────────────────────────
          The DS's real Button component, rendered by Sandpack from its
          actual source on GitHub — no CSS approximation. Mounts only once
          the card enters the viewport so off-screen cards stay cheap.
          Sits on a transparent background so the card surface shows through
          instead of a solid white slab, with inset padding so the preview
          doesn't run edge-to-edge. */}
      <div
        style={{
          position: "relative",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden",
          minHeight: 0,
          padding: "3cqw 4cqw 4cqw",
        }}
      >
        {inView && previewComponent ? (
          <div
            style={{
              width: "100%",
              height: "100%",
              borderRadius: "clamp(10px, 2.4cqw, 16px)",
              overflow: "hidden",
            }}
          >
            <LiveComponentSandbox
              manifest={manifest}
              component={previewComponent}
              cycleComponents={cycleComponents}
              cyclingEnabled={hovered || coarsePointer}
              height="100%"
              bare
              transparentBg
            />
          </div>
        ) : (
          <span
            style={{
              fontFamily: editorialFonts.mono,
              fontSize: "clamp(9px, 2.2cqw, 12px)",
              color: t.textDisabled,
              letterSpacing: "0.05em",
              textTransform: "uppercase",
            }}
          >
            {previewComponent ? "Loads in view" : "No components"}
          </span>
        )}
      </div>
    </div>
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

  // Detect coarse pointers (touch devices) so the UI can show controls
  // without relying on hover. Hover doesn't exist on mobile — if we stayed
  // hover-gated, touch users would never see arrows or dots.
  const [coarsePointer, setCoarsePointer] = useState(false);
  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    const mq = window.matchMedia("(pointer: coarse)");
    const update = () => setCoarsePointer(mq.matches);
    update();
    mq.addEventListener?.("change", update);
    return () => mq.removeEventListener?.("change", update);
  }, []);

  // Chrome (arrows / dots / label) is visible when either the user is
  // hovering (pointer devices) or we've detected a coarse pointer. This
  // keeps touch users in control of slide navigation.
  const chromeVisible = hovered || coarsePointer;

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

  // Swipe gesture — lets touch users change slides by dragging sideways.
  // We track start/end coordinates on touchstart/touchend and only treat
  // it as a slide change if horizontal delta dominates (so vertical scroll
  // from the page still works) and exceeds a small threshold.
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);
  const onTouchStart = (e: React.TouchEvent) => {
    const tch = e.touches[0];
    if (!tch) return;
    touchStartRef.current = { x: tch.clientX, y: tch.clientY };
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    const start = touchStartRef.current;
    touchStartRef.current = null;
    if (!start) return;
    const tch = e.changedTouches[0];
    if (!tch) return;
    const dx = tch.clientX - start.x;
    const dy = tch.clientY - start.y;
    const THRESHOLD = 36;
    if (Math.abs(dx) < THRESHOLD || Math.abs(dx) < Math.abs(dy)) return;
    // Suppress the parent Link's navigation for this tap when swiping.
    e.preventDefault();
    e.stopPropagation();
    go(dx < 0 ? 1 : -1);
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
    // On pointer devices: only show while hovering. On touch: always show
    // so users know slide navigation is available.
    opacity: chromeVisible ? 1 : 0,
    transition: "opacity 160ms ease-out",
  };

  // Arrows are bigger on coarse pointers to meet the 44px minimum target,
  // and sit at a lower opacity so they read as controls rather than
  // decoration (full opacity on hover).
  const arrowSize = coarsePointer ? 44 : 36;
  const arrowBase: CSSProperties = {
    position: "absolute",
    top: "50%",
    transform: "translateY(-50%)",
    width: arrowSize,
    height: arrowSize,
    borderRadius: swatchRadii.full,
    background: "rgba(255,255,255,0.95)",
    color: "#111",
    border: "none",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    opacity: hovered ? 1 : coarsePointer ? 0.8 : 0,
    pointerEvents: chromeVisible ? "auto" : "none",
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
    <div
      style={wrapperStyle}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      {/* Current slide */}
      <div key={currentSlide.key} style={slideStyle}>
        {currentSlide.render({
          manifest,
          brand,
          dsFont,
          ds,
          t,
          hovered,
          inView,
          coarsePointer,
        })}
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

      {/* Label pill — shows which slide you're on, bottom-center.
          On pointer devices it tracks hover; on touch it's always shown
          since touch users have no hover signal. */}
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
          opacity: chromeVisible ? 1 : 0,
          transition: "opacity 160ms ease-out",
        }}
      >
        {currentSlide.label}
      </div>
    </div>
  );
}
