"use client";

import { useState, useMemo, type CSSProperties } from "react";
import Link from "next/link";
import { useTheme } from "@/components/providers/theme-provider";
import { getNd, editorialFonts } from "@/lib/nothing-tokens";
import { resolveDsTokens } from "@/lib/resolve-ds-tokens";
import { ComponentExplorer } from "@/components/registry/component-explorer";
import { MobileComponentViewer } from "@/components/registry/mobile-component-viewer";
import { InstallPanel } from "@/components/registry/install-panel";
import { RelatedSystems } from "@/components/registry/family-tree";
import { getCategoryForPlatform } from "@/lib/platforms";
import type { DSManifest } from "@/lib/types";

type Tab = "components" | "install" | "forks";

export function DetailClient({
  manifest,
  forks,
  allManifests,
  parentManifest,
}: {
  manifest: DSManifest;
  forks: DSManifest[];
  allManifests: DSManifest[];
  parentManifest: DSManifest | null;
}) {
  const { theme } = useTheme();
  const t = getNd(theme);
  const [activeTab, setActiveTab] = useState<Tab>("components");

  const isWeb = getCategoryForPlatform(manifest.platform) === "web";

  const tabs: { id: Tab; label: string }[] = [
    {
      id: "components",
      label: `COMPONENTS (${String(manifest.components.length).padStart(2, "0")})`,
    },
    { id: "install", label: "INSTALL" },
    {
      id: "forks",
      label: `FORKS (${String(forks.length).padStart(2, "0")})`,
    },
  ];

  // ── Style fragments ──────────────────────────────

  const pageStyle: CSSProperties = {
    background: t.black,
    minHeight: "100vh",
    color: t.textPrimary,
  };

  const containerStyle: CSSProperties = {
    maxWidth: 1200,
    margin: "0 auto",
    padding: "0 32px",
  };

  return (
    <div style={pageStyle}>
      {/* ── Hero (Mobbin-style) ─────────────────────── */}
      <div style={containerStyle}>
        <div style={{ paddingTop: 40 }} />
        <DSHero
          manifest={manifest}
          parentManifest={parentManifest}
          forksCount={forks.length}
          t={t}
        />
      </div>

      {/* ── Tabs ────────────────────────────────────── */}
      <div style={containerStyle}>
        <nav
          style={{
            display: "flex",
            gap: 32,
            paddingBottom: 0,
            borderBottom: `1px solid ${t.border}`,
            flexWrap: "wrap",
          }}
        >
          {tabs.map((tab) => {
            const active = activeTab === tab.id;
            return (
              <TabButton
                key={tab.id}
                active={active}
                label={tab.label}
                onClick={() => setActiveTab(tab.id)}
                t={t}
              />
            );
          })}
        </nav>
      </div>

      {/* ── Tab content ─────────────────────────────── */}
      <div style={containerStyle}>
        <main style={{ padding: "40px 0 120px" }}>
          {activeTab === "components" &&
            (isWeb ? (
              <ComponentExplorer manifest={manifest} />
            ) : (
              <MobileComponentViewer manifest={manifest} />
            ))}

          {activeTab === "install" && <InstallPanel manifest={manifest} />}

          {activeTab === "forks" && (
            <ForksTab forks={forks} allManifests={allManifests} manifest={manifest} t={t} />
          )}
        </main>
      </div>
    </div>
  );
}

/* ── Hero (Mobbin-style) ────────────────────────── */

function DSHero({
  manifest,
  parentManifest,
  forksCount,
  t,
}: {
  manifest: DSManifest;
  parentManifest: DSManifest | null;
  forksCount: number;
  t: ReturnType<typeof getNd>;
}) {
  const [saved, setSaved] = useState(false);
  const [forkHovered, setForkHovered] = useState(false);
  const [savedHovered, setSavedHovered] = useState(false);
  const [moreHovered, setMoreHovered] = useState(false);

  // Resolve the DS's own brand color for the icon square
  const ds = useMemo(
    () => resolveDsTokens(manifest.tokens, "dark"),
    [manifest.tokens]
  );

  const brandColor = ds.brand;
  const initial = manifest.name.charAt(0).toUpperCase();

  /* ── Styles ──────────────────────────────────── */

  const wrapStyle: CSSProperties = {
    display: "flex",
    alignItems: "flex-start",
    gap: 24,
    padding: "8px 0 40px",
    flexWrap: "wrap",
  };

  const iconStyle: CSSProperties = {
    width: 88,
    height: 88,
    borderRadius: 20,
    background: brandColor,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontFamily: editorialFonts.body,
    fontWeight: 700,
    fontSize: 40,
    color: ds.textOnBrand,
    letterSpacing: "-0.02em",
    flexShrink: 0,
    boxShadow: `0 0 0 1px ${t.borderVisible}`,
  };

  const bodyStyle: CSSProperties = {
    display: "flex",
    flexDirection: "column",
    gap: 16,
    minWidth: 0,
    flex: 1,
  };

  const titleStyle: CSSProperties = {
    fontFamily: editorialFonts.body,
    fontSize: "clamp(28px, 3.8vw, 42px)",
    fontWeight: 700,
    lineHeight: 1.1,
    letterSpacing: "-0.025em",
    color: t.textDisplay,
    margin: 0,
  };

  const emDashStyle: CSSProperties = {
    color: t.textDisabled,
    fontWeight: 400,
    margin: "0 8px",
  };

  const taglineStyle: CSSProperties = {
    fontFamily: editorialFonts.body,
    fontSize: "clamp(28px, 3.8vw, 42px)",
    fontWeight: 400,
    lineHeight: 1.1,
    letterSpacing: "-0.025em",
    color: t.textPrimary,
  };

  const metaRowStyle: CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: 32,
    flexWrap: "wrap",
  };

  const metaItemStyle: CSSProperties = {
    display: "flex",
    flexDirection: "column",
    gap: 3,
    minWidth: 0,
  };

  const metaLabelStyle: CSSProperties = {
    fontFamily: editorialFonts.body,
    fontSize: 12,
    color: t.textDisabled,
    fontWeight: 400,
  };

  const metaValueStyle: CSSProperties = {
    fontFamily: editorialFonts.body,
    fontSize: 14,
    fontWeight: 500,
    color: t.textPrimary,
  };

  const actionRowStyle: CSSProperties = {
    display: "flex",
    gap: 8,
    alignItems: "center",
    marginTop: 6,
  };

  const primaryActionStyle: CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    padding: "9px 18px",
    borderRadius: 999,
    border: "none",
    background: saved || savedHovered ? t.textDisplay : t.textDisplay,
    color: t.black,
    fontFamily: editorialFonts.body,
    fontSize: 13,
    fontWeight: 600,
    cursor: "pointer",
    opacity: savedHovered ? 0.9 : 1,
    transition: "opacity 120ms ease-out",
  };

  const secondaryActionStyle: CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    padding: "9px 18px",
    borderRadius: 999,
    border: `1px solid ${t.borderVisible}`,
    background: forkHovered ? t.surface : "transparent",
    color: t.textDisplay,
    fontFamily: editorialFonts.body,
    fontSize: 13,
    fontWeight: 500,
    cursor: "pointer",
    textDecoration: "none",
    transition: "background 120ms ease-out",
  };

  const moreBtnStyle: CSSProperties = {
    width: 36,
    height: 36,
    borderRadius: 999,
    border: `1px solid ${t.borderVisible}`,
    background: moreHovered ? t.surface : "transparent",
    color: t.textPrimary,
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    transition: "background 120ms ease-out",
  };

  /* ── Derive a short tagline from description ── */
  const tagline =
    manifest.description.length > 60
      ? manifest.description.slice(0, 57).trimEnd() + "…"
      : manifest.description;

  /* ── Render ──────────────────────────────────── */

  return (
    <div style={wrapStyle}>
      <div style={iconStyle}>{initial}</div>

      <div style={bodyStyle}>
        {parentManifest && (
          <Link
            href={`/ds/${parentManifest.slug}`}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              fontFamily: editorialFonts.body,
              fontSize: 12,
              fontWeight: 500,
              color: t.accent,
              textDecoration: "none",
              width: "fit-content",
            }}
          >
            ← Forked from {parentManifest.name}
          </Link>
        )}

        {/* Title — name + em dash + tagline */}
        <h1 style={titleStyle}>
          {manifest.name}
          <span style={emDashStyle}>—</span>
          <span style={taglineStyle}>{tagline}</span>
        </h1>

        {/* Meta row: Platform / Version / Category */}
        <div style={metaRowStyle}>
          <div style={metaItemStyle}>
            <span style={metaLabelStyle}>Platform</span>
            <span style={metaValueStyle}>
              {manifest.technology.slice(0, 2).join(", ") || "React"}
            </span>
          </div>

          <div style={metaItemStyle}>
            <span style={metaLabelStyle}>Version</span>
            <span style={metaValueStyle}>v{manifest.version}</span>
          </div>

          <div style={metaItemStyle}>
            <span style={metaLabelStyle}>Category</span>
            <span style={metaValueStyle}>
              {manifest.architecture.replace(/-/g, " ")}
            </span>
          </div>

          <div style={metaItemStyle}>
            <span style={metaLabelStyle}>Components</span>
            <span style={metaValueStyle}>{manifest.components.length}</span>
          </div>

          {forksCount > 0 && (
            <div style={metaItemStyle}>
              <span style={metaLabelStyle}>Forks</span>
              <span style={metaValueStyle}>{forksCount}</span>
            </div>
          )}
        </div>

        {/* Action buttons */}
        <div style={actionRowStyle}>
          <button
            type="button"
            onClick={() => setSaved((s) => !s)}
            onMouseEnter={() => setSavedHovered(true)}
            onMouseLeave={() => setSavedHovered(false)}
            style={primaryActionStyle}
          >
            <BookmarkInlineIcon filled={saved} />
            {saved ? "Saved" : "Save"}
          </button>

          <a
            href={manifest.repository}
            target="_blank"
            rel="noopener noreferrer"
            onMouseEnter={() => setForkHovered(true)}
            onMouseLeave={() => setForkHovered(false)}
            style={secondaryActionStyle}
          >
            <GithubInlineIcon />
            View on GitHub
          </a>

          <button
            type="button"
            aria-label="More options"
            onMouseEnter={() => setMoreHovered(true)}
            onMouseLeave={() => setMoreHovered(false)}
            style={moreBtnStyle}
          >
            <MoreInlineIcon />
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Inline icons (kept here so Hero stays self-contained) ── */

function BookmarkInlineIcon({ filled }: { filled: boolean }) {
  return (
    <svg width={14} height={14} viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
    </svg>
  );
}

function GithubInlineIcon() {
  return (
    <svg width={14} height={14} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
    </svg>
  );
}

function MoreInlineIcon() {
  return (
    <svg width={16} height={16} viewBox="0 0 24 24" fill="currentColor">
      <circle cx="12" cy="5" r="1.6" />
      <circle cx="12" cy="12" r="1.6" />
      <circle cx="12" cy="19" r="1.6" />
    </svg>
  );
}

/* ── Tab button ─────────────────────────────────── */

function TabButton({
  active,
  label,
  onClick,
  t,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
  t: ReturnType<typeof getNd>;
}) {
  const [hovered, setHovered] = useState(false);
  const style: CSSProperties = {
    background: "none",
    border: 0,
    padding: "0 0 16px",
    margin: 0,
    cursor: "pointer",
    fontFamily: editorialFonts.mono,
    fontSize: 11,
    letterSpacing: "0.1em",
    textTransform: "uppercase",
    color: active ? t.accent : hovered ? t.textPrimary : t.textSecondary,
    position: "relative",
    transition: "color 120ms ease",
    marginBottom: -1,
  };
  return (
    <button
      type="button"
      onClick={onClick}
      style={style}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {label}
      {active && (
        <span
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            bottom: -1,
            height: 2,
            background: t.accent,
          }}
        />
      )}
    </button>
  );
}

/* ── Section header ─────────────────────────────── */

function SectionHeader({
  title,
  t,
  count,
}: {
  title: string;
  t: ReturnType<typeof getNd>;
  count?: string;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <div
        style={{
          display: "flex",
          alignItems: "baseline",
          justifyContent: "space-between",
          gap: 16,
        }}
      >
        <h2
          style={{
            fontFamily: editorialFonts.mono,
            fontSize: 11,
            letterSpacing: "0.1em",
            color: t.textPrimary,
            textTransform: "uppercase",
            margin: 0,
          }}
        >
          {title}
        </h2>
        {count && (
          <span
            style={{
              fontFamily: editorialFonts.mono,
              fontSize: 10,
              letterSpacing: "0.06em",
              color: t.textDisabled,
              textTransform: "uppercase",
            }}
          >
            {count}
          </span>
        )}
      </div>
      <div style={{ height: 1, background: t.border, width: "100%" }} />
    </div>
  );
}


/* ── Forks tab ──────────────────────────────────── */

function ForksTab({
  forks,
  allManifests,
  manifest,
  t,
}: {
  forks: DSManifest[];
  allManifests: DSManifest[];
  manifest: DSManifest;
  t: ReturnType<typeof getNd>;
}) {
  if (forks.length === 0) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
        <SectionHeader title="FORKS (00)" t={t} />
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 24,
            paddingTop: 24,
            paddingBottom: 56,
          }}
        >
          <span
            style={{
              fontFamily: editorialFonts.mono,
              fontSize: 11,
              letterSpacing: "0.1em",
              color: t.textDisabled,
              textTransform: "uppercase",
            }}
          >
            NO FORKS YET
          </span>
          <p
            style={{
              fontFamily: editorialFonts.body,
              fontSize: 17,
              lineHeight: 1.55,
              color: t.textSecondary,
              margin: 0,
              maxWidth: "65ch",
            }}
          >
            Nobody has forked <em>{manifest.name}</em> yet. To create a fork:
            clone this design system, customize its tokens and components in
            your editor, then submit it back to the registry. Your forked
            system will appear here as a child node.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <SectionHeader
        title={`FORKS (${String(forks.length).padStart(2, "0")})`}
        t={t}
      />
      <RelatedSystems
        allManifests={allManifests}
        currentSlug={manifest.slug}
      />
    </div>
  );
}
