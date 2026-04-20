"use client";

import { type CSSProperties } from "react";
import { useTheme } from "@/components/providers/theme-provider";
import { getNd, editorialFonts } from "@/lib/nothing-tokens";
import { ColorPalettePreview } from "@/components/registry/color-palette-preview";
import type { DSTokens } from "@/lib/types";

/**
 * Shared token-preview components rendered in the explorer's Foundations
 * section. These mirror the old Tokens tab's specimens but are designed to
 * live inside the explorer's preview pane.
 */

interface FoundationProps {
  tokens: DSTokens;
}

/* ── Colors ──────────────────────────────────────── */

export function ColorsFoundation({ tokens }: FoundationProps) {
  return <ColorPalettePreview colors={tokens.colors} mode="full" />;
}

/* ── Typography ──────────────────────────────────── */

export function TypographyFoundation({ tokens }: FoundationProps) {
  const { theme } = useTheme();
  const t = getNd(theme);
  const typography = tokens.typography;

  const fontStack =
    typography.fontFamily && typography.fontFamily.length > 0
      ? `${typography.fontFamily}, ${editorialFonts.body}`
      : editorialFonts.body;

  const weights: { weight: number; label: string }[] = (typography.weights ?? [])
    .map((w) => ({ weight: Number(w), label: weightLabel(Number(w)) }))
    .filter((w) => !Number.isNaN(w.weight));

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
      {/* Hero specimen */}
      <div
        style={{
          fontFamily: fontStack,
          fontSize: "clamp(64px, 9vw, 112px)",
          fontWeight: 400,
          letterSpacing: "-0.03em",
          lineHeight: 0.95,
          color: t.textDisplay,
        }}
      >
        Aa
      </div>

      {/* Family meta */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: 32,
        }}
      >
        <MetaColumn label="Family" value={typography.fontFamily || "System"} t={t} />
        <MetaColumn label="Scale steps" value={`${typography.scaleSteps}`} t={t} />
        <MetaColumn
          label="Weights"
          value={(typography.weights ?? []).join(", ") || "—"}
          t={t}
        />
      </div>

      {/* Weight specimens */}
      {weights.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {weights.map((w) => (
            <div
              key={w.weight}
              style={{
                display: "grid",
                gridTemplateColumns: "120px 1fr",
                gap: 24,
                alignItems: "baseline",
                padding: "12px 0",
                borderTop: `1px solid ${t.border}`,
              }}
            >
              <span
                style={{
                  fontFamily: editorialFonts.mono,
                  fontSize: 11,
                  letterSpacing: "0.06em",
                  color: t.textDisabled,
                  textTransform: "uppercase",
                }}
              >
                {w.weight} · {w.label}
              </span>
              <span
                style={{
                  fontFamily: fontStack,
                  fontSize: 24,
                  fontWeight: w.weight,
                  color: t.textDisplay,
                  letterSpacing: "-0.01em",
                }}
              >
                The quick brown fox jumps over the lazy dog.
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function weightLabel(w: number): string {
  if (w <= 200) return "Extralight";
  if (w <= 300) return "Light";
  if (w <= 400) return "Regular";
  if (w <= 500) return "Medium";
  if (w <= 600) return "Semibold";
  if (w <= 700) return "Bold";
  if (w <= 800) return "Extrabold";
  return "Black";
}

/* ── Spacing ─────────────────────────────────────── */

export function SpacingFoundation({ tokens }: FoundationProps) {
  const { theme } = useTheme();
  const t = getNd(theme);
  const spacing = tokens.spacing;

  const unitNum = parseInt(spacing.unit, 10) || 4;
  const sampleSteps = Math.min(spacing.steps, 12);
  const items: { label: string; px: number }[] = [];
  for (let i = 1; i <= sampleSteps; i++) {
    items.push({ label: String(i), px: unitNum * i });
  }
  const maxPx = items[items.length - 1]?.px ?? 1;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: 32,
        }}
      >
        <MetaColumn label="Base unit" value={spacing.unit} t={t} />
        <MetaColumn label="Steps" value={`${spacing.steps}`} t={t} />
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {items.map((item) => (
          <div
            key={item.label}
            style={{
              display: "grid",
              gridTemplateColumns: "48px 1fr 80px",
              alignItems: "center",
              gap: 24,
            }}
          >
            <span
              style={{
                fontFamily: editorialFonts.mono,
                fontSize: 11,
                letterSpacing: "0.06em",
                color: t.textDisabled,
                textTransform: "uppercase",
              }}
            >
              {item.label.padStart(2, "0")}
            </span>
            <div
              style={{
                height: 12,
                width: `${(item.px / maxPx) * 100}%`,
                background: t.textDisplay,
                minWidth: 4,
                borderRadius: 2,
              }}
            />
            <span
              style={{
                fontFamily: editorialFonts.mono,
                fontSize: 11,
                letterSpacing: "0.04em",
                color: t.textSecondary,
                textTransform: "uppercase",
                textAlign: "right",
              }}
            >
              {item.px}PX
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Radius ──────────────────────────────────────── */

export function RadiusFoundation({ tokens }: FoundationProps) {
  const { theme } = useTheme();
  const t = getNd(theme);
  const radius = tokens.radius;

  const steps = Math.max(1, radius.steps);
  const items: { label: string; r: number }[] = [];
  for (let i = 0; i < steps; i++) {
    const ratio = steps === 1 ? 1 : i / (steps - 1);
    const r = Math.round(ratio * Math.min(radius.full, 32));
    items.push({ label: String(i + 1), r });
  }
  items.push({ label: "FULL", r: radius.full });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 32 }}>
        <MetaColumn label="Steps" value={`${radius.steps}`} t={t} />
        <MetaColumn label="Full" value={`${radius.full}px`} t={t} />
      </div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(96px, 1fr))",
          gap: 24,
        }}
      >
        {items.map((item) => (
          <div
            key={item.label}
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 10,
              alignItems: "flex-start",
            }}
          >
            <div
              style={{
                width: 72,
                height: 72,
                background: t.textDisplay,
                borderRadius: item.label === "FULL" ? "50%" : item.r,
              }}
            />
            <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <span
                style={{
                  fontFamily: editorialFonts.mono,
                  fontSize: 11,
                  letterSpacing: "0.06em",
                  color: t.textPrimary,
                  textTransform: "uppercase",
                }}
              >
                {item.label}
              </span>
              <span
                style={{
                  fontFamily: editorialFonts.mono,
                  fontSize: 10,
                  letterSpacing: "0.04em",
                  color: t.textDisabled,
                  textTransform: "uppercase",
                }}
              >
                {item.label === "FULL" ? `${radius.full}PX` : `${item.r}PX`}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Meta column helper ──────────────────────────── */

function MetaColumn({
  label,
  value,
  t,
}: {
  label: string;
  value: string;
  t: ReturnType<typeof getNd>;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      <span
        style={{
          fontFamily: editorialFonts.body,
          fontSize: 12,
          color: t.textDisabled,
        }}
      >
        {label}
      </span>
      <span
        style={{
          fontFamily: editorialFonts.body,
          fontSize: 14,
          fontWeight: 500,
          color: t.textPrimary,
        }}
      >
        {value}
      </span>
    </div>
  );
}

/* ── Foundation registry ─────────────────────────── */

export interface FoundationEntry {
  key: string;
  name: string;
  Render: React.ComponentType<FoundationProps>;
}

export const FOUNDATION_ENTRIES: FoundationEntry[] = [
  { key: "colors", name: "Colors", Render: ColorsFoundation },
  { key: "typography", name: "Typography", Render: TypographyFoundation },
  { key: "spacing", name: "Spacing", Render: SpacingFoundation },
  { key: "radius", name: "Radius", Render: RadiusFoundation },
];
