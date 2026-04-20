"use client";

import { useState, type CSSProperties } from "react";
import { useTheme } from "@/components/providers/theme-provider";
import { getNd, editorialFonts } from "@/lib/nothing-tokens";
import type { DSTokenColors } from "@/lib/types";

// ── Types ──────────────────────────────────────────

export type PaletteMode = "strip" | "full";

export interface ColorPalettePreviewProps {
  /** Token colors from a DSManifest */
  colors: DSTokenColors;
  /** "strip" = compact row for cards; "full" = grid for detail pages */
  mode?: PaletteMode;
}

// ── Helpers ────────────────────────────────────────

/** Check if a string is a renderable color (hex, rgb, hsl, oklch — not a var() reference) */
function isRenderableColor(value: string): boolean {
  return /^(?:#|rgb|hsl|oklch|color\()/i.test(value.trim());
}

/** Pick representative colors for the strip (one per scale, mid-range shade) */
function pickStripColors(
  tokenColors: DSTokenColors,
  maxSwatches = 8
): { label: string; hex: string }[] {
  const picks: { label: string; hex: string }[] = [];
  for (const [name, value] of Object.entries(tokenColors)) {
    if (typeof value === "string" && isRenderableColor(value)) {
      picks.push({ label: name, hex: value });
    } else if (typeof value === "object" && value !== null) {
      const entries = Object.entries(value).filter(([, v]) => isRenderableColor(v));
      if (entries.length === 0) continue;
      const midIdx = Math.floor(entries.length / 2);
      const [shade, hex] = entries[midIdx];
      picks.push({ label: `${name}.${shade}`, hex });
    }
    if (picks.length >= maxSwatches) break;
  }
  return picks;
}

// ── Strip-mode swatch (flex: 1, no gap) ────────────

function StripSwatch({
  hex,
  label,
}: {
  hex: string;
  label: string;
}) {
  const [hovered, setHovered] = useState(false);

  const style: CSSProperties = {
    position: "relative",
    flex: 1,
    height: "100%",
    background: hex,
    cursor: "default",
    transition: "flex 200ms ease",
  };

  const tooltipStyle: CSSProperties = {
    position: "absolute",
    bottom: "calc(100% + 6px)",
    left: "50%",
    transform: "translateX(-50%)",
    background: "rgba(0,0,0,0.85)",
    color: "#fff",
    fontSize: 11,
    fontWeight: 500,
    fontFamily: editorialFonts.mono,
    padding: "3px 8px",
    whiteSpace: "nowrap",
    pointerEvents: "none",
    opacity: hovered ? 1 : 0,
    transition: "opacity 120ms ease",
    zIndex: 10,
  };

  return (
    <div
      style={style}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      title={`${label}: ${hex}`}
    >
      {hovered && <div style={tooltipStyle}>{hex}</div>}
    </div>
  );
}

// ── Editorial swatch (full mode) ───────────────────

function EditorialSwatch({
  hex,
  shade,
  borderColor,
  textColor,
}: {
  hex: string;
  shade: string;
  borderColor: string;
  textColor: string;
}) {
  const wrapperStyle: CSSProperties = {
    display: "flex",
    flexDirection: "column",
    gap: 8,
    minWidth: 0,
  };

  const tileStyle: CSSProperties = {
    width: "100%",
    aspectRatio: "1 / 1",
    background: hex,
    border: `1px solid ${borderColor}`,
  };

  const hexStyle: CSSProperties = {
    fontFamily: editorialFonts.mono,
    fontSize: 10,
    letterSpacing: "0.04em",
    color: textColor,
    textTransform: "uppercase",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  };

  const shadeStyle: CSSProperties = {
    fontFamily: editorialFonts.mono,
    fontSize: 10,
    letterSpacing: "0.06em",
    color: textColor,
    textTransform: "uppercase",
    opacity: 0.6,
  };

  return (
    <div style={wrapperStyle} title={`${shade} ${hex}`}>
      <div style={tileStyle} />
      {shade && <div style={shadeStyle}>{shade}</div>}
      <div style={hexStyle}>{hex}</div>
    </div>
  );
}

// ── Main component ─────────────────────────────────

export function ColorPalettePreview({
  colors: tokenColors,
  mode = "strip",
}: ColorPalettePreviewProps) {
  const { theme } = useTheme();
  const t = getNd(theme);

  // ── Strip mode ───────────────────────────────────
  if (mode === "strip") {
    const stripColors = pickStripColors(tokenColors);

    const stripContainerStyle: CSSProperties = {
      display: "flex",
      gap: 0,
      height: 6,
      overflow: "hidden",
      border: `1px solid ${t.border}`,
    };

    return (
      <div style={stripContainerStyle}>
        {stripColors.map((c, i) => (
          <StripSwatch key={i} hex={c.hex} label={c.label} />
        ))}
      </div>
    );
  }

  // ── Full mode (editorial) ────────────────────────
  const allEntries = Object.entries(tokenColors).filter(([, value]) => {
    if (typeof value === "string") return isRenderableColor(value);
    if (typeof value === "object" && value !== null) {
      return Object.values(value).some((v) => isRenderableColor(v));
    }
    return false;
  });

  const containerStyle: CSSProperties = {
    display: "flex",
    flexDirection: "column",
    gap: 40,
  };

  const scaleHeaderStyle: CSSProperties = {
    display: "flex",
    alignItems: "baseline",
    justifyContent: "space-between",
    gap: 16,
    paddingBottom: 10,
    borderBottom: `1px solid ${t.border}`,
    marginBottom: 16,
  };

  const scaleNameStyle: CSSProperties = {
    fontFamily: editorialFonts.mono,
    fontSize: 11,
    letterSpacing: "0.08em",
    color: t.textPrimary,
    textTransform: "uppercase",
  };

  const scaleCountStyle: CSSProperties = {
    fontFamily: editorialFonts.mono,
    fontSize: 10,
    letterSpacing: "0.06em",
    color: t.textDisabled,
    textTransform: "uppercase",
  };

  const gridStyle: CSSProperties = {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(72px, 1fr))",
    gap: 16,
  };

  return (
    <div style={containerStyle}>
      {allEntries.map(([scaleName, value]) => {
        if (typeof value === "string") {
          return (
            <div key={scaleName}>
              <div style={scaleHeaderStyle}>
                <span style={scaleNameStyle}>{scaleName}</span>
                <span style={scaleCountStyle}>1 VALUE</span>
              </div>
              <div style={gridStyle}>
                <EditorialSwatch
                  hex={value}
                  shade=""
                  borderColor={t.border}
                  textColor={t.textSecondary}
                />
              </div>
            </div>
          );
        }
        if (typeof value === "object" && value !== null) {
          const shades = Object.entries(value).filter(([, hex]) =>
            isRenderableColor(hex)
          );
          return (
            <div key={scaleName}>
              <div style={scaleHeaderStyle}>
                <span style={scaleNameStyle}>{scaleName}</span>
                <span style={scaleCountStyle}>
                  {shades.length} {shades.length === 1 ? "SHADE" : "SHADES"}
                </span>
              </div>
              <div style={gridStyle}>
                {shades.map(([shade, hex]) => (
                  <EditorialSwatch
                    key={shade}
                    hex={hex}
                    shade={shade}
                    borderColor={t.border}
                    textColor={t.textSecondary}
                  />
                ))}
              </div>
            </div>
          );
        }
        return null;
      })}
    </div>
  );
}
