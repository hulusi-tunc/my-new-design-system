"use client";

import { useMemo, useState, type CSSProperties } from "react";
import { useTheme } from "@/components/providers/theme-provider";
import { getNd, editorialFonts, swatchRadii } from "@/lib/nothing-tokens";
import { Button } from "@/components/hub";
import { manifestToDesignMd } from "@/lib/manifest-to-markdown";
import type { DSManifest } from "@/lib/types";

/**
 * Renders the design system as a copy/download-able `design.md` —
 * the file a downstream user drops into their project so Claude
 * has style guidance for that DS.
 */
export function DesignMdPanel({ manifest }: { manifest: DSManifest }) {
  const { theme } = useTheme();
  const t = getNd(theme);
  const [copied, setCopied] = useState(false);

  const markdown = useMemo(() => manifestToDesignMd(manifest), [manifest]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(markdown);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // older browsers — fall back to selecting the text
      setCopied(false);
    }
  };

  const handleDownload = () => {
    const blob = new Blob([markdown], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${manifest.slug}.design.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const wrapStyle: CSSProperties = {
    display: "grid",
    gridTemplateColumns: "minmax(0, 1fr) 320px",
    gap: 32,
    alignItems: "start",
  };

  const panelStyle: CSSProperties = {
    background: t.surfaceInk,
    border: `1px solid ${t.border}`,
    borderRadius: swatchRadii.lg,
    overflow: "hidden",
  };

  const headerStyle: CSSProperties = {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "12px 16px",
    borderBottom: `1px solid ${t.border}`,
    background: t.surface,
  };

  const codeStyle: CSSProperties = {
    padding: 20,
    fontFamily: editorialFonts.mono,
    fontSize: 12.5,
    lineHeight: 1.65,
    color: t.textPrimary,
    maxHeight: 640,
    overflow: "auto",
    whiteSpace: "pre-wrap",
    wordBreak: "break-word",
    margin: 0,
  };

  const sidebarStyle: CSSProperties = {
    display: "flex",
    flexDirection: "column",
    gap: 16,
    position: "sticky",
    top: 24,
  };

  const eyebrow: CSSProperties = {
    fontFamily: editorialFonts.mono,
    fontSize: 10,
    letterSpacing: "0.12em",
    textTransform: "uppercase",
    color: t.textDisabled,
  };

  const explainer: CSSProperties = {
    fontFamily: editorialFonts.body,
    fontSize: 13,
    lineHeight: 1.55,
    color: t.textSecondary,
  };

  return (
    <div style={wrapStyle}>
      <section style={panelStyle}>
        <header style={headerStyle}>
          <span
            style={{
              fontFamily: editorialFonts.mono,
              fontSize: 11.5,
              color: t.textSecondary,
              letterSpacing: "0.04em",
            }}
          >
            {manifest.slug}.design.md
          </span>
          <span style={eyebrow}>
            {markdown.split("\n").length} lines · {markdown.length} chars
          </span>
        </header>
        <pre style={codeStyle}>{markdown}</pre>
      </section>

      <aside style={sidebarStyle}>
        <div>
          <div style={eyebrow}>Design.md</div>
          <h3
            style={{
              fontFamily: editorialFonts.body,
              fontSize: 22,
              fontWeight: 600,
              color: t.textDisplay,
              margin: "8px 0 12px",
              lineHeight: 1.2,
            }}
          >
            Hand this to Claude
          </h3>
          <p style={explainer}>
            Drop this markdown into your project as <code>design.md</code> (or
            paste it into a Claude conversation). Claude will follow this design
            system&rsquo;s tokens, naming, and components when generating code.
          </p>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <Button
            onClick={handleCopy}
            variant={copied ? "secondary" : "primary"}
            size="md"
            fullWidth
          >
            {copied ? "Copied" : "Copy markdown"}
          </Button>
          <Button
            onClick={handleDownload}
            variant="secondary"
            size="md"
            fullWidth
          >
            Download design.md
          </Button>
        </div>

        <p style={{ ...explainer, fontSize: 12, color: t.textDisabled }}>
          For the full source files, use the MCP install command shown at the
          bottom of the markdown.
        </p>
      </aside>
    </div>
  );
}
