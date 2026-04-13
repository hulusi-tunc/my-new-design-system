"use client";

import Link from "next/link";
import { useTheme } from "@/components/providers/theme-provider";
import { getNd, editorialFonts } from "@/lib/nothing-tokens";

import GithubFillIcon from "remixicon-react/GithubFillIcon";
import ArrowRightLineIcon from "remixicon-react/ArrowRightLineIcon";
import ArrowLeftLineIcon from "remixicon-react/ArrowLeftLineIcon";

export function LoginClient() {
  const { theme } = useTheme();
  const t = getNd(theme);

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: t.black,
        padding: 32,
        fontFamily: editorialFonts.body,
      }}
    >
      <div style={{ width: "100%", maxWidth: 440 }}>
        {/* Editorial header */}
        <div style={{ marginBottom: 56 }}>
          <span
            style={{
              fontFamily: editorialFonts.mono,
              fontSize: 11,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: t.textDisabled,
              display: "block",
              marginBottom: 20,
            }}
          >
            ISSUE 01 · AUTHENTICATION
          </span>

          <div
            style={{
              height: 1,
              background: t.border,
              marginBottom: 28,
            }}
          />

          <h1
            style={{
              fontFamily: editorialFonts.display,
              fontSize: "clamp(48px, 7vw, 76px)",
              fontWeight: 500,
              lineHeight: 0.95,
              letterSpacing: "-0.03em",
              color: t.textDisplay,
              margin: 0,
              marginBottom: 18,
            }}
          >
            Sign{" "}
            <em style={{ fontStyle: "italic", fontWeight: 400 }}>in</em>.
          </h1>

          <p
            style={{
              fontFamily: editorialFonts.body,
              fontSize: 16,
              lineHeight: 1.55,
              color: t.textSecondary,
              margin: 0,
              maxWidth: "40ch",
            }}
          >
            Access the registry with your GitHub account. Your public profile is
            the only thing we read.
          </p>
        </div>

        {/* GitHub button — minimal, editorial, no rounded pill shape */}
        <button
          onClick={() => {
            // TODO: wire up NextAuth signIn("github")
            window.location.href = "/catalog";
          }}
          style={{
            width: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 14,
            fontFamily: editorialFonts.mono,
            fontSize: 12,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            padding: "20px 4px",
            border: "none",
            borderTop: `1px solid ${t.borderVisible}`,
            borderBottom: `1px solid ${t.borderVisible}`,
            background: "transparent",
            color: t.textDisplay,
            cursor: "pointer",
            transition: "color 200ms cubic-bezier(0.25,0.1,0.25,1)",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = t.accent;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = t.textDisplay;
          }}
        >
          <span style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <GithubFillIcon size={16} />
            Continue with GitHub
          </span>
          <ArrowRightLineIcon size={16} />
        </button>

        {/* Fine print */}
        <p
          style={{
            fontFamily: editorialFonts.mono,
            fontSize: 11,
            letterSpacing: "0.04em",
            textTransform: "uppercase",
            color: t.textDisabled,
            marginTop: 20,
            lineHeight: 1.6,
            maxWidth: "52ch",
          }}
        >
          By continuing, you let Hubera read your public GitHub profile.
        </p>

        {/* Back link */}
        <Link
          href="/"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            marginTop: 48,
            fontFamily: editorialFonts.mono,
            fontSize: 11,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            color: t.textSecondary,
            textDecoration: "none",
            transition: "color 200ms cubic-bezier(0.25,0.1,0.25,1)",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = t.textDisplay;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = t.textSecondary;
          }}
        >
          <ArrowLeftLineIcon size={13} />
          Back to the registry
        </Link>
      </div>
    </div>
  );
}
