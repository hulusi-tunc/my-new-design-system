"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, type CSSProperties } from "react";
import { useTheme } from "@/components/providers/theme-provider";
import {
  getNd,
  editorialFonts,
  swatchRadii,
  space,
} from "@/lib/nothing-tokens";
import { HuberaLogo } from "@/components/brand/hubera-logo";
import { createClient } from "@/lib/supabase/client";
import { isAdminEmail } from "@/lib/auth/admin";
import type { User } from "@supabase/supabase-js";
import { DesignSystemsNav } from "@/components/design-systems-nav";
import { useCurrentCategory } from "@/lib/use-current-category";
import { getCategoryMeta } from "@/lib/platforms";
import {
  Avatar,
  Button,
  IconButton,
  NavLink,
  Row,
} from "@/components/hub";

import SearchLineIcon from "remixicon-react/SearchLineIcon";
import BookmarkLineIcon from "remixicon-react/BookmarkLineIcon";
import Notification3LineIcon from "remixicon-react/Notification3LineIcon";
import SunLineIcon from "remixicon-react/SunLineIcon";
import MoonLineIcon from "remixicon-react/MoonLineIcon";

export const TOPNAV_HEIGHT = 60;

export function DSTopNav() {
  const { theme, toggle } = useTheme();
  const t = getNd(theme);
  const pathname = usePathname();
  const currentCategory = useCurrentCategory();
  const categoryMeta = getCategoryMeta(currentCategory);
  const [searchFocused, setSearchFocused] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [authReady, setAuthReady] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    let mounted = true;

    supabase.auth.getUser().then(({ data }) => {
      if (mounted) {
        setUser(data.user);
        setAuthReady(true);
      }
    });

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (mounted) setUser(session?.user ?? null);
      }
    );

    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  const githubUsername =
    (user?.user_metadata?.user_name as string | undefined) ??
    (user?.user_metadata?.preferred_username as string | undefined) ??
    user?.email?.split("@")[0] ??
    "";
  const avatarUrl = user?.user_metadata?.avatar_url as string | undefined;

  const isActive = (href: string) => {
    if (href === "/catalog") {
      return pathname.startsWith("/catalog") || pathname.startsWith("/ds/");
    }
    return pathname === href || pathname.startsWith(href + "/");
  };

  const navStyle: CSSProperties = {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    height: TOPNAV_HEIGHT,
    background: t.black,
    display: "flex",
    alignItems: "center",
    gap: 28,
    padding: `0 ${space[6]}px`,
    zIndex: 50,
    fontFamily: editorialFonts.body,
  };

  const searchStyle: CSSProperties = {
    width: "100%",
    maxWidth: 560,
    height: 40,
    borderRadius: swatchRadii.full,
    border: "none",
    background: searchFocused ? t.surface : t.surfaceInk,
    display: "flex",
    alignItems: "center",
    padding: "0 16px",
    gap: 10,
    transition: "background 120ms ease-out",
  };

  return (
    <nav style={navStyle}>
      {/* ── Left: logo + nav links ───────── */}
      <Row gap={6} align="center" style={{ flexShrink: 0 }}>
        <Link
          href="/catalog"
          aria-label="Hubera home"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 10,
            color: t.textDisplay,
            textDecoration: "none",
          }}
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

        <Row gap={5} align="center">
          <DesignSystemsNav
            label="Design Systems"
            variant="topnav"
            active={isActive("/catalog")}
          />
          <NavLink href="/skills" active={isActive("/skills")}>
            Skills
          </NavLink>
          {isAdminEmail(user?.email) && (
            <NavLink href="/admin" active={isActive("/admin")}>
              Admin
            </NavLink>
          )}
        </Row>
      </Row>

      {/* ── Center: search pill ──────────── */}
      <div style={{ flex: 1, display: "flex", justifyContent: "center", minWidth: 0 }}>
        <div style={searchStyle}>
          <span style={{ color: t.textSecondary, display: "inline-flex" }}>
            <SearchLineIcon size={16} />
          </span>
          <input
            type="text"
            placeholder={`Search ${categoryMeta.searchLabel} design systems…`}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
            style={{
              flex: 1,
              border: "none",
              outline: "none",
              background: "transparent",
              color: t.textPrimary,
              fontFamily: editorialFonts.body,
              fontSize: 13,
              minWidth: 0,
            }}
            aria-label={`Search ${categoryMeta.label} design systems`}
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

      {/* ── Right: icons + auth ─────────── */}
      <Row gap={1} align="center" style={{ flexShrink: 0 }}>
        <IconButton variant="ghost" size="md" aria-label="Bookmarks">
          <BookmarkLineIcon size={18} />
        </IconButton>
        <IconButton variant="ghost" size="md" aria-label="Notifications">
          <Notification3LineIcon size={18} />
        </IconButton>
        <IconButton
          variant="ghost"
          size="md"
          aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
          onClick={toggle}
        >
          {theme === "dark" ? <SunLineIcon size={18} /> : <MoonLineIcon size={18} />}
        </IconButton>

        {authReady && !user && (
          <Button
            variant="secondary"
            size="sm"
            href="/login"
            style={{ marginLeft: 8 }}
          >
            Sign in
          </Button>
        )}

        {user && (
          <Avatar
            src={avatarUrl}
            label={githubUsername || "Account"}
            size="md"
            href="/dashboard"
            style={{ marginLeft: 8 }}
          />
        )}
      </Row>
    </nav>
  );
}
