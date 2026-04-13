"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "@/components/providers/theme-provider";
import { getNd } from "@/lib/nothing-tokens";
import { HuberaLogo } from "@/components/brand/hubera-logo";

const navLinks = [
  { label: "CATALOG", href: "/" },
  { label: "SUBMIT", href: "/submit" },
];

export function DSHeader() {
  const { theme, toggle } = useTheme();
  const pathname = usePathname();
  const t = getNd(theme);

  return (
    <header
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 50,
        display: "flex",
        alignItems: "center",
        height: 48,
        padding: "0 24px",
        background: t.surface,
        borderBottom: `1px solid ${t.border}`,
      }}
    >
      {/* Logo */}
      <Link
        href="/"
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          textDecoration: "none",
          flexShrink: 0,
        }}
      >
        <span style={{ color: t.textDisplay, display: "inline-flex" }}>
          <HuberaLogo variant="mark" height={20} />
        </span>
        <span
          style={{
            fontFamily:
              "'Space Grotesk', var(--font-space-grotesk), sans-serif",
            fontSize: 14,
            fontWeight: 600,
            color: t.textDisplay,
            letterSpacing: "-0.01em",
          }}
        >
          Hubera
        </span>
      </Link>

      {/* Navigation */}
      <nav
        style={{
          marginLeft: 32,
          display: "flex",
          alignItems: "center",
          gap: 4,
        }}
      >
        {navLinks.map((link) => {
          const active = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              style={{
                fontFamily:
                  "'Space Mono', var(--font-space-mono), monospace",
                fontSize: 11,
                letterSpacing: "0.08em",
                color: active ? t.textDisplay : t.textSecondary,
                padding: "6px 10px",
                textDecoration: "none",
                transition:
                  "color 150ms cubic-bezier(0.25, 0.1, 0.25, 1)",
              }}
            >
              {link.label}
            </Link>
          );
        })}
      </nav>

      {/* Right side */}
      <div style={{ marginLeft: "auto" }}>
        <button
          onClick={toggle}
          style={{
            background: "transparent",
            border: "none",
            fontFamily: "'Space Mono', var(--font-space-mono), monospace",
            fontSize: 11,
            letterSpacing: "0.08em",
            color: t.textSecondary,
            cursor: "pointer",
            padding: "8px 0",
            transition:
              "color 150ms cubic-bezier(0.25, 0.1, 0.25, 1)",
          }}
          aria-label={
            theme === "dark" ? "Switch to light mode" : "Switch to dark mode"
          }
        >
          {theme === "dark" ? "LIGHT" : "DARK"}
        </button>
      </div>
    </header>
  );
}
