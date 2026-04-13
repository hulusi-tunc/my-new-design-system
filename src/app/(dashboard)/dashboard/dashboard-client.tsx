"use client";

import Link from "next/link";
import { useTheme } from "@/components/providers/theme-provider";
import { getNd, editorialFonts } from "@/lib/nothing-tokens";

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

  const labelStyle = {
    fontFamily: editorialFonts.mono,
    fontSize: 11,
    letterSpacing: "0.08em",
    textTransform: "uppercase" as const,
    color: t.textDisabled,
  };

  return (
    <div style={{ padding: "48px 48px 96px", maxWidth: 1200, margin: "0 auto" }}>
      {/* Header */}
      <div style={{ marginBottom: 64 }}>
        <span style={{ ...labelStyle, display: "block", marginBottom: 16 }}>
          DASHBOARD
        </span>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 20,
            marginBottom: 24,
          }}
        >
          {user.avatarUrl && (
            <img
              src={user.avatarUrl}
              alt={user.githubUsername}
              style={{
                width: 64,
                height: 64,
                borderRadius: "50%",
                border: `1px solid ${t.border}`,
              }}
            />
          )}
          <div>
            <h1
              style={{
                fontFamily: editorialFonts.display,
                fontSize: 44,
                fontWeight: 500,
                letterSpacing: "-0.02em",
                color: t.textDisplay,
                lineHeight: 1,
                margin: 0,
                marginBottom: 8,
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

        <form action="/auth/signout" method="POST" style={{ display: "inline" }}>
          <button
            type="submit"
            style={{
              fontFamily: editorialFonts.mono,
              fontSize: 11,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              background: "transparent",
              color: t.textSecondary,
              border: `1px solid ${t.border}`,
              padding: "10px 18px",
              cursor: "pointer",
              transition: "color 120ms ease-out, border-color 120ms ease-out",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = t.accent;
              e.currentTarget.style.borderColor = t.accent;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = t.textSecondary;
              e.currentTarget.style.borderColor = t.border;
            }}
          >
            Sign out
          </button>
        </form>
      </div>

      {/* My design systems */}
      <div style={{ marginBottom: 48 }}>
        <div
          style={{
            display: "flex",
            alignItems: "baseline",
            justifyContent: "space-between",
            marginBottom: 24,
          }}
        >
          <span style={labelStyle}>YOUR DESIGN SYSTEMS</span>
          <Link
            href="/submit"
            style={{
              ...labelStyle,
              color: t.accent,
              textDecoration: "none",
            }}
          >
            + PUBLISH NEW
          </Link>
        </div>

        {systems.length === 0 ? (
          <div
            style={{
              border: `1px dashed ${t.border}`,
              padding: "64px 32px",
              textAlign: "center",
            }}
          >
            <p
              style={{
                fontFamily: editorialFonts.body,
                fontSize: 14,
                color: t.textSecondary,
                margin: 0,
                marginBottom: 16,
              }}
            >
              You haven&apos;t published any design systems yet.
            </p>
            <Link
              href="/submit"
              style={{
                fontFamily: editorialFonts.mono,
                fontSize: 11,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                color: t.accent,
                textDecoration: "none",
                border: `1px solid ${t.accent}`,
                padding: "10px 18px",
                display: "inline-block",
              }}
            >
              Publish your first system
            </Link>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column" }}>
            {systems.map((system) => (
              <Link
                key={system.slug}
                href={`/ds/${system.slug}`}
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr auto",
                  alignItems: "baseline",
                  padding: "24px 0",
                  borderTop: `1px solid ${t.border}`,
                  textDecoration: "none",
                  color: "inherit",
                  gap: 24,
                }}
              >
                <div>
                  <h3
                    style={{
                      fontFamily: editorialFonts.display,
                      fontSize: 22,
                      fontWeight: 500,
                      color: t.textDisplay,
                      margin: 0,
                      marginBottom: 6,
                      letterSpacing: "-0.01em",
                    }}
                  >
                    {system.name}
                  </h3>
                  {system.description && (
                    <p
                      style={{
                        fontFamily: editorialFonts.body,
                        fontSize: 13,
                        color: t.textSecondary,
                        margin: 0,
                        marginBottom: 8,
                        maxWidth: "60ch",
                      }}
                    >
                      {system.description}
                    </p>
                  )}
                  <div
                    style={{
                      ...labelStyle,
                      display: "flex",
                      gap: 16,
                    }}
                  >
                    <span>v{system.version}</span>
                    <span>{system.technology.slice(0, 3).join(" · ")}</span>
                    {!system.published && (
                      <span style={{ color: t.accent }}>DRAFT</span>
                    )}
                  </div>
                </div>
                <span style={labelStyle}>→</span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
