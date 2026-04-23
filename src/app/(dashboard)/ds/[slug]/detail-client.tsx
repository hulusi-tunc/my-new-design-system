"use client";

import { useState, useMemo, useEffect, type CSSProperties } from "react";
import Link from "next/link";
import { useTheme } from "@/components/providers/theme-provider";
import { getNd, editorialFonts } from "@/lib/nothing-tokens";
import { resolveDsTokens } from "@/lib/resolve-ds-tokens";
import { ComponentExplorer } from "@/components/registry/component-explorer";
import { MobileComponentViewer } from "@/components/registry/mobile-component-viewer";
import { DesignMdPanel } from "@/components/registry/design-md-panel";
import { RelatedSystems } from "@/components/registry/family-tree";
import { getCategoryForPlatform } from "@/lib/platforms";
import type { DSManifest } from "@/lib/types";

type Tab = "components" | "design-md" | "forks";

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
    {
      id: "design-md",
      label: "DESIGN.MD",
    },
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
    width: "100%",
    padding: "0 40px",
  };

  return (
    <div style={pageStyle}>
      {/* ── Hero (Mobbin-style) ─────────────────────── */}
      <div style={containerStyle}>
        <div style={{ paddingTop: 40 }} />
        <DSHero
          manifest={manifest}
          parentManifest={parentManifest}
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

          {activeTab === "design-md" && <DesignMdPanel manifest={manifest} />}

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
  t,
}: {
  manifest: DSManifest;
  parentManifest: DSManifest | null;
  t: ReturnType<typeof getNd>;
}) {
  const [saved, setSaved] = useState(false);
  const [useHovered, setUseHovered] = useState(false);
  const [savedHovered, setSavedHovered] = useState(false);
  const [moreHovered, setMoreHovered] = useState(false);
  const [useModalOpen, setUseModalOpen] = useState(false);

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
    flexDirection: "column",
    alignItems: "flex-start",
    gap: 24,
    padding: "8px 0 40px",
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
    width: "100%",
  };

  const titleStyle: CSSProperties = {
    fontFamily: editorialFonts.body,
    fontSize: "clamp(32px, 4.4vw, 52px)",
    fontWeight: 700,
    lineHeight: 1.05,
    letterSpacing: "-0.025em",
    color: t.textDisplay,
    margin: 0,
  };

  const taglineStyle: CSSProperties = {
    fontFamily: editorialFonts.body,
    fontSize: 18,
    fontWeight: 400,
    lineHeight: 1.5,
    letterSpacing: "-0.005em",
    color: t.textSecondary,
    margin: 0,
    maxWidth: "60ch",
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

  const useActionStyle: CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    padding: "9px 18px",
    borderRadius: 999,
    border: `1px solid ${t.borderVisible}`,
    background: useHovered ? t.surface : "transparent",
    color: t.textDisplay,
    fontFamily: editorialFonts.body,
    fontSize: 13,
    fontWeight: 500,
    cursor: "pointer",
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

  /* ── Render ──────────────────────────────────── */

  return (
    <>
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

        {/* Title + description */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <h1 style={titleStyle}>{manifest.name}</h1>
          <p style={taglineStyle}>{manifest.description}</p>
        </div>

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

          <button
            type="button"
            onClick={() => setUseModalOpen(true)}
            onMouseEnter={() => setUseHovered(true)}
            onMouseLeave={() => setUseHovered(false)}
            style={useActionStyle}
          >
            <DownloadInlineIcon />
            Use design system
          </button>

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

    {useModalOpen && (
      <UseDSModal
        manifest={manifest}
        onClose={() => setUseModalOpen(false)}
        t={t}
      />
    )}
    </>
  );
}

/* ── Use-design-system modal ───────────────────── */

function UseDSModal({
  manifest,
  onClose,
  t,
}: {
  manifest: DSManifest;
  onClose: () => void;
  t: ReturnType<typeof getNd>;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  const prompt = `Install the "${manifest.slug}" design system from Hubera`;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Use ${manifest.name}`}
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.6)",
        backdropFilter: "blur(4px)",
        WebkitBackdropFilter: "blur(4px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
        zIndex: 80,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "100%",
          maxWidth: 560,
          background: t.surface,
          border: `1px solid ${t.border}`,
          borderRadius: 20,
          padding: 32,
          display: "flex",
          flexDirection: "column",
          gap: 24,
          boxShadow: "0 24px 80px rgba(0,0,0,0.45)",
        }}
      >
        <header style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <span
            style={{
              fontFamily: editorialFonts.mono,
              fontSize: 11,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              color: t.textDisabled,
            }}
          >
            Import
          </span>
          <h2
            style={{
              margin: 0,
              fontFamily: editorialFonts.body,
              fontSize: 24,
              fontWeight: 600,
              letterSpacing: "-0.02em",
              color: t.textDisplay,
              lineHeight: 1.15,
            }}
          >
            Use {manifest.name}
          </h2>
          <p
            style={{
              margin: 0,
              fontFamily: editorialFonts.body,
              fontSize: 14,
              lineHeight: 1.55,
              color: t.textSecondary,
            }}
          >
            Paste the prompt below into Claude Code, or clone the repository
            directly.
          </p>
        </header>

        <Step index="01" label="Prompt Claude Code" t={t}>
          <ModalCopy text={prompt} t={t} />
        </Step>

        <Step index="02" label="Or clone from GitHub" t={t}>
          <ModalCopy text={manifest.repository} t={t} mono />
        </Step>

        <footer
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 12,
            paddingTop: 8,
            borderTop: `1px solid ${t.border}`,
          }}
        >
          <a
            href={manifest.repository}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              fontFamily: editorialFonts.mono,
              fontSize: 11,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: t.textSecondary,
              textDecoration: "none",
            }}
          >
            Open on GitHub ↗
          </a>
          <button
            type="button"
            onClick={onClose}
            style={{
              background: "none",
              border: 0,
              padding: 0,
              cursor: "pointer",
              fontFamily: editorialFonts.mono,
              fontSize: 11,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: t.textDisabled,
            }}
          >
            Close
          </button>
        </footer>
      </div>
    </div>
  );
}

function Step({
  index,
  label,
  children,
  t,
}: {
  index: string;
  label: string;
  children: React.ReactNode;
  t: ReturnType<typeof getNd>;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          fontFamily: editorialFonts.mono,
          fontSize: 11,
          letterSpacing: "0.08em",
          textTransform: "uppercase",
        }}
      >
        <span style={{ color: t.textDisabled }}>{index}</span>
        <span style={{ color: t.textPrimary }}>{label}</span>
      </div>
      {children}
    </div>
  );
}

function ModalCopy({
  text,
  t,
  mono = false,
}: {
  text: string;
  t: ReturnType<typeof getNd>;
  mono?: boolean;
}) {
  const [copied, setCopied] = useState(false);
  const [hovered, setHovered] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // noop
    }
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 16,
        padding: "12px 16px",
        background: t.surfaceInk,
        border: `1px solid ${hovered ? t.borderVisible : t.border}`,
        borderRadius: 12,
        fontFamily: mono ? editorialFonts.mono : editorialFonts.body,
        fontSize: 13,
        color: t.textPrimary,
        cursor: "pointer",
        transition: "border-color 120ms ease-out",
        textAlign: "left",
        width: "100%",
      }}
    >
      <span
        style={{
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
          minWidth: 0,
        }}
      >
        {text}
      </span>
      <span
        style={{
          fontFamily: editorialFonts.mono,
          fontSize: 10,
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          color: copied ? t.accent : t.textDisabled,
          flexShrink: 0,
        }}
      >
        {copied ? "Copied" : "Copy"}
      </span>
    </button>
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

function MoreInlineIcon() {
  return (
    <svg width={16} height={16} viewBox="0 0 24 24" fill="currentColor">
      <circle cx="12" cy="5" r="1.6" />
      <circle cx="12" cy="12" r="1.6" />
      <circle cx="12" cy="19" r="1.6" />
    </svg>
  );
}

function DownloadInlineIcon() {
  return (
    <svg
      width={14}
      height={14}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 3v12" />
      <path d="m7 10 5 5 5-5" />
      <path d="M5 21h14" />
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
