"use client";

import { useState, type CSSProperties } from "react";
import { useTheme } from "@/components/providers/theme-provider";
import { getNd, editorialFonts } from "@/lib/nothing-tokens";

// ── Types ──────────────────────────────────────────

export interface CloneInstructionsProps {
  /** Full repository URL (e.g. "https://github.com/user/repo") */
  repositoryUrl: string;
  /** Design system slug used for install paths */
  slug: string;
}

// ── CopyLink (tiny mono text link) ─────────────────

function CopyLink({ text }: { text: string }) {
  const { theme } = useTheme();
  const t = getNd(theme);
  const [copied, setCopied] = useState(false);
  const [hovered, setHovered] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // no-op
    }
  };

  const style: CSSProperties = {
    background: "none",
    border: 0,
    padding: 0,
    cursor: "pointer",
    fontFamily: editorialFonts.mono,
    fontSize: 10,
    letterSpacing: "0.08em",
    textTransform: "uppercase",
    color: copied ? t.accent : hovered ? t.textPrimary : t.textDisabled,
    transition: "color 120ms ease",
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      style={style}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      aria-label={copied ? "Copied" : "Copy to clipboard"}
    >
      {copied ? "COPIED" : "COPY"}
    </button>
  );
}

// ── CodeLine ───────────────────────────────────────

function CodeLine({ label, code }: { label: string; code: string }) {
  const { theme } = useTheme();
  const t = getNd(theme);

  const wrapperStyle: CSSProperties = {
    display: "flex",
    flexDirection: "column",
    gap: 6,
  };

  const headerStyle: CSSProperties = {
    display: "flex",
    alignItems: "baseline",
    justifyContent: "space-between",
    gap: 12,
  };

  const labelStyle: CSSProperties = {
    fontFamily: editorialFonts.mono,
    fontSize: 10,
    letterSpacing: "0.08em",
    color: t.textDisabled,
    textTransform: "uppercase",
  };

  const codeStyle: CSSProperties = {
    fontFamily: editorialFonts.mono,
    fontSize: 12,
    lineHeight: 1.5,
    color: t.textPrimary,
    paddingLeft: 12,
    borderLeft: `1px solid ${t.borderVisible}`,
    overflowX: "auto",
    whiteSpace: "nowrap",
  };

  return (
    <div style={wrapperStyle}>
      <div style={headerStyle}>
        <span style={labelStyle}>{label}</span>
        <CopyLink text={code} />
      </div>
      <div style={codeStyle}>{code}</div>
    </div>
  );
}

// ── Main component ─────────────────────────────────

export function CloneInstructions({
  repositoryUrl,
  slug,
}: CloneInstructionsProps) {
  const { theme } = useTheme();
  const t = getNd(theme);

  const gitCloneUrl = repositoryUrl.endsWith(".git")
    ? repositoryUrl
    : `${repositoryUrl}.git`;

  const containerStyle: CSSProperties = {
    display: "flex",
    flexDirection: "column",
    gap: 24,
  };

  const eyebrowStyle: CSSProperties = {
    fontFamily: editorialFonts.mono,
    fontSize: 10,
    letterSpacing: "0.1em",
    color: t.textDisabled,
    textTransform: "uppercase",
  };

  const titleStyle: CSSProperties = {
    fontFamily: editorialFonts.display,
    fontSize: 28,
    fontWeight: 400,
    letterSpacing: "-0.01em",
    color: t.textDisplay,
    lineHeight: 1.1,
    margin: 0,
  };

  const ruleStyle: CSSProperties = {
    height: 1,
    background: t.border,
    width: "100%",
  };

  const stepListStyle: CSSProperties = {
    display: "flex",
    flexDirection: "column",
    gap: 20,
  };

  const standfirstStyle: CSSProperties = {
    fontFamily: editorialFonts.body,
    fontSize: 13,
    lineHeight: 1.55,
    color: t.textSecondary,
    margin: 0,
    maxWidth: "60ch",
  };

  const claudeBlockStyle: CSSProperties = {
    display: "flex",
    flexDirection: "column",
    gap: 12,
  };

  const claudeListStyle: CSSProperties = {
    display: "flex",
    flexDirection: "column",
    gap: 10,
    margin: 0,
    padding: 0,
    listStyle: "none",
  };

  const claudeItemStyle: CSSProperties = {
    display: "grid",
    gridTemplateColumns: "24px 1fr",
    gap: 12,
    fontFamily: editorialFonts.body,
    fontSize: 13,
    lineHeight: 1.5,
    color: t.textSecondary,
  };

  const claudeNumberStyle: CSSProperties = {
    fontFamily: editorialFonts.mono,
    fontSize: 10,
    letterSpacing: "0.06em",
    color: t.textDisabled,
    textTransform: "uppercase",
    paddingTop: 2,
  };

  const inlineCodeStyle: CSSProperties = {
    fontFamily: editorialFonts.mono,
    fontSize: 12,
    color: t.textPrimary,
    padding: "0 4px",
  };

  return (
    <aside style={containerStyle}>
      <div style={ruleStyle} />

      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <span style={eyebrowStyle}>SIDEBAR · GET IT LOCALLY</span>
        <h3 style={titleStyle}>Clone &amp; setup.</h3>
      </div>

      <p style={standfirstStyle}>
        Pull this design system to your machine and start customizing in your
        editor of choice.
      </p>

      <div style={ruleStyle} />

      <ol style={stepListStyle}>
        <li style={{ listStyle: "none" }}>
          <CodeLine
            label="01 · CLONE THE REPOSITORY"
            code={`git clone ${gitCloneUrl}`}
          />
        </li>
        <li style={{ listStyle: "none" }}>
          <CodeLine label="02 · NAVIGATE" code={`cd ${slug}`} />
        </li>
        <li style={{ listStyle: "none" }}>
          <CodeLine label="03 · INSTALL" code="npm install" />
        </li>
        <li style={{ listStyle: "none" }}>
          <CodeLine label="04 · DEV SERVER" code="npm run dev" />
        </li>
      </ol>

      <div style={ruleStyle} />

      <div style={claudeBlockStyle}>
        <span style={eyebrowStyle}>WORKFLOW · CLAUDE CODE</span>
        <ul style={claudeListStyle}>
          <li style={claudeItemStyle}>
            <span style={claudeNumberStyle}>I</span>
            <span>Open the project in your editor and start Claude Code.</span>
          </li>
          <li style={claudeItemStyle}>
            <span style={claudeNumberStyle}>II</span>
            <span>Ask Claude to read CLAUDE.md for project context.</span>
          </li>
          <li style={claudeItemStyle}>
            <span style={claudeNumberStyle}>III</span>
            <span>Describe the component or token changes you want.</span>
          </li>
          <li style={claudeItemStyle}>
            <span style={claudeNumberStyle}>IV</span>
            <span>Review the generated code and iterate.</span>
          </li>
          <li style={claudeItemStyle}>
            <span style={claudeNumberStyle}>V</span>
            <span>
              Run <code style={inlineCodeStyle}>npm run build</code> to verify
              the build passes.
            </span>
          </li>
        </ul>
      </div>
    </aside>
  );
}
