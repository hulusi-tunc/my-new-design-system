"use client";

import { type CSSProperties, type ReactNode } from "react";
import { useTheme } from "@/components/providers/theme-provider";
import { getNd, applyType, swatchRadii } from "@/lib/nothing-tokens";

type BadgeTone = "neutral" | "accent" | "success" | "warning" | "danger" | "info";
type BadgeVariant = "solid" | "soft" | "outline";
type BadgeSize = "sm" | "md";

const HEIGHT: Record<BadgeSize, number> = { sm: 18, md: 22 };
const PAD_X: Record<BadgeSize, number> = { sm: 6, md: 8 };
const TYPE_MAP: Record<BadgeSize, "monoSm" | "bodyXs"> = { sm: "monoSm", md: "bodyXs" };

function toneColors(
  tone: BadgeTone,
  variant: BadgeVariant,
  t: ReturnType<typeof getNd>
): { bg: string; fg: string; border: string } {
  const map = {
    neutral: { accent: t.textSecondary, subtle: t.surface, strong: t.textPrimary },
    accent: { accent: t.accent, subtle: t.accentSubtle, strong: t.accentFg },
    success: { accent: t.success, subtle: t.success, strong: t.accentFg },
    warning: { accent: t.warning, subtle: t.warning, strong: t.black },
    danger: { accent: t.danger, subtle: t.danger, strong: t.accentFg },
    info: { accent: t.interactive, subtle: t.surface, strong: t.textDisplay },
  } as const;
  const { accent, strong } = map[tone];
  const subtle = tone === "accent" ? t.accentSubtle : t.surface;

  switch (variant) {
    case "solid":
      return { bg: accent, fg: strong, border: accent };
    case "soft":
      return { bg: subtle, fg: accent, border: "transparent" };
    case "outline":
      return { bg: "transparent", fg: t.textPrimary, border: t.borderVisible };
  }
}

interface BadgeProps {
  tone?: BadgeTone;
  variant?: BadgeVariant;
  size?: BadgeSize;
  leadingDot?: boolean;
  children: ReactNode;
  style?: CSSProperties;
}

export function Badge({
  tone = "neutral",
  variant = "soft",
  size = "md",
  leadingDot,
  children,
  style,
}: BadgeProps) {
  const { theme } = useTheme();
  const t = getNd(theme);
  const colors = toneColors(tone, variant, t);
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: leadingDot ? 6 : 4,
        height: HEIGHT[size],
        padding: `0 ${PAD_X[size]}px`,
        borderRadius: swatchRadii.full,
        background: colors.bg,
        color: colors.fg,
        border: `1px solid ${colors.border}`,
        ...(applyType(TYPE_MAP[size]) as CSSProperties),
        lineHeight: 1,
        letterSpacing: "0.04em",
        textTransform: "uppercase",
        whiteSpace: "nowrap",
        ...style,
      }}
    >
      {leadingDot && (
        <span
          style={{
            display: "inline-block",
            width: 6,
            height: 6,
            borderRadius: "50%",
            background: tone === "neutral" ? t.textSecondary : colors.fg,
          }}
        />
      )}
      {children}
    </span>
  );
}

/* ── Tag — looser, lower-case, pill with subtle outline ─────────── */

interface TagProps {
  children: ReactNode;
  onRemove?: () => void;
  style?: CSSProperties;
}

export function Tag({ children, onRemove, style }: TagProps) {
  const { theme } = useTheme();
  const t = getNd(theme);
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        padding: "4px 10px",
        borderRadius: swatchRadii.full,
        background: t.surfaceInk,
        border: `1px solid ${t.border}`,
        color: t.textPrimary,
        fontFamily: "var(--font-space-grotesk), system-ui, sans-serif",
        fontSize: 12,
        lineHeight: 1,
        ...style,
      }}
    >
      {children}
      {onRemove && (
        <button
          type="button"
          aria-label="Remove"
          onClick={onRemove}
          style={{
            background: "transparent",
            border: "none",
            padding: 0,
            color: t.textSecondary,
            cursor: "pointer",
            fontSize: 14,
            lineHeight: 1,
          }}
        >
          ×
        </button>
      )}
    </span>
  );
}
