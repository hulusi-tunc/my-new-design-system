"use client";

import { useState, type CSSProperties, type ReactNode } from "react";
import { useTheme } from "@/components/providers/theme-provider";
import {
  getNd,
  editorialFonts,
  motion,
} from "@/lib/nothing-tokens";

export interface TabItem<T extends string = string> {
  id: T;
  label: ReactNode;
  badge?: ReactNode;
  disabled?: boolean;
}

type TabVariant = "underline" | "pill";
type TabSize = "sm" | "md";

interface TabsProps<T extends string> {
  items: TabItem<T>[];
  value: T;
  onChange: (id: T) => void;
  variant?: TabVariant;
  size?: TabSize;
  align?: "start" | "stretch";
}

export function Tabs<T extends string>({
  items,
  value,
  onChange,
  variant = "underline",
  size = "md",
  align = "start",
}: TabsProps<T>) {
  const { theme } = useTheme();
  const t = getNd(theme);

  const wrapperStyle: CSSProperties =
    variant === "underline"
      ? {
          display: "flex",
          gap: size === "sm" ? 20 : 32,
          borderBottom: `1px solid ${t.border}`,
          flexWrap: "wrap",
          justifyContent: align === "stretch" ? "space-between" : "flex-start",
        }
      : {
          display: "inline-flex",
          gap: 4,
          padding: 4,
          background: t.surfaceInk,
          border: `1px solid ${t.border}`,
          borderRadius: 9999,
        };

  return (
    <div role="tablist" style={wrapperStyle}>
      {items.map((item) => (
        <TabButton
          key={item.id}
          item={item}
          active={item.id === value}
          variant={variant}
          size={size}
          onClick={() => !item.disabled && onChange(item.id)}
          t={t}
        />
      ))}
    </div>
  );
}

function TabButton<T extends string>({
  item,
  active,
  variant,
  size,
  onClick,
  t,
}: {
  item: TabItem<T>;
  active: boolean;
  variant: TabVariant;
  size: TabSize;
  onClick: () => void;
  t: ReturnType<typeof getNd>;
}) {
  const [hovered, setHovered] = useState(false);

  const baseStyle: CSSProperties = {
    background: "transparent",
    border: 0,
    padding: 0,
    margin: 0,
    cursor: item.disabled ? "not-allowed" : "pointer",
    fontFamily: editorialFonts.mono,
    fontSize: size === "sm" ? 10 : 11,
    letterSpacing: "0.1em",
    textTransform: "uppercase",
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    transition: motion.transition.chrome,
    opacity: item.disabled ? 0.4 : 1,
  };

  if (variant === "underline") {
    return (
      <button
        type="button"
        role="tab"
        aria-selected={active}
        onClick={onClick}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          ...baseStyle,
          padding: size === "sm" ? "0 0 12px" : "0 0 16px",
          color: active ? t.accent : hovered ? t.textPrimary : t.textSecondary,
          position: "relative",
          marginBottom: -1,
        }}
      >
        {item.label}
        {item.badge}
        {active && (
          <span
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              bottom: -1,
              height: 2,
              background: t.accent,
            }}
          />
        )}
      </button>
    );
  }

  // pill
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        ...baseStyle,
        padding: size === "sm" ? "6px 12px" : "8px 14px",
        borderRadius: 9999,
        background: active ? t.surface : hovered ? t.surfaceRaised : "transparent",
        color: active ? t.textDisplay : t.textSecondary,
        boxShadow: active ? `0 0 0 1px ${t.border}` : "none",
      }}
    >
      {item.label}
      {item.badge}
    </button>
  );
}
