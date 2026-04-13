"use client";

import Link from "next/link";
import { motion, useReducedMotion, type Variants } from "framer-motion";
import { useTheme } from "@/components/providers/theme-provider";
import { getNd, editorialFonts } from "@/lib/nothing-tokens";
import { HuberaLogo } from "@/components/brand/hubera-logo";

/**
 * Hubera — editorial landing page.
 *
 * Aesthetic: magazine / editorial. Asymmetric grid, massive Bodoni Moda hero,
 * rule lines as the dividing system, restrained accent color, generous space.
 *
 * No cards. No 3-up feature grid. No glassmorphism. The accent red appears
 * exactly twice (the italic "faster" and the primary CTA marker).
 */
export function LandingPage() {
  const { theme, toggle } = useTheme();
  const t = getNd(theme);
  const prefersReducedMotion = useReducedMotion();

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
      {/* ─────────────────────────────────────── Top nav */}
      <nav
        style={{
          display: "grid",
          gridTemplateColumns: "1fr auto",
          alignItems: "center",
          padding: "clamp(20px, 2.4vw, 32px) clamp(24px, 5vw, 72px)",
          borderBottom: `1px solid ${t.border}`,
        }}
      >
        <Link
          href="/"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 10,
            fontFamily: fBody,
            fontSize: 15,
            fontWeight: 600,
            letterSpacing: "-0.005em",
            color: t.textDisplay,
            textDecoration: "none",
          }}
          aria-label="Hubera home"
        >
          <HuberaLogo variant="mark" height={22} />
          Hubera
        </Link>

        <div style={{ display: "flex", alignItems: "center", gap: 36 }}>
          <button
            type="button"
            onClick={toggle}
            aria-label="Toggle theme"
            style={{
              ...monoLabel,
              background: "transparent",
              border: "none",
              padding: 0,
              cursor: "pointer",
              color: t.textSecondary,
              transition: "color 240ms cubic-bezier(0.165, 0.84, 0.44, 1)",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.color = t.textDisplay)
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.color = t.textSecondary)
            }
          >
            <span suppressHydrationWarning>
              {theme === "dark" ? "Light" : "Dark"}
            </span>
          </button>

          <Link
            href="/login"
            style={{
              ...monoLabel,
              color: t.textPrimary,
              textDecoration: "none",
              transition: "color 240ms cubic-bezier(0.165, 0.84, 0.44, 1)",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.color = t.textDisplay)
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.color = t.textPrimary)
            }
          >
            Sign in
          </Link>
        </div>
      </nav>

      {/* ─────────────────────────────────────── Hero */}
      <motion.section
        variants={stagger}
        initial="hidden"
        animate="show"
        style={{
          position: "relative",
          paddingLeft: "clamp(24px, 5vw, 72px)",
          paddingRight: "clamp(24px, 5vw, 72px)",
          paddingTop: "clamp(64px, 9vw, 144px)",
          paddingBottom: "clamp(64px, 8vw, 128px)",
          // 14-column conceptual grid via CSS grid
          display: "grid",
          gridTemplateColumns: "repeat(14, 1fr)",
          columnGap: "clamp(12px, 1.6vw, 24px)",
          rowGap: "clamp(28px, 4vw, 56px)",
        }}
      >
        {/* Issue marker — sits offset on the right, breaking the natural left flow */}
        <motion.div
          variants={fadeUp}
          style={{
            gridColumn: "10 / span 5",
            display: "flex",
            alignItems: "center",
            gap: 14,
            ...monoLabel,
          }}
        >
          <span
            aria-hidden
            style={{
              display: "inline-block",
              width: 28,
              height: 1,
              background: t.borderStrong,
            }}
          />
          Issue 01 — Design System Registry
        </motion.div>

        {/* Massive headline — asymmetric: starts at column 1, runs to ~12 */}
        <motion.h1
          variants={fadeUp}
          style={{
            gridColumn: "1 / span 13",
            fontFamily: fDisplay,
            fontWeight: 500,
            // Magazine-scale fluid type
            fontSize: "clamp(72px, 11vw, 184px)",
            lineHeight: 0.92,
            letterSpacing: "-0.035em",
            color: t.textDisplay,
            margin: 0,
            // Optical hang — pull the cap edge slightly off the grid line
            marginLeft: "clamp(-6px, -0.5vw, -2px)",
          }}
        >
          Build{" "}
          <em
            style={{
              fontStyle: "italic",
              fontFamily: fDisplay,
              fontWeight: 500,
              // The accent red — appearance #1 of 2 on the page
              color: t.accent,
              // Slight optical kerning for italic
              letterSpacing: "-0.02em",
              paddingRight: "0.04em",
            }}
          >
            faster
          </em>{" "}
          with shared
          <br />
          design systems.
        </motion.h1>

        {/* Standfirst — offset to the right, narrow column */}
        <motion.div
          variants={fadeUp}
          style={{
            gridColumn: "8 / span 6",
            display: "flex",
            flexDirection: "column",
            gap: 32,
          }}
        >
          <p
            style={{
              fontFamily: fBody,
              fontSize: "clamp(16px, 1.15vw, 19px)",
              lineHeight: 1.55,
              color: t.textPrimary,
              maxWidth: "62ch",
              margin: 0,
              fontWeight: 400,
            }}
          >
            Hubera is a registry for designers who build. Browse opinionated
            design systems, fork the one that speaks to you, and customize it
            with Claude Code in an afternoon — not a week.
          </p>

          {/* CTA — text-forward, inline. Accent dot is the second appearance of red. */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 36,
              flexWrap: "wrap",
            }}
          >
            <Link
              href="/catalog"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 14,
                fontFamily: fBody,
                fontSize: 15,
                fontWeight: 500,
                letterSpacing: "0.005em",
                color: t.textDisplay,
                textDecoration: "none",
                paddingBottom: 6,
                borderBottom: `1px solid ${t.borderStrong}`,
                transition:
                  "border-color 320ms cubic-bezier(0.165, 0.84, 0.44, 1), letter-spacing 320ms cubic-bezier(0.165, 0.84, 0.44, 1)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderBottomColor = t.accent;
                e.currentTarget.style.letterSpacing = "0.02em";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderBottomColor = t.borderStrong;
                e.currentTarget.style.letterSpacing = "0.005em";
              }}
            >
              <span
                aria-hidden
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  background: t.accent,
                  display: "inline-block",
                }}
              />
              Browse the registry
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

      {/* ─────────────────────────────────────── Rule line */}
      <Hairline color={t.border} />

      {/* ─────────────────────────────────────── Three numbered sections */}
      <motion.section
        variants={stagger}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.2 }}
        style={{
          paddingLeft: "clamp(24px, 5vw, 72px)",
          paddingRight: "clamp(24px, 5vw, 72px)",
          paddingTop: "clamp(56px, 7vw, 112px)",
          paddingBottom: "clamp(56px, 7vw, 112px)",
          display: "grid",
          gridTemplateColumns: "repeat(14, 1fr)",
          columnGap: "clamp(12px, 1.6vw, 24px)",
          rowGap: "clamp(48px, 6vw, 88px)",
        }}
      >
        {/* Section header — one mono label, intentionally off-balance */}
        <motion.div
          variants={fadeUp}
          style={{
            gridColumn: "1 / span 5",
            ...monoLabel,
            display: "flex",
            alignItems: "center",
            gap: 14,
          }}
        >
          <span
            aria-hidden
            style={{
              display: "inline-block",
              width: 28,
              height: 1,
              background: t.borderStrong,
            }}
          />
          The workflow
        </motion.div>

        {/* Sub-header serif sentence on the right */}
        <motion.p
          variants={fadeUp}
          style={{
            gridColumn: "8 / span 7",
            fontFamily: fDisplay,
            fontStyle: "italic",
            fontWeight: 400,
            fontSize: "clamp(22px, 2.4vw, 36px)",
            lineHeight: 1.25,
            color: t.textDisplay,
            margin: 0,
            letterSpacing: "-0.01em",
          }}
        >
          Three movements. From discovery to a system you call your own.
        </motion.p>

        {/* The three movements — stacked editorial rows, NOT a card grid.
            Each row: number on the left, title + body on the right, hairline between rows. */}
        <div
          style={{
            gridColumn: "1 / -1",
            display: "flex",
            flexDirection: "column",
            marginTop: "clamp(16px, 2vw, 32px)",
          }}
        >
          <Movement
            variants={fadeUp}
            t={t}
            number="01"
            title="Browse"
            body="Walk the registry like a printed catalog. Every system has a full visual preview, live tokens, and a typographic identity that survives screenshots. No tile grids, no decorative chrome — just the work."
            isFirst
          />
          <Movement
            variants={fadeUp}
            t={t}
            number="02"
            title="Fork"
            body="Clone any system into your own workspace. Tokens, components, and variants come with you. Customize in code, in Claude, or in both — the manifest is the contract."
          />
          <Movement
            variants={fadeUp}
            t={t}
            number="03"
            title="Publish"
            body="Push your variant back. Other designers can fork your fork. Provenance is preserved, attribution is automatic, and good taste compounds across the registry."
            isLast
          />
        </div>
      </motion.section>

      {/* ─────────────────────────────────────── Rule line */}
      <Hairline color={t.border} />

      {/* ─────────────────────────────────────── Bottom strip — run-on stat sentence */}
      <motion.footer
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, amount: 0.4 }}
        transition={{
          duration: prefersReducedMotion ? 0 : 0.9,
          ease: easeOutQuart,
        }}
        style={{
          paddingLeft: "clamp(24px, 5vw, 72px)",
          paddingRight: "clamp(24px, 5vw, 72px)",
          paddingTop: "clamp(36px, 4vw, 56px)",
          paddingBottom: "clamp(36px, 4vw, 64px)",
          display: "grid",
          gridTemplateColumns: "repeat(14, 1fr)",
          columnGap: "clamp(12px, 1.6vw, 24px)",
          alignItems: "baseline",
          rowGap: 20,
        }}
      >
        <div
          style={{
            gridColumn: "1 / span 4",
            ...monoLabel,
          }}
        >
          Hubera — Issue 01
        </div>

        <p
          style={{
            gridColumn: "5 / span 7",
            margin: 0,
            ...monoLabel,
            color: t.textSecondary,
            lineHeight: 1.7,
          }}
        >
          Two systems in residence
          <Dot color={t.borderStrong} />
          Fifty-plus components
          <Dot color={t.borderStrong} />
          One hundred percent forkable
        </p>

        <div
          style={{
            gridColumn: "12 / span 3",
            ...monoLabel,
            textAlign: "right",
          }}
        >
          MMXXVI
        </div>
      </motion.footer>
    </div>
  );
}

/* ──────────────────────────────────────────────────────── Sub-components */

function Hairline({ color }: { color: string }) {
  return (
    <div
      role="separator"
      aria-hidden
      style={{
        height: 1,
        background: color,
        width: "100%",
      }}
    />
  );
}

function Dot({ color }: { color: string }) {
  return (
    <span
      aria-hidden
      style={{
        display: "inline-block",
        width: 3,
        height: 3,
        borderRadius: "50%",
        background: color,
        verticalAlign: "middle",
        margin: "0 14px",
      }}
    />
  );
}

function Movement({
  number,
  title,
  body,
  t,
  variants,
  isFirst,
  isLast,
}: {
  number: string;
  title: string;
  body: string;
  t: ReturnType<typeof getNd>;
  variants: Variants;
  isFirst?: boolean;
  isLast?: boolean;
}) {
  return (
    <motion.div
      variants={variants}
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(14, 1fr)",
        columnGap: "clamp(12px, 1.6vw, 24px)",
        // Hairlines between rows — never as side stripes
        borderTop: isFirst ? `1px solid ${t.border}` : "none",
        borderBottom: `1px solid ${t.border}`,
        paddingTop: "clamp(36px, 4.5vw, 64px)",
        paddingBottom: "clamp(36px, 4.5vw, 64px)",
        // Last row gets extra breathing room below
        marginBottom: isLast ? 0 : 0,
      }}
    >
      {/* Number — large display serif, hangs in left columns */}
      <div
        style={{
          gridColumn: "1 / span 3",
          display: "flex",
          flexDirection: "column",
          gap: 10,
        }}
      >
        <span
          style={{
            fontFamily: editorialFonts.mono,
            fontSize: 11,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            color: t.textDisabled,
          }}
        >
          Movement
        </span>
        <span
          style={{
            fontFamily: editorialFonts.display,
            fontStyle: "italic",
            fontWeight: 400,
            fontSize: "clamp(56px, 7vw, 120px)",
            lineHeight: 0.9,
            color: t.textDisplay,
            letterSpacing: "-0.02em",
          }}
        >
          {number}
        </span>
      </div>

      {/* Title */}
      <h3
        style={{
          gridColumn: "5 / span 3",
          margin: 0,
          fontFamily: editorialFonts.display,
          fontWeight: 500,
          fontSize: "clamp(28px, 3vw, 44px)",
          lineHeight: 1.05,
          letterSpacing: "-0.02em",
          color: t.textDisplay,
          alignSelf: "start",
        }}
      >
        {title}
      </h3>

      {/* Body */}
      <p
        style={{
          gridColumn: "9 / span 5",
          margin: 0,
          fontFamily: editorialFonts.body,
          fontSize: "clamp(15px, 1.05vw, 17px)",
          lineHeight: 1.6,
          color: t.textPrimary,
          maxWidth: "65ch",
          alignSelf: "start",
        }}
      >
        {body}
      </p>
    </motion.div>
  );
}
