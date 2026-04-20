"use client";

import {
  forwardRef,
  useState,
  type CSSProperties,
  type ReactNode,
  type HTMLAttributes,
} from "react";
import Link from "next/link";
import { useTheme } from "@/components/providers/theme-provider";
import {
  getNd,
  getShadow,
  motion,
  swatchRadii,
} from "@/lib/nothing-tokens";

type Tone = "default" | "ink" | "raised";
type Pad = "none" | "sm" | "md" | "lg";
type Radius = "sm" | "md" | "lg" | "xl";

interface CardProps extends Omit<HTMLAttributes<HTMLDivElement>, "children"> {
  tone?: Tone;
  pad?: Pad;
  radius?: Radius;
  bordered?: boolean;
  /** If true, card lifts on hover (hero motion). Implies interactive. */
  interactive?: boolean;
  href?: string;
  children: ReactNode;
}

const PAD_MAP: Record<Pad, number | undefined> = {
  none: undefined,
  sm: 12,
  md: 16,
  lg: 24,
};

const RADIUS_MAP: Record<Radius, number> = {
  sm: swatchRadii.md,
  md: swatchRadii.lg,
  lg: swatchRadii.xl,
  xl: swatchRadii.xl + 4,
};

function bgFor(tone: Tone, t: ReturnType<typeof getNd>): string {
  switch (tone) {
    case "default":
      return t.surface;
    case "ink":
      return t.surfaceInk;
    case "raised":
      return t.surfaceRaised;
  }
}

export const Card = forwardRef<HTMLDivElement, CardProps>(function Card(
  {
    tone = "default",
    pad = "md",
    radius = "md",
    bordered = true,
    interactive = false,
    href,
    style,
    children,
    ...rest
  },
  ref
) {
  const { theme } = useTheme();
  const t = getNd(theme);
  const sh = getShadow(theme);
  const [hovered, setHovered] = useState(false);

  const merged: CSSProperties = {
    background: bgFor(tone, t),
    border: bordered ? `1px solid ${t.border}` : "none",
    borderRadius: RADIUS_MAP[radius],
    padding: PAD_MAP[pad],
    transition: interactive ? motion.transition.hero : motion.transition.chrome,
    transform: interactive && hovered ? "translateY(-2px)" : "none",
    boxShadow: interactive && hovered ? sh.medium : "none",
    cursor: interactive || href ? "pointer" : undefined,
    display: "block",
    textDecoration: "none",
    color: "inherit",
    ...style,
  };

  const hoverProps = interactive || href
    ? {
        onMouseEnter: () => setHovered(true),
        onMouseLeave: () => setHovered(false),
      }
    : {};

  if (href) {
    return (
      <Link href={href} style={merged} {...hoverProps}>
        {children}
      </Link>
    );
  }

  return (
    <div ref={ref} style={merged} {...hoverProps} {...rest}>
      {children}
    </div>
  );
});
