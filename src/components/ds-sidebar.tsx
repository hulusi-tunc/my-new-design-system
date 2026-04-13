"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useTheme } from "@/components/providers/theme-provider";
import { getNd, editorialFonts, swatchRadii } from "@/lib/nothing-tokens";
import { HuberaLogo } from "@/components/brand/hubera-logo";

export interface SidebarDSItem {
  slug: string;
  name: string;
  brandColor: string;
}

export const SIDEBAR_WIDTH = 240;

/* ── Icons ────────────────────────────────────────────── */

function GridIcon({ color }: { color: string }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden
    >
      <rect x="2" y="2" width="5" height="5" rx="1" stroke={color} strokeWidth="1.4" />
      <rect x="9" y="2" width="5" height="5" rx="1" stroke={color} strokeWidth="1.4" />
      <rect x="2" y="9" width="5" height="5" rx="1" stroke={color} strokeWidth="1.4" />
      <rect x="9" y="9" width="5" height="5" rx="1" stroke={color} strokeWidth="1.4" />
    </svg>
  );
}

function PlusIcon({ color }: { color: string }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden
    >
      <path
        d="M8 3.5V12.5M3.5 8H12.5"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

function SunIcon({ color }: { color: string }) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
      <circle cx="8" cy="8" r="3" stroke={color} strokeWidth="1.4" />
      <path
        d="M8 1.5V3M8 13V14.5M14.5 8H13M3 8H1.5M12.6 12.6L11.5 11.5M4.5 4.5L3.4 3.4M12.6 3.4L11.5 4.5M4.5 11.5L3.4 12.6"
        stroke={color}
        strokeWidth="1.4"
        strokeLinecap="round"
      />
    </svg>
  );
}

function MoonIcon({ color }: { color: string }) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
      <path
        d="M13.5 9.5A5.5 5.5 0 0 1 6.5 2.5a5.5 5.5 0 1 0 7 7Z"
        stroke={color}
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/* ── Sidebar row primitives ──────────────────────────── */

function NavRow({
  href,
  label,
  icon,
  active,
}: {
  href: string;
  label: string;
  icon: (color: string) => React.ReactNode;
  active: boolean;
}) {
  const { theme } = useTheme();
  const t = getNd(theme);
  const [hover, setHover] = useState(false);

  const bg = active
    ? t.surfaceRaised
    : hover
      ? t.surface
      : "transparent";
  const fg = active ? t.textDisplay : hover ? t.textPrimary : t.textSecondary;

  return (
    <Link
      href={href}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: "7px 8px",
        borderRadius: swatchRadii.md,
        textDecoration: "none",
        background: bg,
        color: fg,
        fontFamily: editorialFonts.body,
        fontSize: 13,
        fontWeight: 500,
        lineHeight: 1.2,
        transition:
          "background-color 120ms ease-out, color 120ms ease-out",
      }}
    >
      <span
        style={{
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          width: 16,
          height: 16,
          flexShrink: 0,
        }}
      >
        {icon(fg)}
      </span>
      <span
        style={{
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        }}
      >
        {label}
      </span>
    </Link>
  );
}

function SystemRow({
  ds,
  active,
}: {
  ds: SidebarDSItem;
  active: boolean;
}) {
  const { theme } = useTheme();
  const t = getNd(theme);
  const [hover, setHover] = useState(false);

  const bg = active
    ? t.surfaceRaised
    : hover
      ? t.surface
      : "transparent";
  const fg = active ? t.textDisplay : hover ? t.textPrimary : t.textSecondary;

  return (
    <Link
      href={`/ds/${ds.slug}`}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: "7px 8px",
        borderRadius: swatchRadii.md,
        textDecoration: "none",
        background: bg,
        color: fg,
        fontFamily: editorialFonts.body,
        fontSize: 13,
        fontWeight: 500,
        lineHeight: 1.2,
        transition:
          "background-color 120ms ease-out, color 120ms ease-out",
      }}
    >
      <span
        aria-hidden
        style={{
          width: 6,
          height: 6,
          borderRadius: swatchRadii.full,
          background: ds.brandColor,
          flexShrink: 0,
        }}
      />
      <span
        style={{
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
          flex: 1,
        }}
      >
        {ds.name}
      </span>
    </Link>
  );
}

/* ── DSSidebar ───────────────────────────────────────── */

export function DSSidebar({ systems }: { systems: SidebarDSItem[] }) {
  const { theme, toggle } = useTheme();
  const t = getNd(theme);
  const pathname = usePathname();
  const [themeHover, setThemeHover] = useState(false);

  const isActive = (href: string) => {
    if (href === "/catalog") return pathname === "/catalog";
    return pathname === href || pathname.startsWith(href + "/");
  };

  return (
    <aside
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        bottom: 0,
        width: SIDEBAR_WIDTH,
        background: t.black,
        borderRight: `1px solid ${t.border}`,
        zIndex: 40,
        display: "flex",
        flexDirection: "column",
        overflowY: "auto",
      }}
    >
      {/* Logo row */}
      <div
        style={{
          padding: 16,
          display: "flex",
          alignItems: "center",
        }}
      >
        <Link
          href="/catalog"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            textDecoration: "none",
            color: t.textDisplay,
          }}
        >
          <HuberaLogo variant="mark" height={20} />
          <span
            style={{
              fontFamily: editorialFonts.display,
              fontSize: 15,
              fontWeight: 600,
              color: t.textDisplay,
              letterSpacing: "-0.01em",
            }}
          >
            Hubera
          </span>
        </Link>
      </div>

      {/* Hairline */}
      <div style={{ height: 1, background: t.border }} />

      {/* Main nav */}
      <nav
        aria-label="Primary"
        style={{
          padding: "12px 8px 0",
          display: "flex",
          flexDirection: "column",
          gap: 2,
        }}
      >
        <NavRow
          href="/catalog"
          label="Catalog"
          icon={(c) => <GridIcon color={c} />}
          active={isActive("/catalog")}
        />
        <NavRow
          href="/submit"
          label="Submit"
          icon={(c) => <PlusIcon color={c} />}
          active={isActive("/submit")}
        />
      </nav>

      {/* Spacer */}
      <div style={{ height: 16 }} />

      {/* Section header */}
      <div
        style={{
          padding: "0 8px",
          margin: "0 8px 8px",
        }}
      >
        <div
          style={{
            fontFamily: editorialFonts.mono,
            fontSize: 11,
            letterSpacing: "0.06em",
            textTransform: "uppercase",
            color: t.textDisabled,
            paddingLeft: 8,
          }}
        >
          Design Systems
        </div>
      </div>

      {/* Systems list */}
      <div
        style={{
          padding: "0 8px",
          display: "flex",
          flexDirection: "column",
          gap: 2,
        }}
      >
        {systems.map((ds) => (
          <SystemRow
            key={ds.slug}
            ds={ds}
            active={isActive(`/ds/${ds.slug}`)}
          />
        ))}
      </div>

      {/* Flex-grow spacer */}
      <div style={{ flex: 1, minHeight: 16 }} />

      {/* Hairline */}
      <div style={{ height: 1, background: t.border }} />

      {/* Bottom row */}
      <div
        style={{
          padding: 16,
          display: "flex",
          alignItems: "center",
        }}
      >
        <button
          type="button"
          onClick={toggle}
          onMouseEnter={() => setThemeHover(true)}
          onMouseLeave={() => setThemeHover(false)}
          aria-label={
            theme === "dark" ? "Switch to light mode" : "Switch to dark mode"
          }
          title={theme === "dark" ? "Light mode" : "Dark mode"}
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            width: 28,
            height: 28,
            background: themeHover ? t.surface : "transparent",
            border: "none",
            borderRadius: swatchRadii.md,
            padding: 0,
            cursor: "pointer",
            color: themeHover ? t.textDisplay : t.textSecondary,
            transition:
              "background-color 120ms ease-out, color 120ms ease-out",
          }}
        >
          {theme === "dark" ? (
            <SunIcon color={themeHover ? t.textDisplay : t.textSecondary} />
          ) : (
            <MoonIcon color={themeHover ? t.textDisplay : t.textSecondary} />
          )}
        </button>
      </div>
    </aside>
  );
}
