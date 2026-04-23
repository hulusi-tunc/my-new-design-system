"use client";

import { forwardRef, useState, type ButtonHTMLAttributes } from "react";
import { colors, getSemanticTokens } from "@/styles/design-tokens";
import { useTheme } from "@/components/providers/theme-provider";

export type SocialPlatform = "google" | "facebook" | "apple" | "twitter";
export type SocialButtonTheme = "brand" | "color" | "gray";
export type SocialButtonSize = "sm" | "md" | "lg" | "xl";

export interface SocialButtonProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children"> {
  platform?: SocialPlatform;
  theme?: SocialButtonTheme;
  size?: SocialButtonSize;
  showText?: boolean;
}

/* ── Brand colors ─────────────────────────────────────── */
const brandColors: Record<SocialPlatform, string> = {
  google: "#4285F4",
  facebook: "#1877F2",
  apple: "#000000",
  twitter: "#000000",
};

/* ── Labels ───────────────────────────────────────────── */
const platformLabels: Record<SocialPlatform, string> = {
  google: "Sign in with Google",
  facebook: "Sign in with Facebook",
  apple: "Sign in with Apple",
  twitter: "Sign in with X",
};

/* ── Size tokens ──────────────────────────────────────── */
const sizeTokens: Record<
  SocialButtonSize,
  { height: number; px: number; py: number; fontSize: number; lineHeight: string; radius: number; iconSize: number; gap: number }
> = {
  sm: { height: 36, px: 12, py: 8, fontSize: 14, lineHeight: "20px", radius: 8, iconSize: 20, gap: 8 },
  md: { height: 40, px: 16, py: 10, fontSize: 14, lineHeight: "20px", radius: 8, iconSize: 24, gap: 12 },
  lg: { height: 44, px: 16, py: 10, fontSize: 16, lineHeight: "24px", radius: 8, iconSize: 24, gap: 12 },
  xl: { height: 48, px: 18, py: 12, fontSize: 16, lineHeight: "24px", radius: 8, iconSize: 24, gap: 12 },
};

/* ── Theme styles ─────────────────────────────────────── */
function getThemeStyles(
  platform: SocialPlatform,
  theme: SocialButtonTheme,
  mode: "light" | "dark",
  bp?: import("@/styles/color-utils").BrandPalette
): {
  bg: string;
  border: string;
  text: string;
  hoverBg: string;
  iconColor?: string;
} {
  const t = getSemanticTokens(mode, bp);

  switch (theme) {
    case "brand":
      if (platform === "google") {
        return {
          bg: t.bg.primary,
          border: `1px solid ${t.border.primary}`,
          text: t.text.secondary,
          hoverBg: t.bg.primaryHover,
        };
      }
      return {
        bg: brandColors[platform],
        border: `2px solid rgba(255,255,255,0.12)`,
        text: "#FFFFFF",
        hoverBg: platform === "facebook" ? "#1565D8" : "#1a1a1a",
      };

    case "color":
      return {
        bg: t.bg.primary,
        border: `1px solid ${t.border.primary}`,
        text: t.text.secondary,
        hoverBg: t.bg.primaryHover,
      };

    case "gray":
      return {
        bg: t.bg.primary,
        border: `1px solid ${t.border.primary}`,
        text: t.text.secondary,
        hoverBg: t.bg.primaryHover,
        iconColor: t.fg.tertiary,
      };
  }
}

/* ── Platform icons (inline SVG) ──────────────────────── */
function GoogleIcon({ size, gray }: { size: number; gray?: boolean }) {
  if (gray) {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill={colors.gray[400]} />
        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill={colors.gray[400]} />
        <path d="M5.84 14.09A6.97 6.97 0 0 1 5.47 12c0-.72.13-1.43.37-2.09V7.07H2.18A11.96 11.96 0 0 0 0 12c0 1.94.46 3.77 1.28 5.39l3.56-2.77v-.53z" fill={colors.gray[400]} />
        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill={colors.gray[400]} />
      </svg>
    );
  }
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
      <path d="M5.84 14.09A6.97 6.97 0 0 1 5.47 12c0-.72.13-1.43.37-2.09V7.07H2.18A11.96 11.96 0 0 0 0 12c0 1.94.46 3.77 1.28 5.39l3.56-2.77v-.53z" fill="#FBBC05" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
  );
}

function FacebookIcon({ size, gray, white, dark }: { size: number; gray?: boolean; white?: boolean; dark?: boolean }) {
  const fill = gray ? (dark ? colors.gray[400] : colors.gray[700]) : white ? "#FFFFFF" : "#1877F2";
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path d="M24 12c0-6.627-5.373-12-12-12S0 5.373 0 12c0 5.99 4.388 10.954 10.125 11.854V15.47H7.078V12h3.047V9.356c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.875V12h3.328l-.532 3.469h-2.796v8.385C19.612 22.954 24 17.99 24 12z" fill={fill} />
    </svg>
  );
}

function AppleIcon({ size, gray, white, dark }: { size: number; gray?: boolean; white?: boolean; dark?: boolean }) {
  const fill = gray ? (dark ? colors.gray[400] : colors.gray[700]) : white ? "#FFFFFF" : (dark ? "#FFFFFF" : "#000000");
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" fill={fill} />
    </svg>
  );
}

function TwitterIcon({ size, gray, white, dark }: { size: number; gray?: boolean; white?: boolean; dark?: boolean }) {
  const fill = gray ? (dark ? colors.gray[400] : colors.gray[700]) : white ? "#FFFFFF" : (dark ? "#FFFFFF" : "#000000");
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" fill={fill} />
    </svg>
  );
}

function PlatformIcon({
  platform,
  size,
  theme,
  dark,
}: {
  platform: SocialPlatform;
  size: number;
  theme: SocialButtonTheme;
  dark?: boolean;
}) {
  const gray = theme === "gray";
  const white = theme === "brand" && platform !== "google";

  switch (platform) {
    case "google":
      return <GoogleIcon size={size} gray={gray} />;
    case "facebook":
      return <FacebookIcon size={size} gray={gray} white={white} dark={dark} />;
    case "apple":
      return <AppleIcon size={size} gray={gray} white={white} dark={dark} />;
    case "twitter":
      return <TwitterIcon size={size} gray={gray} white={white} dark={dark} />;
  }
}

/* ── SocialButton ─────────────────────────────────────── */
export const SocialButton = forwardRef<HTMLButtonElement, SocialButtonProps>(
  function SocialButton(
    {
      platform = "google",
      theme = "brand",
      size = "md",
      showText = true,
      disabled = false,
      style,
      ...rest
    },
    ref
  ) {
    const [hovered, setHovered] = useState(false);
    const { theme: appTheme, brandPalette } = useTheme();
    const t = sizeTokens[size];
    const s = getThemeStyles(platform, theme, appTheme, brandPalette);

    const buttonStyle: React.CSSProperties = {
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      gap: showText ? t.gap : 0,
      height: t.height,
      padding: showText ? `${t.py}px ${t.px}px` : `${t.py}px`,
      borderRadius: t.radius,
      border: s.border,
      background: hovered && !disabled ? s.hoverBg : s.bg,
      color: s.text,
      fontFamily: "var(--font-sans), system-ui, sans-serif",
      fontWeight: 600,
      fontSize: t.fontSize,
      lineHeight: t.lineHeight,
      cursor: disabled ? "not-allowed" : "pointer",
      opacity: disabled ? 0.5 : 1,
      transition: "all 120ms ease",
      outline: "none",
      whiteSpace: "nowrap",
      boxShadow: appTheme === "dark" ? "0px 1px 2px 0px rgba(0,0,0,0.3)" : "0px 1px 2px 0px rgba(10,13,18,0.05)",
      width: showText ? "100%" : undefined,
      ...style,
    };

    return (
      <button
        ref={ref}
        disabled={disabled}
        style={buttonStyle}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        {...rest}
      >
        <span style={{ display: "flex", flexShrink: 0, width: t.iconSize, height: t.iconSize }}>
          <PlatformIcon platform={platform} size={t.iconSize} theme={theme} dark={appTheme === "dark"} />
        </span>
        {showText && platformLabels[platform]}
      </button>
    );
  }
);

/* ── SocialButtonGroup ────────────────────────────────── */
export type SocialButtonGroupLayout = "buttons" | "icons";

export interface SocialButtonGroupProps {
  layout?: SocialButtonGroupLayout;
  theme?: SocialButtonTheme;
  size?: SocialButtonSize;
  platforms?: SocialPlatform[];
  className?: string;
  style?: React.CSSProperties;
  onPlatformClick?: (platform: SocialPlatform) => void;
}

export function SocialButtonGroup({
  layout = "buttons",
  theme = "brand",
  size = "md",
  platforms = ["google", "facebook", "apple"],
  style,
  onPlatformClick,
}: SocialButtonGroupProps) {
  const isIcons = layout === "icons";

  const containerStyle: React.CSSProperties = {
    display: "flex",
    flexDirection: isIcons ? "row" : "column",
    gap: 12,
    alignItems: "center",
    width: isIcons ? undefined : "100%",
    ...style,
  };

  return (
    <div style={containerStyle}>
      {platforms.map((p) => (
        <SocialButton
          key={p}
          platform={p}
          theme={theme}
          size={size}
          showText={!isIcons}
          onClick={() => onPlatformClick?.(p)}
          style={isIcons ? { width: "auto", flex: "1 1 0", minWidth: 0 } : undefined}
        />
      ))}
    </div>
  );
}
