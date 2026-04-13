"use client";

import { useState, type CSSProperties } from "react";
import { useTheme } from "@/components/providers/theme-provider";
import { getNd, editorialFonts } from "@/lib/nothing-tokens";
import { ComponentPreview } from "@/components/registry/component-preview";
import type { DSComponent, DSTokens } from "@/lib/types";

export interface ComponentListProps {
  components: DSComponent[];
  tokens: DSTokens;
}

/* ── Single component tile ───────────────────────── */

function ComponentTile({
  component,
  tokens,
  index,
}: {
  component: DSComponent;
  tokens: DSTokens;
  index: number;
}) {
  const { theme } = useTheme();
  const t = getNd(theme);
  const [hovered, setHovered] = useState(false);

  const variants = component.variants ?? 0;
  const sizes = component.sizes ?? 0;

  const tileStyle: CSSProperties = {
    display: "flex",
    flexDirection: "column",
    background: t.surface,
    border: `1px solid ${hovered ? t.borderVisible : t.border}`,
    borderRadius: 12,
    overflow: "hidden",
    transition: "border-color 200ms cubic-bezier(0.25, 0.1, 0.25, 1)",
    minHeight: 200,
  };

  const previewAreaStyle: CSSProperties = {
    flex: 1,
    background: t.surfaceInk ?? t.black,
    borderBottom: `1px solid ${t.border}`,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    minHeight: 130,
  };

  const footerStyle: CSSProperties = {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "12px 16px",
    gap: 12,
  };

  const numberStyle: CSSProperties = {
    fontFamily: editorialFonts.mono,
    fontSize: 10,
    letterSpacing: "0.08em",
    color: t.textDisabled,
    textTransform: "uppercase",
  };

  const nameStyle: CSSProperties = {
    fontFamily: editorialFonts.body,
    fontSize: 13,
    fontWeight: 600,
    letterSpacing: "-0.005em",
    color: t.textDisplay,
    margin: 0,
    marginBottom: 2,
  };

  const metaStyle: CSSProperties = {
    fontFamily: editorialFonts.mono,
    fontSize: 10,
    letterSpacing: "0.06em",
    color: t.textDisabled,
    textTransform: "uppercase",
  };

  const metaParts: string[] = [];
  if (variants > 0) metaParts.push(`${variants} VAR`);
  if (sizes > 0) metaParts.push(`${sizes} SIZE`);

  return (
    <div
      style={tileStyle}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Preview area — renders the component using the DS's own tokens */}
      <div style={previewAreaStyle}>
        <ComponentPreview name={component.name} tokens={tokens} />
      </div>

      {/* Footer: number + name + meta */}
      <div style={footerStyle}>
        <div style={{ minWidth: 0, flex: 1 }}>
          <h3 style={nameStyle}>{component.name}</h3>
          {metaParts.length > 0 && (
            <div style={metaStyle}>{metaParts.join(" · ")}</div>
          )}
        </div>
        <span style={numberStyle}>{String(index + 1).padStart(2, "0")}</span>
      </div>
    </div>
  );
}

/* ── List wrapper ────────────────────────────────── */

export function ComponentList({ components, tokens }: ComponentListProps) {
  const { theme } = useTheme();
  const t = getNd(theme);

  if (components.length === 0) {
    const emptyStyle: CSSProperties = {
      padding: "48px 0",
      borderTop: `1px solid ${t.border}`,
      borderBottom: `1px solid ${t.border}`,
      textAlign: "center",
      fontFamily: editorialFonts.mono,
      fontSize: 11,
      letterSpacing: "0.08em",
      color: t.textDisabled,
      textTransform: "uppercase",
    };

    return <div style={emptyStyle}>NO COMPONENTS IN THIS DESIGN SYSTEM</div>;
  }

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
        gap: 16,
      }}
    >
      {components.map((c, i) => (
        <ComponentTile
          key={c.name}
          component={c}
          tokens={tokens}
          index={i}
        />
      ))}
    </div>
  );
}
