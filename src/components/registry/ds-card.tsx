"use client";

import { useState } from "react";
import Link from "next/link";
import { useTheme } from "@/components/providers/theme-provider";
import { getNd, editorialFonts, swatchRadii } from "@/lib/nothing-tokens";
import { DSPreviewCarousel } from "@/components/registry/ds-preview-carousel";
import type { DSManifest } from "@/lib/types";

interface DSCardProps {
  manifest: DSManifest;
  forkCount?: number;
}

/**
 * Mobbin-style card. Large visual card (preview fills the box),
 * brand dot + name + description sit BELOW the card (outside its bounds).
 */
export function DSCard({ manifest, forkCount = 0 }: DSCardProps) {
  const { theme } = useTheme();
  const t = getNd(theme);
  const [hover, setHover] = useState(false);

  // Try to extract a single brand dot color from manifest tokens
  const brandDot = extractBrandColor(manifest.tokens?.colors, t.accent);

  return (
    <Link
      href={`/ds/${manifest.slug}`}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 14,
        textDecoration: "none",
        color: "inherit",
      }}
    >
      {/* Card: large visual carousel preview */}
      <div
        style={{
          aspectRatio: "4 / 3",
          borderRadius: swatchRadii.lg,
          border: `1px solid ${hover ? t.borderVisible : t.border}`,
          overflow: "hidden",
          position: "relative",
          transition:
            "border-color 160ms ease-out, transform 200ms ease-out",
          transform: hover ? "translateY(-2px)" : "translateY(0)",
        }}
      >
        <DSPreviewCarousel manifest={manifest} hovered={hover} />

        {/* Tiny top-left badge — only for forks, subtle */}
        {manifest.parent !== null && (
          <span
            style={{
              position: "absolute",
              top: 12,
              left: 12,
              fontFamily: editorialFonts.body,
              fontSize: 10,
              fontWeight: 500,
              color: t.textSecondary,
              background: "rgba(0,0,0,0.5)",
              border: `1px solid ${t.border}`,
              borderRadius: swatchRadii.sm,
              padding: "3px 8px",
              lineHeight: 1.2,
              letterSpacing: "0.02em",
              backdropFilter: "blur(4px)",
              zIndex: 4,
            }}
          >
            Fork
          </span>
        )}
      </div>

      {/* Below the card: brand dot + name + description */}
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          gap: 10,
          padding: "0 2px",
        }}
      >
        <span
          style={{
            width: 22,
            height: 22,
            borderRadius: swatchRadii.sm,
            background: brandDot,
            flexShrink: 0,
            marginTop: 2,
          }}
          aria-hidden
        />
        <div style={{ minWidth: 0, flex: 1 }}>
          <h3
            style={{
              margin: 0,
              fontFamily: editorialFonts.body,
              fontSize: 15,
              fontWeight: 600,
              lineHeight: 1.3,
              color: t.textDisplay,
              letterSpacing: "-0.01em",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {manifest.name}
          </h3>
          <p
            style={{
              margin: "2px 0 0",
              fontFamily: editorialFonts.body,
              fontSize: 13,
              lineHeight: 1.4,
              color: t.textSecondary,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {shortDescription(manifest.description)}
          </p>
        </div>
        {forkCount > 0 && (
          <span
            style={{
              fontFamily: editorialFonts.mono,
              fontSize: 11,
              color: t.textDisabled,
              marginTop: 4,
              flexShrink: 0,
            }}
          >
            {forkCount}
          </span>
        )}
      </div>
    </Link>
  );
}

/* ── helpers ──────────────────────────────────────── */

function shortDescription(desc: string): string {
  // Grab first sentence or first ~60 chars
  const firstSentence = desc.split(".")[0];
  if (firstSentence.length <= 70) return firstSentence;
  return firstSentence.slice(0, 67).trimEnd() + "...";
}

function extractBrandColor(
  colors: Record<string, Record<string, string> | string> | undefined,
  fallback: string
): string {
  if (!colors) return fallback;
  for (const key of ["brand", "primary", "blue", "accent"]) {
    const scale = colors[key];
    if (scale && typeof scale === "object") {
      const record = scale as Record<string, string>;
      const shade =
        record["500"] ??
        record["600"] ??
        record["base"] ??
        Object.values(record)[0];
      if (shade) return shade;
    }
  }
  for (const value of Object.values(colors)) {
    if (value && typeof value === "object") {
      const record = value as Record<string, string>;
      const shade =
        record["500"] ??
        record["600"] ??
        record["base"] ??
        Object.values(record)[0];
      if (shade) return shade;
    }
  }
  return fallback;
}

/* Loading placeholder */
export function DSCardSkeleton() {
  const { theme } = useTheme();
  const t = getNd(theme);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div
        style={{
          aspectRatio: "4 / 3",
          background: t.surface,
          border: `1px solid ${t.border}`,
          borderRadius: swatchRadii.lg,
          animation: "swatchPulse 1200ms ease-in-out infinite",
        }}
      />
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          padding: "0 2px",
        }}
      >
        <div
          style={{
            width: 22,
            height: 22,
            borderRadius: swatchRadii.sm,
            background: t.surface,
          }}
        />
        <div style={{ flex: 1 }}>
          <div
            style={{
              height: 12,
              width: "60%",
              background: t.surface,
              borderRadius: swatchRadii.sm,
              marginBottom: 6,
            }}
          />
          <div
            style={{
              height: 10,
              width: "80%",
              background: t.surface,
              borderRadius: swatchRadii.sm,
            }}
          />
        </div>
      </div>
      <style jsx>{`
        @keyframes swatchPulse {
          0%,
          100% {
            opacity: 0.7;
          }
          50% {
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}
