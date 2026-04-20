"use client";

import { useEffect, useState, type CSSProperties } from "react";
import Image from "next/image";
import { useTheme } from "@/components/providers/theme-provider";
import { getNd, editorialFonts, swatchRadii } from "@/lib/nothing-tokens";
import type { DSComponent, DSManifest } from "@/lib/types";

/**
 * Stand-in for ComponentExplorer on non-web platforms. Mobile DSes can't
 * run in a browser sandbox, so we show screenshots + the raw source file
 * for each component instead of a live preview.
 *
 * This is intentionally minimal for Phase 3 — Phase 4a will flesh it out
 * once real iOS/Android systems appear in the registry.
 */
export function MobileComponentViewer({ manifest }: { manifest: DSManifest }) {
  const { theme } = useTheme();
  const t = getNd(theme);
  const components = manifest.components;
  const [selected, setSelected] = useState<DSComponent | null>(
    components[0] ?? null
  );

  const gallery = manifest.screenshots.gallery ?? [];

  if (!selected) {
    return (
      <EmptyNote t={t}>
        This design system has no components declared in its manifest yet.
      </EmptyNote>
    );
  }

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "260px minmax(0, 1fr)",
        gap: 24,
      }}
    >
      <ComponentList
        components={components}
        selected={selected}
        onSelect={setSelected}
        t={t}
      />

      <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
        {gallery.length > 0 && <ScreenshotStrip sources={gallery} t={t} />}
        <ComponentSourceView
          manifest={manifest}
          component={selected}
          t={t}
        />
      </div>
    </div>
  );
}

/* ── Component list (left column) ─────────────────── */

function ComponentList({
  components,
  selected,
  onSelect,
  t,
}: {
  components: DSComponent[];
  selected: DSComponent;
  onSelect: (c: DSComponent) => void;
  t: ReturnType<typeof getNd>;
}) {
  return (
    <nav
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 2,
        borderRight: `1px solid ${t.border}`,
        paddingRight: 16,
      }}
    >
      <span
        style={{
          fontFamily: editorialFonts.mono,
          fontSize: 10,
          letterSpacing: "0.12em",
          textTransform: "uppercase",
          color: t.textDisabled,
          padding: "0 10px 10px",
        }}
      >
        Components ({components.length})
      </span>
      {components.map((c) => (
        <ComponentRow
          key={c.file}
          component={c}
          active={c.file === selected.file}
          onSelect={() => onSelect(c)}
          t={t}
        />
      ))}
    </nav>
  );
}

function ComponentRow({
  component,
  active,
  onSelect,
  t,
}: {
  component: DSComponent;
  active: boolean;
  onSelect: () => void;
  t: ReturnType<typeof getNd>;
}) {
  const [hovered, setHovered] = useState(false);
  const rowStyle: CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: 10,
    padding: "8px 10px",
    borderRadius: swatchRadii.md,
    background: active ? t.surface : hovered ? t.surfaceInk : "transparent",
    color: active ? t.textDisplay : t.textPrimary,
    fontFamily: editorialFonts.body,
    fontSize: 13,
    fontWeight: active ? 600 : 500,
    textAlign: "left",
    border: "none",
    cursor: "pointer",
    transition: "background 120ms ease-out, color 120ms ease-out",
  };
  return (
    <button
      type="button"
      onClick={onSelect}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={rowStyle}
    >
      <span
        style={{
          width: 4,
          height: 4,
          borderRadius: 999,
          background: active ? t.accent : "transparent",
          flexShrink: 0,
        }}
      />
      {component.name}
    </button>
  );
}

/* ── Screenshot strip ─────────────────────────────── */

function ScreenshotStrip({
  sources,
  t,
}: {
  sources: string[];
  t: ReturnType<typeof getNd>;
}) {
  return (
    <div
      style={{
        display: "flex",
        gap: 16,
        overflowX: "auto",
        padding: "4px 0 12px",
        borderBottom: `1px solid ${t.border}`,
      }}
    >
      {sources.map((src, i) => (
        <div
          key={src + i}
          style={{
            flexShrink: 0,
            width: 180,
            aspectRatio: "9 / 19.5",
            borderRadius: swatchRadii.lg,
            overflow: "hidden",
            border: `1px solid ${t.borderVisible}`,
            background: t.surface,
            position: "relative",
          }}
        >
          <Image
            src={src}
            alt=""
            fill
            sizes="180px"
            style={{ objectFit: "cover" }}
            unoptimized={src.startsWith("http")}
          />
        </div>
      ))}
    </div>
  );
}

/* ── Source code panel ─────────────────────────────── */

function ComponentSourceView({
  manifest,
  component,
  t,
}: {
  manifest: DSManifest;
  component: DSComponent;
  t: ReturnType<typeof getNd>;
}) {
  const filePath = `${manifest.sourceLayout.componentsDir}/${component.file}`;
  const [state, setState] = useState<
    | { kind: "loading" }
    | { kind: "ready"; content: string }
    | { kind: "error"; message: string }
  >({ kind: "loading" });

  useEffect(() => {
    let cancelled = false;
    // Reset to loading when the selected file changes.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setState({ kind: "loading" });

    fetch(`/api/ds-source/${manifest.slug}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ paths: [filePath] }),
    })
      .then((res) => res.json())
      .then((data: { files?: Record<string, string>; errors?: Record<string, string> }) => {
        if (cancelled) return;
        const content = data.files?.[filePath];
        if (!content) {
          setState({
            kind: "error",
            message:
              data.errors?.[filePath] ?? `Could not fetch ${filePath} from GitHub.`,
          });
          return;
        }
        setState({ kind: "ready", content });
      })
      .catch((err) => {
        if (cancelled) return;
        setState({
          kind: "error",
          message: err instanceof Error ? err.message : "Unknown error",
        });
      });

    return () => {
      cancelled = true;
    };
  }, [manifest.slug, filePath]);

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
    padding: "10px 14px",
    borderBottom: `1px solid ${t.border}`,
    background: t.surface,
  };

  return (
    <section style={panelStyle}>
      <header style={headerStyle}>
        <span
          style={{
            fontFamily: editorialFonts.mono,
            fontSize: 11,
            color: t.textSecondary,
            letterSpacing: "0.04em",
          }}
        >
          {filePath}
        </span>
        <span
          style={{
            fontFamily: editorialFonts.mono,
            fontSize: 10,
            color: t.textDisabled,
            textTransform: "uppercase",
            letterSpacing: "0.1em",
          }}
        >
          {component.name}
        </span>
      </header>
      <CodeBody state={state} t={t} />
    </section>
  );
}

function CodeBody({
  state,
  t,
}: {
  state:
    | { kind: "loading" }
    | { kind: "ready"; content: string }
    | { kind: "error"; message: string };
  t: ReturnType<typeof getNd>;
}) {
  const baseStyle: CSSProperties = {
    padding: 20,
    fontFamily: editorialFonts.mono,
    fontSize: 12,
    lineHeight: 1.6,
    color: t.textPrimary,
    maxHeight: 520,
    overflow: "auto",
    whiteSpace: "pre",
  };

  if (state.kind === "loading") {
    return (
      <div
        style={{
          ...baseStyle,
          color: t.textDisabled,
          fontStyle: "italic",
          whiteSpace: "normal",
        }}
      >
        Loading source from GitHub…
      </div>
    );
  }
  if (state.kind === "error") {
    return (
      <div
        style={{
          ...baseStyle,
          color: t.textDisabled,
          whiteSpace: "normal",
        }}
      >
        {state.message}
      </div>
    );
  }
  return <pre style={baseStyle}>{state.content}</pre>;
}

function EmptyNote({
  children,
  t,
}: {
  children: React.ReactNode;
  t: ReturnType<typeof getNd>;
}) {
  return (
    <div
      style={{
        padding: 48,
        fontFamily: editorialFonts.body,
        fontSize: 14,
        color: t.textSecondary,
        border: `1px dashed ${t.border}`,
        borderRadius: swatchRadii.lg,
        textAlign: "center",
      }}
    >
      {children}
    </div>
  );
}
