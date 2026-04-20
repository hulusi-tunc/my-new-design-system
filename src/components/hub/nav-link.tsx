"use client";

import Link from "next/link";
import { useState, type CSSProperties, type ReactNode } from "react";
import { useTheme } from "@/components/providers/theme-provider";
import { getNd, editorialFonts, motion } from "@/lib/nothing-tokens";

type NavVariant = "body" | "mono";

interface NavLinkProps {
  href: string;
  active?: boolean;
  variant?: NavVariant;
  target?: string;
  rel?: string;
  children: ReactNode;
  onClick?: () => void;
}

/**
 * Reusable navigation link with active + hover states.
 * `body` variant: sentence-case 14px (used inside dashboard topnav).
 * `mono` variant: uppercase mono 11px (used inside the site-header pill and landing bar).
 */
export function NavLink({
  href,
  active = false,
  variant = "body",
  target,
  rel,
  children,
  onClick,
}: NavLinkProps) {
  const { theme } = useTheme();
  const t = getNd(theme);
  const [hovered, setHovered] = useState(false);

  const bodyStyle: CSSProperties = {
    fontFamily: editorialFonts.body,
    fontSize: 14,
    fontWeight: active ? 600 : 500,
    padding: "6px 2px",
  };

  const monoStyle: CSSProperties = {
    fontFamily: editorialFonts.mono,
    fontSize: 11,
    letterSpacing: "0.08em",
    textTransform: "uppercase",
    fontWeight: 400,
    padding: "6px 10px",
  };

  const style: CSSProperties = {
    ...(variant === "mono" ? monoStyle : bodyStyle),
    color: active || hovered ? t.textDisplay : t.textSecondary,
    textDecoration: "none",
    transition: `color ${motion.transition.chrome}`,
    cursor: "pointer",
  };

  return (
    <Link
      href={href}
      target={target}
      rel={rel}
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={style}
      aria-current={active ? "page" : undefined}
    >
      {children}
    </Link>
  );
}
