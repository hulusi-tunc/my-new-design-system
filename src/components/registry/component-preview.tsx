"use client";

import type { CSSProperties, ReactNode } from "react";
import { useTheme } from "@/components/providers/theme-provider";
import { getNd } from "@/lib/nothing-tokens";
import type { DSTokens, DSTokenColors } from "@/lib/types";

/* ─── Token extractors ─────────────────────────────── */

function getBrandColor(colors: DSTokenColors): string {
  for (const key of ["brand", "primary", "blue", "indigo", "violet", "purple"]) {
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

function getBrandLight(colors: DSTokenColors): string {
  for (const key of ["brand", "primary", "blue", "indigo", "violet", "purple"]) {
    const scale = colors[key];
    if (scale && typeof scale === "object") {
      const record = scale as Record<string, string>;
      const shade = record["50"] ?? record["100"] ?? record["200"];
      if (shade) return shade;
    }
  }
  return "rgba(0,0,0,0.05)";
}

function getBrandDark(colors: DSTokenColors): string {
  for (const key of ["brand", "primary", "blue", "indigo", "violet", "purple"]) {
    const scale = colors[key];
    if (scale && typeof scale === "object") {
      const record = scale as Record<string, string>;
      const shade = record["700"] ?? record["800"] ?? record["600"];
      if (shade) return shade;
    }
  }
  return "#444444";
}

function getRadius(tokens: DSTokens, size: "sm" | "md" | "lg"): number {
  const full = tokens.radius.full;
  if (size === "sm") return Math.min(4, full);
  if (size === "lg") return Math.min(12, full);
  return Math.min(8, full);
}

function getFont(tokens: DSTokens): string {
  return tokens.typography.fontFamily || "system-ui, sans-serif";
}

/* ─── Render context ──────────────────────────────── */

interface Ctx {
  font: string;
  brand: string;
  brandLight: string;
  brandDark: string;
  radiusSm: number;
  radiusMd: number;
  radiusLg: number;
  surface: string;
  border: string;
  textPrimary: string;
  textSecondary: string;
  textDisabled: string;
}

/* ─── Renderers ───────────────────────────────────── */

const renderers: Record<string, (c: Ctx) => ReactNode> = {
  button: (c) => (
    <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
      <button
        type="button"
        style={{
          fontFamily: c.font,
          background: c.brand,
          color: "#ffffff",
          border: "none",
          borderRadius: c.radiusMd,
          padding: "9px 18px",
          fontSize: 13,
          fontWeight: 600,
          cursor: "default",
          letterSpacing: "-0.005em",
        }}
      >
        Get started
      </button>
      <button
        type="button"
        style={{
          fontFamily: c.font,
          background: "transparent",
          color: c.brand,
          border: `1.5px solid ${c.brand}`,
          borderRadius: c.radiusMd,
          padding: "7.5px 16px",
          fontSize: 13,
          fontWeight: 600,
          cursor: "default",
          letterSpacing: "-0.005em",
        }}
      >
        Learn more
      </button>
    </div>
  ),

  input: (c) => (
    <div style={{ display: "flex", flexDirection: "column", gap: 6, width: "100%" }}>
      <label
        style={{
          fontFamily: c.font,
          fontSize: 11,
          fontWeight: 500,
          color: c.textSecondary,
          letterSpacing: "0.01em",
        }}
      >
        Email
      </label>
      <input
        type="text"
        readOnly
        defaultValue="hello@hubera.dev"
        style={{
          fontFamily: c.font,
          background: c.surface,
          color: c.textPrimary,
          border: `1px solid ${c.border}`,
          borderRadius: c.radiusMd,
          padding: "10px 14px",
          fontSize: 13,
          outline: "none",
          width: "100%",
          maxWidth: 260,
          boxShadow: `0 0 0 3px ${hexToRgba(c.brand, 0.08)}`,
          borderColor: c.brand,
        }}
      />
    </div>
  ),

  textarea: (c) => (
    <textarea
      readOnly
      defaultValue={"Multi-line text input.\nSupports expansion and resize."}
      style={{
        fontFamily: c.font,
        background: c.surface,
        color: c.textPrimary,
        border: `1px solid ${c.border}`,
        borderRadius: c.radiusMd,
        padding: "10px 14px",
        fontSize: 13,
        outline: "none",
        resize: "none",
        width: "100%",
        maxWidth: 260,
        height: 64,
        lineHeight: 1.5,
      }}
    />
  ),

  badge: (c) => (
    <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
      <span
        style={{
          fontFamily: c.font,
          background: c.brandLight,
          color: c.brandDark,
          padding: "3px 10px",
          borderRadius: 999,
          fontSize: 11,
          fontWeight: 600,
        }}
      >
        New
      </span>
      <span
        style={{
          fontFamily: c.font,
          background: c.brand,
          color: "#ffffff",
          padding: "3px 10px",
          borderRadius: 999,
          fontSize: 11,
          fontWeight: 600,
        }}
      >
        Active
      </span>
      <span
        style={{
          fontFamily: c.font,
          background: "transparent",
          color: c.textSecondary,
          border: `1px solid ${c.border}`,
          padding: "2px 9px",
          borderRadius: 999,
          fontSize: 11,
          fontWeight: 500,
        }}
      >
        Draft
      </span>
    </div>
  ),

  badgegroup: (c) => (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
        background: c.brandLight,
        color: c.brandDark,
        padding: "3px 4px 3px 12px",
        borderRadius: 999,
        fontFamily: c.font,
        fontSize: 11,
        fontWeight: 600,
      }}
    >
      <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
        <span
          style={{
            width: 6,
            height: 6,
            borderRadius: "50%",
            background: c.brand,
          }}
        />
        Latest update
      </span>
      <span
        style={{
          background: c.surface,
          color: c.brand,
          padding: "2px 8px",
          borderRadius: 999,
          fontSize: 10,
          fontWeight: 600,
        }}
      >
        v2.0
      </span>
    </div>
  ),

  tag: (c) => (
    <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
      {["design", "tokens", "react"].map((tag) => (
        <span
          key={tag}
          style={{
            fontFamily: c.font,
            background: "transparent",
            color: c.brand,
            border: `1px solid ${c.brand}`,
            padding: "3px 10px",
            borderRadius: c.radiusSm,
            fontSize: 11,
            fontWeight: 500,
          }}
        >
          {tag}
        </span>
      ))}
    </div>
  ),

  tabs: (c) => (
    <div
      style={{
        display: "flex",
        gap: 0,
        borderBottom: `1px solid ${c.border}`,
        width: "100%",
      }}
    >
      {["Overview", "Tokens", "Specs"].map((label, i) => (
        <span
          key={label}
          style={{
            fontFamily: c.font,
            color: i === 0 ? c.brand : c.textSecondary,
            padding: "8px 16px",
            fontSize: 12,
            fontWeight: i === 0 ? 600 : 500,
            borderBottom: i === 0 ? `2px solid ${c.brand}` : "2px solid transparent",
            marginBottom: -1,
          }}
        >
          {label}
        </span>
      ))}
    </div>
  ),

  closebutton: (c) => (
    <button
      type="button"
      aria-label="Close"
      style={{
        width: 32,
        height: 32,
        borderRadius: 999,
        background: "transparent",
        border: `1px solid ${c.border}`,
        color: c.textPrimary,
        cursor: "default",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="6" x2="6" y2="18" />
        <line x1="6" y1="6" x2="18" y2="18" />
      </svg>
    </button>
  ),

  utilitybutton: (c) => (
    <button
      type="button"
      style={{
        fontFamily: c.font,
        background: "transparent",
        color: c.textPrimary,
        border: `1px solid ${c.border}`,
        borderRadius: c.radiusMd,
        padding: "8px 14px",
        fontSize: 12,
        fontWeight: 500,
        cursor: "default",
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
      }}
    >
      <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 5v14M5 12h14" />
      </svg>
      Add item
    </button>
  ),

  socialbutton: (c) => (
    <button
      type="button"
      style={{
        fontFamily: c.font,
        background: c.surface,
        color: c.textPrimary,
        border: `1px solid ${c.border}`,
        borderRadius: c.radiusMd,
        padding: "9px 16px",
        fontSize: 13,
        fontWeight: 600,
        cursor: "default",
        display: "inline-flex",
        alignItems: "center",
        gap: 10,
      }}
    >
      <svg width={14} height={14} viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
      </svg>
      Continue with GitHub
    </button>
  ),

  icon: (c) => (
    <div style={{ display: "flex", gap: 14, alignItems: "center", color: c.textPrimary }}>
      <svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <path d="M12 6v6l4 2" />
      </svg>
      <svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      </svg>
      <svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke={c.brand} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
      </svg>
    </div>
  ),

  verificationcodeinput: (c) => (
    <div style={{ display: "flex", gap: 8 }}>
      {["8", "4", "2", "1"].map((digit, i) => (
        <div
          key={i}
          style={{
            fontFamily: c.font,
            width: 36,
            height: 44,
            borderRadius: c.radiusMd,
            border: `1px solid ${i === 3 ? c.brand : c.border}`,
            background: c.surface,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 16,
            fontWeight: 600,
            color: c.textPrimary,
            boxShadow: i === 3 ? `0 0 0 3px ${hexToRgba(c.brand, 0.12)}` : undefined,
          }}
        >
          {digit}
        </div>
      ))}
    </div>
  ),

  appnavigation: (c) => (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 16,
        padding: "10px 14px",
        border: `1px solid ${c.border}`,
        borderRadius: c.radiusMd,
        background: c.surface,
        width: "100%",
        maxWidth: 320,
      }}
    >
      <span
        style={{
          width: 18,
          height: 18,
          background: c.brand,
          borderRadius: c.radiusSm,
          flexShrink: 0,
        }}
      />
      <span
        style={{
          fontFamily: c.font,
          fontSize: 12,
          fontWeight: 600,
          color: c.brand,
        }}
      >
        Home
      </span>
      <span
        style={{
          fontFamily: c.font,
          fontSize: 12,
          color: c.textSecondary,
        }}
      >
        About
      </span>
      <span
        style={{
          fontFamily: c.font,
          fontSize: 12,
          color: c.textSecondary,
        }}
      >
        Docs
      </span>
    </div>
  ),

  codeblock: (c) => (
    <pre
      style={{
        fontFamily: "ui-monospace, 'SFMono-Regular', Menlo, monospace",
        background: c.surface,
        border: `1px solid ${c.border}`,
        borderRadius: c.radiusMd,
        padding: "12px 14px",
        fontSize: 12,
        lineHeight: 1.5,
        color: c.textPrimary,
        margin: 0,
        width: "100%",
        maxWidth: 280,
        overflow: "hidden",
      }}
    >
      <span style={{ color: c.textSecondary }}>$ </span>
      <span style={{ color: c.brand }}>npm install</span>
      <span style={{ color: c.textPrimary }}> @hubera/core</span>
    </pre>
  ),

  designtip: (c) => (
    <div
      style={{
        display: "flex",
        gap: 12,
        padding: "12px 14px",
        background: c.brandLight,
        border: `1px solid ${hexToRgba(c.brand, 0.2)}`,
        borderRadius: c.radiusMd,
        width: "100%",
        maxWidth: 280,
      }}
    >
      <svg
        width={18}
        height={18}
        viewBox="0 0 24 24"
        fill="none"
        stroke={c.brand}
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{ flexShrink: 0, marginTop: 1 }}
      >
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="16" x2="12" y2="12" />
        <line x1="12" y1="8" x2="12.01" y2="8" />
      </svg>
      <div>
        <div
          style={{
            fontFamily: c.font,
            fontSize: 12,
            fontWeight: 600,
            color: c.brandDark,
            marginBottom: 2,
          }}
        >
          Pro tip
        </div>
        <div
          style={{
            fontFamily: c.font,
            fontSize: 11,
            color: c.brandDark,
            opacity: 0.85,
            lineHeight: 1.5,
          }}
        >
          Use semantic tokens, not raw hex values.
        </div>
      </div>
    </div>
  ),

  card: (c) => (
    <div
      style={{
        background: c.surface,
        border: `1px solid ${c.border}`,
        borderRadius: c.radiusLg,
        padding: 16,
        width: "100%",
        maxWidth: 240,
      }}
    >
      <div
        style={{
          fontFamily: c.font,
          fontSize: 13,
          fontWeight: 600,
          color: c.textPrimary,
          marginBottom: 4,
        }}
      >
        Card title
      </div>
      <div
        style={{
          fontFamily: c.font,
          fontSize: 12,
          color: c.textSecondary,
          lineHeight: 1.5,
        }}
      >
        A short description supporting the card title.
      </div>
    </div>
  ),

  switch: (c) => (
    <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
      <div
        style={{
          width: 36,
          height: 20,
          borderRadius: 999,
          background: c.brand,
          padding: 2,
          display: "flex",
          alignItems: "center",
          justifyContent: "flex-end",
        }}
      >
        <div
          style={{
            width: 16,
            height: 16,
            borderRadius: "50%",
            background: "#ffffff",
          }}
        />
      </div>
      <div
        style={{
          width: 36,
          height: 20,
          borderRadius: 999,
          background: c.border,
          padding: 2,
          display: "flex",
          alignItems: "center",
        }}
      >
        <div
          style={{
            width: 16,
            height: 16,
            borderRadius: "50%",
            background: c.surface,
          }}
        />
      </div>
    </div>
  ),

  checkbox: (c) => (
    <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
      <div
        style={{
          width: 18,
          height: 18,
          borderRadius: c.radiusSm,
          background: c.brand,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round">
          <polyline points="20 6 9 17 4 12" />
        </svg>
      </div>
      <div
        style={{
          width: 18,
          height: 18,
          borderRadius: c.radiusSm,
          border: `1.5px solid ${c.border}`,
        }}
      />
    </div>
  ),
};

/* ─── Helpers ─────────────────────────────────────── */

function hexToRgba(hex: string, alpha: number): string {
  // Handle non-hex colors gracefully
  if (!hex.startsWith("#")) return `rgba(0,0,0,${alpha})`;
  const cleaned = hex.replace("#", "");
  const full = cleaned.length === 3
    ? cleaned.split("").map((c) => c + c).join("")
    : cleaned;
  const r = parseInt(full.slice(0, 2), 16);
  const g = parseInt(full.slice(2, 4), 16);
  const b = parseInt(full.slice(4, 6), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

function normalizeName(name: string): string {
  return name.toLowerCase().replace(/[\s_-]/g, "");
}

/* ─── Public component ────────────────────────────── */

interface ComponentPreviewProps {
  name: string;
  tokens: DSTokens;
  /** Optional fixed height for the preview area */
  minHeight?: number;
}

export function ComponentPreview({ name, tokens, minHeight = 80 }: ComponentPreviewProps) {
  const { theme } = useTheme();
  const t = getNd(theme);

  const ctx: Ctx = {
    font: getFont(tokens),
    brand: getBrandColor(tokens.colors),
    brandLight: getBrandLight(tokens.colors),
    brandDark: getBrandDark(tokens.colors),
    radiusSm: getRadius(tokens, "sm"),
    radiusMd: getRadius(tokens, "md"),
    radiusLg: getRadius(tokens, "lg"),
    surface: t.surface,
    border: t.borderVisible,
    textPrimary: t.textPrimary,
    textSecondary: t.textSecondary,
    textDisabled: t.textDisabled,
  };

  const normalized = normalizeName(name);
  let renderer = renderers[normalized];

  // Fallback: try contains-match (e.g. "Search Input" → "input")
  if (!renderer) {
    for (const [key, fn] of Object.entries(renderers)) {
      if (normalized.includes(key)) {
        renderer = fn;
        break;
      }
    }
  }

  const containerStyle: CSSProperties = {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    minHeight,
    padding: 16,
    width: "100%",
  };

  if (renderer) {
    return <div style={containerStyle}>{renderer(ctx)}</div>;
  }

  // Generic fallback: show the component name in the DS's own font
  return (
    <div style={containerStyle}>
      <span
        style={{
          fontFamily: ctx.font,
          fontSize: 16,
          fontWeight: 500,
          color: ctx.textSecondary,
          letterSpacing: "-0.01em",
        }}
      >
        {name}
      </span>
    </div>
  );
}
