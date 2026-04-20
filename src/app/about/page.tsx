"use client";

import { useTheme } from "@/components/providers/theme-provider";
import { getNd, editorialFonts } from "@/lib/nothing-tokens";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Eyebrow, Rule } from "@/components/editorial";

export default function AboutPage() {
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
      <SiteHeader active="/about" />
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
          <Eyebrow>About · Hubera</Eyebrow>

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
            A registry for the <span style={{ color: t.accent }}>public</span>{" "}
            good.
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
            Hubera is a non-profit registry for complete design systems.
            Tokens, providers, and components — not just snippets. Every
            system is forkable and the provenance is preserved.
          </p>

          <p
            style={{
              margin: 0,
              fontSize: 16,
              fontWeight: 500,
              lineHeight: 1.6,
              color: t.textPrimary,
              maxWidth: "58ch",
            }}
          >
            There is no pricing page. There will not be one. The registry
            runs as a community resource, funded by contributors and hosted
            infrastructure. Everything shipped here is MIT licensed.
          </p>

          <Rule />

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
              gap: 32,
            }}
          >
            <Principle
              label="Forkable by default"
              body="Every system can be cloned, modified, and re-published with attribution preserved."
              t={t}
            />
            <Principle
              label="Craft over scale"
              body="Opinionated systems from designers who care about detail, not a pile of generated variants."
              t={t}
            />
            <Principle
              label="Open infrastructure"
              body="MCP-native so Claude Code can install a whole system into any project in one command."
              t={t}
            />
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}

function Principle({
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
