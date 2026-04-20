"use client";

import type { CSSProperties, ReactNode } from "react";
import { useTheme } from "@/components/providers/theme-provider";
import {
  resolveDsTokens,
  type ResolvedDsTokens,
} from "@/lib/resolve-ds-tokens";
import type { DSTokens } from "@/lib/types";

/**
 * ComponentPreview renders a mock of a specific named component using
 * ONLY the design system's own resolved tokens.
 *
 * The preview never falls back to Hubera's own theme — surfaces, borders,
 * text colors, typography, radii all come from the DS manifest. This is
 * what makes each DS preview look like its own world.
 */

/* ─── Helpers ─────────────────────────────────────── */

function hexToRgba(hex: string, alpha: number): string {
  if (!hex.startsWith("#")) return `rgba(0,0,0,${alpha})`;
  const cleaned = hex.replace("#", "");
  const full =
    cleaned.length === 3
      ? cleaned
          .split("")
          .map((ch) => ch + ch)
          .join("")
      : cleaned;
  const r = parseInt(full.slice(0, 2), 16);
  const g = parseInt(full.slice(2, 4), 16);
  const b = parseInt(full.slice(4, 6), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

function softBrand(c: ResolvedDsTokens, alpha = 0.12): string {
  // For hex, use alpha. For non-hex (rgba, oklch), fall back to brandLight
  if (c.brand.startsWith("#")) return hexToRgba(c.brand, alpha);
  return c.brandLight;
}

function softStatus(color: string, alpha = 0.12, fallback: string): string {
  if (color.startsWith("#")) return hexToRgba(color, alpha);
  return fallback;
}

function normalizeName(name: string): string {
  return name.toLowerCase().replace(/[\s_-]/g, "");
}

/* ─── Renderers (all consume ResolvedDsTokens) ───── */

type Renderer = (c: ResolvedDsTokens) => ReactNode;

const renderers: Record<string, Renderer> = {
  /* ── BUTTONS ─────────────────────────────────── */

  button: (c) => (
    <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
      <button
        type="button"
        style={{
          fontFamily: c.font,
          background: c.brand,
          color: c.textOnBrand,
          border: "none",
          borderRadius: c.radiusMd,
          padding: "9px 18px",
          fontSize: 13,
          fontWeight: Number(c.weightSemibold),
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
          fontWeight: Number(c.weightSemibold),
          cursor: "default",
          letterSpacing: "-0.005em",
        }}
      >
        Learn more
      </button>
    </div>
  ),

  compactbutton: (c) => (
    <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
      <button
        type="button"
        style={{
          fontFamily: c.font,
          background: c.brand,
          color: c.textOnBrand,
          border: "none",
          borderRadius: c.radiusSm,
          padding: "5px 12px",
          fontSize: 11,
          fontWeight: Number(c.weightSemibold),
          cursor: "default",
        }}
      >
        Save
      </button>
      <button
        type="button"
        style={{
          fontFamily: c.font,
          background: c.surface,
          color: c.textPrimary,
          border: `1px solid ${c.border}`,
          borderRadius: c.radiusSm,
          padding: "5px 12px",
          fontSize: 11,
          fontWeight: Number(c.weightMedium),
          cursor: "default",
        }}
      >
        Cancel
      </button>
    </div>
  ),

  fancybutton: (c) => (
    <button
      type="button"
      style={{
        fontFamily: c.font,
        background: `linear-gradient(135deg, ${c.brand} 0%, ${c.brandDark} 100%)`,
        color: c.textOnBrand,
        border: "none",
        borderRadius: c.radiusLg,
        padding: "12px 24px 12px 22px",
        fontSize: 13,
        fontWeight: Number(c.weightBold),
        cursor: "default",
        display: "inline-flex",
        alignItems: "center",
        gap: 10,
        boxShadow: `0 8px 24px -8px ${softBrand(c, 0.5)}, inset 0 1px 0 ${hexToRgba(
          "#ffffff",
          0.18
        )}`,
        letterSpacing: "-0.005em",
      }}
    >
      <svg width={14} height={14} viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
      </svg>
      Upgrade to Pro
    </button>
  ),

  linkbutton: (c) => (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <a
        href="#"
        onClick={(e) => e.preventDefault()}
        style={{
          fontFamily: c.font,
          color: c.brand,
          fontSize: 13,
          fontWeight: Number(c.weightSemibold),
          textDecoration: "none",
          display: "inline-flex",
          alignItems: "center",
          gap: 4,
        }}
      >
        Read documentation
        <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
          <path d="M5 12h14M12 5l7 7-7 7" />
        </svg>
      </a>
      <a
        href="#"
        onClick={(e) => e.preventDefault()}
        style={{
          fontFamily: c.font,
          color: c.textSecondary,
          fontSize: 13,
          fontWeight: Number(c.weightMedium),
          textDecoration: "underline",
          textUnderlineOffset: 3,
        }}
      >
        Forgot password?
      </a>
    </div>
  ),

  iconbutton: (c) => (
    <div style={{ display: "flex", gap: 8 }}>
      <button
        type="button"
        style={{
          width: 36,
          height: 36,
          borderRadius: c.radiusMd,
          background: c.brand,
          color: c.textOnBrand,
          border: "none",
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "default",
        }}
      >
        <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 5v14M5 12h14" />
        </svg>
      </button>
      <button
        type="button"
        style={{
          width: 36,
          height: 36,
          borderRadius: c.radiusMd,
          background: c.surface,
          color: c.textPrimary,
          border: `1px solid ${c.border}`,
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "default",
        }}
      >
        <svg width={15} height={15} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
        </svg>
      </button>
    </div>
  ),

  closebutton: (c) => (
    <button
      type="button"
      aria-label="Close"
      style={{
        width: 32,
        height: 32,
        borderRadius: c.radiusFull,
        background: c.surface,
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
        background: c.surface,
        color: c.textPrimary,
        border: `1px solid ${c.border}`,
        borderRadius: c.radiusMd,
        padding: "8px 14px",
        fontSize: 12,
        fontWeight: Number(c.weightMedium),
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
        fontWeight: Number(c.weightSemibold),
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

  /* ── INPUTS ──────────────────────────────────── */

  input: (c) => (
    <div style={{ display: "flex", flexDirection: "column", gap: 6, width: "100%", maxWidth: 240 }}>
      <label
        style={{
          fontFamily: c.font,
          fontSize: 11,
          fontWeight: Number(c.weightMedium),
          color: c.textSecondary,
          letterSpacing: "0.01em",
        }}
      >
        Email address
      </label>
      <input
        type="text"
        readOnly
        defaultValue="hello@hubera.dev"
        style={{
          fontFamily: c.font,
          background: c.surface,
          color: c.textPrimary,
          border: `1px solid ${c.brand}`,
          borderRadius: c.radiusMd,
          padding: "10px 14px",
          fontSize: 13,
          outline: "none",
          width: "100%",
          boxShadow: `0 0 0 3px ${softBrand(c, 0.1)}`,
        }}
      />
    </div>
  ),

  textarea: (c) => (
    <textarea
      readOnly
      defaultValue={"Multi-line text input.\nResize as needed."}
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
        maxWidth: 240,
        height: 64,
        lineHeight: 1.5,
      }}
    />
  ),

  searchinput: (c) => (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        background: c.surface,
        border: `1px solid ${c.border}`,
        borderRadius: c.radiusMd,
        padding: "8px 14px",
        width: "100%",
        maxWidth: 240,
      }}
    >
      <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke={c.textSecondary} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="8" />
        <line x1="21" y1="21" x2="16.65" y2="16.65" />
      </svg>
      <span style={{ fontFamily: c.font, fontSize: 13, color: c.textSecondary }}>
        Search components...
      </span>
    </div>
  ),

  checkbox: (c) => (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
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
          <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke={c.textOnBrand} strokeWidth={3} strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
        <span style={{ fontFamily: c.font, fontSize: 13, color: c.textPrimary }}>
          Remember me
        </span>
      </div>
      <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
        <div
          style={{
            width: 18,
            height: 18,
            borderRadius: c.radiusSm,
            border: `1.5px solid ${c.border}`,
            background: c.surface,
          }}
        />
        <span style={{ fontFamily: c.font, fontSize: 13, color: c.textPrimary }}>
          Subscribe
        </span>
      </div>
    </div>
  ),

  radio: (c) => (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
        <div
          style={{
            width: 18,
            height: 18,
            borderRadius: "50%",
            border: `2px solid ${c.brand}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div style={{ width: 8, height: 8, borderRadius: "50%", background: c.brand }} />
        </div>
        <span style={{ fontFamily: c.font, fontSize: 13, color: c.textPrimary }}>
          Monthly
        </span>
      </div>
      <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
        <div
          style={{
            width: 18,
            height: 18,
            borderRadius: "50%",
            border: `1.5px solid ${c.border}`,
          }}
        />
        <span style={{ fontFamily: c.font, fontSize: 13, color: c.textPrimary }}>
          Annual
        </span>
      </div>
    </div>
  ),

  switch: (c) => (
    <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
      <div
        style={{
          width: 38,
          height: 22,
          borderRadius: 999,
          background: c.brand,
          padding: 2,
          display: "flex",
          alignItems: "center",
          justifyContent: "flex-end",
        }}
      >
        <div style={{ width: 18, height: 18, borderRadius: "50%", background: c.textOnBrand }} />
      </div>
      <div
        style={{
          width: 38,
          height: 22,
          borderRadius: 999,
          background: c.border,
          padding: 2,
          display: "flex",
          alignItems: "center",
        }}
      >
        <div style={{ width: 18, height: 18, borderRadius: "50%", background: c.surface }} />
      </div>
    </div>
  ),

  slider: (c) => (
    <div style={{ width: "100%", maxWidth: 220 }}>
      <div
        style={{
          height: 4,
          borderRadius: 999,
          background: c.border,
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            bottom: 0,
            width: "60%",
            background: c.brand,
            borderRadius: 999,
          }}
        />
        <div
          style={{
            position: "absolute",
            left: "60%",
            top: "50%",
            width: 16,
            height: 16,
            borderRadius: "50%",
            background: c.surface,
            border: `2px solid ${c.brand}`,
            transform: "translate(-50%, -50%)",
            boxShadow: `0 0 0 4px ${softBrand(c, 0.12)}`,
          }}
        />
      </div>
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
            fontWeight: Number(c.weightSemibold),
            color: c.textPrimary,
            boxShadow: i === 3 ? `0 0 0 3px ${softBrand(c, 0.12)}` : undefined,
          }}
        >
          {digit}
        </div>
      ))}
    </div>
  ),

  dropdownmenu: (c) => (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        background: c.surface,
        border: `1px solid ${c.border}`,
        borderRadius: c.radiusMd,
        overflow: "hidden",
        width: "100%",
        maxWidth: 200,
      }}
    >
      {[
        { label: "Profile", active: false },
        { label: "Settings", active: true },
        { label: "Sign out", active: false },
      ].map((item) => (
        <div
          key={item.label}
          style={{
            fontFamily: c.font,
            fontSize: 13,
            fontWeight: Number(item.active ? c.weightSemibold : c.weightMedium),
            color: item.active ? c.brand : c.textPrimary,
            background: item.active ? softBrand(c, 0.08) : "transparent",
            padding: "8px 14px",
          }}
        >
          {item.label}
        </div>
      ))}
    </div>
  ),

  /* ── DISPLAY ─────────────────────────────────── */

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
          fontWeight: Number(c.weightSemibold),
        }}
      >
        New
      </span>
      <span
        style={{
          fontFamily: c.font,
          background: c.brand,
          color: c.textOnBrand,
          padding: "3px 10px",
          borderRadius: 999,
          fontSize: 11,
          fontWeight: Number(c.weightSemibold),
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
          fontWeight: Number(c.weightMedium),
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
        fontWeight: Number(c.weightSemibold),
      }}
    >
      <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
        <span style={{ width: 6, height: 6, borderRadius: "50%", background: c.brand }} />
        Latest update
      </span>
      <span
        style={{
          background: c.surface,
          color: c.brand,
          padding: "2px 8px",
          borderRadius: 999,
          fontSize: 10,
          fontWeight: Number(c.weightSemibold),
        }}
      >
        v2.0
      </span>
    </div>
  ),

  statusbadge: (c) => (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <span
        style={{
          fontFamily: c.font,
          display: "inline-flex",
          alignItems: "center",
          gap: 6,
          background: softStatus(c.success, 0.12, c.brandLight),
          color: c.success,
          padding: "3px 10px 3px 8px",
          borderRadius: 999,
          fontSize: 11,
          fontWeight: Number(c.weightSemibold),
          width: "fit-content",
        }}
      >
        <span style={{ width: 6, height: 6, borderRadius: "50%", background: c.success }} />
        Online
      </span>
      <span
        style={{
          fontFamily: c.font,
          display: "inline-flex",
          alignItems: "center",
          gap: 6,
          background: softStatus(c.warning, 0.12, c.brandLight),
          color: c.warning,
          padding: "3px 10px 3px 8px",
          borderRadius: 999,
          fontSize: 11,
          fontWeight: Number(c.weightSemibold),
          width: "fit-content",
        }}
      >
        <span style={{ width: 6, height: 6, borderRadius: "50%", background: c.warning }} />
        Pending
      </span>
      <span
        style={{
          fontFamily: c.font,
          display: "inline-flex",
          alignItems: "center",
          gap: 6,
          background: softStatus(c.error, 0.12, c.brandLight),
          color: c.error,
          padding: "3px 10px 3px 8px",
          borderRadius: 999,
          fontSize: 11,
          fontWeight: Number(c.weightSemibold),
          width: "fit-content",
        }}
      >
        <span style={{ width: 6, height: 6, borderRadius: "50%", background: c.error }} />
        Failed
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
            fontWeight: Number(c.weightMedium),
          }}
        >
          {tag}
        </span>
      ))}
    </div>
  ),

  avatar: (c) => (
    <div style={{ display: "flex", alignItems: "center" }}>
      {[
        { letter: "A", bg: c.brand, color: c.textOnBrand },
        { letter: "B", bg: c.brandDark, color: c.textOnBrand },
        { letter: "C", bg: c.brandLight, color: c.brandDark },
      ].map((a, i) => (
        <div
          key={i}
          style={{
            width: 36,
            height: 36,
            borderRadius: "50%",
            background: a.bg,
            color: a.color,
            border: `2px solid ${c.surface}`,
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: c.font,
            fontSize: 13,
            fontWeight: Number(c.weightSemibold),
            marginLeft: i === 0 ? 0 : -10,
            boxShadow: `0 0 0 1px ${c.border}`,
          }}
        >
          {a.letter}
        </div>
      ))}
    </div>
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

  /* ── LAYOUT ──────────────────────────────────── */

  card: (c) => (
    <div
      style={{
        background: c.surface,
        border: `1px solid ${c.border}`,
        borderRadius: c.radiusLg,
        padding: 14,
        width: "100%",
        maxWidth: 220,
      }}
    >
      <div
        style={{
          fontFamily: c.font,
          fontSize: 13,
          fontWeight: Number(c.weightSemibold),
          color: c.textPrimary,
          marginBottom: 4,
        }}
      >
        Card title
      </div>
      <div
        style={{
          fontFamily: c.font,
          fontSize: 11,
          color: c.textSecondary,
          lineHeight: 1.5,
        }}
      >
        A short description supporting the card title.
      </div>
    </div>
  ),

  metriccard: (c) => (
    <div
      style={{
        background: c.surface,
        border: `1px solid ${c.border}`,
        borderRadius: c.radiusLg,
        padding: 14,
        width: "100%",
        maxWidth: 220,
      }}
    >
      <div
        style={{
          fontFamily: c.font,
          fontSize: 10,
          fontWeight: Number(c.weightMedium),
          color: c.textSecondary,
          textTransform: "uppercase",
          letterSpacing: "0.06em",
          marginBottom: 6,
        }}
      >
        Total revenue
      </div>
      <div
        style={{
          fontFamily: c.font,
          fontSize: 24,
          fontWeight: Number(c.weightBold),
          color: c.textPrimary,
          letterSpacing: "-0.02em",
          marginBottom: 4,
        }}
      >
        $47,238
      </div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 4,
          fontFamily: c.font,
          fontSize: 11,
          color: c.success,
          fontWeight: Number(c.weightSemibold),
        }}
      >
        <svg width={10} height={10} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round">
          <polyline points="18 15 12 9 6 15" />
        </svg>
        +12.4%
      </div>
    </div>
  ),

  divider: (c) => (
    <div style={{ width: "100%", maxWidth: 240 }}>
      <div style={{ height: 1, background: c.border, marginBottom: 16 }} />
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{ flex: 1, height: 1, background: c.border }} />
        <span
          style={{
            fontFamily: c.font,
            fontSize: 11,
            color: c.textSecondary,
            fontWeight: Number(c.weightMedium),
          }}
        >
          OR
        </span>
        <div style={{ flex: 1, height: 1, background: c.border }} />
      </div>
    </div>
  ),

  /* ── NAVIGATION ──────────────────────────────── */

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
            fontWeight: Number(i === 0 ? c.weightSemibold : c.weightMedium),
            borderBottom: i === 0 ? `2px solid ${c.brand}` : "2px solid transparent",
            marginBottom: -1,
          }}
        >
          {label}
        </span>
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
        maxWidth: 280,
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
      <span style={{ fontFamily: c.font, fontSize: 12, fontWeight: Number(c.weightSemibold), color: c.brand }}>
        Home
      </span>
      <span style={{ fontFamily: c.font, fontSize: 12, color: c.textSecondary }}>About</span>
      <span style={{ fontFamily: c.font, fontSize: 12, color: c.textSecondary }}>Docs</span>
    </div>
  ),

  breadcrumb: (c) => (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        fontFamily: c.font,
        fontSize: 12,
        color: c.textSecondary,
      }}
    >
      <span>Home</span>
      <span style={{ color: c.textDisabled }}>/</span>
      <span>Components</span>
      <span style={{ color: c.textDisabled }}>/</span>
      <span style={{ color: c.brand, fontWeight: Number(c.weightSemibold) }}>Button</span>
    </div>
  ),

  pagination: (c) => (
    <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
      {[1, 2, 3, 4].map((n) => (
        <span
          key={n}
          style={{
            fontFamily: c.font,
            width: 28,
            height: 28,
            borderRadius: c.radiusSm,
            background: n === 2 ? c.brand : "transparent",
            color: n === 2 ? c.textOnBrand : c.textPrimary,
            border: n === 2 ? "none" : `1px solid ${c.border}`,
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 12,
            fontWeight: Number(c.weightSemibold),
          }}
        >
          {n}
        </span>
      ))}
      <span style={{ fontFamily: c.font, fontSize: 12, color: c.textSecondary, padding: "0 4px" }}>...</span>
    </div>
  ),

  /* ── DATA ────────────────────────────────────── */

  table: (c) => (
    <div
      style={{
        width: "100%",
        maxWidth: 260,
        background: c.surface,
        border: `1px solid ${c.border}`,
        borderRadius: c.radiusMd,
        overflow: "hidden",
        fontFamily: c.font,
        fontSize: 11,
      }}
    >
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1.4fr 1fr 0.8fr",
          padding: "8px 12px",
          background: softBrand(c, 0.06),
          borderBottom: `1px solid ${c.border}`,
          fontWeight: Number(c.weightSemibold),
          color: c.textSecondary,
          fontSize: 10,
          textTransform: "uppercase",
          letterSpacing: "0.04em",
        }}
      >
        <span>Name</span>
        <span>Email</span>
        <span style={{ textAlign: "right" }}>Role</span>
      </div>
      {[
        { name: "Ava Chen", email: "ava@hubera", role: "Admin" },
        { name: "Mia Park", email: "mia@hubera", role: "Edit" },
        { name: "Leo Cruz", email: "leo@hubera", role: "View" },
      ].map((row, i) => (
        <div
          key={i}
          style={{
            display: "grid",
            gridTemplateColumns: "1.4fr 1fr 0.8fr",
            padding: "7px 12px",
            color: c.textPrimary,
            borderTop: i > 0 ? `1px solid ${c.border}` : "none",
            fontWeight: Number(c.weightMedium),
          }}
        >
          <span>{row.name}</span>
          <span style={{ color: c.textSecondary }}>{row.email}</span>
          <span style={{ textAlign: "right", color: c.brand, fontWeight: Number(c.weightSemibold) }}>
            {row.role}
          </span>
        </div>
      ))}
    </div>
  ),

  stepindicator: (c) => (
    <div style={{ display: "flex", alignItems: "center", gap: 0, width: "100%", maxWidth: 240 }}>
      {[
        { num: "1", state: "done" },
        { num: "2", state: "active" },
        { num: "3", state: "todo" },
      ].map((s, i) => (
        <div key={i} style={{ display: "flex", alignItems: "center", flex: i < 2 ? 1 : 0 }}>
          <div
            style={{
              width: 28,
              height: 28,
              borderRadius: "50%",
              background: s.state === "done" ? c.brand : c.surface,
              border:
                s.state === "active"
                  ? `2px solid ${c.brand}`
                  : s.state === "todo"
                    ? `1.5px solid ${c.border}`
                    : "none",
              color:
                s.state === "done"
                  ? c.textOnBrand
                  : s.state === "active"
                    ? c.brand
                    : c.textDisabled,
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              fontFamily: c.font,
              fontSize: 12,
              fontWeight: Number(c.weightBold),
              flexShrink: 0,
            }}
          >
            {s.state === "done" ? (
              <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            ) : (
              s.num
            )}
          </div>
          {i < 2 && (
            <div
              style={{
                flex: 1,
                height: 2,
                background: i === 0 ? c.brand : c.border,
                marginLeft: 6,
                marginRight: 6,
              }}
            />
          )}
        </div>
      ))}
    </div>
  ),

  progress: (c) => (
    <div style={{ width: "100%", maxWidth: 220 }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          fontFamily: c.font,
          fontSize: 11,
          color: c.textSecondary,
          marginBottom: 6,
          fontWeight: Number(c.weightMedium),
        }}
      >
        <span>Uploading…</span>
        <span style={{ color: c.textPrimary, fontWeight: Number(c.weightSemibold) }}>74%</span>
      </div>
      <div style={{ height: 6, borderRadius: 999, background: c.border, overflow: "hidden" }}>
        <div style={{ width: "74%", height: "100%", background: c.brand }} />
      </div>
    </div>
  ),

  spinner: (c) => (
    <svg width={28} height={28} viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="10" stroke={c.border} strokeWidth={2.5} />
      <path d="M22 12a10 10 0 0 0-10-10" stroke={c.brand} strokeWidth={2.5} strokeLinecap="round" />
    </svg>
  ),

  /* ── FEEDBACK ────────────────────────────────── */

  designtip: (c) => (
    <div
      style={{
        display: "flex",
        gap: 12,
        padding: "12px 14px",
        background: c.brandLight,
        border: `1px solid ${softBrand(c, 0.2)}`,
        borderRadius: c.radiusMd,
        width: "100%",
        maxWidth: 260,
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
            fontWeight: Number(c.weightSemibold),
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
          Use semantic tokens, not raw hex.
        </div>
      </div>
    </div>
  ),

  alert: (c) => (
    <div
      style={{
        display: "flex",
        gap: 10,
        padding: "10px 12px",
        background: softStatus(c.warning, 0.1, c.brandLight),
        border: `1px solid ${softStatus(c.warning, 0.3, c.border)}`,
        borderLeft: `3px solid ${c.warning}`,
        borderRadius: c.radiusSm,
        width: "100%",
        maxWidth: 260,
      }}
    >
      <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke={c.warning} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: 1 }}>
        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
        <line x1="12" y1="9" x2="12" y2="13" />
        <line x1="12" y1="17" x2="12.01" y2="17" />
      </svg>
      <div>
        <div style={{ fontFamily: c.font, fontSize: 12, fontWeight: Number(c.weightSemibold), color: c.textPrimary }}>
          Heads up
        </div>
        <div style={{ fontFamily: c.font, fontSize: 11, color: c.textSecondary }}>
          Your trial expires in 3 days.
        </div>
      </div>
    </div>
  ),

  toast: (c) => (
    <div
      style={{
        display: "flex",
        gap: 10,
        padding: "10px 14px",
        background: c.surface,
        border: `1px solid ${c.border}`,
        borderRadius: c.radiusMd,
        boxShadow: `0 8px 24px -10px rgba(0,0,0,0.2)`,
        width: "100%",
        maxWidth: 240,
        alignItems: "center",
      }}
    >
      <div
        style={{
          width: 22,
          height: 22,
          borderRadius: "50%",
          background: softStatus(c.success, 0.15, c.brandLight),
          color: c.success,
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round">
          <polyline points="20 6 9 17 4 12" />
        </svg>
      </div>
      <span style={{ fontFamily: c.font, fontSize: 12, fontWeight: Number(c.weightMedium), color: c.textPrimary }}>
        Changes saved successfully
      </span>
    </div>
  ),

  tooltip: (c) => (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 0 }}>
      <div
        style={{
          fontFamily: c.font,
          background: c.textPrimary,
          color: c.surface,
          padding: "5px 10px",
          borderRadius: c.radiusSm,
          fontSize: 11,
          fontWeight: Number(c.weightMedium),
        }}
      >
        Copy to clipboard
      </div>
      <div
        style={{
          width: 0,
          height: 0,
          borderLeft: "5px solid transparent",
          borderRight: "5px solid transparent",
          borderTop: `5px solid ${c.textPrimary}`,
        }}
      />
    </div>
  ),

  modal: (c) => (
    <div
      style={{
        background: c.surface,
        border: `1px solid ${c.border}`,
        borderRadius: c.radiusLg,
        padding: 14,
        width: "100%",
        maxWidth: 220,
        boxShadow: `0 12px 32px -10px rgba(0,0,0,0.25)`,
      }}
    >
      <div style={{ fontFamily: c.font, fontSize: 13, fontWeight: Number(c.weightBold), color: c.textPrimary, marginBottom: 4 }}>
        Confirm action
      </div>
      <div style={{ fontFamily: c.font, fontSize: 11, color: c.textSecondary, marginBottom: 12, lineHeight: 1.5 }}>
        This action cannot be undone.
      </div>
      <div style={{ display: "flex", gap: 6, justifyContent: "flex-end" }}>
        <button
          type="button"
          style={{
            fontFamily: c.font,
            background: "transparent",
            color: c.textSecondary,
            border: "none",
            padding: "5px 10px",
            fontSize: 11,
            fontWeight: Number(c.weightSemibold),
            cursor: "default",
          }}
        >
          Cancel
        </button>
        <button
          type="button"
          style={{
            fontFamily: c.font,
            background: c.brand,
            color: c.textOnBrand,
            border: "none",
            borderRadius: c.radiusSm,
            padding: "5px 12px",
            fontSize: 11,
            fontWeight: Number(c.weightSemibold),
            cursor: "default",
          }}
        >
          Confirm
        </button>
      </div>
    </div>
  ),

  /* ── CODE ────────────────────────────────────── */

  codeblock: (c) => (
    <pre
      style={{
        fontFamily: c.fontMono,
        background: c.surface,
        border: `1px solid ${c.border}`,
        borderRadius: c.radiusMd,
        padding: "12px 14px",
        fontSize: 12,
        lineHeight: 1.5,
        color: c.textPrimary,
        margin: 0,
        width: "100%",
        maxWidth: 260,
        overflow: "hidden",
      }}
    >
      <span style={{ color: c.textSecondary }}>$ </span>
      <span style={{ color: c.brand }}>npm install</span>
      <span style={{ color: c.textPrimary }}> @hubera/core</span>
    </pre>
  ),
};

/* ─── Public component ────────────────────────────── */

interface ComponentPreviewProps {
  name: string;
  tokens: DSTokens;
}

export function ComponentPreview({ name, tokens }: ComponentPreviewProps) {
  const { theme } = useTheme();
  const ctx = resolveDsTokens(tokens, theme === "light" ? "light" : "dark");

  const normalized = normalizeName(name);
  // Exact match first
  let renderer = renderers[normalized];

  // Fallback: longest-key first so e.g. "searchinput" matches "searchinput" not "input"
  if (!renderer) {
    const sortedKeys = Object.keys(renderers).sort((a, b) => b.length - a.length);
    for (const key of sortedKeys) {
      if (normalized.includes(key)) {
        renderer = renderers[key];
        break;
      }
    }
  }

  const containerStyle: CSSProperties = {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    height: "100%",
  };

  if (renderer) {
    return <div style={containerStyle}>{renderer(ctx)}</div>;
  }

  // Generic fallback: show the name in the DS's own font
  return (
    <div style={containerStyle}>
      <span
        style={{
          fontFamily: ctx.font,
          fontSize: 18,
          fontWeight: Number(ctx.weightSemibold),
          color: ctx.textSecondary,
          letterSpacing: "-0.01em",
        }}
      >
        {name}
      </span>
    </div>
  );
}

/* ─── Categorization helper (exported) ────────────── */

export function categorizeComponent(name: string): string {
  const n = name.toLowerCase();
  if (/button/.test(n)) return "Buttons";
  if (
    /input|textarea|checkbox|radio|switch|slider|select|dropdown\s*menu|verification/.test(n)
  )
    return "Inputs";
  if (/badge|tag|chip|avatar|status/.test(n)) return "Display";
  if (/card|panel|divider|separator|surface/.test(n)) return "Layout";
  if (/tab|nav|breadcrumb|pagination|menu|sidebar/.test(n)) return "Navigation";
  if (/table|list|grid|timeline|step|progress|spinner|metric/.test(n)) return "Data";
  if (/alert|toast|notification|tooltip|modal|tip|popover/.test(n)) return "Feedback";
  if (/code|console|terminal|snippet/.test(n)) return "Code";
  if (/icon/.test(n)) return "Display";
  return "Other";
}

/* ─── Size hint inference ─────────────────────────── */

/**
 * Infers a preview-frame size class from a component name.
 * Returns one of: "sm" | "md" | "lg" | "xl".
 * Longest-pattern-first check so "verification code input" doesn't fall
 * through to "input".
 */
export function inferDisplaySize(name: string): "sm" | "md" | "lg" | "xl" {
  const n = name.toLowerCase();

  // XL — must fit real page-level components at roughly actual size
  if (/table|sidebar|modal|app\s*navigation|data.?table|layout|drawer|sheet/.test(n)) {
    return "xl";
  }

  // LG — medium-sized rich composites
  if (
    /card|metric|code\s*block|step.?indicator|progress|breadcrumb|pagination|design.?tip|form|row/.test(
      n
    )
  ) {
    return "lg";
  }

  // MD — single-element inputs and feedback surfaces
  if (
    /textarea|verification|tabs|tooltip|toast|alert|popover|dropdown|menu|select|slider|tag.?group|badge.?group/.test(
      n
    )
  ) {
    return "md";
  }

  // Input is MD
  if (/^input$|^input\b/.test(n)) return "md";

  // SM — buttons, badges, single-glyph items
  if (
    /button|badge|tag|icon|avatar|checkbox|radio|switch|spinner|close|chip/.test(
      n
    )
  ) {
    return "sm";
  }

  // Default: medium
  return "md";
}

/** Pixel dimensions for a given display size. */
export function displaySizeFrame(size: "sm" | "md" | "lg" | "xl"): {
  width: number | string;
  height: number;
} {
  switch (size) {
    case "sm":
      return { width: 480, height: 320 };
    case "md":
      return { width: 640, height: 400 };
    case "lg":
      return { width: 800, height: 480 };
    case "xl":
      return { width: "100%", height: 640 };
  }
}
