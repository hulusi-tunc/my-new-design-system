"use client";

import { useTheme } from "@/components/providers/theme-provider";
import { getNd, editorialFonts } from "@/lib/nothing-tokens";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Eyebrow, Rule } from "@/components/editorial";

type Entry = {
  version: string;
  date: string;
  title: string;
  body: string;
};

const ENTRIES: Entry[] = [
  {
    version: "0.1.0",
    date: "Coming soon",
    title: "Public preview",
    body: "The first public release of Hubera — browse, fork, and install design systems via Claude Code. MCP endpoint live at /api/mcp.",
  },
];

export default function ChangelogPage() {
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
      <SiteHeader active="/changelog" />
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
          <Eyebrow>Changelog</Eyebrow>

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
            What{" "}
            <span style={{ color: t.accent }}>shipped</span>.
          </h1>

          <p
            style={{
              margin: 0,
              fontSize: 16,
              fontWeight: 500,
              lineHeight: 1.6,
              color: t.textPrimary,
              maxWidth: "52ch",
            }}
          >
            Every release, every change. Dates are in UTC. The first public
            release is imminent.
          </p>

          <Rule />

          <ol
            style={{
              margin: 0,
              padding: 0,
              listStyle: "none",
              display: "flex",
              flexDirection: "column",
              gap: 48,
            }}
          >
            {ENTRIES.map((entry) => (
              <li
                key={entry.version}
                style={{
                  display: "grid",
                  gridTemplateColumns: "160px 1fr",
                  gap: 32,
                  alignItems: "start",
                }}
              >
                <div
                  style={{ display: "flex", flexDirection: "column", gap: 4 }}
                >
                  <span
                    style={{
                      fontFamily: editorialFonts.mono,
                      fontSize: 13,
                      fontWeight: 500,
                      color: t.textDisplay,
                      letterSpacing: "-0.005em",
                    }}
                  >
                    v{entry.version}
                  </span>
                  <Eyebrow tone="muted">{entry.date}</Eyebrow>
                </div>
                <div
                  style={{ display: "flex", flexDirection: "column", gap: 8 }}
                >
                  <h2
                    style={{
                      margin: 0,
                      fontFamily: editorialFonts.display,
                      fontWeight: 500,
                      fontSize: "clamp(20px, 1.8vw, 26px)",
                      lineHeight: 1.15,
                      letterSpacing: "-0.01em",
                      color: t.textDisplay,
                    }}
                  >
                    {entry.title}
                  </h2>
                  <p
                    style={{
                      margin: 0,
                      fontSize: 15,
                      fontWeight: 500,
                      lineHeight: 1.6,
                      color: t.textPrimary,
                      maxWidth: "58ch",
                    }}
                  >
                    {entry.body}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
