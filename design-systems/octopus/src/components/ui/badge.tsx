"use client";

import { forwardRef, type HTMLAttributes, type ReactNode } from "react";
import { colors, fontFamily, fontWeights, spacing, radius } from "@/styles/design-tokens";
import { useTheme } from "@/components/providers/theme-provider";

export type BadgeColor =
  | "gray"
  | "brand"
  | "error"
  | "warning"
  | "success"
  | "gray-blue"
  | "blue-light"
  | "blue"
  | "indigo"
  | "purple"
  | "pink"
  | "orange";

export type BadgeType = "pill-color" | "badge-color" | "badge-modern";
export type BadgeSize = "sm" | "md" | "lg";
export type BadgeIcon = "none" | "dot" | "icon-leading" | "icon-trailing" | "x-close" | "avatar" | "icon-only";

export interface BadgeProps extends Omit<HTMLAttributes<HTMLSpanElement>, "color"> {
  color?: BadgeColor;
  type?: BadgeType;
  size?: BadgeSize;
  icon?: BadgeIcon;
  iconLeading?: ReactNode;
  iconTrailing?: ReactNode;
  avatar?: ReactNode;
  onClose?: () => void;
}

// Color palettes mapped to design token keys
const colorPalettes: Record<BadgeColor, { 50: string; 200: string; 500: string; 700: string; 800: string; 900: string; 950: string }> = {
  gray: { 50: colors.gray[50], 200: colors.gray[200], 500: colors.gray[500], 700: colors.gray[700], 800: colors.gray[800], 900: colors.gray[900], 950: colors.gray[950] },
  brand: { 50: colors.brand[50], 200: colors.brand[200], 500: colors.brand[500], 700: colors.brand[700], 800: colors.brand[800], 900: colors.brand[900], 950: colors.brand[950] },
  error: { 50: colors.error[50], 200: colors.error[200], 500: colors.error[500], 700: colors.error[700], 800: colors.error[800], 900: colors.error[900], 950: colors.error[950] },
  warning: { 50: colors.warning[50], 200: colors.warning[200], 500: colors.warning[500], 700: colors.warning[700], 800: colors.warning[800], 900: colors.warning[900], 950: colors.warning[950] },
  success: { 50: colors.success[50], 200: "#ABEFC6", 500: colors.success[500], 700: colors.success[700], 800: colors.success[800], 900: colors.success[900], 950: colors.success[950] },
  "gray-blue": { 50: colors.grayBlue[50], 200: colors.grayBlue[200], 500: colors.grayBlue[500], 700: colors.grayBlue[700], 800: colors.grayBlue[800], 900: colors.grayBlue[900], 950: colors.grayBlue[950] },
  "blue-light": { 50: colors.blueLight[50], 200: colors.blueLight[200], 500: colors.blueLight[500], 700: colors.blueLight[700], 800: colors.blueLight[800], 900: colors.blueLight[900], 950: colors.blueLight[950] },
  blue: { 50: colors.blue[50], 200: colors.blue[200], 500: colors.blue[500], 700: colors.blue[700], 800: colors.blue[800], 900: colors.blue[900], 950: colors.blue[950] },
  indigo: { 50: colors.indigo[50], 200: colors.indigo[200], 500: colors.indigo[500], 700: colors.indigo[700], 800: colors.indigo[800], 900: colors.indigo[900], 950: colors.indigo[950] },
  purple: { 50: colors.purple[50], 200: colors.purple[200], 500: colors.purple[500], 700: colors.purple[700], 800: colors.purple[800], 900: colors.purple[900], 950: colors.purple[950] },
  pink: { 50: colors.pink[50], 200: colors.pink[200], 500: colors.pink[500], 700: colors.pink[700], 800: colors.pink[800], 900: colors.pink[900], 950: colors.pink[950] },
  orange: { 50: colors.orange[50], 200: colors.orange[200], 500: colors.orange[500], 700: colors.orange[700], 800: colors.orange[800], 900: colors.orange[900], 950: colors.orange[950] },
};

interface BadgeSizeConfig {
  fontSize: number;
  lineHeight: string;
  paddingY: number;
  paddingX: { pill: number; badge: number };
  iconSize: number;
  dotSize: number;
  gap: number;
  avatarSize: number;
}

const sizeConfigs: Record<BadgeSize, BadgeSizeConfig> = {
  sm: { fontSize: 12, lineHeight: "18px", paddingY: spacing.xxs, paddingX: { pill: spacing.md, badge: spacing.sm }, iconSize: 12, dotSize: 8, gap: spacing.xs, avatarSize: 16 },
  md: { fontSize: 12, lineHeight: "18px", paddingY: spacing.xxs, paddingX: { pill: 10, badge: spacing.md }, iconSize: 12, dotSize: 8, gap: spacing.xs, avatarSize: 16 },
  lg: { fontSize: 14, lineHeight: "20px", paddingY: spacing.xs, paddingX: { pill: 12, badge: 10 }, iconSize: 12, dotSize: 10, gap: spacing.xs, avatarSize: 18 },
};

function getColorStyles(
  color: BadgeColor,
  type: BadgeType,
  mode: "light" | "dark",
  paletteOverride?: { 50: string; 200: string; 500: string; 700: string; 800: string; 900: string; 950: string }
): { bg: string; border: string; text: string; dot: string } {
  const palette = paletteOverride || colorPalettes[color];

  if (type === "badge-modern") {
    return mode === "light"
      ? { bg: colors.base.white, border: colors.gray[300], text: palette[700], dot: palette[500] }
      : { bg: colors.gray[900], border: colors.gray[700], text: palette[200], dot: palette[500] };
  }

  return mode === "light"
    ? { bg: palette[50], border: palette[200], text: palette[700], dot: palette[500] }
    : { bg: palette[950], border: palette[800], text: palette[200], dot: palette[500] };
}

function XCloseIcon({ color, size }: { color: string; size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 12 12" fill="none">
      <path d="M9 3L3 9M3 3L9 9" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function DotIcon({ color, size }: { color: string; size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 8 8" fill="none">
      <circle cx="4" cy="4" r="3" fill={color} />
    </svg>
  );
}

export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  function Badge(
    {
      color = "gray",
      type = "pill-color",
      size = "sm",
      icon = "none",
      iconLeading,
      iconTrailing,
      avatar,
      onClose,
      children,
      style,
      onMouseEnter,
      onMouseLeave,
      ...rest
    },
    ref
  ) {
    const { theme, brandPalette } = useTheme();
    const palette = color === "brand"
      ? { 50: brandPalette[50], 200: brandPalette[200], 500: brandPalette[500], 700: brandPalette[700], 800: brandPalette[800], 900: brandPalette[900], 950: brandPalette[950] }
      : colorPalettes[color];
    const colorStyle = getColorStyles(color, type, theme, palette);
    const sizeConfig = sizeConfigs[size];
    const isPill = type === "pill-color";
    const isModern = type === "badge-modern";
    const isIconOnly = icon === "icon-only";

    const paddingX = isPill ? sizeConfig.paddingX.pill : sizeConfig.paddingX.badge;

    // Adjust padding when icons are present
    let paddingLeft = paddingX;
    let paddingRight = paddingX;

    if (icon === "dot" || icon === "icon-leading") {
      paddingLeft = isPill ? spacing.sm : spacing.xs;
    }
    if (icon === "avatar") {
      paddingLeft = isPill ? spacing.xs : spacing.xs;
    }
    if (icon === "icon-trailing" || icon === "x-close") {
      paddingRight = isPill ? 3 : 3;
    }
    if (isIconOnly) {
      paddingLeft = sizeConfig.paddingY;
      paddingRight = sizeConfig.paddingY;
    }

    const baseStyle: React.CSSProperties = {
      display: "inline-flex",
      alignItems: "center",
      gap: icon !== "none" ? sizeConfig.gap : 0,
      fontFamily,
      fontWeight: fontWeights.medium,
      fontSize: sizeConfig.fontSize,
      lineHeight: sizeConfig.lineHeight,
      color: colorStyle.text,
      background: colorStyle.bg,
      border: `1px solid ${colorStyle.border}`,
      borderRadius: isPill ? radius.full : radius.sm,
      paddingTop: sizeConfig.paddingY,
      paddingBottom: sizeConfig.paddingY,
      paddingLeft,
      paddingRight,
      whiteSpace: "nowrap",
      cursor: "default",
      transition: "all 120ms ease",
      ...(isModern ? { boxShadow: "0px 1px 2px 0px rgba(10, 13, 18, 0.05)" } : {}),
      ...style,
    };

    const iconStyle: React.CSSProperties = {
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      flexShrink: 0,
    };

    const closeButtonStyle: React.CSSProperties = {
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      padding: spacing.xxs,
      borderRadius: isPill ? radius.full : 3,
      border: "none",
      background: "transparent",
      cursor: "pointer",
      flexShrink: 0,
      transition: "background 120ms ease",
    };

    const closeHoverBg = theme === "light" ? palette[200] : palette[800];

    return (
      <span ref={ref} style={baseStyle} onMouseEnter={onMouseEnter} onMouseLeave={onMouseLeave} {...rest}>
        {icon === "dot" && (
          <span style={iconStyle}>
            <DotIcon color={colorStyle.dot} size={sizeConfig.dotSize} />
          </span>
        )}

        {icon === "avatar" && avatar && (
          <span style={{ ...iconStyle, width: sizeConfig.avatarSize, height: sizeConfig.avatarSize, borderRadius: radius.full, overflow: "hidden" }}>
            {avatar}
          </span>
        )}

        {icon === "icon-leading" && iconLeading && (
          <span style={{ ...iconStyle, width: sizeConfig.iconSize, height: sizeConfig.iconSize }}>
            {iconLeading}
          </span>
        )}

        {icon === "icon-only" && iconLeading && (
          <span style={{ ...iconStyle, width: sizeConfig.iconSize, height: sizeConfig.iconSize }}>
            {iconLeading}
          </span>
        )}

        {!isIconOnly && children}

        {icon === "icon-trailing" && iconTrailing && (
          <span style={{ ...iconStyle, width: sizeConfig.iconSize, height: sizeConfig.iconSize }}>
            {iconTrailing}
          </span>
        )}

        {icon === "x-close" && (
          <button
            type="button"
            aria-label="Remove"
            onClick={onClose}
            style={closeButtonStyle}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = closeHoverBg;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "transparent";
            }}
          >
            <XCloseIcon color={colorStyle.text} size={sizeConfig.iconSize} />
          </button>
        )}
      </span>
    );
  }
);
