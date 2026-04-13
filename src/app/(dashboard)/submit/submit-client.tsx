"use client";

import { type CSSProperties } from "react";
import { useTheme } from "@/components/providers/theme-provider";
import { getNd, editorialFonts } from "@/lib/nothing-tokens";

export function SubmitClient() {
  const { theme } = useTheme();
  const t = getNd(theme);

  const steps = [
    {
      number: "01",
      title: "FORK OR CREATE",
      description:
        "Start from an existing design system or build your own from scratch. Use Claude Code to customize tokens, components, and more.",
    },
    {
      number: "02",
      title: "ADD MANIFEST",
      description:
        "Create a ds-manifest.json in your design system folder describing the name, tokens, components, author, and parent (if forked).",
    },
    {
      number: "03",
      title: "ADD SCREENSHOTS",
      description:
        "Include a preview.png in a screenshots/ folder. This appears as the card thumbnail in the catalog.",
    },
    {
      number: "04",
      title: "SUBMIT PR",
      description:
        "Add your design system folder to design-systems/ and open a PR. Once merged, it appears in the registry.",
    },
  ];

  const manifestExample = `{
  "name": "My Design System",
  "slug": "my-ds",
  "version": "1.0.0",
  "description": "A brief description.",
  "author": {
    "name": "yourname",
    "github": "yourname"
  },
  "parent": null,
  "repository": "https://github.com/you/your-ds",
  "technology": ["react", "typescript", "tailwind-v4"],
  "tokens": { ... },
  "components": [ ... ],
  "screenshots": {
    "preview": "screenshots/preview.png"
  },
  "tags": ["your", "tags"]
}`;

  const claudeWorkflow = `# 01 · clone the registry
git clone https://github.com/hulusitunc/my-new-design-system

# 02 · copy an existing system
cp -r design-systems/octopus design-systems/my-ds

# 03 · open Claude Code and customize
claude "Customize design-systems/my-ds..."

# 04 · push and open a PR
git push origin my-ds-branch`;

  // ── Style fragments ──────────────────────────────

  const pageStyle: CSSProperties = {
    background: t.black,
    minHeight: "100vh",
    color: t.textPrimary,
  };

  const containerStyle: CSSProperties = {
    maxWidth: 1100,
    margin: "0 auto",
    padding: "0 32px",
  };

  const ruleStyle: CSSProperties = {
    height: 1,
    background: t.border,
    width: "100%",
  };

  const monoLabelStyle: CSSProperties = {
    fontFamily: editorialFonts.mono,
    fontSize: 11,
    letterSpacing: "0.1em",
    color: t.textDisabled,
    textTransform: "uppercase",
  };

  const sectionTitleStyle: CSSProperties = {
    fontFamily: editorialFonts.mono,
    fontSize: 11,
    letterSpacing: "0.1em",
    color: t.textPrimary,
    textTransform: "uppercase",
    margin: 0,
  };

  return (
    <div style={pageStyle}>
      <div style={containerStyle}>
        {/* ── Editorial header ──────────────────────── */}
        <header
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 24,
            paddingTop: 64,
            paddingBottom: 56,
          }}
        >
          <span style={monoLabelStyle}>FEATURE · SUBMISSIONS GUIDELINES</span>
          <div style={ruleStyle} />
          <h1
            style={{
              fontFamily: editorialFonts.display,
              fontSize: "clamp(56px, 10vw, 112px)",
              fontWeight: 400,
              letterSpacing: "-0.03em",
              lineHeight: 0.92,
              color: t.textDisplay,
              margin: 0,
            }}
          >
            Submit.
          </h1>
          <p
            style={{
              fontFamily: editorialFonts.body,
              fontSize: 19,
              lineHeight: 1.5,
              color: t.textSecondary,
              margin: 0,
              maxWidth: "65ch",
            }}
          >
            Hubera is a registry built by designers and engineers who care
            about craft. Anyone can contribute &mdash; whether you&apos;re
            shipping a brand new system or a customized fork of an existing
            one. Below are the four steps to get your work in front of the
            community.
          </p>
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
            <span>FOUR STEPS</span>
            <span
              style={{
                display: "inline-block",
                width: 12,
                height: 1,
                background: t.borderVisible,
              }}
            />
            <span>OPEN TO ALL</span>
            <span
              style={{
                display: "inline-block",
                width: 12,
                height: 1,
                background: t.borderVisible,
              }}
            />
            <span>PRs WELCOME</span>
          </div>
          <div style={ruleStyle} />
        </header>

        {/* ── Steps ─────────────────────────────────── */}
        <section
          style={{
            display: "flex",
            flexDirection: "column",
            paddingBottom: 96,
          }}
        >
          {steps.map((step, i) => (
            <div
              key={step.number}
              style={{
                display: "grid",
                gridTemplateColumns: "minmax(120px, 160px) minmax(0, 1fr)",
                gap: 48,
                padding: "48px 0",
                borderTop: i === 0 ? "none" : `1px solid ${t.border}`,
                alignItems: "baseline",
              }}
            >
              <span
                style={{
                  fontFamily: editorialFonts.display,
                  fontSize: "clamp(64px, 9vw, 96px)",
                  fontWeight: 400,
                  letterSpacing: "-0.03em",
                  lineHeight: 0.85,
                  color: t.textDisplay,
                  fontVariantNumeric: "tabular-nums",
                }}
              >
                {step.number}
              </span>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 16,
                  paddingTop: 12,
                }}
              >
                <h2
                  style={{
                    fontFamily: editorialFonts.mono,
                    fontSize: 13,
                    letterSpacing: "0.1em",
                    color:
                      i === 0 ? t.accent : t.textPrimary,
                    textTransform: "uppercase",
                    margin: 0,
                  }}
                >
                  {step.title}
                </h2>
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
                  {step.description}
                </p>
              </div>
            </div>
          ))}
          <div style={ruleStyle} />
        </section>

        {/* ── Manifest specimen ─────────────────────── */}
        <section
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 32,
            paddingBottom: 96,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "baseline",
              justifyContent: "space-between",
              gap: 16,
            }}
          >
            <h2 style={sectionTitleStyle}>SPECIMEN · DS-MANIFEST.JSON</h2>
            <span
              style={{
                fontFamily: editorialFonts.mono,
                fontSize: 10,
                letterSpacing: "0.06em",
                color: t.textDisabled,
                textTransform: "uppercase",
              }}
            >
              EXAMPLE
            </span>
          </div>
          <div style={ruleStyle} />
          <pre
            style={{
              fontFamily: editorialFonts.mono,
              fontSize: 13,
              lineHeight: 1.65,
              color: t.textPrimary,
              margin: 0,
              padding: "8px 0 8px 20px",
              borderLeft: `1px solid ${t.borderVisible}`,
              overflowX: "auto",
              whiteSpace: "pre",
            }}
          >
            {manifestExample}
          </pre>
        </section>

        {/* ── Claude workflow specimen ─────────────── */}
        <section
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 32,
            paddingBottom: 160,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "baseline",
              justifyContent: "space-between",
              gap: 16,
            }}
          >
            <h2 style={sectionTitleStyle}>WORKFLOW · CLAUDE CODE</h2>
            <span
              style={{
                fontFamily: editorialFonts.mono,
                fontSize: 10,
                letterSpacing: "0.06em",
                color: t.textDisabled,
                textTransform: "uppercase",
              }}
            >
              FASTEST PATH
            </span>
          </div>
          <div style={ruleStyle} />
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
            The shortest route from idea to merged PR. Clone the registry,
            duplicate an existing system, and let Claude Code do the heavy
            lifting on your customizations.
          </p>
          <pre
            style={{
              fontFamily: editorialFonts.mono,
              fontSize: 13,
              lineHeight: 1.85,
              color: t.textPrimary,
              margin: 0,
              padding: "8px 0 8px 20px",
              borderLeft: `1px solid ${t.borderVisible}`,
              overflowX: "auto",
              whiteSpace: "pre",
            }}
          >
            {claudeWorkflow}
          </pre>
        </section>
      </div>
    </div>
  );
}
