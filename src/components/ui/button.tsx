"use client";

import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react";
import { getSemanticTokens } from "@/styles/design-tokens";
import { useTheme } from "@/components/providers/theme-provider";

export type ButtonVariant =
  | "primary"
  | "secondary"
  | "tertiary"
  | "link-color"
  | "link-gray";

export type ButtonSize = "sm" | "md" | "lg" | "xl";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  destructive?: boolean;
  loading?: boolean;
  iconLeft?: ReactNode;
  iconRight?: ReactNode;
  iconOnly?: boolean;
}

const sizeStyles: Record<ButtonSize, React.CSSProperties> = {
  sm: { height: 36, padding: "8px 12px", fontSize: 14, lineHeight: "20px", borderRadius: 8, gap: 4 },
  md: { height: 40, padding: "10px 14px", fontSize: 14, lineHeight: "20px", borderRadius: 10, gap: 4 },
  lg: { height: 44, padding: "10px 16px", fontSize: 14, lineHeight: "20px", borderRadius: 10, gap: 4 },
  xl: { height: 48, padding: "12px 18px", fontSize: 16, lineHeight: "24px", borderRadius: 12, gap: 4 },
};

const iconOnlySizes: Record<ButtonSize, number> = {
  sm: 36,
  md: 40,
  lg: 44,
  xl: 48,
};

const iconSizes: Record<ButtonSize, number> = {
  sm: 20,
  md: 20,
  lg: 20,
  xl: 20,
};

function getVariantStyles(
  variant: ButtonVariant,
  destructive: boolean,
  mode: "light" | "dark",
  brandPalette?: import("@/styles/color-utils").BrandPalette
): {
  base: React.CSSProperties;
  hover: React.CSSProperties;
  focusRing: string;
} {
  const t = getSemanticTokens(mode, brandPalette);

  if (destructive) {
    switch (variant) {
      case "primary":
        return {
          base: { background: t.bg.errorSolid, color: t.text.white, border: "1px solid " + t.bg.errorSolid },
          hover: { background: t.bg.errorSolidHover },
          focusRing: `0 0 0 4px ${t.bg.errorSecondary}`,
        };
      case "secondary":
        return {
          base: { background: t.bg.primary, color: t.text.errorPrimary, border: "1px solid " + t.border.errorSubtle },
          hover: { background: t.bg.errorPrimary },
          focusRing: `0 0 0 4px ${t.bg.errorSecondary}`,
        };
      case "tertiary":
        return {
          base: { background: "transparent", color: t.text.errorPrimary, border: "1px solid transparent" },
          hover: { background: t.bg.errorPrimary },
          focusRing: `0 0 0 4px ${t.bg.errorSecondary}`,
        };
      case "link-color":
        return {
          base: { background: "transparent", color: t.text.errorPrimary, border: "none" },
          hover: { color: t.fg.errorSecondary },
          focusRing: "none",
        };
      case "link-gray":
        return {
          base: { background: "transparent", color: t.text.errorPrimary, border: "none" },
          hover: { color: t.fg.errorSecondary },
          focusRing: "none",
        };
    }
  }

  switch (variant) {
    case "primary":
      return {
        base: { background: t.bg.brandSolid, color: t.text.white, border: "1px solid " + t.bg.brandSolid },
        hover: { background: t.bg.brandSolidHover },
        focusRing: `0 0 0 4px ${t.bg.brandSecondary}`,
      };
    case "secondary":
      return {
        base: { background: t.bg.primary, color: t.text.secondary, border: "1px solid " + t.border.primary },
        hover: { background: t.bg.primaryHover },
        focusRing: `0 0 0 4px ${t.bg.secondary}`,
      };
    case "tertiary":
      return {
        base: { background: "transparent", color: t.text.tertiary, border: "1px solid transparent" },
        hover: { background: t.bg.primaryHover },
        focusRing: `0 0 0 4px ${t.bg.secondary}`,
      };
    case "link-color":
      return {
        base: { background: "transparent", color: t.fg.brandPrimary, border: "none", padding: 0, height: "auto" },
        hover: { color: t.fg.brandSecondary },
        focusRing: "none",
      };
    case "link-gray":
      return {
        base: { background: "transparent", color: t.text.tertiary, border: "none", padding: 0, height: "auto" },
        hover: { color: t.text.secondary },
        focusRing: "none",
      };
  }
}

function Spinner({ size }: { size: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 20 20"
      fill="none"
      style={{ animation: "spin 1s linear infinite" }}
    >
      <circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="2" opacity="0.25" />
      <path
        d="M10 2a8 8 0 0 1 8 8"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  function Button(
    {
      variant = "primary",
      size = "md",
      destructive = false,
      loading = false,
      disabled = false,
      iconLeft,
      iconRight,
      iconOnly = false,
      children,
      style,
      onMouseEnter,
      onMouseLeave,
      ...rest
    },
    ref
  ) {
    const { theme, brandPalette } = useTheme();
    const sizeStyle = sizeStyles[size];
    const variantStyle = getVariantStyles(variant, destructive, theme, brandPalette);
    const isLink = variant === "link-color" || variant === "link-gray";
    const isDisabled = disabled || loading;
    const iconSize = iconSizes[size];

    const baseStyle: React.CSSProperties = {
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      gap: sizeStyle.gap,
      fontFamily: "var(--font-sans), system-ui, sans-serif",
      fontWeight: 500,
      fontSize: sizeStyle.fontSize,
      lineHeight: sizeStyle.lineHeight,
      borderRadius: isLink ? 0 : sizeStyle.borderRadius,
      cursor: isDisabled ? "not-allowed" : "pointer",
      opacity: isDisabled ? 0.5 : 1,
      transition: "all 120ms ease",
      outline: "none",
      whiteSpace: "nowrap",
      ...sizeStyle,
      ...variantStyle.base,
      ...(iconOnly && !isLink
        ? {
            width: iconOnlySizes[size],
            height: iconOnlySizes[size],
            padding: 0,
          }
        : {}),
      ...style,
    };

    return (
      <>
        <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
        <button
          ref={ref}
          disabled={isDisabled}
          style={baseStyle}
          onMouseEnter={(e) => {
            if (!isDisabled) {
              Object.assign(e.currentTarget.style, variantStyle.hover);
            }
            onMouseEnter?.(e);
          }}
          onMouseLeave={(e) => {
            if (!isDisabled) {
              Object.assign(e.currentTarget.style, variantStyle.base);
              if (iconOnly && !isLink) {
                e.currentTarget.style.padding = "0";
                e.currentTarget.style.width = iconOnlySizes[size] + "px";
              }
            }
            onMouseLeave?.(e);
          }}
          onFocus={(e) => {
            if (variantStyle.focusRing !== "none") {
              e.currentTarget.style.boxShadow = variantStyle.focusRing;
            }
          }}
          onBlur={(e) => {
            e.currentTarget.style.boxShadow = "none";
          }}
          {...rest}
        >
          {loading ? (
            <Spinner size={iconSize} />
          ) : (
            iconLeft && (
              <span style={{ display: "flex", width: iconSize, height: iconSize, flexShrink: 0 }}>
                {iconLeft}
              </span>
            )
          )}
          {!iconOnly && (loading ? "Submitting..." : children)}
          {!loading && iconRight && (
            <span style={{ display: "flex", width: iconSize, height: iconSize, flexShrink: 0 }}>
              {iconRight}
            </span>
          )}
        </button>
      </>
    );
  }
);
