"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useTheme } from "@/components/providers/theme-provider";
import { getNd, editorialFonts, swatchRadii } from "@/lib/nothing-tokens";
import { DSPreviewCarousel } from "@/components/registry/ds-preview-carousel";
import { getThemeSupport, type ThemeSupport } from "@/lib/theme-support";
import type { DSManifest } from "@/lib/types";
import SunLineIcon from "remixicon-react/SunLineIcon";
import MoonLineIcon from "remixicon-react/MoonLineIcon";
import ContrastLineIcon from "remixicon-react/ContrastLineIcon";

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

  // Lazy flag — becomes true once the card has ever entered the viewport.
  // Passed to the carousel so the heavy live-component Sandpack iframe on the
  // Components slide only mounts for cards the user can actually see.
  const rootRef = useRef<HTMLDivElement | null>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    if (inView) return;
    const el = rootRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setInView(true);
          io.disconnect();
        }
      },
      { rootMargin: "200px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [inView]);

  // Try to extract a single brand dot color from manifest tokens
  const brandDot = extractBrandColor(manifest.tokens?.colors, t.accent);

  const themeSupport = getThemeSupport(manifest);

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
      {/* Card: large visual carousel preview.
          `containerType: inline-size` lets slide contents scale with the card's
          rendered width via `cqw` units, so the preview looks right across the
          3-col / 2-col / 1-col responsive grid. No border — the uniform warm-
          gray card background (set inside the carousel) separates it from the
          page. */}
      <div
        ref={rootRef}
        style={{
          aspectRatio: "4 / 3",
          borderRadius: 20,
          border: "none",
          overflow: "hidden",
          position: "relative",
          transition: "transform 200ms ease-out",
          transform: hover ? "translateY(-2px)" : "translateY(0)",
          containerType: "inline-size",
        }}
      >
        <DSPreviewCarousel manifest={manifest} hovered={hover} inView={inView} />

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
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 10,
            marginTop: 4,
            flexShrink: 0,
            color: t.textDisabled,
          }}
        >
          <ThemeSupportMark support={themeSupport} color={t.textDisabled} />
          {forkCount > 0 && (
            <span
              style={{
                fontFamily: editorialFonts.mono,
                fontSize: 11,
                color: t.textDisabled,
              }}
            >
              {forkCount}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}

/* ── theme-support mark ────────────────────────────
   Quiet inline glyph in the card meta row, sized to match fork count etc.
   No pill, no backdrop — just the icon, inheriting the muted meta color. */

function ThemeSupportMark({
  support,
  color,
}: {
  support: ThemeSupport;
  color: string;
}) {
  const cfg = (() => {
    if (support === "both") {
      return { label: "Light & dark mode", icon: <ContrastLineIcon size={13} /> };
    }
    if (support === "dark") {
      return { label: "Dark mode only", icon: <MoonLineIcon size={13} /> };
    }
    return { label: "Light mode only", icon: <SunLineIcon size={13} /> };
  })();

  return (
    <span
      aria-label={cfg.label}
      title={cfg.label}
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        color,
        lineHeight: 0,
      }}
    >
      {cfg.icon}
    </span>
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
