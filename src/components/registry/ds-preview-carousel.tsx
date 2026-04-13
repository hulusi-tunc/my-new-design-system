"use client";

import { useMemo, useState, useCallback, type CSSProperties } from "react";
import { useTheme } from "@/components/providers/theme-provider";
import { getNd, editorialFonts, swatchRadii } from "@/lib/nothing-tokens";
import type { DSManifest, DSTokenColors } from "@/lib/types";

// Remix icons
import ArrowLeftSLineIcon from "remixicon-react/ArrowLeftSLineIcon";
import ArrowRightSLineIcon from "remixicon-react/ArrowRightSLineIcon";
import CheckLineIcon from "remixicon-react/CheckLineIcon";

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
};

function TypographySlide({ manifest, dsFont }: SlideProps) {
  const { theme } = useTheme();
  const t = getNd(theme);
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        gap: 10,
        padding: 28,
      }}
    >
      <p
        style={{
          fontSize: 96,
          fontWeight: 700,
          fontFamily: dsFont,
          color: t.textDisplay,
          lineHeight: 0.95,
          margin: 0,
          letterSpacing: "-0.04em",
        }}
      >
        Aa
      </p>
      <p
        style={{
          fontSize: 13,
          fontFamily: dsFont,
          color: t.textSecondary,
          lineHeight: 1.4,
          margin: 0,
          textAlign: "center",
        }}
      >
        {manifest.tokens.typography.fontFamily ?? "Sans"}
      </p>
    </div>
  );
}

function ButtonsSlide({ brand, dsFont }: SlideProps) {
  const { theme } = useTheme();
  const t = getNd(theme);
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        gap: 14,
        padding: 28,
      }}
    >
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", justifyContent: "center" }}>
        <span
          style={{
            padding: "9px 18px",
            fontSize: 13,
            fontWeight: 500,
            fontFamily: dsFont,
            color: "#fff",
            background: brand,
            borderRadius: 8,
            border: "none",
          }}
        >
          Primary
        </span>
        <span
          style={{
            padding: "9px 18px",
            fontSize: 13,
            fontWeight: 500,
            fontFamily: dsFont,
            color: brand,
            background: "transparent",
            border: `1.5px solid ${brand}`,
            borderRadius: 8,
          }}
        >
          Secondary
        </span>
      </div>
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", justifyContent: "center" }}>
        <span
          style={{
            padding: "7px 14px",
            fontSize: 12,
            fontWeight: 500,
            fontFamily: dsFont,
            color: t.textPrimary,
            background: t.surfaceInk,
            borderRadius: 6,
            border: `1px solid ${t.border}`,
          }}
        >
          Ghost
        </span>
        <span
          style={{
            padding: "7px 14px",
            fontSize: 12,
            fontWeight: 500,
            fontFamily: dsFont,
            color: t.textDisabled,
            borderRadius: 6,
            border: `1px dashed ${t.border}`,
          }}
        >
          Disabled
        </span>
      </div>
    </div>
  );
}

function ColorsSlide({ manifest, brand }: SlideProps) {
  const palette = useMemo(
    () => extractPalette(manifest.tokens.colors, 18),
    [manifest.tokens.colors]
  );
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "grid",
        gridTemplateColumns: "repeat(6, 1fr)",
        gap: 6,
        padding: 24,
        alignContent: "center",
      }}
    >
      {palette.length > 0
        ? palette.map((c, i) => (
            <div
              key={`${c}-${i}`}
              style={{
                aspectRatio: "1 / 1",
                background: c,
                borderRadius: 6,
              }}
            />
          ))
        : Array.from({ length: 18 }).map((_, i) => (
            <div
              key={i}
              style={{
                aspectRatio: "1 / 1",
                background: brand,
                opacity: 0.15 + (i % 6) * 0.12,
                borderRadius: 6,
              }}
            />
          ))}
    </div>
  );
}

function ComponentsSlide({ manifest, brand, dsFont }: SlideProps) {
  const { theme } = useTheme();
  const t = getNd(theme);
  const count = manifest.components.length;
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        gap: 12,
        padding: 28,
      }}
    >
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", justifyContent: "center" }}>
        {/* Checkbox */}
        <span
          style={{
            width: 18,
            height: 18,
            background: brand,
            borderRadius: 4,
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#fff",
          }}
        >
          <CheckLineIcon size={12} color="#fff" />
        </span>
        {/* Badge */}
        <span
          style={{
            padding: "3px 8px",
            fontSize: 10,
            fontFamily: dsFont,
            fontWeight: 500,
            color: brand,
            background: "transparent",
            border: `1px solid ${brand}`,
            borderRadius: 999,
          }}
        >
          Badge
        </span>
        {/* Input */}
        <span
          style={{
            padding: "4px 10px",
            fontSize: 11,
            fontFamily: dsFont,
            color: t.textSecondary,
            background: t.surfaceInk,
            border: `1px solid ${t.border}`,
            borderRadius: 6,
            minWidth: 60,
          }}
        >
          Input
        </span>
      </div>
      <div
        style={{
          fontFamily: editorialFonts.mono,
          fontSize: 10,
          letterSpacing: "0.06em",
          color: t.textDisabled,
          textTransform: "uppercase",
          marginTop: 4,
        }}
      >
        {count} component{count === 1 ? "" : "s"}
      </div>
    </div>
  );
}

/* ── Carousel ───────────────────────────────────────── */

export type CarouselSlide = {
  key: string;
  label: string;
  render: (props: SlideProps) => React.ReactElement;
};

const SLIDES: CarouselSlide[] = [
  { key: "typography", label: "Typography", render: (p) => <TypographySlide {...p} /> },
  { key: "buttons", label: "Buttons", render: (p) => <ButtonsSlide {...p} /> },
  { key: "colors", label: "Colors", render: (p) => <ColorsSlide {...p} /> },
  { key: "components", label: "Components", render: (p) => <ComponentsSlide {...p} /> },
];

export function DSPreviewCarousel({
  manifest,
  hovered,
}: {
  manifest: DSManifest;
  hovered: boolean;
}) {
  const { theme } = useTheme();
  const t = getNd(theme);
  const [index, setIndex] = useState(0);

  const brand = useMemo(
    () => extractBrandColor(manifest.tokens.colors),
    [manifest.tokens.colors]
  );
  const dsFont = manifest.tokens.typography.fontFamily || "system-ui, sans-serif";

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

  const wrapperStyle: CSSProperties = {
    position: "relative",
    width: "100%",
    height: "100%",
    background: t.surfaceRaised,
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
    boxShadow: "0 2px 8px rgba(0,0,0,0.18)",
    opacity: hovered ? 1 : 0,
    pointerEvents: hovered ? "auto" : "none",
    transition: "opacity 160ms ease-out, transform 160ms ease-out, background 120ms ease-out",
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
        {currentSlide.render({ manifest, brand, dsFont })}
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
                i === index ? t.textDisplay : "rgba(255,255,255,0.25)",
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

      {/* Label pill — shows which slide you're on, bottom-center */}
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
          opacity: hovered ? 1 : 0,
          transition: "opacity 160ms ease-out",
          pointerEvents: "none",
          zIndex: 2,
        }}
      >
        {currentSlide.label}
      </div>
    </div>
  );
}
