"use client";

import Link from "next/link";
import { useState } from "react";
import { useTheme } from "@/components/providers/theme-provider";
import { getNd, editorialFonts } from "@/lib/nothing-tokens";
import {
  Eyebrow,
  PrimaryPill,
  SectionHeader,
} from "@/components/editorial";

interface DashboardUser {
  email: string;
  githubUsername: string;
  avatarUrl?: string;
  displayName: string;
}

interface DashboardSystem {
  slug: string;
  name: string;
  description: string | null;
  version: string;
  technology: string[];
  tags: string[];
  published: boolean;
  updated_at: string;
}

export function DashboardClient({
  user,
  systems,
}: {
  user: DashboardUser;
  systems: DashboardSystem[];
}) {
  const { theme } = useTheme();
  const t = getNd(theme);

  return (
    <div
      style={{
        padding: "clamp(32px, 4vw, 56px) clamp(24px, 5vw, 72px) 96px",
        maxWidth: 1200,
        margin: "0 auto",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 20,
          marginBottom: 56,
        }}
      >
        <Eyebrow>Dashboard</Eyebrow>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 24,
            flexWrap: "wrap",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
            {user.avatarUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={user.avatarUrl}
                alt={user.githubUsername}
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: "50%",
                  border: `1px solid ${t.border}`,
                }}
              />
            )}
            <div>
              <h1
                style={{
                  fontFamily: editorialFonts.display,
                  fontSize: "clamp(32px, 4vw, 56px)",
                  fontWeight: 500,
                  letterSpacing: "-0.025em",
                  lineHeight: 1.02,
                  color: t.textDisplay,
                  margin: 0,
                  marginBottom: 6,
                }}
              >
                {user.displayName || user.githubUsername || "Welcome"}
              </h1>
              <p
                style={{
                  fontFamily: editorialFonts.body,
                  fontSize: 14,
                  color: t.textSecondary,
                  margin: 0,
                }}
              >
                @{user.githubUsername} · {user.email}
              </p>
            </div>
          </div>

          <SignOutButton />
        </div>
      </div>

      {/* My design systems */}
      <section style={{ display: "flex", flexDirection: "column", gap: 28 }}>
        <SectionHeader
          eyebrow="Your design systems"
          title={
            systems.length > 0
              ? `${systems.length} published`
              : "Nothing published yet"
          }
          link={{ label: "Publish new →", href: "/submit" }}
        />

        {systems.length === 0 ? (
          <div
            style={{
              border: `1px dashed ${t.border}`,
              padding: "clamp(40px, 6vw, 72px) 32px",
              textAlign: "center",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 20,
            }}
          >
            <p
              style={{
                fontFamily: editorialFonts.body,
                fontSize: 15,
                color: t.textSecondary,
                margin: 0,
                maxWidth: "42ch",
              }}
            >
              You haven&apos;t published any design systems yet.
            </p>
            <PrimaryPill href="/submit">
              Publish your first system
            </PrimaryPill>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column" }}>
            {systems.map((system) => (
              <SystemRow key={system.slug} system={system} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

/* ─────────────── Sign-out ghost button (matches GhostArrowLink visually) */

function SignOutButton() {
  const { theme } = useTheme();
  const t = getNd(theme);
  const [hovered, setHovered] = useState(false);

  return (
    <form action="/auth/signout" method="POST" style={{ display: "inline" }}>
      <button
        type="submit"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          fontFamily: editorialFonts.mono,
          fontSize: 11,
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          background: "transparent",
          color: hovered ? t.textDisplay : t.textSecondary,
          border: "none",
          padding: 0,
          cursor: "pointer",
          transition: "color 200ms cubic-bezier(0.165, 0.84, 0.44, 1)",
        }}
      >
        Sign out →
      </button>
    </form>
  );
}

/* ─────────────── Single system row */

function SystemRow({ system }: { system: DashboardSystem }) {
  const { theme } = useTheme();
  const t = getNd(theme);
  const [hovered, setHovered] = useState(false);

  return (
    <Link
      href={`/ds/${system.slug}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: "grid",
        gridTemplateColumns: "1fr auto",
        alignItems: "baseline",
        padding: "20px 0",
        borderTop: `1px solid ${t.border}`,
        textDecoration: "none",
        color: "inherit",
        gap: 24,
        transition: "opacity 200ms cubic-bezier(0.165, 0.84, 0.44, 1)",
        opacity: hovered ? 0.92 : 1,
      }}
    >
      <div>
        <h3
          style={{
            fontFamily: editorialFonts.display,
            fontSize: 20,
            fontWeight: 500,
            color: t.textDisplay,
            margin: 0,
            marginBottom: 6,
            letterSpacing: "-0.015em",
          }}
        >
          {system.name}
        </h3>
        {system.description && (
          <p
            style={{
              fontFamily: editorialFonts.body,
              fontSize: 14,
              color: t.textSecondary,
              margin: 0,
              marginBottom: 10,
              maxWidth: "60ch",
              lineHeight: 1.5,
            }}
          >
            {system.description}
          </p>
        )}
        <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
          <Eyebrow>v{system.version}</Eyebrow>
          {system.technology.length > 0 && (
            <Eyebrow>{system.technology.slice(0, 3).join(" · ")}</Eyebrow>
          )}
          {!system.published && (
            <Eyebrow style={{ color: t.accent }}>Draft</Eyebrow>
          )}
        </div>
      </div>
      <Eyebrow
        style={{
          color: hovered ? t.textDisplay : t.textDisabled,
          transition: "color 200ms cubic-bezier(0.165, 0.84, 0.44, 1)",
        }}
      >
        →
      </Eyebrow>
    </Link>
  );
}
