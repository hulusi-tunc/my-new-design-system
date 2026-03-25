"use client";

import { forwardRef, type HTMLAttributes, type ReactNode } from "react";
import { useTheme } from "@/components/providers/theme-provider";
import { getSemanticTokens } from "@/styles/design-tokens";

export type TagSize = "sm" | "md" | "lg";

export interface TagProps extends HTMLAttributes<HTMLDivElement> {
  size?: TagSize;
  dot?: boolean;
  dotColor?: string;
  avatar?: ReactNode;
  icon?: ReactNode;
  count?: number;
  checkbox?: boolean;
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  onDismiss?: () => void;
  disabled?: boolean;
}

const sizeConfig = {
  sm: { height: 24, px: 8, gap: 4, fontSize: 12, lineHeight: 18, iconSize: 14, dotSize: 6, checkboxSize: 14, closeIcon: 10, closePad: 2, radius: 6 },
  md: { height: 24, px: 8, gap: 4, fontSize: 12, lineHeight: 18, iconSize: 16, dotSize: 8, checkboxSize: 16, closeIcon: 12, closePad: 2, radius: 6 },
  lg: { height: 28, px: 10, gap: 6, fontSize: 14, lineHeight: 20, iconSize: 18, dotSize: 8, checkboxSize: 18, closeIcon: 14, closePad: 3, radius: 6 },
};

function XCloseIcon({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 6L6 18M6 6l12 12" />
    </svg>
  );
}

function CheckIcon({ size }: { size: number }) {
  return (
    <svg width={size - 4} height={size - 4} viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2.5 6l2.5 2.5 4.5-5" />
    </svg>
  );
}

export const Tag = forwardRef<HTMLDivElement, TagProps>(
  function Tag(
    {
      size = "sm",
      dot,
      dotColor = "#17B26A",
      avatar,
      icon,
      count,
      checkbox,
      checked,
      onCheckedChange,
      onDismiss,
      disabled,
      children,
      style,
      ...rest
    },
    ref
  ) {
    const { theme, brandPalette } = useTheme();
    const tokens = getSemanticTokens(theme === "dark" ? "dark" : "light", brandPalette);
    const c = sizeConfig[size];
    const hasClose = !!onDismiss;
    const hasCount = count !== undefined;
    const hasLeading = dot || avatar || icon || checkbox;

    const containerStyle: React.CSSProperties = {
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      height: c.height,
      paddingLeft: hasLeading ? (checkbox ? c.px - 3 : c.px - 2) : c.px,
      paddingRight: hasClose || hasCount ? c.gap : c.px,
      gap: hasClose ? 3 : c.gap,
      background: tokens.bg.primary,
      border: `1px solid ${tokens.border.primary}`,
      borderRadius: c.radius,
      cursor: disabled ? "not-allowed" : "default",
      opacity: disabled ? 0.5 : 1,
      fontFamily: "var(--font-sans), system-ui, sans-serif",
      fontSize: c.fontSize,
      lineHeight: `${c.lineHeight}px`,
      fontWeight: 500,
      color: tokens.text.secondary,
      whiteSpace: "nowrap",
      ...style,
    };

    return (
      <div ref={ref} style={containerStyle} {...rest}>
        {/* Checkbox */}
        {checkbox && (
          <button
            onClick={() => onCheckedChange?.(!checked)}
            disabled={disabled}
            style={{
              width: c.checkboxSize,
              height: c.checkboxSize,
              borderRadius: 4,
              border: `1px solid ${checked ? tokens.fg.brandPrimary : tokens.border.primary}`,
              background: checked ? tokens.fg.brandPrimary : tokens.bg.primary,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: disabled ? "not-allowed" : "pointer",
              padding: 0,
              flexShrink: 0,
              color: "#fff",
            }}
          >
            {checked && <CheckIcon size={c.checkboxSize} />}
          </button>
        )}

        {/* Dot */}
        {dot && (
          <span
            style={{
              width: c.dotSize,
              height: c.dotSize,
              borderRadius: "50%",
              background: dotColor,
              flexShrink: 0,
            }}
          />
        )}

        {/* Avatar / Icon */}
        {avatar && (
          <span style={{ width: c.iconSize, height: c.iconSize, borderRadius: "50%", overflow: "hidden", flexShrink: 0, display: "flex" }}>
            {avatar}
          </span>
        )}
        {icon && (
          <span style={{ width: c.iconSize, height: c.iconSize, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
            {icon}
          </span>
        )}

        {/* Label */}
        <span>{children}</span>

        {/* Count */}
        {hasCount && (
          <span
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              minWidth: c.iconSize,
              height: c.iconSize,
              padding: "0 4px",
              borderRadius: 3,
              background: tokens.bg.tertiary,
              fontSize: c.fontSize,
              lineHeight: `${c.lineHeight}px`,
              fontWeight: 500,
              color: tokens.text.secondary,
            }}
          >
            {count}
          </span>
        )}

        {/* Close */}
        {hasClose && (
          <button
            onClick={onDismiss}
            disabled={disabled}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: c.closePad,
              borderRadius: 3,
              border: "none",
              background: "transparent",
              color: tokens.fg.quaternary,
              cursor: disabled ? "not-allowed" : "pointer",
              transition: "color 100ms, background 100ms",
              flexShrink: 0,
            }}
            onMouseEnter={(e) => {
              if (!disabled) {
                e.currentTarget.style.color = tokens.fg.secondary;
                e.currentTarget.style.background = tokens.bg.secondaryHover;
              }
            }}
            onMouseLeave={(e) => {
              if (!disabled) {
                e.currentTarget.style.color = tokens.fg.quaternary;
                e.currentTarget.style.background = "transparent";
              }
            }}
          >
            <XCloseIcon size={c.closeIcon} />
          </button>
        )}
      </div>
    );
  }
);
