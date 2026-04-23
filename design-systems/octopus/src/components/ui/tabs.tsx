"use client";

import { forwardRef, useState, type ReactNode, type HTMLAttributes } from "react";
import { useTheme } from "@/components/providers/theme-provider";
import { getSemanticTokens } from "@/styles/design-tokens";

// ── Types ────────────────────────────────────────

export type TabVariant = "underline" | "filled";
export type TabSize = "sm" | "md";
export type TabOrientation = "horizontal" | "vertical";

export interface TabItem {
  label: string;
  value: string;
  badge?: number;
  icon?: ReactNode;
  disabled?: boolean;
}

export interface TabsProps extends Omit<HTMLAttributes<HTMLDivElement>, "onChange"> {
  /** Tab items */
  items: TabItem[];
  /** Currently active tab value */
  value?: string;
  /** Called when a tab is clicked */
  onChange?: (value: string) => void;
  /** Visual variant */
  variant?: TabVariant;
  /** Size */
  size?: TabSize;
  /** Orientation */
  orientation?: TabOrientation;
  /** Stretch tabs to fill container width (horizontal only) */
  fullWidth?: boolean;
}

// ── Size configs ─────────────────────────────────

const sizeConfig: Record<TabSize, {
  height: number;
  px: number;
  fontSize: number;
  lineHeight: number;
  gap: number;
  badgeFontSize: number;
  iconSize: number;
}> = {
  sm: { height: 36, px: 12, fontSize: 14, lineHeight: 20, gap: 8, badgeFontSize: 12, iconSize: 16 },
  md: { height: 40, px: 16, fontSize: 14, lineHeight: 20, gap: 8, badgeFontSize: 12, iconSize: 20 },
};

// ── Component ────────────────────────────────────

export const Tabs = forwardRef<HTMLDivElement, TabsProps>(
  function Tabs(
    {
      items,
      value,
      onChange,
      variant = "underline",
      size = "sm",
      orientation = "horizontal",
      fullWidth = false,
      style,
      ...rest
    },
    ref
  ) {
    const { theme, brandPalette } = useTheme();
    const t = getSemanticTokens(theme, brandPalette);
    const c = sizeConfig[size];
    const isVertical = orientation === "vertical";

    // ── Container styles ──

    const containerStyle: React.CSSProperties = {
      display: "flex",
      flexDirection: isVertical ? "column" : "row",
      fontFamily: "var(--font-sans), system-ui, sans-serif",
      ...(variant === "underline" && !isVertical
        ? { borderBottom: `1px solid ${t.border.secondary}` }
        : {}),
      ...(variant === "underline" && isVertical
        ? { borderLeft: `2px solid ${t.border.secondary}` }
        : {}),
      ...(variant === "filled"
        ? {
            background: t.bg.secondary,
            borderRadius: isVertical ? 10 : 10,
            padding: 4,
            gap: 4,
          }
        : {}),
      ...style,
    };

    return (
      <div ref={ref} role="tablist" style={containerStyle} {...rest}>
        {items.map((item) => (
          <TabButton
            key={item.value}
            item={item}
            active={value === item.value}
            onClick={() => !item.disabled && onChange?.(item.value)}
            variant={variant}
            size={size}
            orientation={orientation}
            fullWidth={fullWidth}
            tokens={t}
            sizeConfig={c}
          />
        ))}
      </div>
    );
  }
);

// ── Tab button (internal) ────────────────────────

interface TabButtonProps {
  item: TabItem;
  active: boolean;
  onClick: () => void;
  variant: TabVariant;
  size: TabSize;
  orientation: TabOrientation;
  fullWidth: boolean;
  tokens: ReturnType<typeof getSemanticTokens>;
  sizeConfig: (typeof sizeConfig)[TabSize];
}

function TabButton({ item, active, onClick, variant, size, orientation, fullWidth, tokens: t, sizeConfig: c }: TabButtonProps) {
  const [hovered, setHovered] = useState(false);
  const isVertical = orientation === "vertical";
  const isDisabled = !!item.disabled;

  // ── Colors ──

  const textColor = isDisabled
    ? t.text.disabled
    : active
      ? variant === "underline"
        ? t.fg.brandPrimary
        : t.text.secondaryHover
      : hovered
        ? t.text.secondaryHover
        : t.text.tertiary;

  const iconColor = isDisabled
    ? t.fg.disabled
    : active
      ? variant === "underline"
        ? t.fg.brandPrimary
        : t.fg.secondary
      : t.fg.quaternary;

  // ── Underline variant styles ──

  const underlineStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    justifyContent: isVertical ? "flex-start" : "center",
    gap: c.gap,
    padding: isVertical ? `${c.px - 4}px ${c.px}px` : `0 ${c.px - 4}px`,
    height: isVertical ? undefined : c.height,
    fontSize: c.fontSize,
    lineHeight: `${c.lineHeight}px`,
    fontWeight: 600,
    color: textColor,
    background: "transparent",
    border: "none",
    cursor: isDisabled ? "not-allowed" : "pointer",
    transition: "color 120ms ease, box-shadow 120ms ease",
    whiteSpace: "nowrap",
    fontFamily: "inherit",
    textAlign: "left",
    position: "relative",
    opacity: isDisabled ? 0.5 : 1,
    flex: fullWidth && !isVertical ? 1 : undefined,
    // Bottom border indicator for horizontal
    ...(!isVertical
      ? {
          boxShadow: active ? `inset 0 -2px 0 0 ${t.fg.brandPrimary}` : "none",
          marginBottom: -1,
        }
      : {
          // Left border indicator for vertical
          marginLeft: -2,
          paddingLeft: c.px + 2,
          boxShadow: active ? `inset 2px 0 0 0 ${t.fg.brandPrimary}` : "none",
        }),
  };

  // ── Filled variant styles ──

  const filledStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    justifyContent: isVertical ? "flex-start" : "center",
    gap: c.gap,
    padding: isVertical ? `${c.px - 6}px ${c.px - 4}px` : `0 ${c.px - 4}px`,
    height: isVertical ? undefined : c.height - 8,
    fontSize: c.fontSize,
    lineHeight: `${c.lineHeight}px`,
    fontWeight: 600,
    color: textColor,
    background: active ? t.bg.primary : "transparent",
    border: "none",
    borderRadius: 6,
    cursor: isDisabled ? "not-allowed" : "pointer",
    transition: "all 120ms ease",
    whiteSpace: "nowrap",
    fontFamily: "inherit",
    textAlign: "left",
    opacity: isDisabled ? 0.5 : 1,
    flex: fullWidth && !isVertical ? 1 : undefined,
    boxShadow: active ? "0 1px 2px rgba(10,13,18,0.05)" : "none",
  };

  const buttonStyle = variant === "underline" ? underlineStyle : filledStyle;

  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      aria-disabled={isDisabled}
      tabIndex={isDisabled ? -1 : 0}
      onClick={onClick}
      style={buttonStyle}
      onMouseEnter={() => !isDisabled && setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {item.icon && (
        <span
          style={{
            width: c.iconSize,
            height: c.iconSize,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
            color: iconColor,
          }}
        >
          {item.icon}
        </span>
      )}
      <span>{item.label}</span>
      {item.badge !== undefined && (
        <span
          style={{
            fontSize: c.badgeFontSize,
            lineHeight: "18px",
            fontWeight: 500,
            minWidth: 20,
            height: 20,
            padding: "0 6px",
            borderRadius: 9999,
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
            background: active
              ? variant === "underline"
                ? t.bg.brandPrimary
                : t.bg.secondary
              : t.bg.secondary,
            color: active
              ? variant === "underline"
                ? t.fg.brandPrimary
                : t.text.secondary
              : t.text.tertiary,
            border: `1px solid ${active && variant === "underline" ? "transparent" : t.border.secondary}`,
          }}
        >
          {item.badge}
        </span>
      )}
    </button>
  );
}
