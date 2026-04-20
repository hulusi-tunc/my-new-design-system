"use client";

import Link from "next/link";
import {
  useState,
  type CSSProperties,
  type HTMLAttributes,
} from "react";
import { useTheme } from "@/components/providers/theme-provider";
import {
  getNd,
  editorialFonts,
  swatchRadii,
  motion,
} from "@/lib/nothing-tokens";

type AvatarSize = "xs" | "sm" | "md" | "lg";
const SIZE_MAP: Record<AvatarSize, { box: number; text: number }> = {
  xs: { box: 20, text: 10 },
  sm: { box: 28, text: 12 },
  md: { box: 32, text: 13 },
  lg: { box: 40, text: 15 },
};

interface AvatarProps extends Omit<HTMLAttributes<HTMLSpanElement>, "title"> {
  src?: string | null;
  label: string;
  size?: AvatarSize;
  tone?: "accent" | "neutral";
  title?: string;
  href?: string;
  interactive?: boolean;
}

export function Avatar({
  src,
  label,
  size = "md",
  tone = "accent",
  title,
  href,
  interactive,
  style: styleOverride,
  ...rest
}: AvatarProps) {
  const { theme } = useTheme();
  const t = getNd(theme);
  const dim = SIZE_MAP[size];
  const [hovered, setHovered] = useState(false);
  const initial = label.trim().charAt(0).toUpperCase() || "?";
  const isClickable = Boolean(href || interactive);

  const style: CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    width: dim.box,
    height: dim.box,
    borderRadius: swatchRadii.full,
    background: tone === "accent" ? t.accent : t.surfaceRaised,
    color: tone === "accent" ? t.accentFg : t.textDisplay,
    fontFamily: editorialFonts.body,
    fontSize: dim.text,
    fontWeight: 600,
    border: `1px solid ${hovered && isClickable ? (tone === "accent" ? t.accentHover : t.borderStrong) : "transparent"}`,
    overflow: "hidden",
    backgroundImage: src ? `url(${src})` : undefined,
    backgroundSize: "cover",
    backgroundPosition: "center",
    cursor: isClickable ? "pointer" : "default",
    transition: motion.transition.chrome,
    textDecoration: "none",
    ...styleOverride,
  };

  const content = src ? null : <span aria-hidden="true">{initial}</span>;

  if (href) {
    return (
      <Link
        href={href}
        aria-label={label}
        title={title ?? label}
        style={style}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        {content}
      </Link>
    );
  }

  return (
    <span
      aria-label={label}
      title={title ?? label}
      style={style}
      onMouseEnter={() => isClickable && setHovered(true)}
      onMouseLeave={() => isClickable && setHovered(false)}
      {...rest}
    >
      {content}
    </span>
  );
}
