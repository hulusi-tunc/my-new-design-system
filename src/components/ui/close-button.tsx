"use client";

import { forwardRef, type ButtonHTMLAttributes } from "react";
import { useTheme } from "@/components/providers/theme-provider";

export type CloseButtonSize = "sm" | "md" | "lg";

export interface CloseButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  size?: CloseButtonSize;
  darkBackground?: boolean;
}

const sizes: Record<CloseButtonSize, { box: number; icon: number }> = {
  sm: { box: 36, icon: 20 },
  md: { box: 40, icon: 20 },
  lg: { box: 44, icon: 24 },
};

function XIcon({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 6L6 18M6 6l12 12" />
    </svg>
  );
}

export const CloseButton = forwardRef<HTMLButtonElement, CloseButtonProps>(
  function CloseButton({ size = "sm", darkBackground, disabled, style, ...rest }, ref) {
    const { theme, brandPalette } = useTheme();
    const dark = darkBackground ?? theme === "dark";
    const s = sizes[size];

    const baseStyle: React.CSSProperties = {
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      width: s.box,
      height: s.box,
      borderRadius: 8,
      border: "none",
      background: "transparent",
      color: dark ? "rgba(255,255,255,0.7)" : "#A4A7AE",
      cursor: disabled ? "not-allowed" : "pointer",
      opacity: disabled ? 0.4 : 1,
      transition: "all 120ms ease",
      outline: "none",
      padding: 0,
      ...style,
    };

    return (
      <button
        ref={ref}
        disabled={disabled}
        style={baseStyle}
        onMouseEnter={(e) => {
          if (!disabled) {
            e.currentTarget.style.background = dark ? "rgba(255,255,255,0.1)" : "#FAFAFA";
            e.currentTarget.style.color = dark ? "#fff" : "#535862";
          }
        }}
        onMouseLeave={(e) => {
          if (!disabled) {
            e.currentTarget.style.background = "transparent";
            e.currentTarget.style.color = dark ? "rgba(255,255,255,0.7)" : "#A4A7AE";
          }
        }}
        onFocus={(e) => {
          e.currentTarget.style.boxShadow = `0 0 0 2px ${dark ? "#0A0D12" : "#fff"}, 0 0 0 4px ${brandPalette[500]}`;
          e.currentTarget.style.background = dark ? "rgba(255,255,255,0.1)" : "#fff";
        }}
        onBlur={(e) => {
          e.currentTarget.style.boxShadow = "none";
          e.currentTarget.style.background = "transparent";
        }}
        {...rest}
      >
        <XIcon size={s.icon} />
      </button>
    );
  }
);
