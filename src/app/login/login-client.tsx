"use client";

import { useEffect, useState, type CSSProperties, type FormEvent } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useTheme } from "@/components/providers/theme-provider";
import { getNd, editorialFonts } from "@/lib/nothing-tokens";
import { createClient } from "@/lib/supabase/client";
import {
  Eyebrow,
  PrimaryPill,
  GhostArrowLink,
} from "@/components/editorial";
import { HeroShader } from "@/components/hero-shader";
import { HuberaLogo } from "@/components/brand/hubera-logo";

import GithubFillIcon from "remixicon-react/GithubFillIcon";

type LoadingKind = "email" | "github" | null;

export function LoginClient() {
  const { theme } = useTheme();
  const t = getNd(theme);
  const searchParams = useSearchParams();
  const errorFromQuery = searchParams.get("error");

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState<LoadingKind>(null);
  const [error, setError] = useState<string | null>(errorFromQuery);
  const [emailSent, setEmailSent] = useState(false);

  // Desktop split: show the hero frame on the right only on wide screens.
  const [isDesktop, setIsDesktop] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 900px)");
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsDesktop(mq.matches);
    const onChange = (e: MediaQueryListEvent) => setIsDesktop(e.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  async function handleEmailSignIn(e: FormEvent) {
    e.preventDefault();
    if (!email) return;
    setLoading("email");
    setError(null);
    const supabase = createClient();
    const { error: signInError } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback?next=/dashboard`,
      },
    });
    if (signInError) {
      setError(signInError.message);
      setLoading(null);
    } else {
      setEmailSent(true);
      setLoading(null);
    }
  }

  async function handleGitHubSignIn() {
    setLoading("github");
    setError(null);
    const supabase = createClient();
    const { error: signInError } = await supabase.auth.signInWithOAuth({
      provider: "github",
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=/dashboard`,
      },
    });
    if (signInError) {
      setError(signInError.message);
      setLoading(null);
    }
  }

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
      {/* ─────────── Left: form panel */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "clamp(32px, 5vw, 72px)",
          minHeight: "100vh",
          gap: 48,
          minWidth: 0,
        }}
      >
        {/* Logo */}
        <Link
          href="/"
          aria-label="Hubera home"
          style={{
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

        {/* Form center block */}
        <div
          style={{
            width: "100%",
            maxWidth: 400,
            display: "flex",
            flexDirection: "column",
            gap: 32,
          }}
        >
          {emailSent ? (
            <SentState email={email} onBack={() => setEmailSent(false)} />
          ) : (
            <>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 14,
                }}
              >
                <Eyebrow>Welcome</Eyebrow>
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
                  Sign in to Hubera.
                </h1>
                <p
                  style={{
                    margin: 0,
                    fontFamily: editorialFonts.body,
                    fontSize: 15,
                    lineHeight: 1.55,
                    color: t.textSecondary,
                    maxWidth: "42ch",
                  }}
                >
                  Enter your email to sign in or create an account. We&apos;ll
                  send you a link — no password needed.
                </p>
              </div>

              <form
                onSubmit={handleEmailSignIn}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 12,
                }}
              >
                <EmailInput
                  value={email}
                  onChange={setEmail}
                  disabled={loading !== null}
                />
                <PrimaryPill
                  as="button"
                  type="submit"
                  disabled={loading !== null || !email}
                  trailingArrow={false}
                >
                  {loading === "email"
                    ? "Sending link…"
                    : "Continue with email"}
                </PrimaryPill>
              </form>

              <OrDivider />

              <GitHubButton
                onClick={handleGitHubSignIn}
                disabled={loading !== null}
                loading={loading === "github"}
              />

              {error ? (
                <Eyebrow style={{ color: t.danger }}>! {error}</Eyebrow>
              ) : null}

              <Eyebrow tone="muted" style={{ lineHeight: 1.6 }}>
                By continuing, you agree to our terms.
              </Eyebrow>
            </>
          )}
        </div>

        {/* Back link */}
        <GhostArrowLink href="/" direction="back">
          Back to the registry
        </GhostArrowLink>
      </div>

      {/* ─────────── Right: hero frame (desktop only) */}
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

/* ─────────── Email input — rounded, theme-aware */

function EmailInput({
  value,
  onChange,
  disabled,
}: {
  value: string;
  onChange: (v: string) => void;
  disabled?: boolean;
}) {
  const { theme } = useTheme();
  const t = getNd(theme);
  const [focused, setFocused] = useState(false);

  const style: CSSProperties = {
    width: "100%",
    padding: "14px 20px",
    background: t.surface,
    border: `1px solid ${focused ? t.textDisplay : t.borderVisible}`,
    borderRadius: 12,
    fontFamily: editorialFonts.body,
    fontSize: 15,
    lineHeight: 1.2,
    color: t.textDisplay,
    outline: "none",
    transition: "border-color 200ms cubic-bezier(0.165, 0.84, 0.44, 1)",
    boxSizing: "border-box",
  };

  return (
    <input
      type="email"
      required
      autoComplete="email"
      placeholder="you@example.com"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      disabled={disabled}
      style={style}
    />
  );
}

/* ─────────── "or" divider */

function OrDivider() {
  const { theme } = useTheme();
  const t = getNd(theme);
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 14,
        color: t.textDisabled,
      }}
    >
      <span
        aria-hidden
        style={{ height: 1, flex: 1, background: t.border }}
      />
      <span
        style={{
          fontFamily: editorialFonts.mono,
          fontSize: 11,
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          color: t.textDisabled,
        }}
      >
        or
      </span>
      <span
        aria-hidden
        style={{ height: 1, flex: 1, background: t.border }}
      />
    </div>
  );
}

/* ─────────── GitHub secondary button — outlined pill */

function GitHubButton({
  onClick,
  disabled,
  loading,
}: {
  onClick: () => void;
  disabled?: boolean;
  loading?: boolean;
}) {
  const { theme } = useTheme();
  const t = getNd(theme);
  const [hovered, setHovered] = useState(false);

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 12,
        padding: "12px 22px",
        background: hovered ? t.surfaceRaised : "transparent",
        border: `1px solid ${hovered ? t.textDisplay : t.borderVisible}`,
        borderRadius: 9999,
        fontFamily: editorialFonts.body,
        fontSize: 15,
        fontWeight: 500,
        color: t.textDisplay,
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled && !loading ? 0.5 : 1,
        transition:
          "background 200ms cubic-bezier(0.165, 0.84, 0.44, 1), border-color 200ms cubic-bezier(0.165, 0.84, 0.44, 1)",
      }}
    >
      <GithubFillIcon size={18} />
      {loading ? "Redirecting to GitHub…" : "Continue with GitHub"}
    </button>
  );
}

/* ─────────── Sent state — check your email */

function SentState({
  email,
  onBack,
}: {
  email: string;
  onBack: () => void;
}) {
  const { theme } = useTheme();
  const t = getNd(theme);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 20,
      }}
    >
      <Eyebrow>Check your email</Eyebrow>
      <h1
        style={{
          margin: 0,
          fontFamily: editorialFonts.display,
          fontWeight: 500,
          fontSize: "clamp(28px, 3.2vw, 40px)",
          lineHeight: 1.05,
          letterSpacing: "-0.025em",
          color: t.textDisplay,
        }}
      >
        Link sent.
      </h1>
      <p
        style={{
          margin: 0,
          fontFamily: editorialFonts.body,
          fontSize: 15,
          lineHeight: 1.6,
          color: t.textSecondary,
        }}
      >
        We just emailed a sign-in link to{" "}
        <strong style={{ color: t.textDisplay, fontWeight: 500 }}>
          {email}
        </strong>
        . Open it on this device to continue.
      </p>
      <button
        type="button"
        onClick={onBack}
        style={{
          alignSelf: "flex-start",
          background: "transparent",
          border: "none",
          padding: 0,
          cursor: "pointer",
          fontFamily: editorialFonts.mono,
          fontSize: 11,
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          color: t.textSecondary,
          transition: "color 200ms cubic-bezier(0.165, 0.84, 0.44, 1)",
          marginTop: 4,
        }}
        onMouseEnter={(e) =>
          (e.currentTarget.style.color = t.textDisplay)
        }
        onMouseLeave={(e) =>
          (e.currentTarget.style.color = t.textSecondary)
        }
      >
        ← Use a different email
      </button>
    </div>
  );
}
