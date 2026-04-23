"use client";

import {
  forwardRef,
  useState,
  type TextareaHTMLAttributes,
} from "react";
import { getSemanticTokens } from "@/styles/design-tokens";
import { useTheme } from "@/components/providers/theme-provider";

export type TextareaSize = "sm" | "md";

export interface TextareaProps
  extends Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, "size"> {
  /** sm = 14px font, md = 16px font */
  textareaSize?: TextareaSize;
  /** Label above the textarea */
  label?: string;
  /** Hint text below the textarea (hidden when error is set) */
  hint?: string;
  /** Error message below the textarea */
  error?: string;
}

const sizeConfig: Record<
  TextareaSize,
  { px: number; py: number; fontSize: number; lineHeight: number; radius: number }
> = {
  sm: { px: 12, py: 10, fontSize: 14, lineHeight: 20, radius: 8 },
  md: { px: 14, py: 12, fontSize: 16, lineHeight: 24, radius: 8 },
};

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  function Textarea(
    {
      textareaSize = "sm",
      label,
      hint,
      error,
      disabled = false,
      rows = 4,
      style,
      onFocus,
      onBlur,
      ...rest
    },
    ref
  ) {
    const { theme, brandPalette } = useTheme();
    const tokens = getSemanticTokens(theme, brandPalette);
    const c = sizeConfig[textareaSize];
    const hasError = !!error;
    const [focused, setFocused] = useState(false);

    const borderColor = disabled
      ? tokens.border.disabled
      : hasError
        ? tokens.border.error
        : focused
          ? tokens.border.brand
          : tokens.border.primary;

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

    const textareaStyle: React.CSSProperties = {
      width: "100%",
      padding: `${c.py}px ${c.px}px`,
      background: disabled ? tokens.bg.disabledSubtle : tokens.bg.primary,
      border: `1px solid ${borderColor}`,
      borderRadius: c.radius,
      boxShadow,
      fontSize: c.fontSize,
      lineHeight: `${c.lineHeight}px`,
      fontFamily: "inherit",
      color: disabled ? tokens.text.disabled : tokens.text.primary,
      outline: "none",
      resize: "vertical",
      transition: "border-color 120ms ease, box-shadow 120ms ease",
      cursor: disabled ? "not-allowed" : "text",
    };

    const hintStyle: React.CSSProperties = {
      fontSize: 14,
      lineHeight: "20px",
      color: hasError ? tokens.text.errorPrimary : tokens.text.tertiary,
    };

    return (
      <div style={wrapperStyle}>
        {label && <label style={labelStyle}>{label}</label>}

        <textarea
          ref={ref}
          disabled={disabled}
          rows={rows}
          style={textareaStyle}
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

        {(hint || error) && (
          <span style={hintStyle}>{error || hint}</span>
        )}
      </div>
    );
  }
);
