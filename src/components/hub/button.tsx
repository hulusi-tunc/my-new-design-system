"use client";

import {
  forwardRef,
  useState,
  type ButtonHTMLAttributes,
  type CSSProperties,
  type ReactNode,
} from "react";
import Link from "next/link";
import { useTheme } from "@/components/providers/theme-provider";
import {
  getNd,
  getShadow,
  motion,
  swatchRadii,
  applyType,
} from "@/lib/nothing-tokens";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "destructive";
export type ButtonSize = "sm" | "md" | "lg";
export type ButtonShape = "pill" | "rounded";

interface BaseButtonProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  shape?: ButtonShape;
  leadingIcon?: ReactNode;
  trailingIcon?: ReactNode;
  loading?: boolean;
  fullWidth?: boolean;
}

interface ButtonAsButton
  extends BaseButtonProps,
    Omit<ButtonHTMLAttributes<HTMLButtonElement>, "size"> {
  href?: undefined;
}

interface ButtonAsLink extends BaseButtonProps {
  href: string;
  target?: string;
  rel?: string;
  onClick?: () => void;
  disabled?: boolean;
  "aria-label"?: string;
  children?: ReactNode;
  style?: CSSProperties;
  className?: string;
}

type ButtonProps = ButtonAsButton | ButtonAsLink;

const SIZE_TOKENS: Record<
  ButtonSize,
  {
    height: number;
    paddingX: number;
    gap: number;
    type: "bodySm" | "bodyMd";
    iconSize: number;
  }
> = {
  sm: { height: 28, paddingX: 12, gap: 6, type: "bodyXs" as never, iconSize: 14 },
  md: { height: 34, paddingX: 16, gap: 8, type: "bodySm", iconSize: 16 },
  lg: { height: 40, paddingX: 20, gap: 10, type: "bodyMd", iconSize: 18 },
};

export const Button = forwardRef<HTMLButtonElement | HTMLAnchorElement, ButtonProps>(
  function Button(props, ref) {
    const {
      variant = "secondary",
      size = "md",
      shape = "pill",
      leadingIcon,
      trailingIcon,
      loading = false,
      fullWidth = false,
      children,
    } = props;

    const { theme } = useTheme();
    const t = getNd(theme);
    const sh = getShadow(theme);
    const [hovered, setHovered] = useState(false);
    const [pressed, setPressed] = useState(false);
    const [focused, setFocused] = useState(false);

    const sizeTok = SIZE_TOKENS[size];
    const isHero = variant === "primary" || variant === "destructive";
    const radius = shape === "pill" ? swatchRadii.full : swatchRadii.md;

    const palette = paletteFor(variant, t, { hovered, pressed });

    const style: CSSProperties = {
      ...(applyType(sizeTok.type as never) as CSSProperties),
      fontWeight: 500,
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      gap: sizeTok.gap,
      height: sizeTok.height,
      padding: `0 ${sizeTok.paddingX}px`,
      borderRadius: radius,
      border: palette.border
        ? `1px solid ${palette.border}`
        : "1px solid transparent",
      background: palette.bg,
      color: palette.fg,
      cursor: loading || isDisabled(props) ? "not-allowed" : "pointer",
      textDecoration: "none",
      transform: isHero && hovered && !pressed ? "translateY(-1px)" : "none",
      transition: isHero ? motion.transition.hero : motion.transition.chrome,
      boxShadow: focused ? sh.focus : "none",
      outline: "none",
      width: fullWidth ? "100%" : undefined,
      opacity: isDisabled(props) || loading ? 0.55 : 1,
      whiteSpace: "nowrap",
      userSelect: "none",
      lineHeight: 1,
    };

    const hoverHandlers = {
      onMouseEnter: () => setHovered(true),
      onMouseLeave: () => {
        setHovered(false);
        setPressed(false);
      },
      onMouseDown: () => setPressed(true),
      onMouseUp: () => setPressed(false),
      onFocus: () => setFocused(true),
      onBlur: () => {
        setFocused(false);
        setPressed(false);
      },
    };

    const content = (
      <>
        {loading ? (
          <Spinner size={sizeTok.iconSize} color={palette.fg} />
        ) : (
          leadingIcon && <span style={{ display: "inline-flex" }}>{leadingIcon}</span>
        )}
        {children && <span>{children}</span>}
        {trailingIcon && !loading && (
          <span style={{ display: "inline-flex" }}>{trailingIcon}</span>
        )}
      </>
    );

    if ("href" in props && props.href) {
      const linkProps = props as ButtonAsLink;
      return (
        <Link
          ref={ref as React.Ref<HTMLAnchorElement>}
          href={linkProps.href}
          target={linkProps.target}
          rel={linkProps.rel}
          onClick={linkProps.onClick}
          aria-label={linkProps["aria-label"]}
          aria-disabled={isDisabled(props) || loading || undefined}
          className={linkProps.className}
          style={{ ...style, ...linkProps.style }}
          {...hoverHandlers}
        >
          {content}
        </Link>
      );
    }

    const {
      variant: _v,
      size: _s,
      shape: _sh,
      leadingIcon: _li,
      trailingIcon: _ti,
      loading: _ld,
      fullWidth: _fw,
      href: _h,
      children: _c,
      ...btnRest
    } = props as ButtonAsButton;
    void _v;
    void _s;
    void _sh;
    void _li;
    void _ti;
    void _ld;
    void _fw;
    void _h;
    void _c;

    return (
      <button
        ref={ref as React.Ref<HTMLButtonElement>}
        type={btnRest.type ?? "button"}
        disabled={btnRest.disabled || loading}
        style={style}
        {...btnRest}
        {...hoverHandlers}
      >
        {content}
      </button>
    );
  }
);

// ── Variants ──

function paletteFor(
  variant: ButtonVariant,
  t: ReturnType<typeof getNd>,
  state: { hovered: boolean; pressed: boolean }
): { bg: string; fg: string; border?: string } {
  const { hovered, pressed } = state;
  switch (variant) {
    case "primary":
      return {
        bg: t.textDisplay,
        fg: t.black,
      };
    case "secondary":
      return {
        bg: hovered ? t.surface : "transparent",
        fg: t.textDisplay,
        border: pressed ? t.borderStrong : t.borderVisible,
      };
    case "ghost":
      return {
        bg: hovered ? t.surface : "transparent",
        fg: hovered ? t.textDisplay : t.textSecondary,
      };
    case "destructive":
      return {
        bg: hovered ? t.danger : t.danger,
        fg: t.accentFg,
      };
  }
}

function isDisabled(props: ButtonProps): boolean {
  if ("href" in props) return Boolean(props.disabled);
  return Boolean(props.disabled);
}

// ── Spinner ──

function Spinner({ size, color }: { size: number; color: string }) {
  return (
    <span
      style={{
        display: "inline-block",
        width: size,
        height: size,
        border: `2px solid ${color}`,
        borderTopColor: "transparent",
        borderRadius: "50%",
        animation: "hub-spin 700ms linear infinite",
      }}
    >
      <style>{`@keyframes hub-spin { to { transform: rotate(360deg); } }`}</style>
    </span>
  );
}

/* ── IconButton ──────────────────────────────────── */

interface IconButtonProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "size" | "children"> {
  variant?: "ghost" | "secondary" | "primary";
  size?: "sm" | "md" | "lg";
  "aria-label": string;
  children: ReactNode;
}

const ICON_SIZES: Record<NonNullable<IconButtonProps["size"]>, number> = {
  sm: 28,
  md: 34,
  lg: 40,
};

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  function IconButton(
    { variant = "ghost", size = "md", style: styleOverride, children, ...rest },
    ref
  ) {
    const { theme } = useTheme();
    const t = getNd(theme);
    const sh = getShadow(theme);
    const [hovered, setHovered] = useState(false);
    const [focused, setFocused] = useState(false);
    const dim = ICON_SIZES[size];

    const palette = paletteFor(
      variant === "secondary" ? "secondary" : variant === "primary" ? "primary" : "ghost",
      t,
      { hovered, pressed: false }
    );

    const style: CSSProperties = {
      width: dim,
      height: dim,
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      borderRadius: swatchRadii.md,
      border: palette.border
        ? `1px solid ${palette.border}`
        : "1px solid transparent",
      background: palette.bg,
      color: palette.fg,
      cursor: rest.disabled ? "not-allowed" : "pointer",
      transition: motion.transition.chrome,
      boxShadow: focused ? sh.focus : "none",
      outline: "none",
      padding: 0,
      opacity: rest.disabled ? 0.55 : 1,
      ...styleOverride,
    };

    return (
      <button
        ref={ref}
        type={rest.type ?? "button"}
        style={style}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        {...rest}
      >
        {children}
      </button>
    );
  }
);
