"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useTheme } from "@/components/providers/theme-provider";
import { getNd, editorialFonts } from "@/lib/nothing-tokens";
import { createClient } from "@/lib/supabase/client";
import {
  Eyebrow,
  PrimaryPill,
  GhostArrowLink,
  TextInput,
} from "@/components/editorial";
import { HeroShader } from "@/components/hero-shader";
import { HuberaLogo } from "@/components/brand/hubera-logo";

import GithubFillIcon from "remixicon-react/GithubFillIcon";

type LoadingKind = "email" | "github" | null;

// Minimal client-side email shape check. Supabase will do the real check.
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD = 6;

function humanizeAuthError(raw: string): { title: string; hint?: string } {
  const msg = raw.toLowerCase();
  if (msg.includes("email not confirmed")) {
    return {
      title: "Email confirmation is on in Supabase",
      hint: "Go to Supabase → Authentication → Providers → Email and turn off 'Confirm email'. Then try again.",
    };
  }
  if (msg.includes("invalid login credentials")) {
    return { title: "Incorrect password." };
  }
  if (msg.includes("password should be at least")) {
    return { title: `Password must be at least ${MIN_PASSWORD} characters.` };
  }
  if (msg.includes("rate limit") || msg.includes("too many")) {
    return {
      title: "Too many requests",
      hint: "Wait a minute, then try again. GitHub sign-in still works.",
    };
  }
  if (msg.includes("signups not allowed") || msg.includes("disabled")) {
    return {
      title: "Email sign-in isn't enabled",
      hint: "Enable Email provider in Supabase → Authentication → Providers. Use GitHub for now.",
    };
  }
  if (msg.includes("invalid") && msg.includes("email")) {
    return { title: "That email doesn't look valid." };
  }
  return { title: raw };
}

export function LoginClient() {
  const { theme } = useTheme();
  const t = getNd(theme);
  const searchParams = useSearchParams();
  const errorFromQuery = searchParams.get("error");

  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState<LoadingKind>(null);
  const [error, setError] = useState<string | null>(errorFromQuery);

  // Config check — warn dev if Supabase env vars are missing.
  const [configMissing, setConfigMissing] = useState(false);
  useEffect(() => {
    const hasUrl = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL);
    const hasKey = Boolean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
setConfigMissing(!hasUrl || !hasKey);
  }, []);

  // Desktop split: show the hero frame on the right only on wide screens.
  const [isDesktop, setIsDesktop] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 900px)");
setIsDesktop(mq.matches);
    const onChange = (e: MediaQueryListEvent) => setIsDesktop(e.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  const emailValid = EMAIL_RE.test(email.trim());
  const passwordValid = password.length >= MIN_PASSWORD;
  const fullNameValid = fullName.trim().length >= 2;
  const formValid =
    emailValid &&
    passwordValid &&
    (mode === "signin" || fullNameValid);

  async function handleEmailSubmit(e: FormEvent) {
    e.preventDefault();
    if (!emailValid) {
      setError("Please enter a valid email address.");
      return;
    }
    if (!passwordValid) {
      setError(`Password must be at least ${MIN_PASSWORD} characters.`);
      return;
    }
    if (mode === "signup" && !fullNameValid) {
      setError("Please enter your full name.");
      return;
    }

    setLoading("email");
    setError(null);

    const trimmedEmail = email.trim();
    const trimmedName = fullName.trim();
    const supabase = createClient();

    try {
      if (mode === "signin") {
        const { error: signInError } =
          await supabase.auth.signInWithPassword({
            email: trimmedEmail,
            password,
          });
        if (signInError) {
          setError(signInError.message);
          return;
        }
        // Let the dashboard layout decide where to send them based on their
        // approval status.
        window.location.href = "/dashboard";
        return;
      }

      // mode === "signup"
      const { error: signUpError } = await supabase.auth.signUp({
        email: trimmedEmail,
        password,
        options: {
          data: {
            full_name: trimmedName,
          },
        },
      });

      if (signUpError) {
        setError(signUpError.message);
        return;
      }

      // Account created. Profile row is inserted by the database trigger with
      // approval_status = 'pending' (or 'approved' for the admin email).
      // Send them to the pending screen — the gating layout will bounce them
      // to the dashboard automatically if they were auto-approved.
      window.location.href = "/pending";
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(null);
    }
  }

  async function handleGitHubSignIn() {
    setLoading("github");
    setError(null);
    try {
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
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
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
        {/* Logo — top-left */}
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
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 14,
                }}
              >
                <Eyebrow>{mode === "signin" ? "Welcome back" : "Create account"}</Eyebrow>
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
                  {mode === "signin" ? "Sign in to Hubera." : "Join Hubera."}
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
                  {mode === "signin"
                    ? "Sign in with your email and password, or continue with GitHub."
                    : "New accounts need admin approval before access is granted. We'll email you when you're in."}
                </p>
              </div>

              <GitHubButton
                onClick={handleGitHubSignIn}
                disabled={loading !== null}
                loading={loading === "github"}
              />

              <OrDivider />

              <form
                onSubmit={handleEmailSubmit}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 12,
                }}
              >
                {mode === "signup" ? (
                  <TextInput
                    type="text"
                    required
                    autoComplete="name"
                    placeholder="Full name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    disabled={loading !== null}
                  />
                ) : null}
                <TextInput
                  type="email"
                  required
                  autoComplete="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading !== null}
                />
                <TextInput
                  type="password"
                  required
                  autoComplete={
                    mode === "signin" ? "current-password" : "new-password"
                  }
                  placeholder="Password (6+ characters)"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading !== null}
                />
                <PrimaryPill
                  as="button"
                  type="submit"
                  disabled={loading !== null || !formValid}
                  trailingArrow={false}
                  fullWidth
                >
                  {loading === "email"
                    ? mode === "signin"
                      ? "Signing in…"
                      : "Creating account…"
                    : "Continue"}
                </PrimaryPill>
              </form>

              {/* Mode toggle */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  gap: 8,
                  fontFamily: editorialFonts.body,
                  fontSize: 14,
                  color: t.textSecondary,
                }}
              >
                <span>
                  {mode === "signin"
                    ? "New to Hubera?"
                    : "Already have an account?"}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setMode(mode === "signin" ? "signup" : "signin");
                    setError(null);
                  }}
                  style={{
                    background: "transparent",
                    border: "none",
                    padding: 0,
                    cursor: "pointer",
                    fontFamily: editorialFonts.body,
                    fontSize: 14,
                    fontWeight: 500,
                    color: t.textDisplay,
                    textDecoration: "underline",
                    textUnderlineOffset: 3,
                  }}
                >
                  {mode === "signin" ? "Create an account" : "Sign in"}
                </button>
              </div>

              {configMissing ? (
                <AlertBanner
                  tone="warning"
                  title="Supabase isn't configured"
                  hint="Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in your Vercel project env, then redeploy."
                />
              ) : null}

              {error ? (
                <AlertBanner
                  tone="error"
                  title={humanizeAuthError(error).title}
                  hint={humanizeAuthError(error).hint}
                />
              ) : null}

              <Eyebrow tone="muted" style={{ lineHeight: 1.6 }}>
                By continuing, you agree to our terms.
              </Eyebrow>
        </div>

        {/* Back link — bottom-left */}
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

/* ─────────── "or" divider */

/* ─────────── Alert banner — used for errors + config hints */

function AlertBanner({
  tone,
  title,
  hint,
}: {
  tone: "error" | "warning";
  title: string;
  hint?: string;
}) {
  const { theme } = useTheme();
  const t = getNd(theme);
  const accentColor = tone === "error" ? t.danger : t.warning;

  return (
    <div
      role="alert"
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 6,
        padding: "12px 16px",
        background: `color-mix(in oklch, ${accentColor} 10%, transparent)`,
        border: `1px solid color-mix(in oklch, ${accentColor} 35%, transparent)`,
        borderRadius: 10,
      }}
    >
      <span
        style={{
          fontFamily: editorialFonts.body,
          fontSize: 14,
          fontWeight: 500,
          lineHeight: 1.35,
          color: accentColor,
        }}
      >
        {title}
      </span>
      {hint ? (
        <span
          style={{
            fontFamily: editorialFonts.body,
            fontSize: 13,
            lineHeight: 1.5,
            color: t.textSecondary,
          }}
        >
          {hint}
        </span>
      ) : null}
    </div>
  );
}

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
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 12,
        width: "100%",
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

