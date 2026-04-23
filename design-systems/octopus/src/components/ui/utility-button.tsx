"use client";

import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react";
import { useTheme } from "@/components/providers/theme-provider";

export type UtilityButtonSize = "xs" | "sm";
export type UtilityButtonHierarchy = "secondary" | "tertiary";

export interface UtilityButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  size?: UtilityButtonSize;
  hierarchy?: UtilityButtonHierarchy;
  icon?: ReactNode;
}

const sizeMap: Record<UtilityButtonSize, { box: number; icon: number; padding: number; radius: number }> = {
  xs: { box: 28, icon: 16, padding: 6, radius: 6 },
  sm: { box: 32, icon: 20, padding: 6, radius: 6 },
};

function PlaceholderIcon({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="8" />
    </svg>
  );
}

export const UtilityButton = forwardRef<HTMLButtonElement, UtilityButtonProps>(
  function UtilityButton({ size = "sm", hierarchy = "secondary", icon, disabled, style, ...rest }, ref) {
    const { theme, brandPalette } = useTheme();
    const dark = theme === "dark";
    const s = sizeMap[size];

    const isSecondary = hierarchy === "secondary";

    const baseStyle: React.CSSProperties = {
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      width: s.box,
      height: s.box,
      padding: s.padding,
      borderRadius: s.radius,
      border: isSecondary ? `1px solid ${dark ? "#373A41" : "#D5D7DA"}` : "1px solid transparent",
      background: isSecondary ? (dark ? "#0C0E12" : "#fff") : "transparent",
      color: dark ? "#61656C" : "#A4A7AE",
      cursor: disabled ? "not-allowed" : "pointer",
      opacity: disabled ? 0.5 : 1,
      transition: "all 120ms ease",
      outline: "none",
      boxShadow: isSecondary ? "0px 1px 2px 0px rgba(10,13,18,0.05)" : "none",
      ...style,
    };

    return (
      <button
        ref={ref}
        disabled={disabled}
        style={baseStyle}
        onMouseEnter={(e) => {
          if (!disabled) {
            e.currentTarget.style.background = dark ? "#22262F" : "#FAFAFA";
            e.currentTarget.style.color = dark ? "#85888E" : "#535862";
          }
        }}
        onMouseLeave={(e) => {
          if (!disabled) {
            e.currentTarget.style.background = isSecondary ? (dark ? "#0C0E12" : "#fff") : "transparent";
            e.currentTarget.style.color = dark ? "#61656C" : "#A4A7AE";
          }
        }}
        onFocus={(e) => {
          e.currentTarget.style.boxShadow = `0 0 0 2px ${dark ? "#0C0E12" : "#fff"}, 0 0 0 4px ${brandPalette[500]}`;
        }}
        onBlur={(e) => {
          e.currentTarget.style.boxShadow = isSecondary ? "0px 1px 2px 0px rgba(10,13,18,0.05)" : "none";
        }}
        {...rest}
      >
        {icon || <PlaceholderIcon size={s.icon} />}
      </button>
    );
  }
);
