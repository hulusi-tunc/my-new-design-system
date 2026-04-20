"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { motion, useReducedMotion, type Variants } from "framer-motion";
import { useTheme } from "@/components/providers/theme-provider";
import { getNd, editorialFonts } from "@/lib/nothing-tokens";
import { HuberaLogo } from "@/components/brand/hubera-logo";
import { HeroShader } from "@/components/hero-shader";
import { SiteFooter } from "@/components/site-footer";
import { Scramble } from "@/components/editorial";

/**
 * Hubera — editorial landing page.
 *
 * Aesthetic: magazine / editorial. Asymmetric grid, massive Bodoni Moda hero,
 * rule lines as the dividing system, restrained accent color, generous space.
 *
 * No cards. No 3-up feature grid. No glassmorphism. The accent red appears
 * exactly twice (the emphasized "forkable" and the primary CTA marker).
 */
export function LandingPage() {
  const { theme } = useTheme();
  const t = getNd(theme);
  const prefersReducedMotion = useReducedMotion();

  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Easing: ease-out-quart (exponential, no bounce)
  const easeOutQuart = [0.165, 0.84, 0.44, 1] as const;

  const fadeUp: Variants = {
    hidden: {
      opacity: 0,
      y: prefersReducedMotion ? 0 : 24,
    },
    show: {
      opacity: 1,
      y: 0,
      transition: {
        duration: prefersReducedMotion ? 0 : 0.9,
        ease: easeOutQuart,
      },
    },
  };

  const stagger: Variants = {
    hidden: {},
    show: {
      transition: {
        staggerChildren: prefersReducedMotion ? 0 : 0.12,
        delayChildren: prefersReducedMotion ? 0 : 0.05,
      },
    },
  };

  // Shared font tokens
  const fDisplay = editorialFonts.display;
  const fBody = editorialFonts.body;
  const fMono = editorialFonts.mono;

  // Tertiary mono label style — used for issue marker, section numbers, footer
  const monoLabel: React.CSSProperties = {
    fontFamily: fMono,
    fontSize: 11,
    letterSpacing: "0.08em",
    textTransform: "uppercase",
    color: t.textDisabled,
    fontWeight: 400,
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: t.black,
        color: t.textPrimary,
        fontFamily: fBody,
        // antialias hint
        WebkitFontSmoothing: "antialiased",
        MozOsxFontSmoothing: "grayscale",
        position: "relative",
        overflowX: "hidden",
      }}
    >
      {/* ─────────────────────────────────────── Top nav (morphs bar ↔ floating pill) */}
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 50,
          display: "flex",
          justifyContent: "center",
          pointerEvents: "none",
        }}
      >
        <motion.nav
          layout
          initial={false}
          animate={{
            marginTop: scrolled ? 14 : 0,
            borderRadius: scrolled ? 999 : 0,
            backgroundColor: scrolled
              ? theme === "dark"
                ? "rgba(22, 22, 26, 0.68)"
                : "rgba(255, 255, 255, 0.72)"
              : theme === "dark"
              ? "rgba(22, 22, 26, 0)"
              : "rgba(255, 255, 255, 0)",
            borderTopColor: scrolled
              ? t.borderVisible
              : "rgba(0,0,0,0)",
            borderLeftColor: scrolled
              ? t.borderVisible
              : "rgba(0,0,0,0)",
            borderRightColor: scrolled
              ? t.borderVisible
              : "rgba(0,0,0,0)",
            borderBottomColor: scrolled ? t.borderVisible : t.border,
            boxShadow: scrolled
              ? theme === "dark"
                ? "0 1px 0 rgba(255,255,255,0.04) inset, 0 8px 24px rgba(0,0,0,0.32)"
                : "0 1px 0 rgba(255,255,255,0.6) inset, 0 8px 24px rgba(15,15,20,0.08)"
              : "0 0 0 0 rgba(0,0,0,0)",
          }}
          transition={{
            layout: {
              duration: prefersReducedMotion ? 0 : 0.55,
              ease: easeOutQuart,
            },
            default: {
              duration: prefersReducedMotion ? 0 : 0.45,
              ease: easeOutQuart,
            },
          }}
          style={{
            pointerEvents: "auto",
            width: scrolled ? "auto" : "100%",
            display: "inline-flex",
            alignItems: "center",
            gap: scrolled ? 6 : 0,
            padding: scrolled
              ? "6px 6px 6px 16px"
              : "clamp(20px, 2.4vw, 32px) clamp(24px, 5vw, 72px)",
            borderStyle: "solid",
            borderWidth: 1,
            backdropFilter: scrolled
              ? "blur(20px) saturate(1.8)"
              : "blur(0px) saturate(1)",
            WebkitBackdropFilter: scrolled
              ? "blur(20px) saturate(1.8)"
              : "blur(0px) saturate(1)",
            transition:
              "padding 550ms cubic-bezier(0.165, 0.84, 0.44, 1), gap 550ms cubic-bezier(0.165, 0.84, 0.44, 1), backdrop-filter 450ms cubic-bezier(0.165, 0.84, 0.44, 1), -webkit-backdrop-filter 450ms cubic-bezier(0.165, 0.84, 0.44, 1)",
          }}
        >
          {/* Brand — full wordmark in both states, subtle size shift */}
          <motion.div layout style={{ flexShrink: 0 }}>
            <Link
              href="/"
              aria-label="Hubera home"
              style={{
                display: "inline-flex",
                alignItems: "center",
                color: t.textDisplay,
                textDecoration: "none",
                lineHeight: 0,
              }}
            >
              <motion.span
                layout
                animate={{ height: scrolled ? 18 : 22 }}
                transition={{
                  duration: prefersReducedMotion ? 0 : 0.5,
                  ease: easeOutQuart,
                }}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                }}
              >
                <HuberaLogo
                  variant="wordmark"
                  height={scrolled ? 18 : 22}
                />
              </motion.span>
            </Link>
          </motion.div>

          {/* Elastic spacer — fills remaining width in bar state, collapses in pill */}
          <motion.div
            layout
            aria-hidden
            animate={{ flexGrow: scrolled ? 0 : 1 }}
            transition={{
              duration: prefersReducedMotion ? 0 : 0.5,
              ease: easeOutQuart,
            }}
            style={{ flexShrink: 0, minWidth: 0 }}
          />

          <motion.div
            layout
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: scrolled ? 0 : 36,
              flexShrink: 0,
              transition:
                "gap 550ms cubic-bezier(0.165, 0.84, 0.44, 1)",
            }}
          >
            <Link
              href="/catalog"
              style={{
                ...monoLabel,
                padding: scrolled ? "6px 10px" : "0",
                color: t.textSecondary,
                textDecoration: "none",
                transition:
                  "color 240ms cubic-bezier(0.165, 0.84, 0.44, 1), padding 550ms cubic-bezier(0.165, 0.84, 0.44, 1)",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.color = t.textDisplay)
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.color = t.textSecondary)
              }
            >
              Catalog
            </Link>

            <Link
              href="/docs"
              style={{
                ...monoLabel,
                padding: scrolled ? "6px 10px" : "0",
                color: t.textSecondary,
                textDecoration: "none",
                transition:
                  "color 240ms cubic-bezier(0.165, 0.84, 0.44, 1), padding 550ms cubic-bezier(0.165, 0.84, 0.44, 1)",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.color = t.textDisplay)
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.color = t.textSecondary)
              }
            >
              Docs
            </Link>

            <Link
              href="/about"
              style={{
                ...monoLabel,
                padding: scrolled ? "6px 10px" : "0",
                color: t.textSecondary,
                textDecoration: "none",
                transition:
                  "color 240ms cubic-bezier(0.165, 0.84, 0.44, 1), padding 550ms cubic-bezier(0.165, 0.84, 0.44, 1)",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.color = t.textDisplay)
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.color = t.textSecondary)
              }
            >
              About
            </Link>

            <Link
              href="/changelog"
              style={{
                ...monoLabel,
                padding: scrolled ? "6px 10px" : "0",
                color: t.textSecondary,
                textDecoration: "none",
                transition:
                  "color 240ms cubic-bezier(0.165, 0.84, 0.44, 1), padding 550ms cubic-bezier(0.165, 0.84, 0.44, 1)",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.color = t.textDisplay)
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.color = t.textSecondary)
              }
            >
              Changelog
            </Link>

            <motion.div
              layout
              animate={{
                backgroundColor: scrolled
                  ? t.textDisplay
                  : "rgba(0,0,0,0)",
              }}
              transition={{
                duration: prefersReducedMotion ? 0 : 0.45,
                ease: easeOutQuart,
              }}
              style={{
                borderRadius: 999,
                transition:
                  "padding 550ms cubic-bezier(0.165, 0.84, 0.44, 1)",
                padding: scrolled ? "0" : "0",
                marginLeft: scrolled ? 6 : 0,
              }}
            >
              <Link
                href="/login"
                style={{
                  fontFamily: fMono,
                  fontSize: 11,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  fontWeight: 500,
                  color: scrolled ? t.black : t.textPrimary,
                  padding: scrolled ? "8px 16px" : "0",
                  borderRadius: 999,
                  textDecoration: "none",
                  display: "inline-block",
                  transition:
                    "color 400ms cubic-bezier(0.165, 0.84, 0.44, 1), padding 550ms cubic-bezier(0.165, 0.84, 0.44, 1), opacity 240ms ease",
                }}
                onMouseEnter={(e) => {
                  if (scrolled) {
                    e.currentTarget.style.opacity = "0.88";
                  } else {
                    e.currentTarget.style.color = t.textDisplay;
                  }
                }}
                onMouseLeave={(e) => {
                  if (scrolled) {
                    e.currentTarget.style.opacity = "1";
                  } else {
                    e.currentTarget.style.color = t.textPrimary;
                  }
                }}
              >
                Sign in
              </Link>
            </motion.div>
          </motion.div>
        </motion.nav>
      </div>

      {/* Spacer to offset fixed nav */}
      <div aria-hidden style={{ height: 72 }} />

      {/* Hero container — title + plate + feature strip all fit in one viewport */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          minHeight: "calc(100vh - 72px)",
        }}
      >

      {/* ─────────────────────────────────────── Hero */}
      <motion.section
        variants={stagger}
        initial="hidden"
        animate="show"
        style={{
          paddingLeft: "clamp(24px, 5vw, 72px)",
          paddingRight: "clamp(24px, 5vw, 72px)",
          paddingTop: "clamp(28px, 4vw, 56px)",
          paddingBottom: "clamp(20px, 2.5vw, 32px)",
          display: "grid",
          gridTemplateColumns: "1.35fr 1fr",
          columnGap: "clamp(32px, 5vw, 96px)",
          alignItems: "start",
          flexShrink: 0,
        }}
      >
        {/* Left: vertical rule + title */}
        <motion.div
          variants={fadeUp}
          style={{
            display: "grid",
            gridTemplateColumns: "auto 1fr",
            columnGap: "clamp(20px, 2.2vw, 32px)",
            alignItems: "stretch",
          }}
        >
          <span
            aria-hidden
            style={{
              width: 1,
              background: t.border,
              alignSelf: "stretch",
              minHeight: "100%",
            }}
          />
          <h1
            style={{
              margin: 0,
              fontFamily: fDisplay,
              fontWeight: 500,
              fontSize: "clamp(40px, 5vw, 80px)",
              lineHeight: 1.02,
              letterSpacing: "-0.025em",
              color: t.textDisplay,
            }}
          >
            Design systems,{" "}
            <span
              style={{
                color: t.accent,
                letterSpacing: "-0.02em",
              }}
            >
              forkable
            </span>
            .
          </h1>
        </motion.div>

        {/* Right: supporting copy + CTAs */}
        <motion.div
          variants={fadeUp}
          style={{
            paddingTop: "clamp(12px, 1.5vw, 24px)",
            display: "flex",
            flexDirection: "column",
            gap: 28,
          }}
        >
          <p
            style={{
              margin: 0,
              fontFamily: fBody,
              fontSize: "clamp(16px, 1.1vw, 19px)",
              fontWeight: 500,
              lineHeight: 1.55,
              color: t.textPrimary,
              maxWidth: "42ch",
            }}
          >
            Hubera is a registry for complete design systems — tokens,
            providers, and components, not just snippets. Browse, fork, and
            install any system into your project with a single Claude Code
            command.
          </p>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 28,
              flexWrap: "wrap",
            }}
          >
            <Link
              href="/catalog"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 12,
                fontFamily: fBody,
                fontSize: 15,
                fontWeight: 500,
                color: "#FFFFFF",
                textDecoration: "none",
                padding: "12px 22px",
                borderRadius: 9999,
                background: t.accent,
                transition:
                  "background 240ms cubic-bezier(0.165, 0.84, 0.44, 1)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = t.accentHover;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = t.accent;
              }}
            >
              Browse the registry
              <span aria-hidden>→</span>
            </Link>

            <Link
              href="/login"
              style={{
                ...monoLabel,
                color: t.textSecondary,
                textDecoration: "none",
                transition: "color 240ms cubic-bezier(0.165, 0.84, 0.44, 1)",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.color = t.textDisplay)
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.color = t.textSecondary)
              }
            >
              Sign in with GitHub →
            </Link>
          </div>
        </motion.div>
      </motion.section>

      {/* ─────────────────────────────────────── Illustration plate */}
      <motion.div
        initial={{ opacity: 0, y: prefersReducedMotion ? 0 : 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          duration: prefersReducedMotion ? 0 : 0.9,
          ease: easeOutQuart,
          delay: prefersReducedMotion ? 0 : 0.35,
        }}
        style={{
          margin: "0 clamp(24px, 5vw, 72px)",
          flex: 1,
          minHeight: 0,
          position: "relative",
          overflow: "hidden",
          borderRadius: 2,
          background: "transparent",
        }}
      >
        <HeroShader />

        {/* Copyable install command — centered on the plate */}
        <div
          style={{
            position: "absolute",
            left: "50%",
            top: "50%",
            transform: "translate(-50%, -50%)",
            width: "auto",
            maxWidth: "calc(100% - 48px)",
            zIndex: 2,
          }}
        >
          <CopyCommand
            cmd="claude mcp add hubera https://hubera.app/api/mcp"
            fontMono={fMono}
          />
        </div>
      </motion.div>

      {/* ─────────────────────────────────────── Feature strip */}
      <motion.section
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.3 }}
        variants={stagger}
        style={{
          margin: "clamp(16px, 2vw, 24px) clamp(24px, 5vw, 72px) clamp(20px, 2.5vw, 32px)",
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          borderTop: `1px solid ${t.border}`,
          borderBottom: `1px solid ${t.border}`,
          flexShrink: 0,
        }}
      >
        <FeatureCell
          label="Install in one command"
          icon={<InstallIcon />}
          t={t}
          variants={fadeUp}
          isFirst
        />
        <FeatureCell
          label="Full-stack systems"
          icon={<StackIcon />}
          t={t}
          variants={fadeUp}
        />
        <FeatureCell
          label="Fork &amp; make it yours"
          icon={<ForkIcon />}
          t={t}
          variants={fadeUp}
        />
        <FeatureCell
          label="MIT licensed"
          icon={<OpenIcon />}
          t={t}
          variants={fadeUp}
        />
      </motion.section>

      </div>

      {/* ─────────────────────────────────────── Founder's letter */}
      <motion.section
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.15 }}
        variants={stagger}
        style={{
          padding:
            "clamp(80px, 12vw, 160px) clamp(24px, 5vw, 72px) clamp(80px, 12vw, 160px)",
          display: "flex",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            width: "100%",
            maxWidth: 720,
            display: "flex",
            flexDirection: "column",
            gap: "clamp(56px, 7vw, 96px)",
          }}
        >
          <LetterBlock
            eyebrow="01 — About"
            title="Who I am"
            body="Hulusi Tunç. Web designer who builds apps. I spend most days deciding what feels right in a design and then shipping it. Hubera is the most ambitious thing I've made."
            t={t}
            fDisplay={fDisplay}
            fBody={fBody}
            variants={fadeUp}
          />
          <LetterBlock
            eyebrow="02 — Motivation"
            title="Why I'm doing this"
            body="Every project I start, I rewrite the same tokens, the same primitives, the same twelve components. I got tired of it. Hubera is the registry I wish existed — complete design systems you can fork in one command, not a hundred."
            t={t}
            fDisplay={fDisplay}
            fBody={fBody}
            variants={fadeUp}
          />
          <LetterBlock
            eyebrow="03 — The plan"
            title="What we're going to do"
            body="Build the registry I want to browse. Opinionated systems from designers who care about craft. One-command install via Claude Code. No npm bloat, no half-finished component libraries — just systems that hold up in production."
            t={t}
            fDisplay={fDisplay}
            fBody={fBody}
            variants={fadeUp}
          />
          <LetterBlock
            eyebrow="04 — To the team"
            title="Message for my team"
            body="If you care about craft more than headcount, if you'd rather ship one right thing than ten half-right ones, we're going to do good work. Keep picking the harder, better version every time. I'll do the same."
            t={t}
            fDisplay={fDisplay}
            fBody={fBody}
            variants={fadeUp}
          />

          {/* Contact row */}
          <motion.div
            variants={fadeUp}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 24,
              flexWrap: "wrap",
              paddingTop: "clamp(24px, 3vw, 40px)",
              borderTop: `1px solid ${t.border}`,
            }}
          >
            <ContactLink
              href="https://hulusitunc.com"
              label="hulusitunc.com"
              monoLabel={monoLabel}
              t={t}
            />
            <ContactLink
              href="https://linkedin.com/in/hulusitunc"
              label="LinkedIn / hulusitunc"
              monoLabel={monoLabel}
              t={t}
            />
          </motion.div>
        </div>
      </motion.section>

      <SiteFooter />
    </div>
  );
}

function LetterBlock({
  eyebrow,
  title,
  body,
  t,
  fDisplay,
  fBody,
  variants,
}: {
  eyebrow: string;
  title: string;
  body: string;
  t: ReturnType<typeof getNd>;
  fDisplay: string;
  fBody: string;
  variants: Variants;
}) {
  return (
    <motion.div
      variants={variants}
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 18,
      }}
    >
      <span
        style={{
          fontFamily: editorialFonts.mono,
          fontSize: 11,
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          color: t.textDisabled,
          fontWeight: 400,
        }}
      >
        {eyebrow}
      </span>
      <h3
        style={{
          margin: 0,
          fontFamily: fDisplay,
          fontWeight: 500,
          fontSize: "clamp(26px, 3vw, 40px)",
          lineHeight: 1.05,
          letterSpacing: "-0.025em",
          color: t.textDisplay,
        }}
      >
        {title}
      </h3>
      <p
        style={{
          margin: 0,
          fontFamily: fBody,
          fontSize: "clamp(16px, 1.1vw, 19px)",
          lineHeight: 1.6,
          color: t.textPrimary,
          maxWidth: "58ch",
        }}
      >
        {body}
      </p>
    </motion.div>
  );
}

function ContactLink({
  href,
  label,
  monoLabel,
  t,
}: {
  href: string;
  label: string;
  monoLabel: React.CSSProperties;
  t: ReturnType<typeof getNd>;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      style={{
        ...monoLabel,
        color: t.textSecondary,
        textDecoration: "none",
        transition: "color 200ms cubic-bezier(0.165, 0.84, 0.44, 1)",
      }}
      onMouseEnter={(e) => (e.currentTarget.style.color = t.textDisplay)}
      onMouseLeave={(e) => (e.currentTarget.style.color = t.textSecondary)}
    >
      {label} →
    </a>
  );
}

/* ──────────────────────────────────────────────────────── Sub-components */

function CopyCommand({
  cmd,
  fontMono,
}: {
  cmd: string;
  fontMono: string;
}) {
  const [copied, setCopied] = useState(false);
  const [hovered, setHovered] = useState(false);

  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(cmd);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      /* noop */
    }
  };

  return (
    <button
      type="button"
      onClick={onCopy}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      aria-label="Copy install command"
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 14,
        padding: "12px 14px 12px 18px",
        background: hovered
          ? "rgba(10,10,14,0.92)"
          : "rgba(10,10,14,0.82)",
        backdropFilter: "blur(14px)",
        WebkitBackdropFilter: "blur(14px)",
        border: "1px solid rgba(255,255,255,0.1)",
        borderRadius: 9999,
        color: "#ffffff",
        fontFamily: fontMono,
        fontSize: "clamp(12px, 0.95vw, 14px)",
        letterSpacing: "-0.005em",
        cursor: "pointer",
        transition:
          "background 220ms cubic-bezier(0.165, 0.84, 0.44, 1), transform 220ms cubic-bezier(0.165, 0.84, 0.44, 1)",
        transform: hovered ? "translateY(-1px)" : "translateY(0)",
        boxShadow:
          "0 12px 40px rgba(0,0,0,0.18), 0 2px 6px rgba(0,0,0,0.12)",
      }}
    >
      <span style={{ color: "rgba(255,255,255,0.45)" }}>$</span>
      <Scramble text={cmd} style={{ whiteSpace: "nowrap" }} />
      <span
        aria-hidden
        style={{
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          width: 28,
          height: 28,
          borderRadius: 9999,
          background: copied
            ? "rgba(80,200,120,0.22)"
            : "rgba(255,255,255,0.08)",
          color: copied ? "rgb(120,220,160)" : "rgba(255,255,255,0.8)",
          transition: "background 180ms ease, color 180ms ease",
        }}
      >
        {copied ? <CheckGlyph /> : <CopyGlyph />}
      </span>
    </button>
  );
}

function CopyGlyph() {
  return (
    <svg width={14} height={14} viewBox="0 0 16 16" fill="none" aria-hidden>
      <rect
        x={5}
        y={5}
        width={9}
        height={9}
        rx={1.5}
        stroke="currentColor"
        strokeWidth={1.3}
      />
      <path
        d="M11 5V3.5A1.5 1.5 0 0 0 9.5 2h-6A1.5 1.5 0 0 0 2 3.5v6A1.5 1.5 0 0 0 3.5 11H5"
        stroke="currentColor"
        strokeWidth={1.3}
      />
    </svg>
  );
}

function CheckGlyph() {
  return (
    <svg width={14} height={14} viewBox="0 0 16 16" fill="none" aria-hidden>
      <path
        d="M3 8.5 6.5 12 13 5"
        stroke="currentColor"
        strokeWidth={1.6}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function FeatureCell({
  label,
  icon,
  t,
  variants,
  isFirst,
}: {
  label: string;
  icon: React.ReactNode;
  t: ReturnType<typeof getNd>;
  variants: Variants;
  isFirst?: boolean;
}) {
  return (
    <motion.div
      variants={variants}
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 16,
        padding: "clamp(18px, 1.8vw, 26px) clamp(16px, 1.8vw, 28px)",
        borderLeft: isFirst ? "none" : `1px solid ${t.border}`,
      }}
    >
      <span
        style={{
          fontFamily: editorialFonts.display,
          fontSize: "clamp(14px, 1vw, 17px)",
          fontWeight: 500,
          letterSpacing: "-0.005em",
          color: t.textDisplay,
        }}
        dangerouslySetInnerHTML={{ __html: label }}
      />
      <span style={{ color: t.textSecondary, display: "inline-flex" }}>
        {icon}
      </span>
    </motion.div>
  );
}

function InstallIcon() {
  return (
    <svg width={22} height={22} viewBox="0 0 24 24" fill="none" aria-hidden>
      <rect x={4} y={4} width={16} height={16} rx={1.5} stroke="currentColor" strokeWidth={1.5} />
      <path
        d="M12 8v7M8.5 11.5 12 15l3.5-3.5"
        stroke="currentColor"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function StackIcon() {
  return (
    <svg width={22} height={22} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M12 4 3 8.5 12 13l9-4.5L12 4z"
        stroke="currentColor"
        strokeWidth={1.5}
        strokeLinejoin="round"
      />
      <path
        d="M3 13.5 12 18l9-4.5M3 17.5 12 22l9-4.5"
        stroke="currentColor"
        strokeWidth={1.5}
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ForkIcon() {
  return (
    <svg width={22} height={22} viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx={6} cy={5.5} r={2} stroke="currentColor" strokeWidth={1.5} />
      <circle cx={18} cy={5.5} r={2} stroke="currentColor" strokeWidth={1.5} />
      <circle cx={12} cy={18.5} r={2} stroke="currentColor" strokeWidth={1.5} />
      <path
        d="M6 7.5v4a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2v-4M12 13.5v3"
        stroke="currentColor"
        strokeWidth={1.5}
        strokeLinecap="round"
      />
    </svg>
  );
}

function OpenIcon() {
  return (
    <svg width={22} height={22} viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx={12} cy={12} r={8} stroke="currentColor" strokeWidth={1.5} />
      <path
        d="M12 4c2.5 2 4 4.8 4 8s-1.5 6-4 8c-2.5-2-4-4.8-4-8s1.5-6 4-8zM4 12h16"
        stroke="currentColor"
        strokeWidth={1.5}
        strokeLinecap="round"
      />
    </svg>
  );
}

