"use client";

import Link from "next/link";
import { useTheme } from "@/components/providers/theme-provider";
import { getNd, editorialFonts } from "@/lib/nothing-tokens";
import { HuberaLogo } from "@/components/brand/hubera-logo";
import { Eyebrow, Rule } from "@/components/editorial";

/**
 * SiteFooter — shared footer for public marketing pages (landing, docs, about,
 * changelog). Holds the theme toggle, nav columns, and attribution row.
 */
export function SiteFooter() {
  const { theme, toggle } = useTheme();
  const t = getNd(theme);

  const columnLinkStyle = {
    fontFamily: editorialFonts.body,
    fontSize: 14,
    fontWeight: 500,
    lineHeight: 1.8,
    color: t.textPrimary,
    textDecoration: "none",
    transition: "color 200ms cubic-bezier(0.165, 0.84, 0.44, 1)",
  } as const;

  return (
    <footer
      style={{
        borderTop: `1px solid ${t.border}`,
        padding:
          "clamp(56px, 7vw, 96px) clamp(24px, 5vw, 72px) clamp(32px, 3vw, 48px)",
        display: "flex",
        flexDirection: "column",
        gap: "clamp(40px, 5vw, 72px)",
      }}
    >
      {/* Top grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(12, 1fr)",
          gap: 32,
          alignItems: "start",
        }}
      >
        {/* Brand + tagline */}
        <div
          style={{
            gridColumn: "span 5",
            display: "flex",
            flexDirection: "column",
            gap: 20,
          }}
        >
          <Link
            href="/"
            aria-label="Hubera home"
            style={{
              display: "inline-flex",
              alignItems: "center",
              color: t.textDisplay,
              textDecoration: "none",
            }}
          >
            <HuberaLogo variant="wordmark" height={24} />
          </Link>
          <p
            style={{
              margin: 0,
              maxWidth: "32ch",
              fontFamily: editorialFonts.body,
              fontSize: 14,
              lineHeight: 1.55,
              color: t.textSecondary,
            }}
          >
            A registry for complete design systems. Browse, fork, and install
            with a single Claude Code command.
          </p>
        </div>

        {/* Product */}
        <FooterColumn
          label="Product"
          links={[
            { href: "/catalog", label: "Catalog" },
            { href: "/submit", label: "Submit" },
            { href: "/skills", label: "Skills" },
            { href: "/changelog", label: "Changelog" },
          ]}
          style={{ gridColumn: "span 2" }}
          t={t}
          linkStyle={columnLinkStyle}
        />

        {/* Learn */}
        <FooterColumn
          label="Learn"
          links={[
            { href: "/docs", label: "Docs" },
            { href: "/about", label: "About" },
          ]}
          style={{ gridColumn: "span 2" }}
          t={t}
          linkStyle={columnLinkStyle}
        />

        {/* Open source */}
        <FooterColumn
          label="Open source"
          links={[
            {
              href: "https://github.com/anthropics/hubera",
              label: "GitHub",
              external: true,
            },
            { href: "/docs#license", label: "MIT licensed" },
          ]}
          style={{ gridColumn: "span 3" }}
          t={t}
          linkStyle={columnLinkStyle}
        />
      </div>

      <Rule tone="subtle" />

      {/* Bottom row — attribution + theme toggle */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 24,
          flexWrap: "wrap",
        }}
      >
        <Eyebrow tone="muted">
          © {new Date().getFullYear()} Hubera · Non-profit · MIT
        </Eyebrow>

        <button
          type="button"
          onClick={toggle}
          aria-label="Toggle theme"
          style={{
            fontFamily: editorialFonts.mono,
            fontSize: 11,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            background: "transparent",
            border: `1px solid ${t.border}`,
            borderRadius: 999,
            padding: "8px 14px",
            cursor: "pointer",
            color: t.textSecondary,
            display: "inline-flex",
            alignItems: "center",
            gap: 10,
            transition:
              "color 200ms cubic-bezier(0.165, 0.84, 0.44, 1), border-color 200ms cubic-bezier(0.165, 0.84, 0.44, 1)",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = t.textDisplay;
            e.currentTarget.style.borderColor = t.borderVisible;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = t.textSecondary;
            e.currentTarget.style.borderColor = t.border;
          }}
        >
          <span
            aria-hidden
            style={{
              width: 8,
              height: 8,
              borderRadius: 999,
              background: t.textDisplay,
            }}
          />
          <span suppressHydrationWarning>
            {theme === "dark" ? "Dark" : "Light"} · switch
          </span>
        </button>
      </div>
    </footer>
  );
}

function FooterColumn({
  label,
  links,
  style,
  t,
  linkStyle,
}: {
  label: string;
  links: { href: string; label: string; external?: boolean }[];
  style?: React.CSSProperties;
  t: ReturnType<typeof getNd>;
  linkStyle: React.CSSProperties;
}) {
  return (
    <div
      style={{ display: "flex", flexDirection: "column", gap: 14, ...style }}
    >
      <Eyebrow>{label}</Eyebrow>
      <ul
        style={{
          margin: 0,
          padding: 0,
          listStyle: "none",
          display: "flex",
          flexDirection: "column",
          gap: 2,
        }}
      >
        {links.map((link) => (
          <li key={link.href}>
            {link.external ? (
              <a
                href={link.href}
                target="_blank"
                rel="noreferrer"
                style={linkStyle}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.color = t.textDisplay)
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.color = t.textPrimary)
                }
              >
                {link.label} ↗
              </a>
            ) : (
              <Link
                href={link.href}
                style={linkStyle}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.color = t.textDisplay)
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.color = t.textPrimary)
                }
              >
                {link.label}
              </Link>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
