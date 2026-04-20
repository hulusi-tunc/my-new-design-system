"use client";

import { useState, type CSSProperties } from "react";
import { useTheme } from "@/components/providers/theme-provider";
import { getNd, editorialFonts, swatchRadii } from "@/lib/nothing-tokens";
import { getPlatformMeta } from "@/lib/platforms";
import { getSetupTemplate } from "@/lib/mcp/setup-templates";
import type { DSManifest } from "@/lib/types";

/**
 * Shows platform-aware install instructions plus the Claude Code / MCP
 * command to fetch the full design system. Rendered on the DS detail page.
 */
export function InstallPanel({ manifest }: { manifest: DSManifest }) {
  const { theme } = useTheme();
  const t = getNd(theme);
  const platformMeta = getPlatformMeta(manifest.platform);
  const template = getSetupTemplate(manifest.platform);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
      <MCPBlock manifest={manifest} platformLabel={platformMeta.longLabel} t={t} />

      <Section title="Setup" subtitle="After the files are installed" t={t}>
        <ol
          style={{
            margin: 0,
            paddingLeft: 20,
            display: "flex",
            flexDirection: "column",
            gap: 10,
            fontFamily: editorialFonts.body,
            fontSize: 14,
            lineHeight: 1.55,
            color: t.textPrimary,
          }}
        >
          {template.full.map((step, i) => (
            <li key={i}>{step}</li>
          ))}
        </ol>
      </Section>

      <Section title="Path aliases" t={t}>
        <p
          style={{
            margin: 0,
            fontFamily: editorialFonts.body,
            fontSize: 14,
            lineHeight: 1.55,
            color: t.textSecondary,
          }}
        >
          {template.importAliasNote}
        </p>
      </Section>
    </div>
  );
}

/* ── MCP command block ─────────────────────────────── */

function MCPBlock({
  manifest,
  platformLabel,
  t,
}: {
  manifest: DSManifest;
  platformLabel: string;
  t: ReturnType<typeof getNd>;
}) {
  const command = `Install the "${manifest.slug}" design system from Hubera`;
  return (
    <Section
      title="Install via Claude Code"
      subtitle={`${platformLabel} · v${manifest.version}`}
      t={t}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 14,
        }}
      >
        <p
          style={{
            margin: 0,
            fontFamily: editorialFonts.body,
            fontSize: 14,
            lineHeight: 1.55,
            color: t.textSecondary,
            maxWidth: "60ch",
          }}
        >
          Connect your Claude Code to the Hubera MCP server, then ask it to
          install this design system. Claude Code will fetch the source files
          from {manifest.repository} and write them into your current project.
        </p>
        <CopyCommand text={command} t={t} />
      </div>
    </Section>
  );
}

function CopyCommand({
  text,
  t,
}: {
  text: string;
  t: ReturnType<typeof getNd>;
}) {
  const [copied, setCopied] = useState(false);
  const [hovered, setHovered] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // clipboard denied — no-op
    }
  };

  const style: CSSProperties = {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 16,
    padding: "14px 18px",
    background: t.surfaceInk,
    border: `1px solid ${hovered ? t.borderStrong : t.border}`,
    borderRadius: swatchRadii.md,
    fontFamily: editorialFonts.mono,
    fontSize: 13,
    color: t.textPrimary,
    cursor: "pointer",
    transition: "border-color 120ms ease-out",
    textAlign: "left",
    width: "100%",
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={style}
    >
      <span>{text}</span>
      <span
        style={{
          fontFamily: editorialFonts.mono,
          fontSize: 10,
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          color: copied ? t.accent : t.textDisabled,
        }}
      >
        {copied ? "Copied" : "Copy"}
      </span>
    </button>
  );
}

/* ── Section wrapper ───────────────────────────────── */

function Section({
  title,
  subtitle,
  children,
  t,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  t: ReturnType<typeof getNd>;
}) {
  return (
    <section style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <header
        style={{
          display: "flex",
          alignItems: "baseline",
          justifyContent: "space-between",
          gap: 16,
          borderBottom: `1px solid ${t.border}`,
          paddingBottom: 10,
        }}
      >
        <h2
          style={{
            margin: 0,
            fontFamily: editorialFonts.mono,
            fontSize: 11,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            color: t.textPrimary,
          }}
        >
          {title}
        </h2>
        {subtitle && (
          <span
            style={{
              fontFamily: editorialFonts.mono,
              fontSize: 10,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: t.textDisabled,
            }}
          >
            {subtitle}
          </span>
        )}
      </header>
      {children}
    </section>
  );
}
