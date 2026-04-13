"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, type CSSProperties } from "react";
import { useTheme } from "@/components/providers/theme-provider";
import { getNd, editorialFonts, swatchRadii } from "@/lib/nothing-tokens";
import { HuberaLogo } from "@/components/brand/hubera-logo";

// Remix icons — established project icon library
import SearchLineIcon from "remixicon-react/SearchLineIcon";
import BookmarkLineIcon from "remixicon-react/BookmarkLineIcon";
import Notification3LineIcon from "remixicon-react/Notification3LineIcon";
import SunLineIcon from "remixicon-react/SunLineIcon";
import MoonLineIcon from "remixicon-react/MoonLineIcon";

export const TOPNAV_HEIGHT = 60;


/* ─────────────────────────────────────── Nav link ─────────────────────────────────────── */

function NavLink({
  href,
  label,
  active,
  color,
  hoverColor,
}: {
  href: string;
  label: string;
  active: boolean;
  color: string;
  hoverColor: string;
}) {
  const [hovered, setHovered] = useState(false);

  const style: CSSProperties = {
    fontFamily: editorialFonts.body,
    fontSize: 14,
    fontWeight: active ? 600 : 500,
    color: active ? hoverColor : hovered ? hoverColor : color,
    textDecoration: "none",
    padding: "6px 2px",
    transition: "color 120ms ease-out",
  };

  return (
    <Link
      href={href}
      style={style}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {label}
    </Link>
  );
}

/* ─────────────────────────────────────── Icon button ──────────────────────────────────── */

function IconButton({
  onClick,
  children,
  color,
  hoverColor,
  hoverBg,
  ariaLabel,
}: {
  onClick?: () => void;
  children: React.ReactNode;
  color: string;
  hoverColor: string;
  hoverBg: string;
  ariaLabel: string;
}) {
  const [hovered, setHovered] = useState(false);

  const style: CSSProperties = {
    width: 34,
    height: 34,
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: swatchRadii.md,
    border: "none",
    background: hovered ? hoverBg : "transparent",
    color: hovered ? hoverColor : color,
    cursor: "pointer",
    transition: "background 120ms ease-out, color 120ms ease-out",
    padding: 0,
  };

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={style}
      aria-label={ariaLabel}
      type="button"
    >
      {children}
    </button>
  );
}

/* ─────────────────────────────────────── Top nav ──────────────────────────────────────── */

export function DSTopNav() {
  const { theme, toggle } = useTheme();
  const t = getNd(theme);
  const pathname = usePathname();
  const [searchFocused, setSearchFocused] = useState(false);
  const [avatarHovered, setAvatarHovered] = useState(false);

  const isActive = (href: string) => {
    if (href === "/catalog") {
      return pathname === "/catalog" || pathname.startsWith("/ds/");
    }
    return pathname === href || pathname.startsWith(href + "/");
  };

  /* ── styles ──────────────────────────── */

  const navStyle: CSSProperties = {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    height: TOPNAV_HEIGHT,
    background: t.black,
    borderBottom: `1px solid ${t.border}`,
    display: "flex",
    alignItems: "center",
    gap: 28,
    padding: "0 24px",
    zIndex: 50,
    fontFamily: editorialFonts.body,
  };

  const leftStyle: CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: 24,
    flexShrink: 0,
  };

  const logoLinkStyle: CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    textDecoration: "none",
  };

  const centerStyle: CSSProperties = {
    flex: 1,
    display: "flex",
    justifyContent: "center",
    minWidth: 0,
  };

  const searchStyle: CSSProperties = {
    width: "100%",
    maxWidth: 560,
    height: 40,
    borderRadius: swatchRadii.full,
    border: `1px solid ${searchFocused ? t.borderStrong : t.border}`,
    background: searchFocused ? t.surface : t.surfaceInk,
    display: "flex",
    alignItems: "center",
    padding: "0 16px",
    gap: 10,
    transition: "border-color 120ms ease-out, background 120ms ease-out",
  };

  const searchInputStyle: CSSProperties = {
    flex: 1,
    border: "none",
    outline: "none",
    background: "transparent",
    color: t.textPrimary,
    fontFamily: editorialFonts.body,
    fontSize: 13,
    minWidth: 0,
  };

  const rightStyle: CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: 4,
    flexShrink: 0,
  };

  const avatarStyle: CSSProperties = {
    width: 32,
    height: 32,
    borderRadius: swatchRadii.full,
    background: t.accent,
    color: t.accentFg,
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 13,
    fontWeight: 600,
    fontFamily: editorialFonts.body,
    border: `1px solid ${avatarHovered ? t.accentHover : "transparent"}`,
    cursor: "pointer",
    marginLeft: 8,
    transition: "border-color 120ms ease-out",
  };

  return (
    <nav style={navStyle}>
      {/* ── Left: logo + nav links ───────── */}
      <div style={leftStyle}>
        <Link
          href="/catalog"
          style={{
            ...logoLinkStyle,
            color: t.textDisplay,
            display: "inline-flex",
            alignItems: "center",
            gap: 10,
          }}
          aria-label="Hubera home"
        >
          <HuberaLogo variant="mark" height={22} />
          <span
            style={{
              fontFamily: editorialFonts.display,
              fontSize: 16,
              fontWeight: 600,
              color: t.textDisplay,
              letterSpacing: "-0.01em",
            }}
          >
            Hubera
          </span>
        </Link>

        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <NavLink
            href="/catalog"
            label="Design Systems"
            active={isActive("/catalog")}
            color={t.textSecondary}
            hoverColor={t.textDisplay}
          />
          <NavLink
            href="/skills"
            label="Skills"
            active={isActive("/skills")}
            color={t.textSecondary}
            hoverColor={t.textDisplay}
          />
        </div>
      </div>

      {/* ── Center: search pill ──────────── */}
      <div style={centerStyle}>
        <div style={searchStyle}>
          <span style={{ color: t.textSecondary, display: "inline-flex" }}>
            <SearchLineIcon size={16} />
          </span>
          <input
            type="text"
            placeholder="Search design systems, skills..."
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
            style={searchInputStyle}
            aria-label="Global search"
          />
          <span
            style={{
              fontFamily: editorialFonts.mono,
              fontSize: 11,
              color: t.textDisabled,
              padding: "2px 6px",
              border: `1px solid ${t.border}`,
              borderRadius: swatchRadii.sm,
            }}
          >
            ⌘K
          </span>
        </div>
      </div>

      {/* ── Right: icons + avatar ───────── */}
      <div style={rightStyle}>
        <IconButton
          color={t.textSecondary}
          hoverColor={t.textDisplay}
          hoverBg={t.surface}
          ariaLabel="Bookmarks"
        >
          <BookmarkLineIcon size={18} />
        </IconButton>
        <IconButton
          color={t.textSecondary}
          hoverColor={t.textDisplay}
          hoverBg={t.surface}
          ariaLabel="Notifications"
        >
          <Notification3LineIcon size={18} />
        </IconButton>
        <IconButton
          onClick={toggle}
          color={t.textSecondary}
          hoverColor={t.textDisplay}
          hoverBg={t.surface}
          ariaLabel={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
        >
          {theme === "dark" ? <SunLineIcon size={18} /> : <MoonLineIcon size={18} />}
        </IconButton>

        <div
          style={avatarStyle}
          onMouseEnter={() => setAvatarHovered(true)}
          onMouseLeave={() => setAvatarHovered(false)}
          role="button"
          tabIndex={0}
          aria-label="Your account"
        >
          H
        </div>
      </div>
    </nav>
  );
}
