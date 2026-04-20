"use client";

import { useTheme } from "@/components/providers/theme-provider";
import { getNd, editorialFonts } from "@/lib/nothing-tokens";
import { Eyebrow, GhostArrowLink } from "@/components/editorial";
import { Button } from "@/components/hub";
import { HeroShader } from "@/components/hero-shader";
import { HuberaLogo } from "@/components/brand/hubera-logo";
import Link from "next/link";
import { useEffect, useState } from "react";

type Status = "pending" | "approved" | "rejected";

export function PendingClient({
  fullName,
  email,
  status,
}: {
  fullName: string | null;
  email: string;
  status: Status;
}) {
  const { theme } = useTheme();
  const t = getNd(theme);

  const [isDesktop, setIsDesktop] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 900px)");
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsDesktop(mq.matches);
    const onChange = (e: MediaQueryListEvent) => setIsDesktop(e.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  const copy =
    status === "rejected"
      ? {
          eyebrow: "Access declined",
          title: "Your request wasn't approved.",
          body: "The admin reviewed your account and declined access. If this was a mistake, reach out to the team.",
        }
      : {
          eyebrow: "Pending approval",
          title: "You're on the list.",
          body: "New accounts need admin approval before they can use Hubera. We'll email you the moment you're in — usually within a day.",
        };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "grid",
        gridTemplateColumns: isDesktop ? "2fr 3fr" : "1fr",
        background: "#ffffff",
        color: t.textPrimary,
        fontFamily: editorialFonts.body,
      }}
    >
      {/* Left: message */}
      <div
        style={{
          position: "relative",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "clamp(32px, 5vw, 72px)",
          minHeight: "100vh",
          minWidth: 0,
        }}
      >
        {/* Logo */}
        <Link
          href="/"
          aria-label="Hubera home"
          style={{
            position: "absolute",
            top: "clamp(32px, 5vw, 48px)",
            left: "clamp(32px, 5vw, 48px)",
            display: "inline-flex",
            alignItems: "center",
            gap: 10,
            color: t.textDisplay,
            textDecoration: "none",
            fontFamily: editorialFonts.body,
            fontSize: 15,
            fontWeight: 600,
            letterSpacing: "-0.005em",
          }}
        >
          <HuberaLogo variant="mark" height={22} />
          Hubera
        </Link>

        <div
          style={{
            width: "100%",
            maxWidth: 440,
            display: "flex",
            flexDirection: "column",
            gap: 28,
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <Eyebrow>{copy.eyebrow}</Eyebrow>
            <h1
              style={{
                margin: 0,
                fontFamily: editorialFonts.display,
                fontWeight: 500,
                fontSize: "clamp(32px, 3.6vw, 48px)",
                lineHeight: 1.02,
                letterSpacing: "-0.025em",
                color: t.textDisplay,
              }}
            >
              {copy.title}
            </h1>
            <p
              style={{
                margin: 0,
                fontSize: 15,
                lineHeight: 1.55,
                color: t.textSecondary,
                maxWidth: "44ch",
              }}
            >
              {copy.body}
            </p>
          </div>

          {/* Account info card */}
          <div
            style={{
              padding: "18px 20px",
              background: t.surfaceInk,
              borderRadius: 12,
              display: "flex",
              flexDirection: "column",
              gap: 8,
            }}
          >
            {fullName ? (
              <div style={{ display: "flex", gap: 12, alignItems: "baseline" }}>
                <Eyebrow tone="muted">Name</Eyebrow>
                <span style={{ color: t.textDisplay, fontWeight: 500 }}>
                  {fullName}
                </span>
              </div>
            ) : null}
            <div style={{ display: "flex", gap: 12, alignItems: "baseline" }}>
              <Eyebrow tone="muted">Email</Eyebrow>
              <span style={{ color: t.textDisplay }}>{email}</span>
            </div>
          </div>

          {/* Sign out */}
          <form action="/auth/signout" method="POST">
            <Button type="submit" variant="ghost" size="sm">
              Sign out →
            </Button>
          </form>
        </div>

        {/* Back link */}
        <div
          style={{
            position: "absolute",
            bottom: "clamp(32px, 5vw, 48px)",
            left: "clamp(32px, 5vw, 48px)",
          }}
        >
          <GhostArrowLink href="/" direction="back">
            Back to the registry
          </GhostArrowLink>
        </div>
      </div>

      {/* Right: scene */}
      {isDesktop ? (
        <div
          style={{
            position: "relative",
            overflow: "hidden",
            background: "transparent",
            minHeight: "100vh",
            minWidth: 0,
          }}
        >
          <HeroShader projectId="IrDzlkfhQyypa7rN4qwc" />
        </div>
      ) : null}
    </div>
  );
}
