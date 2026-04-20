"use client";

import {
  useEffect,
  useRef,
  useState,
  useMemo,
  type CSSProperties,
} from "react";
import { useTheme } from "@/components/providers/theme-provider";
import { getNd, editorialFonts } from "@/lib/nothing-tokens";
import { resolveDsTokens } from "@/lib/resolve-ds-tokens";
import {
  ComponentPreview,
  categorizeComponent,
} from "@/components/registry/component-preview";
import { LiveComponentSandbox } from "@/components/registry/live-component-sandbox";
import type { DSComponent, DSManifest, DSTokens } from "@/lib/types";

export interface ComponentListProps {
  components: DSComponent[];
  tokens: DSTokens;
  /**
   * Optional manifest. If provided, tiles render a live Sandpack preview
   * of each component (lazy-loaded on visibility). Without it, tiles fall
   * back to the static mock preview.
   */
  manifest?: DSManifest;
}

const CATEGORY_ORDER = [
  "Buttons",
  "Inputs",
  "Display",
  "Layout",
  "Navigation",
  "Data",
  "Feedback",
  "Code",
  "Other",
];

/* ── Brand color helper (used for hover accent) ─── */

function getBrandFromTokens(tokens: DSTokens): string {
  const colors = tokens.colors;
  for (const key of ["brand", "primary", "blue", "indigo", "violet", "purple"]) {
    const scale = colors[key];
    if (scale && typeof scale === "object") {
      const record = scale as Record<string, string>;
      const shade =
        record["600"] ?? record["500"] ?? record["700"] ?? Object.values(record)[0];
      if (shade) return shade;
    }
  }
  return "#666666";
}

/* ── Single component tile ───────────────────────── */

function ComponentTile({
  component,
  tokens,
  brandColor,
  index,
  manifest,
}: {
  component: DSComponent;
  tokens: DSTokens;
  brandColor: string;
  index: number;
  manifest?: DSManifest;
}) {
  const { theme } = useTheme();
  const t = getNd(theme);
  const ds = useMemo(
    () => resolveDsTokens(tokens, theme === "light" ? "light" : "dark"),
    [tokens, theme]
  );
  const [hovered, setHovered] = useState(false);

  // Lazy-mount the live Sandpack preview when the tile first enters the viewport.
  // This is critical — 14 sandboxes mounted eagerly would crush the page.
  const rootRef = useRef<HTMLDivElement | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!manifest) return; // No live mode requested
    if (visible) return;
    const el = rootRef.current;
    if (!el) return;

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setVisible(true);
            io.disconnect();
            break;
          }
        }
      },
      { rootMargin: "200px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [manifest, visible]);

  const variants = component.variants ?? 0;
  const sizes = component.sizes ?? 0;

  const tileStyle: CSSProperties = {
    display: "flex",
    flexDirection: "column",
    background: t.surface,
    border: `1px solid ${hovered ? brandColor : t.border}`,
    borderRadius: 14,
    overflow: "hidden",
    transition:
      "border-color 240ms cubic-bezier(0.32, 0.72, 0, 1), transform 240ms cubic-bezier(0.32, 0.72, 0, 1)",
    transform: hovered ? "translateY(-2px)" : "translateY(0)",
    cursor: "default",
    minHeight: 220,
  };

  // Preview area: uses the DESIGN SYSTEM's own page background,
  // so each DS preview looks like its own environment.
  const previewAreaStyle: CSSProperties = {
    flex: 1,
    background: ds.pageBg,
    borderBottom: `1px solid ${t.border}`,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    minHeight: 150,
    position: "relative",
    overflow: "hidden",
  };

  // Subtle dot-grid using the DS's own border color
  const dotPatternStyle: CSSProperties = {
    position: "absolute",
    inset: 0,
    backgroundImage: `radial-gradient(${ds.border} 1px, transparent 1px)`,
    backgroundSize: "16px 16px",
    opacity: 0.4,
    pointerEvents: "none",
  };

  const previewContentStyle: CSSProperties = {
    position: "relative",
    zIndex: 1,
    width: "100%",
    height: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  };

  const footerStyle: CSSProperties = {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "14px 16px",
    gap: 12,
  };

  const numberStyle: CSSProperties = {
    fontFamily: editorialFonts.mono,
    fontSize: 10,
    letterSpacing: "0.06em",
    color: hovered ? brandColor : t.textDisabled,
    transition: "color 240ms cubic-bezier(0.32, 0.72, 0, 1)",
  };

  const nameStyle: CSSProperties = {
    fontFamily: editorialFonts.body,
    fontSize: 13,
    fontWeight: 600,
    letterSpacing: "-0.005em",
    color: t.textDisplay,
    margin: 0,
    marginBottom: 3,
  };

  const metaStyle: CSSProperties = {
    fontFamily: editorialFonts.mono,
    fontSize: 10,
    letterSpacing: "0.04em",
    color: t.textDisabled,
    textTransform: "uppercase",
  };

  const metaParts: string[] = [];
  if (variants > 0) metaParts.push(`${variants} VAR`);
  if (sizes > 0) metaParts.push(`${sizes} SIZE`);

  const useLive = Boolean(manifest);

  return (
    <div
      ref={rootRef}
      style={tileStyle}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      role="article"
      aria-label={component.name}
    >
      {/* Preview area */}
      {useLive && manifest ? (
        visible ? (
          <LiveComponentSandbox
            manifest={manifest}
            component={component}
            height={200}
            bare
          />
        ) : (
          <div style={previewAreaStyle}>
            <div style={dotPatternStyle} />
            <div style={previewContentStyle}>
              <span
                style={{
                  fontFamily: editorialFonts.mono,
                  fontSize: 10,
                  color: ds.textDisabled,
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                }}
              >
                Scroll to preview
              </span>
            </div>
          </div>
        )
      ) : (
        <div style={previewAreaStyle}>
          <div style={dotPatternStyle} />
          <div style={previewContentStyle}>
            <ComponentPreview name={component.name} tokens={tokens} />
          </div>
        </div>
      )}

      {/* Footer: name + meta + index */}
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

/* ── Category section ─────────────────────────────── */

function CategorySection({
  title,
  components,
  tokens,
  brandColor,
  startIndex,
  manifest,
}: {
  title: string;
  components: DSComponent[];
  tokens: DSTokens;
  brandColor: string;
  startIndex: number;
  manifest?: DSManifest;
}) {
  const { theme } = useTheme();
  const t = getNd(theme);

  const headerStyle: CSSProperties = {
    display: "flex",
    alignItems: "baseline",
    justifyContent: "space-between",
    paddingBottom: 16,
    borderBottom: `1px solid ${t.border}`,
    marginBottom: 24,
  };

  const titleStyle: CSSProperties = {
    fontFamily: editorialFonts.mono,
    fontSize: 11,
    letterSpacing: "0.14em",
    color: t.textPrimary,
    textTransform: "uppercase",
    margin: 0,
    fontWeight: 600,
  };

  const countStyle: CSSProperties = {
    fontFamily: editorialFonts.mono,
    fontSize: 10,
    letterSpacing: "0.06em",
    color: t.textDisabled,
    textTransform: "uppercase",
  };

  return (
    <section
      style={{ display: "flex", flexDirection: "column", marginBottom: 56 }}
    >
      <div style={headerStyle}>
        <h2 style={titleStyle}>
          <span style={{ color: t.textDisabled, marginRight: 12 }}>—</span>
          {title}
        </h2>
        <span style={countStyle}>
          {String(components.length).padStart(2, "0")}{" "}
          {components.length === 1 ? "ITEM" : "ITEMS"}
        </span>
      </div>

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
            brandColor={brandColor}
            index={startIndex + i}
            manifest={manifest}
          />
        ))}
      </div>
    </section>
  );
}

/* ── List wrapper ─────────────────────────────────── */

export function ComponentList({ components, tokens, manifest }: ComponentListProps) {
  const { theme } = useTheme();
  const t = getNd(theme);
  const brandColor = useMemo(() => getBrandFromTokens(tokens), [tokens]);

  const grouped = useMemo(() => {
    const groups: Record<string, DSComponent[]> = {};
    for (const c of components) {
      const cat = categorizeComponent(c.name);
      if (!groups[cat]) groups[cat] = [];
      groups[cat].push(c);
    }
    return groups;
  }, [components]);

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

  // Build ordered list with running index
  let runningIndex = 0;
  const sections = CATEGORY_ORDER.filter((cat) => grouped[cat])
    .map((cat) => {
      const start = runningIndex;
      runningIndex += grouped[cat].length;
      return { cat, items: grouped[cat], start };
    });

  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      {sections.map(({ cat, items, start }) => (
        <CategorySection
          key={cat}
          title={cat}
          components={items}
          tokens={tokens}
          brandColor={brandColor}
          startIndex={start}
          manifest={manifest}
        />
      ))}
    </div>
  );
}
