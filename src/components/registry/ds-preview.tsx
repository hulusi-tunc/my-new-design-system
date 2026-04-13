"use client";

import { useMemo, type CSSProperties } from "react";
import { useTheme } from "@/components/providers/theme-provider";
import { getNd, editorialFonts } from "@/lib/nothing-tokens";
import { ComponentPreview } from "@/components/registry/component-preview";
import type { DSManifest, DSTokenColors } from "@/lib/types";

/* ── Helpers ────────────────────────────────────────── */

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
  return "#666666";
}

function extractSwatches(colors: DSTokenColors): string[] {
  const result: string[] = [];
  const seen = new Set<string>();
  const priorityKeys = ["brand", "primary", "secondary", "error", "warning", "success"];

  for (const key of priorityKeys) {
    const scale = colors[key];
    if (scale && typeof scale === "object") {
      const record = scale as Record<string, string>;
      const shade = record["500"] ?? record["600"] ?? Object.values(record)[0];
      if (shade && !seen.has(shade)) {
        result.push(shade);
        seen.add(shade);
      }
    }
    if (result.length >= 5) break;
  }

  if (result.length < 5) {
    for (const [key, value] of Object.entries(colors)) {
      if (priorityKeys.includes(key)) continue;
      if (value && typeof value === "object") {
        const record = value as Record<string, string>;
        const shade = record["500"] ?? record["600"] ?? Object.values(record)[0];
        if (shade && !seen.has(shade)) {
          result.push(shade);
          seen.add(shade);
        }
      }
      if (result.length >= 5) break;
    }
  }

  return result.slice(0, 5);
}

/**
 * Pick the most visually representative component for a catalog thumbnail.
 * Prefers rich, differentiated components over plain buttons.
 */
function pickFeaturedComponent(manifest: DSManifest): string | null {
  if (!manifest.components.length) return null;

  const names = manifest.components.map((c) => c.name);
  const priorities = [
    /metric\s*card/i,
    /status\s*badge/i,
    /fancy\s*button/i,
    /step\s*indicator/i,
    /verification\s*code/i,
    /design\s*tip/i,
    /badge\s*group/i,
    /dropdown\s*menu/i,
    /table/i,
    /card/i,
    /badge/i,
    /input/i,
    /button/i,
  ];

  for (const pattern of priorities) {
    const found = names.find((n) => pattern.test(n));
    if (found) return found;
  }

  return names[0];
}

/* ── DSPreview ──────────────────────────────────────── */

export function DSPreview({ manifest }: { manifest: DSManifest }) {
  const { theme } = useTheme();
  const t = getNd(theme);

  const brandColor = useMemo(
    () => extractBrandColor(manifest.tokens.colors),
    [manifest.tokens.colors]
  );
  const swatches = useMemo(
    () => extractSwatches(manifest.tokens.colors),
    [manifest.tokens.colors]
  );
  const featured = useMemo(
    () => pickFeaturedComponent(manifest),
    [manifest]
  );

  const dsFont =
    manifest.tokens.typography.fontFamily || "system-ui, sans-serif";

  /* ── Style fragments ───────────────────────────── */

  const containerStyle: CSSProperties = {
    display: "flex",
    flexDirection: "column",
    background: theme === "dark" ? t.surfaceInk : "rgb(250, 250, 252)",
    width: "100%",
    minHeight: 220,
    overflow: "hidden",
    position: "relative",
  };

  // Subtle dot-grid pattern for the preview bg
  const dotPatternStyle: CSSProperties = {
    position: "absolute",
    inset: 0,
    backgroundImage: `radial-gradient(${t.border} 1px, transparent 1px)`,
    backgroundSize: "18px 18px",
    opacity: 0.6,
    pointerEvents: "none",
  };

  // Featured component area
  const previewStageStyle: CSSProperties = {
    flex: 1,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "28px 24px 16px",
    position: "relative",
    zIndex: 1,
    minHeight: 140,
  };

  // Meta footer strip
  const metaStyle: CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: 12,
    padding: "12px 20px",
    borderTop: `1px solid ${t.border}`,
    background: t.surface,
    position: "relative",
    zIndex: 1,
    flexWrap: "wrap",
  };

  const labelStyle: CSSProperties = {
    fontFamily: editorialFonts.mono,
    fontSize: 10,
    letterSpacing: "0.06em",
    color: t.textDisabled,
    textTransform: "uppercase",
  };

  const valueStyle: CSSProperties = {
    fontFamily: editorialFonts.mono,
    fontSize: 10,
    letterSpacing: "0.06em",
    color: t.textSecondary,
    textTransform: "uppercase",
    fontWeight: 600,
  };

  // Font name shown in the DS's own font to "teach" what the font looks like
  const fontSampleStyle: CSSProperties = {
    fontFamily: dsFont,
    fontSize: 14,
    fontWeight: 600,
    color: t.textPrimary,
    letterSpacing: "-0.01em",
  };

  const swatchDotStyle = (color: string): CSSProperties => ({
    width: 10,
    height: 10,
    borderRadius: "50%",
    background: color,
    border: `1px solid ${t.border}`,
    flexShrink: 0,
  });

  return (
    <div style={containerStyle}>
      <div style={dotPatternStyle} />

      {/* Featured component stage */}
      <div style={previewStageStyle}>
        {featured ? (
          <ComponentPreview name={featured} tokens={manifest.tokens} />
        ) : (
          <span
            style={{
              fontFamily: dsFont,
              fontSize: 32,
              fontWeight: 700,
              color: t.textPrimary,
              letterSpacing: "-0.02em",
            }}
          >
            {manifest.name.charAt(0)}a
          </span>
        )}
      </div>

      {/* Meta footer: font + swatches */}
      <div style={metaStyle}>
        {/* Font name in the DS's own font */}
        <span style={fontSampleStyle}>
          {manifest.tokens.typography.fontFamily || "System"}
        </span>

        <span style={{ flex: 1 }} />

        {/* Color swatches */}
        {swatches.length > 0 && (
          <div style={{ display: "flex", gap: 5, alignItems: "center" }}>
            {swatches.map((color, i) => (
              <div key={i} style={swatchDotStyle(color)} title={color} />
            ))}
          </div>
        )}

        <span style={labelStyle}>·</span>
        <span style={valueStyle}>
          {manifest.components.length}
          <span style={{ color: t.textDisabled, fontWeight: 400 }}>
            {" "}
            COMPS
          </span>
        </span>
      </div>
    </div>
  );
}
