"use client";

import { useState, type CSSProperties } from "react";
import Link from "next/link";
import { useTheme } from "@/components/providers/theme-provider";
import { getNd, editorialFonts } from "@/lib/nothing-tokens";
import { ColorPalettePreview } from "@/components/registry/color-palette-preview";
import { ComponentList } from "@/components/registry/component-list";
import { CloneInstructions } from "@/components/registry/clone-instructions";
import { RelatedSystems } from "@/components/registry/family-tree";
import type { DSManifest } from "@/lib/types";

type Tab = "overview" | "tokens" | "components" | "forks";

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
  const [activeTab, setActiveTab] = useState<Tab>("overview");

  const tabs: { id: Tab; label: string }[] = [
    { id: "overview", label: "OVERVIEW" },
    { id: "tokens", label: "TOKENS" },
    {
      id: "components",
      label: `COMPONENTS (${String(manifest.components.length).padStart(2, "0")})`,
    },
    {
      id: "forks",
      label: `FORKS (${String(forks.length).padStart(2, "0")})`,
    },
  ];

  const colorScaleCount = Object.keys(manifest.tokens.colors).length;

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

  const ruleStyle = (
    color: string = t.border,
    thickness: number = 1
  ): CSSProperties => ({
    height: thickness,
    background: color,
    width: "100%",
  });

  const monoLabelStyle: CSSProperties = {
    fontFamily: editorialFonts.mono,
    fontSize: 11,
    letterSpacing: "0.1em",
    color: t.textDisabled,
    textTransform: "uppercase",
  };

  return (
    <div style={pageStyle}>
      {/* ── Top nav strip ───────────────────────────── */}
      <div style={containerStyle}>
        <div style={{ paddingTop: 32, paddingBottom: 24 }}>
          <BackLink t={t} />
        </div>
      </div>

      {/* ── Editorial header ────────────────────────── */}
      <div style={containerStyle}>
        <header
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 24,
            paddingBottom: 40,
          }}
        >
          {/* Eyebrow */}
          {parentManifest ? (
            <Link
              href={`/ds/${parentManifest.slug}`}
              style={{
                ...monoLabelStyle,
                color: t.accent,
                textDecoration: "none",
              }}
            >
              FEATURE · FORKED FROM {parentManifest.name.toUpperCase()}
            </Link>
          ) : (
            <span style={monoLabelStyle}>FEATURE · ORIGINAL SYSTEM</span>
          )}

          <div style={ruleStyle()} />

          {/* Massive display title */}
          <h1
            style={{
              fontFamily: editorialFonts.display,
              fontSize: "clamp(48px, 8vw, 80px)",
              fontWeight: 400,
              letterSpacing: "-0.025em",
              lineHeight: 0.95,
              color: t.textDisplay,
              margin: 0,
            }}
          >
            {manifest.name}.
          </h1>

          {/* Standfirst paragraph */}
          <p
            style={{
              fontFamily: editorialFonts.body,
              fontSize: 19,
              lineHeight: 1.5,
              color: t.textSecondary,
              margin: 0,
              maxWidth: "65ch",
              fontWeight: 400,
            }}
          >
            {manifest.description}
          </p>

          {/* Meta row */}
          <MetaRun manifest={manifest} t={t} />

          <div style={ruleStyle()} />

          {/* Tags row */}
          {manifest.technology.length > 0 && (
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: 16,
                alignItems: "baseline",
              }}
            >
              <span style={monoLabelStyle}>TECH ·</span>
              {manifest.technology.map((tech, i) => (
                <span
                  key={tech}
                  style={{
                    fontFamily: editorialFonts.mono,
                    fontSize: 11,
                    letterSpacing: "0.06em",
                    color: t.textSecondary,
                    textTransform: "uppercase",
                  }}
                >
                  {tech}
                  {i < manifest.technology.length - 1 && (
                    <span style={{ color: t.textDisabled }}>{"  /"}</span>
                  )}
                </span>
              ))}
              <span style={{ flex: 1 }} />
              <a
                href={manifest.repository}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  fontFamily: editorialFonts.mono,
                  fontSize: 11,
                  letterSpacing: "0.08em",
                  color: t.textPrimary,
                  textTransform: "uppercase",
                  textDecoration: "none",
                  borderBottom: `1px solid ${t.borderVisible}`,
                  paddingBottom: 2,
                }}
              >
                VIEW ON GITHUB →
              </a>
            </div>
          )}
        </header>
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
        <main style={{ padding: "56px 0 120px" }}>
          {activeTab === "overview" && (
            <OverviewTab
              manifest={manifest}
              colorScaleCount={colorScaleCount}
              t={t}
            />
          )}

          {activeTab === "tokens" && (
            <TokensTab manifest={manifest} t={t} />
          )}

          {activeTab === "components" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
              <SectionHeader
                title={`COMPONENTS (${String(manifest.components.length).padStart(2, "0")})`}
                t={t}
              />
              <ComponentList components={manifest.components} tokens={manifest.tokens} />
            </div>
          )}

          {activeTab === "forks" && (
            <ForksTab forks={forks} allManifests={allManifests} manifest={manifest} t={t} />
          )}
        </main>
      </div>
    </div>
  );
}

/* ── Back link ──────────────────────────────────── */

function BackLink({ t }: { t: ReturnType<typeof getNd> }) {
  const [hovered, setHovered] = useState(false);
  return (
    <Link
      href="/"
      style={{
        fontFamily: editorialFonts.mono,
        fontSize: 11,
        letterSpacing: "0.08em",
        color: hovered ? t.accent : t.textDisabled,
        textTransform: "uppercase",
        textDecoration: "none",
        transition: "color 120ms ease",
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      ← BACK TO INDEX
    </Link>
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

/* ── Meta run (BY · v · ARCH · LICENSE) ─────────── */

function MetaRun({
  manifest,
  t,
}: {
  manifest: DSManifest;
  t: ReturnType<typeof getNd>;
}) {
  const parts = [
    `BY ${manifest.author.name.toUpperCase()}`,
    `V${manifest.version}`,
    manifest.architecture.toUpperCase(),
    manifest.license.toUpperCase(),
  ];

  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        gap: 14,
        alignItems: "baseline",
        fontFamily: editorialFonts.mono,
        fontSize: 11,
        letterSpacing: "0.08em",
        color: t.textSecondary,
        textTransform: "uppercase",
      }}
    >
      {parts.map((part, i) => (
        <span
          key={part}
          style={{
            display: "inline-flex",
            alignItems: "baseline",
            gap: 14,
          }}
        >
          {part}
          {i < parts.length - 1 && (
            <span
              style={{
                display: "inline-block",
                width: 12,
                height: 1,
                background: t.borderVisible,
                marginBottom: 3,
              }}
            />
          )}
        </span>
      ))}
    </div>
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

/* ── Overview tab ───────────────────────────────── */

function OverviewTab({
  manifest,
  colorScaleCount,
  t,
}: {
  manifest: DSManifest;
  colorScaleCount: number;
  t: ReturnType<typeof getNd>;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 80 }}>
      {/* Asymmetric two-column layout: 2/3 palette, 1/3 sidebar */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(0, 2fr) minmax(0, 1fr)",
          gap: 56,
          alignItems: "start",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <SectionHeader
            title="PALETTE"
            t={t}
            count={`${colorScaleCount} ${colorScaleCount === 1 ? "SCALE" : "SCALES"}`}
          />
          <ColorPalettePreview colors={manifest.tokens.colors} mode="full" />
        </div>
        <div>
          <CloneInstructions
            repositoryUrl={manifest.repository}
            slug={manifest.slug}
          />
        </div>
      </div>

      {/* Components */}
      <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
        <SectionHeader
          title="COMPONENTS"
          t={t}
          count={`${String(manifest.components.length).padStart(2, "0")} TOTAL`}
        />
        <ComponentList components={manifest.components} tokens={manifest.tokens} />
      </div>

      {/* Editorial stats row */}
      <StatsRow
        manifest={manifest}
        colorScaleCount={colorScaleCount}
        t={t}
      />
    </div>
  );
}

/* ── Stats row (rule-separated, no cards) ───────── */

function StatsRow({
  manifest,
  colorScaleCount,
  t,
}: {
  manifest: DSManifest;
  colorScaleCount: number;
  t: ReturnType<typeof getNd>;
}) {
  const stats = [
    { value: String(manifest.components.length), label: "COMPONENTS" },
    { value: String(colorScaleCount), label: "COLOR SCALES" },
    {
      value: String(manifest.tokens.typography.weights.length),
      label: "TYPE WEIGHTS",
    },
    {
      value: String(manifest.tokens.spacing.steps),
      label: "SPACING STEPS",
    },
  ];

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(4, 1fr)",
        borderTop: `1px solid ${t.border}`,
        borderBottom: `1px solid ${t.border}`,
      }}
    >
      {stats.map((s, i) => (
        <div
          key={s.label}
          style={{
            padding: "32px 24px",
            display: "flex",
            flexDirection: "column",
            gap: 8,
            borderLeft: i === 0 ? "none" : `1px solid ${t.border}`,
          }}
        >
          <span
            style={{
              fontFamily: editorialFonts.display,
              fontSize: 56,
              fontWeight: 400,
              lineHeight: 1,
              letterSpacing: "-0.03em",
              color: t.textDisplay,
              fontVariantNumeric: "tabular-nums",
            }}
          >
            {s.value}
          </span>
          <span
            style={{
              fontFamily: editorialFonts.mono,
              fontSize: 10,
              letterSpacing: "0.1em",
              color: t.textDisabled,
              textTransform: "uppercase",
            }}
          >
            {s.label}
          </span>
        </div>
      ))}
    </div>
  );
}

/* ── Tokens tab ─────────────────────────────────── */

function TokensTab({
  manifest,
  t,
}: {
  manifest: DSManifest;
  t: ReturnType<typeof getNd>;
}) {
  const colorScaleCount = Object.keys(manifest.tokens.colors).length;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 80 }}>
      {/* Colors */}
      <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
        <SectionHeader
          title="COLORS"
          t={t}
          count={`${colorScaleCount} ${colorScaleCount === 1 ? "SCALE" : "SCALES"}`}
        />
        <ColorPalettePreview colors={manifest.tokens.colors} mode="full" />
      </div>

      {/* Typography */}
      <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
        <SectionHeader
          title="TYPOGRAPHY"
          t={t}
          count={`${manifest.tokens.typography.scaleSteps} STEPS`}
        />
        <TypographySpecimen typography={manifest.tokens.typography} t={t} />
      </div>

      {/* Spacing */}
      <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
        <SectionHeader
          title="SPACING"
          t={t}
          count={`${manifest.tokens.spacing.steps} STEPS`}
        />
        <SpacingScale spacing={manifest.tokens.spacing} t={t} />
      </div>

      {/* Radius */}
      <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
        <SectionHeader
          title="RADIUS"
          t={t}
          count={`${manifest.tokens.radius.steps} STEPS`}
        />
        <RadiusScale radius={manifest.tokens.radius} t={t} />
      </div>
    </div>
  );
}

/* ── Typography specimen ────────────────────────── */

function TypographySpecimen({
  typography,
  t,
}: {
  typography: DSManifest["tokens"]["typography"];
  t: ReturnType<typeof getNd>;
}) {
  // Use the manifest's font family if provided, but always render with system fallback
  const fontStack =
    typography.fontFamily && typography.fontFamily.length > 0
      ? `${typography.fontFamily}, ${editorialFonts.body}`
      : editorialFonts.body;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
      <div
        style={{
          fontFamily: fontStack,
          fontSize: "clamp(64px, 12vw, 144px)",
          fontWeight: 400,
          letterSpacing: "-0.04em",
          lineHeight: 0.9,
          color: t.textDisplay,
        }}
      >
        Aa
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "200px 1fr",
          gap: 24,
          paddingTop: 24,
          borderTop: `1px solid ${t.border}`,
        }}
      >
        <span
          style={{
            fontFamily: editorialFonts.mono,
            fontSize: 11,
            letterSpacing: "0.08em",
            color: t.textDisabled,
            textTransform: "uppercase",
          }}
        >
          FAMILY
        </span>
        <span
          style={{
            fontFamily: editorialFonts.mono,
            fontSize: 12,
            color: t.textPrimary,
          }}
        >
          {typography.fontFamily || "—"}
        </span>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "200px 1fr",
          gap: 24,
          paddingTop: 24,
          borderTop: `1px solid ${t.border}`,
        }}
      >
        <span
          style={{
            fontFamily: editorialFonts.mono,
            fontSize: 11,
            letterSpacing: "0.08em",
            color: t.textDisabled,
            textTransform: "uppercase",
          }}
        >
          WEIGHTS
        </span>
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 16,
          }}
        >
          {typography.weights.map((w, i) => (
            <span
              key={w}
              style={{
                fontFamily: editorialFonts.mono,
                fontSize: 11,
                letterSpacing: "0.06em",
                color: t.textPrimary,
                textTransform: "uppercase",
              }}
            >
              {w}
              {i < typography.weights.length - 1 && (
                <span style={{ color: t.textDisabled, marginLeft: 16 }}>/</span>
              )}
            </span>
          ))}
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "200px 1fr",
          gap: 24,
          paddingTop: 24,
          borderTop: `1px solid ${t.border}`,
          borderBottom: `1px solid ${t.border}`,
          paddingBottom: 24,
        }}
      >
        <span
          style={{
            fontFamily: editorialFonts.mono,
            fontSize: 11,
            letterSpacing: "0.08em",
            color: t.textDisabled,
            textTransform: "uppercase",
          }}
        >
          SCALE STEPS
        </span>
        <span
          style={{
            fontFamily: editorialFonts.mono,
            fontSize: 12,
            color: t.textPrimary,
          }}
        >
          {typography.scaleSteps} sizes
        </span>
      </div>
    </div>
  );
}

/* ── Spacing scale ──────────────────────────────── */

function SpacingScale({
  spacing,
  t,
}: {
  spacing: DSManifest["tokens"]["spacing"];
  t: ReturnType<typeof getNd>;
}) {
  // Build a sample scale: 4, 8, 12, 16, 20, 24, ...
  const unitNum = parseInt(spacing.unit, 10) || 4;
  const sampleSteps = Math.min(spacing.steps, 10);
  const items: { label: string; px: number }[] = [];
  for (let i = 1; i <= sampleSteps; i++) {
    const px = unitNum * i;
    items.push({ label: `${i}`, px });
  }

  const maxPx = items[items.length - 1]?.px ?? 1;

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 14,
      }}
    >
      {items.map((item) => (
        <div
          key={item.label}
          style={{
            display: "grid",
            gridTemplateColumns: "48px 1fr 80px",
            alignItems: "center",
            gap: 24,
          }}
        >
          <span
            style={{
              fontFamily: editorialFonts.mono,
              fontSize: 11,
              letterSpacing: "0.06em",
              color: t.textDisabled,
              textTransform: "uppercase",
            }}
          >
            {item.label.padStart(2, "0")}
          </span>
          <div
            style={{
              height: 12,
              width: `${(item.px / maxPx) * 100}%`,
              background: t.textDisplay,
              minWidth: 4,
            }}
          />
          <span
            style={{
              fontFamily: editorialFonts.mono,
              fontSize: 11,
              letterSpacing: "0.04em",
              color: t.textSecondary,
              textTransform: "uppercase",
              textAlign: "right",
            }}
          >
            {item.px}PX
          </span>
        </div>
      ))}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "48px 1fr 80px",
          gap: 24,
          paddingTop: 16,
          borderTop: `1px solid ${t.border}`,
        }}
      >
        <span
          style={{
            fontFamily: editorialFonts.mono,
            fontSize: 11,
            letterSpacing: "0.08em",
            color: t.textDisabled,
            textTransform: "uppercase",
          }}
        >
          BASE
        </span>
        <span
          style={{
            fontFamily: editorialFonts.mono,
            fontSize: 11,
            letterSpacing: "0.04em",
            color: t.textSecondary,
            textTransform: "uppercase",
          }}
        >
          {spacing.unit} unit · {spacing.steps} step{spacing.steps !== 1 ? "s" : ""}
        </span>
        <span />
      </div>
    </div>
  );
}

/* ── Radius scale ───────────────────────────────── */

function RadiusScale({
  radius,
  t,
}: {
  radius: DSManifest["tokens"]["radius"];
  t: ReturnType<typeof getNd>;
}) {
  // Generate sample radii: 0, 2, 4, 8, 16, ... up to `full`
  const steps = Math.max(1, radius.steps);
  const items: { label: string; r: number }[] = [];
  for (let i = 0; i < steps; i++) {
    const ratio = steps === 1 ? 1 : i / (steps - 1);
    const r = Math.round(ratio * Math.min(radius.full, 32));
    items.push({ label: String(i + 1), r });
  }
  // Add the "full" sample
  items.push({ label: "FULL", r: radius.full });

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(96px, 1fr))",
        gap: 24,
      }}
    >
      {items.map((item) => (
        <div
          key={item.label}
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 12,
            alignItems: "flex-start",
          }}
        >
          <div
            style={{
              width: 72,
              height: 72,
              background: t.textDisplay,
              borderRadius: item.label === "FULL" ? "50%" : item.r,
            }}
          />
          <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <span
              style={{
                fontFamily: editorialFonts.mono,
                fontSize: 11,
                letterSpacing: "0.06em",
                color: t.textPrimary,
                textTransform: "uppercase",
              }}
            >
              {item.label}
            </span>
            <span
              style={{
                fontFamily: editorialFonts.mono,
                fontSize: 10,
                letterSpacing: "0.04em",
                color: t.textDisabled,
                textTransform: "uppercase",
              }}
            >
              {item.label === "FULL" ? `${radius.full}PX` : `${item.r}PX`}
            </span>
          </div>
        </div>
      ))}
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
