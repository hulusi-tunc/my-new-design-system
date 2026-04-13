"use client";

import { type CSSProperties } from "react";
import { motion } from "framer-motion";
import { useTheme } from "@/components/providers/theme-provider";
import { getSemanticTokens } from "@/styles/design-tokens";
import AnimatedGradientBackground from "@/components/ui/animated-gradient-background";

export function LandingHero() {
  const { theme, brandPalette } = useTheme();
  const t = getSemanticTokens(theme, brandPalette);

  const darkColors = ["#0A0A0A", "#1a1040", "#2d1b69", "#1a1040", "#0f0f23", "#0A0A0A", "#0A0A0A"];
  const lightColors = ["#ffffff", "#f0ecff", "#e8e0ff", "#ddd6fe", "#e8e0ff", "#f5f3ff", "#ffffff"];

  const containerStyle: CSSProperties = {
    position: "relative",
    width: "100%",
    height: 420,
    overflow: "hidden",
    borderBottom: `1px solid ${t.border.tertiary}`,
  };

  const contentStyle: CSSProperties = {
    position: "relative",
    zIndex: 10,
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start",
    justifyContent: "center",
    height: "100%",
    padding: "0 48px",
    maxWidth: 600,
  };

  const tagStyle: CSSProperties = {
    fontSize: 11,
    fontWeight: 500,
    letterSpacing: "0.06em",
    textTransform: "uppercase" as const,
    color: theme === "dark" ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.4)",
    marginBottom: 16,
    fontFamily: "var(--font-sans), system-ui, sans-serif",
  };

  const titleStyle: CSSProperties = {
    fontSize: 36,
    fontWeight: 700,
    letterSpacing: "-0.03em",
    lineHeight: 1.15,
    color: theme === "dark" ? "#fff" : t.text.primary,
    marginBottom: 12,
    fontFamily: "var(--font-sans), system-ui, sans-serif",
  };

  const subtitleStyle: CSSProperties = {
    fontSize: 15,
    lineHeight: 1.6,
    color: theme === "dark" ? "rgba(255,255,255,0.6)" : t.text.tertiary,
    marginBottom: 28,
    fontFamily: "var(--font-sans), system-ui, sans-serif",
    maxWidth: 480,
  };

  const btnStyle: CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    fontSize: 13,
    fontWeight: 500,
    padding: "8px 18px",
    borderRadius: 8,
    border: "none",
    cursor: "pointer",
    fontFamily: "var(--font-sans), system-ui, sans-serif",
    backgroundColor: theme === "dark" ? "#fff" : t.bg.primarySolid,
    color: theme === "dark" ? "#0A0A0A" : "#fff",
    transition: "opacity 150ms ease",
  };

  const btnSecondaryStyle: CSSProperties = {
    ...btnStyle,
    backgroundColor: "transparent",
    border: `1px solid ${theme === "dark" ? "rgba(255,255,255,0.15)" : t.border.primary}`,
    color: theme === "dark" ? "rgba(255,255,255,0.8)" : t.text.secondary,
  };

  return (
    <div style={containerStyle}>
      <AnimatedGradientBackground
        gradientColors={theme === "dark" ? darkColors : lightColors}
        gradientStops={[0, 20, 35, 50, 65, 80, 100]}
        startingGap={140}
        Breathing={true}
        animationSpeed={0.015}
        breathingRange={8}
        topOffset={30}
      />

      <motion.div
        style={contentStyle}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
      >
        <div style={tagStyle}>Design System Registry</div>
        <h1 style={titleStyle}>
          Build faster with
          <br />
          shared design systems
        </h1>
        <p style={subtitleStyle}>
          Browse, fork, and publish design systems. Pick one, customize it with
          Claude Code, and ship your next project with a head start.
        </p>
        <div style={{ display: "flex", gap: 10 }}>
          <a href="#catalog" style={btnStyle}>
            Browse catalog
            <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 9l6 6 6-6" />
            </svg>
          </a>
          <a href="/submit" style={btnSecondaryStyle}>
            Submit yours
          </a>
        </div>
      </motion.div>
    </div>
  );
}
