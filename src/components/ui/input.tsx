"use client";

import {
  forwardRef,
  useState,
  type InputHTMLAttributes,
  type ReactNode,
} from "react";
import { getSemanticTokens } from "@/styles/design-tokens";
import { useTheme } from "@/components/providers/theme-provider";

export type InputSize = "sm" | "md";

export interface InputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "size"> {
  /** sm = 40px, md = 44px */
  inputSize?: InputSize;
  /** Label above the input */
  label?: string;
  /** Hint text below the input (hidden when error is set) */
  hint?: string;
  /** Error message below the input */
  error?: string;
  /** Icon or element on the left inside the input */
  leadingIcon?: ReactNode;
  /** Icon or element on the right inside the input */
  trailingIcon?: ReactNode;
  /** Text addon on the left (e.g. "https://") */
  leadingText?: string;
  /** Text addon on the right (e.g. ".com") */
  trailingText?: string;
  /** Dropdown element on the left (e.g. country code) */
  leadingDropdown?: ReactNode;
}

const sizeConfig: Record<
  InputSize,
  {
    height: number;
    px: number;
    py: number;
    fontSize: number;
    lineHeight: number;
    radius: number;
    iconSize: number;
    gap: number;
  }
> = {
  sm: { height: 40, px: 12, py: 8, fontSize: 14, lineHeight: 20, radius: 8, iconSize: 20, gap: 8 },
  md: { height: 44, px: 14, py: 10, fontSize: 16, lineHeight: 24, radius: 8, iconSize: 20, gap: 8 },
};

function HelpCircleIcon({ size = 16, color = "currentColor" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
      <path d="M12 17h.01" />
    </svg>
  );
}

function AlertCircleIcon({ size = 16, color = "currentColor" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  );
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  function Input(
    {
      inputSize = "sm",
      label,
      hint,
      error,
      leadingIcon,
      trailingIcon,
      leadingText,
      trailingText,
      leadingDropdown,
      disabled = false,
      style,
      onFocus,
      onBlur,
      ...rest
    },
    ref
  ) {
    const { theme, brandPalette } = useTheme();
    const tokens = getSemanticTokens(theme, brandPalette);
    const c = sizeConfig[inputSize];
    const hasError = !!error;
    const [focused, setFocused] = useState(false);

    const hasLeadingAddon = !!leadingText || !!leadingDropdown;
    const hasTrailingAddon = !!trailingText;

    // border color
    const borderColor = disabled
      ? tokens.border.disabled
      : hasError
        ? tokens.border.error
        : focused
          ? tokens.border.brand
          : tokens.border.primary;

    // shadow
    const boxShadow = focused && !disabled
      ? hasError
        ? `0 0 0 4px ${tokens.bg.errorSecondary}`
        : `0 0 0 4px ${tokens.bg.brandSecondary}`
      : "none";

    const wrapperStyle: React.CSSProperties = {
      display: "flex",
      flexDirection: "column",
      gap: 6,
      fontFamily: "var(--font-sans), system-ui, sans-serif",
      ...style,
    };

    const labelStyle: React.CSSProperties = {
      fontSize: 14,
      lineHeight: "20px",
      fontWeight: 500,
      color: tokens.text.secondary,
    };

    const containerStyle: React.CSSProperties = {
      display: "flex",
      alignItems: "center",
      height: c.height,
      background: disabled ? tokens.bg.disabledSubtle : tokens.bg.primary,
      border: `1px solid ${borderColor}`,
      borderRadius: c.radius,
      boxShadow,
      transition: "border-color 120ms ease, box-shadow 120ms ease",
      overflow: "hidden",
      cursor: disabled ? "not-allowed" : "text",
    };

    const inputStyle: React.CSSProperties = {
      flex: 1,
      height: "100%",
      border: "none",
      outline: "none",
      background: "transparent",
      fontSize: c.fontSize,
      lineHeight: `${c.lineHeight}px`,
      fontFamily: "inherit",
      color: disabled ? tokens.text.disabled : tokens.text.primary,
      padding: `${c.py}px ${c.px}px`,
      paddingLeft: leadingIcon || hasLeadingAddon ? 0 : c.px,
      paddingRight: trailingIcon || hasTrailingAddon || hasError ? 0 : c.px,
      cursor: disabled ? "not-allowed" : "text",
      minWidth: 0,
    };

    const iconWrapperStyle = (side: "left" | "right"): React.CSSProperties => ({
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      flexShrink: 0,
      width: c.iconSize,
      height: c.iconSize,
      color: hasError && side === "right" ? tokens.fg.errorPrimary : tokens.fg.quaternary,
      ...(side === "left"
        ? { marginLeft: c.px }
        : { marginRight: c.px }),
    });

    const addonTextStyle = (side: "left" | "right"): React.CSSProperties => ({
      display: "flex",
      alignItems: "center",
      flexShrink: 0,
      fontSize: c.fontSize,
      lineHeight: `${c.lineHeight}px`,
      color: tokens.text.tertiary,
      whiteSpace: "nowrap",
      userSelect: "none",
      ...(side === "left"
        ? { paddingLeft: c.px, borderRight: `1px solid ${borderColor}`, paddingRight: c.px - 2, marginRight: 2 }
        : { paddingRight: c.px, borderLeft: `1px solid ${borderColor}`, paddingLeft: c.px - 2, marginLeft: 2 }),
      height: "100%",
    });

    const dropdownWrapperStyle: React.CSSProperties = {
      display: "flex",
      alignItems: "center",
      flexShrink: 0,
      height: "100%",
      borderRight: `1px solid ${borderColor}`,
      paddingLeft: c.px,
      paddingRight: c.px - 4,
    };

    const hintStyle: React.CSSProperties = {
      fontSize: 14,
      lineHeight: "20px",
      color: hasError ? tokens.text.errorPrimary : tokens.text.tertiary,
    };

    return (
      <div style={wrapperStyle}>
        {label && <label style={labelStyle}>{label}</label>}

        <div style={containerStyle}>
          {/* Leading dropdown */}
          {leadingDropdown && (
            <div style={dropdownWrapperStyle}>{leadingDropdown}</div>
          )}

          {/* Leading text addon */}
          {leadingText && (
            <span style={addonTextStyle("left")}>{leadingText}</span>
          )}

          {/* Leading icon */}
          {leadingIcon && !hasLeadingAddon && (
            <span style={iconWrapperStyle("left")}>{leadingIcon}</span>
          )}

          <input
            ref={ref}
            disabled={disabled}
            style={inputStyle}
            onFocus={(e) => {
              setFocused(true);
              onFocus?.(e);
            }}
            onBlur={(e) => {
              setFocused(false);
              onBlur?.(e);
            }}
            {...rest}
          />

          {/* Trailing icon or error icon */}
          {hasError && !trailingIcon && !hasTrailingAddon && (
            <span style={iconWrapperStyle("right")}>
              <AlertCircleIcon size={c.iconSize} />
            </span>
          )}
          {trailingIcon && !hasTrailingAddon && (
            <span style={iconWrapperStyle("right")}>{trailingIcon}</span>
          )}

          {/* Trailing text addon */}
          {trailingText && (
            <span style={addonTextStyle("right")}>{trailingText}</span>
          )}
        </div>

        {(hint || error) && (
          <span style={hintStyle}>{error || hint}</span>
        )}
      </div>
    );
  }
);
