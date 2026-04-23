"use client";

import { forwardRef, type HTMLAttributes, type ReactNode } from "react";
import { colors, fontFamily, fontWeights, spacing, radius } from "@/styles/design-tokens";
import { useTheme } from "@/components/providers/theme-provider";
import type { BadgeColor } from "./badge";

export type BadgeGroupSize = "md" | "lg";
export type BadgeGroupType = "pill-color" | "badge-modern";
export type BadgeGroupPosition = "leading" | "trailing";

export interface BadgeGroupProps extends Omit<HTMLAttributes<HTMLDivElement>, "color"> {
  color?: BadgeColor;
  type?: BadgeGroupType;
  size?: BadgeGroupSize;
  badgePosition?: BadgeGroupPosition;
  badgeLabel?: string;
  showIcon?: boolean;
  icon?: ReactNode;
}

const colorPalettes: Record<BadgeColor, { 50: string; 200: string; 700: string; 800: string; 950: string }> = {
  gray: { 50: colors.gray[50], 200: colors.gray[200], 700: colors.gray[700], 800: colors.gray[800], 950: colors.gray[950] },
  brand: { 50: colors.brand[50], 200: colors.brand[200], 700: colors.brand[700], 800: colors.brand[800], 950: colors.brand[950] },
  error: { 50: colors.error[50], 200: colors.error[200], 700: colors.error[700], 800: colors.error[800], 950: colors.error[950] },
  warning: { 50: colors.warning[50], 200: colors.warning[200], 700: colors.warning[700], 800: colors.warning[800], 950: colors.warning[950] },
  success: { 50: colors.success[50], 200: "#ABEFC6", 700: colors.success[700], 800: colors.success[800], 950: colors.success[950] },
  "gray-blue": { 50: colors.grayBlue[50], 200: colors.grayBlue[200], 700: colors.grayBlue[700], 800: colors.grayBlue[800], 950: colors.grayBlue[950] },
  "blue-light": { 50: colors.blueLight[50], 200: colors.blueLight[200], 700: colors.blueLight[700], 800: colors.blueLight[800], 950: colors.blueLight[950] },
  blue: { 50: colors.blue[50], 200: colors.blue[200], 700: colors.blue[700], 800: colors.blue[800], 950: colors.blue[950] },
  indigo: { 50: colors.indigo[50], 200: colors.indigo[200], 700: colors.indigo[700], 800: colors.indigo[800], 950: colors.indigo[950] },
  purple: { 50: colors.purple[50], 200: colors.purple[200], 700: colors.purple[700], 800: colors.purple[800], 950: colors.purple[950] },
  pink: { 50: colors.pink[50], 200: colors.pink[200], 700: colors.pink[700], 800: colors.pink[800], 950: colors.pink[950] },
  orange: { 50: colors.orange[50], 200: colors.orange[200], 700: colors.orange[700], 800: colors.orange[800], 950: colors.orange[950] },
};

function ArrowRightIcon({ color, size }: { color: string; size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
      <path d="M3.333 8h9.334M8.667 4l4 4-4 4" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export const BadgeGroup = forwardRef<HTMLDivElement, BadgeGroupProps>(
  function BadgeGroup(
    {
      color = "brand",
      type = "pill-color",
      size = "md",
      badgePosition = "leading",
      badgeLabel = "New feature",
      showIcon = true,
      icon,
      children,
      style,
      ...rest
    },
    ref
  ) {
    const { theme, brandPalette } = useTheme();
    const palette = color === "brand"
      ? { 50: brandPalette[50], 200: brandPalette[200], 700: brandPalette[700], 800: brandPalette[800], 950: brandPalette[950] }
      : colorPalettes[color];
    const isModern = type === "badge-modern";
    const isLg = size === "lg";

    const outerBg = theme === "light"
      ? (isModern ? colors.base.white : palette[50])
      : (isModern ? colors.gray[900] : palette[950]);
    const outerBorder = theme === "light"
      ? (isModern ? colors.gray[300] : palette[200])
      : (isModern ? colors.gray[700] : palette[800]);
    const textColor = theme === "light" ? palette[700] : palette[200];
    const innerBg = theme === "light" ? colors.base.white : colors.gray[800];
    const innerBorder = theme === "light" ? palette[200] : palette[800];

    const outerStyle: React.CSSProperties = {
      display: "inline-flex",
      alignItems: "center",
      gap: spacing.md,
      fontFamily,
      fontWeight: fontWeights.medium,
      fontSize: isLg ? 14 : 12,
      lineHeight: isLg ? "20px" : "18px",
      color: textColor,
      background: outerBg,
      border: `1px solid ${outerBorder}`,
      borderRadius: isModern ? radius.lg : radius.full,
      paddingTop: spacing.xs,
      paddingBottom: spacing.xs,
      paddingLeft: badgePosition === "leading" ? spacing.xs : spacing.md,
      paddingRight: badgePosition === "trailing" ? spacing.xs : spacing.md,
      whiteSpace: "nowrap",
      cursor: "default",
      transition: "all 120ms ease",
      ...(isModern ? { boxShadow: "0px 1px 2px 0px rgba(10, 13, 18, 0.05)" } : {}),
      ...style,
    };

    const innerBadgeStyle: React.CSSProperties = {
      display: "inline-flex",
      alignItems: "center",
      fontFamily,
      fontWeight: fontWeights.medium,
      fontSize: 12,
      lineHeight: "18px",
      color: textColor,
      background: innerBg,
      border: `1px solid ${innerBorder}`,
      borderRadius: isModern ? radius.sm : radius.full,
      paddingLeft: spacing.md,
      paddingRight: spacing.md,
      paddingTop: spacing.xxs,
      paddingBottom: spacing.xxs,
      whiteSpace: "nowrap",
      flexShrink: 0,
    };

    const contentStyle: React.CSSProperties = {
      display: "inline-flex",
      alignItems: "center",
      gap: spacing.xs,
    };

    const innerBadge = (
      <span style={innerBadgeStyle}>{badgeLabel}</span>
    );

    const defaultIcon = <ArrowRightIcon color={textColor} size={16} />;

    const content = (
      <span style={contentStyle}>
        <span>{children}</span>
        {showIcon && (icon || defaultIcon)}
      </span>
    );

    return (
      <div ref={ref} style={outerStyle} {...rest}>
        {badgePosition === "leading" ? (
          <>
            {innerBadge}
            {content}
          </>
        ) : (
          <>
            {content}
            {innerBadge}
          </>
        )}
      </div>
    );
  }
);
