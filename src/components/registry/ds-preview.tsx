"use client";

import { useMemo } from "react";
import { useTheme } from "@/components/providers/theme-provider";
import { getNd } from "@/lib/nothing-tokens";
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
    if (result.length >= 6) break;
  }

  if (result.length < 6) {
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
      if (result.length >= 6) break;
    }
  }

  return result.slice(0, 6);
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

  const dsFont =
    manifest.tokens.typography.fontFamily || "system-ui, sans-serif";

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        gap: 20,
        padding: "28px 24px",
        background: t.surfaceRaised,
        width: "100%",
        minHeight: 200,
        overflow: "hidden",
      }}
    >
      {/* Top row: buttons + typography */}
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          gap: 20,
          overflow: "hidden",
        }}
      >
        {/* Button samples */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 6,
            flexShrink: 0,
          }}
        >
          <span
            style={{
              fontFamily:
                "'Space Mono', var(--font-space-mono), monospace",
              fontSize: 10,
              letterSpacing: "0.08em",
              color: t.textDisabled,
            }}
          >
            BUTTONS
          </span>
          <div style={{ display: "flex", gap: 8 }}>
            <span
              style={{
                padding: "5px 14px",
                fontSize: 11,
                fontWeight: 500,
                fontFamily: dsFont,
                color: "#fff",
                background: brandColor,
                border: "none",
                borderRadius: 6,
                whiteSpace: "nowrap",
              }}
            >
              Button
            </span>
            <span
              style={{
                padding: "5px 14px",
                fontSize: 11,
                fontWeight: 500,
                fontFamily: dsFont,
                color: brandColor,
                background: "transparent",
                border: `1.5px solid ${brandColor}`,
                borderRadius: 6,
                whiteSpace: "nowrap",
              }}
            >
              Button
            </span>
          </div>
        </div>

        {/* Typography sample */}
        <div style={{ flex: 1, minWidth: 0, overflow: "hidden" }}>
          <span
            style={{
              fontFamily:
                "'Space Mono', var(--font-space-mono), monospace",
              fontSize: 10,
              letterSpacing: "0.08em",
              color: t.textDisabled,
              display: "block",
              marginBottom: 4,
            }}
          >
            TYPOGRAPHY
          </span>
          <p
            style={{
              fontSize: 28,
              fontWeight: 700,
              fontFamily: dsFont,
              color: t.textDisplay,
              lineHeight: 1.1,
              margin: 0,
              letterSpacing: "-0.02em",
            }}
          >
            Aa
          </p>
          <p
            style={{
              fontSize: 11,
              fontFamily: dsFont,
              color: t.textSecondary,
              lineHeight: 1.4,
              margin: "4px 0 0",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            The quick brown fox jumps over the lazy dog.
          </p>
        </div>
      </div>

      {/* Color swatches */}
      {swatches.length > 0 && (
        <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
          {swatches.map((color, i) => (
            <div
              key={i}
              style={{
                width: 14,
                height: 14,
                borderRadius: "50%",
                background: color,
                border: `1px solid ${t.border}`,
                flexShrink: 0,
              }}
              title={color}
            />
          ))}
          <span
            style={{
              fontFamily:
                "'Space Mono', var(--font-space-mono), monospace",
              fontSize: 10,
              letterSpacing: "0.04em",
              color: t.textDisabled,
              marginLeft: 4,
            }}
          >
            {swatches.length} SCALES
          </span>
        </div>
      )}
    </div>
  );
}
