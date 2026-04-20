"use client";

import { useTheme } from "@/components/providers/theme-provider";
import { getNd, editorialFonts } from "@/lib/nothing-tokens";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Eyebrow, Rule, CopyCommand } from "@/components/editorial";

export default function DocsPage() {
  const { theme } = useTheme();
  const t = getNd(theme);

  return (
    <div
      style={{
        minHeight: "100vh",
        background: t.black,
        color: t.textPrimary,
        fontFamily: editorialFonts.body,
        display: "flex",
        flexDirection: "column",
      }}
    >
      <SiteHeader active="/docs" />
      <div aria-hidden style={{ height: 72 }} />

      <main
        style={{
          flex: 1,
          padding:
            "clamp(40px, 5vw, 80px) clamp(24px, 5vw, 72px) clamp(56px, 7vw, 112px)",
          maxWidth: 960,
          width: "100%",
          margin: "0 auto",
          display: "grid",
          gridTemplateColumns: "auto 1fr",
          columnGap: "clamp(20px, 2.2vw, 32px)",
          alignItems: "stretch",
        }}
      >
        <Rule orientation="vertical" />
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 36,
            maxWidth: 720,
          }}
        >
          <Eyebrow>Documentation · v0</Eyebrow>

          <h1
            style={{
              margin: 0,
              fontFamily: editorialFonts.display,
              fontWeight: 500,
              fontSize: "clamp(40px, 5vw, 72px)",
              lineHeight: 1.02,
              letterSpacing: "-0.025em",
              color: t.textDisplay,
            }}
          >
            Docs,{" "}
            <span style={{ color: t.accent }}>shortly</span>.
          </h1>

          <p
            style={{
              margin: 0,
              fontSize: 18,
              lineHeight: 1.55,
              color: t.textPrimary,
              maxWidth: "52ch",
            }}
          >
            The installation guide and authoring reference are in progress.
            In the meantime, wire the registry into Claude Code and it will
            guide you the rest of the way.
          </p>

          <div>
            <CopyCommand cmd="claude mcp add hubera https://hubera.app/api/mcp" />
          </div>

          <Rule />

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
              gap: 32,
            }}
          >
            <Topic
              label="Install the MCP"
              body="One command in Claude Code. Works in any project."
              t={t}
            />
            <Topic
              label="Authoring a system"
              body="Tokens, providers, and components. All in one manifest."
              t={t}
            />
            <Topic
              label="Forking"
              body="Clone any system, customize in code, publish your variant."
              t={t}
            />
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}

function Topic({
  label,
  body,
  t,
}: {
  label: string;
  body: string;
  t: ReturnType<typeof getNd>;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <Eyebrow tone="secondary">{label}</Eyebrow>
      <p
        style={{
          margin: 0,
          fontSize: 14,
          fontWeight: 500,
          lineHeight: 1.6,
          color: t.textPrimary,
          maxWidth: "36ch",
        }}
      >
        {body}
      </p>
    </div>
  );
}
