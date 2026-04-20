"use client";

import {
  useEffect,
  useMemo,
  useState,
  type CSSProperties,
} from "react";
import { createPortal } from "react-dom";
import { useTheme } from "@/components/providers/theme-provider";
import { getNd, editorialFonts, swatchRadii } from "@/lib/nothing-tokens";
import { resolveDsTokens } from "@/lib/resolve-ds-tokens";
import {
  categorizeComponent,
  inferDisplaySize,
  displaySizeFrame,
} from "@/components/registry/component-preview";
import { LiveComponentSandbox } from "@/components/registry/live-component-sandbox";
import {
  PlaygroundControls,
  initialValuesFromSchema,
  jsxFromProps,
  type PropValue,
} from "@/components/registry/playground-controls";
import {
  FOUNDATION_ENTRIES,
  type FoundationEntry,
} from "@/components/registry/foundation-previews";
import type { DSComponent, DSManifest } from "@/lib/types";

import ArrowDropDownLineIcon from "remixicon-react/ArrowDropDownLineIcon";
import FullscreenLineIcon from "remixicon-react/FullscreenLineIcon";
import FullscreenExitLineIcon from "remixicon-react/FullscreenExitLineIcon";
import CloseLineIcon from "remixicon-react/CloseLineIcon";
import Apps2LineIcon from "remixicon-react/Apps2LineIcon";
import SettingsLineIcon from "remixicon-react/SettingsLineIcon";

/* ─── View mode ───────────────────────────────────── */

type ViewMode = "gallery" | "playground";

function toPascalCase(s: string): string {
  return s
    .split(/[\s_-]+/)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join("");
}

/**
 * Smart default view for a component:
 *   - small/medium components default to Gallery (side-by-side variants look good)
 *   - large/xl components default to Playground (gallery of tables is wasteful)
 * If the component has no examples, force Playground. If it has no props, force Gallery.
 */
function defaultViewFor(component: DSComponent): ViewMode {
  const hasExamples = (component.examples?.length ?? 0) > 0;
  const hasProps = Object.keys(component.props ?? {}).length > 0;

  if (!hasExamples && hasProps) return "playground";
  if (hasExamples && !hasProps) return "gallery";
  if (!hasExamples && !hasProps) return "gallery"; // Falls back to single auto-example

  const size = component.displaySize ?? inferDisplaySize(component.name);
  return size === "lg" || size === "xl" ? "playground" : "gallery";
}

/**
 * Storybook-style component explorer.
 *
 *   [▼ BUTTONS (5)]                ┌───────────────────────────┐
 *     ● Button                     │                           │
 *     Close Button                 │     LIVE PREVIEW          │
 *     Social Button                │     (one Sandpack only)   │
 *   [▶ INPUTS (3)]                 │                           │
 *   [▶ DISPLAY (4)]                └───────────────────────────┘
 *
 * Left pane: collapsible categories + component rows.
 * Right pane: one live Sandpack iframe, sized by the component's displaySize.
 * Click "expand" in the preview header → fullscreen modal portal.
 *
 * Crucially there is *one* LiveComponentSandbox mounted at a time (either
 * in the right pane or inside the fullscreen modal — never both).
 */

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
] as const;

export function ComponentExplorer({ manifest }: { manifest: DSManifest }) {
  const { theme } = useTheme();
  const t = getNd(theme);
  const ds = useMemo(
    () => resolveDsTokens(manifest.tokens, theme === "light" ? "light" : "dark"),
    [manifest.tokens, theme]
  );

  /* ── Group components by category ──────────────── */
  const grouped = useMemo(() => {
    const groups: Record<string, DSComponent[]> = {};
    for (const c of manifest.components) {
      const cat = categorizeComponent(c.name);
      if (!groups[cat]) groups[cat] = [];
      groups[cat].push(c);
    }
    return groups;
  }, [manifest.components]);

  const orderedCategories = useMemo(
    () => CATEGORY_ORDER.filter((cat) => grouped[cat]),
    [grouped]
  );

  /* ── State: which categories are open, which component is selected ── */
  const initialCategory = orderedCategories[0];
  const initialComponent = initialCategory ? grouped[initialCategory][0] : null;

  // Foundations is a pseudo-category that sits at the top of the tree with
  // colors/typography/spacing/radius entries.
  const FOUNDATIONS_KEY = "Foundations";

  const [openCategories, setOpenCategories] = useState<Set<string>>(
    () => new Set([FOUNDATIONS_KEY, ...(initialCategory ? [initialCategory] : [])])
  );

  // Unified selection — either a component or a foundation entry.
  type Selection =
    | { type: "component"; name: string }
    | { type: "foundation"; key: string };

  const [selection, setSelection] = useState<Selection>(
    initialComponent
      ? { type: "component", name: initialComponent.name }
      : { type: "foundation", key: "colors" }
  );

  const [expanded, setExpanded] = useState(false);
  const [treeQuery, setTreeQuery] = useState("");

  /* ── Filter tree by search query ──────────────── */
  const filteredGrouped = useMemo(() => {
    const q = treeQuery.trim().toLowerCase();
    if (!q) return grouped;
    const out: Record<string, DSComponent[]> = {};
    for (const [cat, items] of Object.entries(grouped)) {
      const matches = items.filter((c) => c.name.toLowerCase().includes(q));
      if (matches.length > 0) out[cat] = matches;
    }
    return out;
  }, [grouped, treeQuery]);

  const filteredCategories = useMemo(
    () => CATEGORY_ORDER.filter((cat) => filteredGrouped[cat]),
    [filteredGrouped]
  );

  // When a search query is active, auto-expand all categories that have matches
  const effectiveOpenCategories = useMemo(() => {
    if (!treeQuery.trim()) return openCategories;
    return new Set(filteredCategories);
  }, [treeQuery, openCategories, filteredCategories]);

  const selectedComponent = useMemo(() => {
    if (selection.type !== "component") return undefined;
    return manifest.components.find((c) => c.name === selection.name);
  }, [manifest.components, selection]);

  const selectedFoundation = useMemo(() => {
    if (selection.type !== "foundation") return undefined;
    return FOUNDATION_ENTRIES.find((f) => f.key === selection.key);
  }, [selection]);

  const selectedName =
    selection.type === "component" ? selection.name : "";

  /* ── View mode (Gallery / Playground) ──────────── */
  // Each component can have a different default (smart per size), so we
  // keep view mode per-component.
  const [viewModeByComponent, setViewModeByComponent] = useState<
    Record<string, ViewMode>
  >({});

  const currentViewMode: ViewMode =
    (selectedComponent && viewModeByComponent[selectedComponent.name]) ??
    (selectedComponent ? defaultViewFor(selectedComponent) : "gallery");

  const setCurrentViewMode = (mode: ViewMode) => {
    if (!selectedComponent) return;
    setViewModeByComponent((prev) => ({ ...prev, [selectedComponent.name]: mode }));
  };

  /* ── Playground controls state (per component) ── */
  const [propValuesByComponent, setPropValuesByComponent] = useState<
    Record<string, Record<string, PropValue>>
  >({});

  const currentPropValues: Record<string, PropValue> = useMemo(() => {
    if (!selectedComponent) return {};
    const stored = propValuesByComponent[selectedComponent.name];
    if (stored) return stored;
    return initialValuesFromSchema(selectedComponent.props ?? {});
  }, [selectedComponent, propValuesByComponent]);

  const setPropValue = (name: string, value: PropValue) => {
    if (!selectedComponent) return;
    setPropValuesByComponent((prev) => {
      const base = prev[selectedComponent.name] ?? initialValuesFromSchema(selectedComponent.props ?? {});
      return { ...prev, [selectedComponent.name]: { ...base, [name]: value } };
    });
  };

  const resetPropValues = () => {
    if (!selectedComponent) return;
    setPropValuesByComponent((prev) => {
      const copy = { ...prev };
      delete copy[selectedComponent.name];
      return copy;
    });
  };

  /* ── Handlers ──────────────────────────────────── */
  const toggleCategory = (cat: string) => {
    setOpenCategories((prev) => {
      const next = new Set(prev);
      if (next.has(cat)) next.delete(cat);
      else next.add(cat);
      return next;
    });
  };

  const selectComponent = (c: DSComponent) => {
    setSelection({ type: "component", name: c.name });
    const cat = categorizeComponent(c.name);
    setOpenCategories((prev) => {
      if (prev.has(cat)) return prev;
      const next = new Set(prev);
      next.add(cat);
      return next;
    });
  };

  const selectFoundation = (entry: FoundationEntry) => {
    setSelection({ type: "foundation", key: entry.key });
    setOpenCategories((prev) => {
      if (prev.has(FOUNDATIONS_KEY)) return prev;
      const next = new Set(prev);
      next.add(FOUNDATIONS_KEY);
      return next;
    });
  };

  /* ── Close expand modal on Esc ─────────────────── */
  useEffect(() => {
    if (!expanded) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setExpanded(false);
    };
    document.addEventListener("keydown", onKey);
    // Freeze page scroll while modal is open
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [expanded]);

  /* ── Styles ────────────────────────────────────── */
  const shellStyle: CSSProperties = {
    display: "grid",
    gridTemplateColumns: "240px minmax(0, 1fr)",
    gap: 24,
    alignItems: "start",
  };

  const treeStyle: CSSProperties = {
    // Borderless Mobbin-style tree — sits directly on the page background.
    border: "none",
    borderRadius: 0,
    padding: "0 8px 0 0",
    background: "transparent",
    position: "sticky",
    top: 80, // below the sticky top nav (60px) + a little breathing room
    maxHeight: "calc(100vh - 100px)",
    overflow: "auto",
  };

  const previewShellStyle: CSSProperties = {
    display: "flex",
    flexDirection: "column",
    gap: 12,
    minWidth: 0,
  };

  /* ── Render ────────────────────────────────────── */

  const hasMatches = filteredCategories.length > 0 || treeQuery.trim().length === 0;
  const foundationsOpen = effectiveOpenCategories.has(FOUNDATIONS_KEY);
  const showFoundations = treeQuery.trim().length === 0; // hide foundations when searching components

  return (
    <>
      <div className="swatch-explorer" style={shellStyle}>
        {/* ── Left: tree ─────────────────────────── */}
        <aside style={treeStyle} aria-label="Component tree">
          <TreeSearch
            query={treeQuery}
            onChange={setTreeQuery}
            totalMatches={
              treeQuery.trim()
                ? Object.values(filteredGrouped).reduce(
                    (n, items) => n + items.length,
                    0
                  )
                : 0
            }
            t={t}
          />

          {showFoundations && (
            <FoundationsBlock
              entries={FOUNDATION_ENTRIES}
              isOpen={foundationsOpen}
              selectedKey={
                selection.type === "foundation" ? selection.key : null
              }
              onToggle={() => toggleCategory(FOUNDATIONS_KEY)}
              onSelect={selectFoundation}
              t={t}
            />
          )}

          {!hasMatches ? (
            <div
              style={{
                padding: "20px 12px",
                fontFamily: editorialFonts.body,
                fontSize: 12,
                color: t.textDisabled,
                textAlign: "center",
              }}
            >
              No matches
            </div>
          ) : (
            filteredCategories.map((cat) => {
              const isOpen = effectiveOpenCategories.has(cat);
              const items = filteredGrouped[cat];
              return (
                <CategoryBlock
                  key={cat}
                  category={cat}
                  items={items}
                  isOpen={isOpen}
                  selectedName={selectedName}
                  onToggle={() => toggleCategory(cat)}
                  onSelect={selectComponent}
                  t={t}
                />
              );
            })
          )}
        </aside>

        {/* ── Right: preview pane ────────────────── */}
        <div style={previewShellStyle}>
          {selectedFoundation ? (
            <FoundationPane
              entry={selectedFoundation}
              manifest={manifest}
              t={t}
            />
          ) : selectedComponent ? (
            <>
              <PreviewPaneHeader
                component={selectedComponent}
                viewMode={currentViewMode}
                onViewModeChange={setCurrentViewMode}
                onExpand={() => setExpanded(true)}
                canGallery={(selectedComponent.examples?.length ?? 0) > 0}
                canPlayground={Object.keys(selectedComponent.props ?? {}).length > 0}
                t={t}
              />
              {!expanded && (
                <PreviewFrame
                  manifest={manifest}
                  component={selectedComponent}
                  viewMode={currentViewMode}
                  propValues={currentPropValues}
                  onPropChange={setPropValue}
                  onResetProps={resetPropValues}
                  ds={ds}
                  t={t}
                />
              )}
            </>
          ) : (
            <div
              style={{
                padding: 48,
                textAlign: "center",
                fontFamily: editorialFonts.mono,
                fontSize: 12,
                color: t.textDisabled,
                letterSpacing: "0.06em",
                textTransform: "uppercase",
              }}
            >
              Select a component or foundation from the tree.
            </div>
          )}
        </div>
      </div>

      {/* ── Fullscreen modal ──────────────────── */}
      {expanded && selectedComponent && (
        <ExpandedModal
          manifest={manifest}
          component={selectedComponent}
          viewMode={currentViewMode}
          propValues={currentPropValues}
          onClose={() => setExpanded(false)}
          t={t}
          ds={ds}
        />
      )}

      {/* ── Responsive stacking under 900px ───── */}
      <style jsx>{`
        @media (max-width: 900px) {
          :global(.swatch-explorer) {
            grid-template-columns: minmax(0, 1fr) !important;
          }
        }
      `}</style>
    </>
  );
}

/* ─── Tree category block ───────────────────────── */

/* ─── Foundations tree block ────────────────────── */

function FoundationsBlock({
  entries,
  isOpen,
  selectedKey,
  onToggle,
  onSelect,
  t,
}: {
  entries: FoundationEntry[];
  isOpen: boolean;
  selectedKey: string | null;
  onToggle: () => void;
  onSelect: (e: FoundationEntry) => void;
  t: ReturnType<typeof getNd>;
}) {
  const [hovered, setHovered] = useState(false);
  return (
    <div style={{ marginBottom: 2 }}>
      <button
        type="button"
        onClick={onToggle}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          display: "flex",
          alignItems: "center",
          width: "100%",
          padding: "7px 8px",
          background: hovered ? t.surfaceInk : "transparent",
          border: "none",
          borderRadius: swatchRadii.sm,
          cursor: "pointer",
          fontFamily: editorialFonts.body,
          fontSize: 13,
          fontWeight: 600,
          letterSpacing: "-0.005em",
          color: t.textDisplay,
          textAlign: "left",
          transition: "background 120ms ease-out",
        }}
      >
        <span>Foundations</span>
        <span
          style={{
            marginLeft: 8,
            fontFamily: editorialFonts.body,
            fontSize: 11,
            color: t.textDisabled,
            fontWeight: 500,
          }}
        >
          {entries.length}
        </span>
        <span
          aria-hidden
          style={{
            marginLeft: "auto",
            display: "inline-flex",
            color: t.textDisabled,
            transition: "transform 160ms ease-out",
            transform: isOpen ? "rotate(0deg)" : "rotate(-90deg)",
          }}
        >
          <ArrowDropDownLineIcon size={16} />
        </span>
      </button>

      {isOpen && (
        <ul
          style={{
            listStyle: "none",
            margin: 0,
            padding: "0 0 6px 8px",
            display: "flex",
            flexDirection: "column",
            gap: 0,
          }}
        >
          {entries.map((entry) => (
            <li key={entry.key}>
              <FoundationRow
                entry={entry}
                selected={selectedKey === entry.key}
                onClick={() => onSelect(entry)}
                t={t}
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function FoundationRow({
  entry,
  selected,
  onClick,
  t,
}: {
  entry: FoundationEntry;
  selected: boolean;
  onClick: () => void;
  t: ReturnType<typeof getNd>;
}) {
  const [hovered, setHovered] = useState(false);
  return (
    <button
      type="button"
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: "block",
        width: "100%",
        padding: "6px 10px",
        background: selected
          ? t.surfaceRaised
          : hovered
            ? t.surfaceInk
            : "transparent",
        border: "none",
        borderRadius: swatchRadii.sm,
        cursor: "pointer",
        fontFamily: editorialFonts.body,
        fontSize: 13,
        fontWeight: selected ? 600 : 400,
        color: selected
          ? t.textDisplay
          : hovered
            ? t.textPrimary
            : t.textSecondary,
        textAlign: "left",
        transition: "background 120ms ease-out, color 120ms ease-out",
      }}
    >
      {entry.name}
    </button>
  );
}

/* ─── Foundation preview pane ───────────────────── */

function FoundationPane({
  entry,
  manifest,
  t,
}: {
  entry: FoundationEntry;
  manifest: DSManifest;
  t: ReturnType<typeof getNd>;
}) {
  const { Render } = entry;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div
        style={{
          display: "flex",
          alignItems: "baseline",
          gap: 12,
          padding: "0 4px",
        }}
      >
        <h2
          style={{
            fontFamily: editorialFonts.body,
            fontSize: 20,
            fontWeight: 700,
            letterSpacing: "-0.01em",
            color: t.textDisplay,
            margin: 0,
          }}
        >
          {entry.name}
        </h2>
        <span
          style={{
            fontFamily: editorialFonts.mono,
            fontSize: 10,
            color: t.textDisabled,
            letterSpacing: "0.06em",
            textTransform: "uppercase",
          }}
        >
          Foundation
        </span>
      </div>
      <div
        style={{
          padding: "28px 28px 32px",
          border: `1px solid ${t.border}`,
          borderRadius: 16,
          background: t.surface,
        }}
      >
        <Render tokens={manifest.tokens} />
      </div>
    </div>
  );
}

function CategoryBlock({
  category,
  items,
  isOpen,
  selectedName,
  onToggle,
  onSelect,
  t,
}: {
  category: string;
  items: DSComponent[];
  isOpen: boolean;
  selectedName: string;
  onToggle: () => void;
  onSelect: (c: DSComponent) => void;
  t: ReturnType<typeof getNd>;
}) {
  const [hovered, setHovered] = useState(false);

  const headerStyle: CSSProperties = {
    display: "flex",
    alignItems: "center",
    width: "100%",
    padding: "7px 8px",
    background: hovered ? t.surfaceInk : "transparent",
    border: "none",
    borderRadius: swatchRadii.sm,
    cursor: "pointer",
    fontFamily: editorialFonts.body,
    fontSize: 13,
    fontWeight: 600,
    letterSpacing: "-0.005em",
    color: t.textDisplay,
    textAlign: "left",
    transition: "background 120ms ease-out",
  };

  const countStyle: CSSProperties = {
    marginLeft: 8,
    fontFamily: editorialFonts.body,
    fontSize: 11,
    color: t.textDisabled,
    fontWeight: 500,
  };

  return (
    <div style={{ marginBottom: 2 }}>
      <button
        type="button"
        onClick={onToggle}
        style={headerStyle}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        <span>{category}</span>
        <span style={countStyle}>{items.length}</span>
        <span
          aria-hidden
          style={{
            marginLeft: "auto",
            display: "inline-flex",
            color: t.textDisabled,
            transition: "transform 160ms ease-out",
            transform: isOpen ? "rotate(0deg)" : "rotate(-90deg)",
          }}
        >
          <ArrowDropDownLineIcon size={16} />
        </span>
      </button>

      {isOpen && (
        <ul
          style={{
            listStyle: "none",
            margin: 0,
            padding: "0 0 6px 8px",
            display: "flex",
            flexDirection: "column",
            gap: 0,
          }}
        >
          {items.map((item) => (
            <li key={item.name}>
              <ComponentRow
                item={item}
                selected={selectedName === item.name}
                onClick={() => onSelect(item)}
                t={t}
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function ComponentRow({
  item,
  selected,
  onClick,
  t,
}: {
  item: DSComponent;
  selected: boolean;
  onClick: () => void;
  t: ReturnType<typeof getNd>;
}) {
  const [hovered, setHovered] = useState(false);

  const style: CSSProperties = {
    display: "block",
    width: "100%",
    padding: "6px 10px",
    background: selected
      ? t.surfaceRaised
      : hovered
        ? t.surfaceInk
        : "transparent",
    border: "none",
    borderRadius: swatchRadii.sm,
    cursor: "pointer",
    fontFamily: editorialFonts.body,
    fontSize: 13,
    fontWeight: selected ? 600 : 400,
    color: selected
      ? t.textDisplay
      : hovered
        ? t.textPrimary
        : t.textSecondary,
    textAlign: "left",
    transition: "background 120ms ease-out, color 120ms ease-out",
  };

  return (
    <button
      type="button"
      onClick={onClick}
      style={style}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {item.name}
    </button>
  );
}

/* ─── Preview pane header ───────────────────────── */

function PreviewPaneHeader({
  component,
  viewMode,
  onViewModeChange,
  canGallery,
  canPlayground,
  onExpand,
  t,
}: {
  component: DSComponent;
  viewMode: ViewMode;
  onViewModeChange: (m: ViewMode) => void;
  canGallery: boolean;
  canPlayground: boolean;
  onExpand: () => void;
  t: ReturnType<typeof getNd>;
}) {
  const variants = component.variants ?? 0;
  const sizes = component.sizes ?? 0;
  const size = component.displaySize ?? inferDisplaySize(component.name);

  const metaParts: string[] = [];
  if (variants > 0) metaParts.push(`${variants} VAR`);
  if (sizes > 0) metaParts.push(`${sizes} SIZE${sizes === 1 ? "" : "S"}`);
  metaParts.push(size.toUpperCase());
  metaParts.push(component.file);

  const barStyle: CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: 12,
    padding: "0 4px",
  };

  const titleStyle: CSSProperties = {
    fontFamily: editorialFonts.body,
    fontSize: 20,
    fontWeight: 700,
    letterSpacing: "-0.01em",
    color: t.textDisplay,
    margin: 0,
  };

  const metaStyle: CSSProperties = {
    fontFamily: editorialFonts.mono,
    fontSize: 10,
    color: t.textDisabled,
    letterSpacing: "0.06em",
    textTransform: "uppercase",
    display: "inline-flex",
    gap: 8,
    flexWrap: "wrap",
  };

  const showToggle = canGallery && canPlayground;

  return (
    <div style={barStyle}>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 4,
          minWidth: 0,
          flex: 1,
        }}
      >
        <h2 style={titleStyle}>{component.name}</h2>
        <span style={metaStyle}>
          {metaParts.map((p, i) => (
            <span key={i}>
              {p}
              {i < metaParts.length - 1 && (
                <span
                  aria-hidden
                  style={{ color: t.textDisabled, marginLeft: 8 }}
                >
                  ·
                </span>
              )}
            </span>
          ))}
        </span>
      </div>

      {showToggle && (
        <ViewToggle
          viewMode={viewMode}
          onChange={onViewModeChange}
          t={t}
        />
      )}

      <IconButton label="Expand preview" onClick={onExpand} t={t}>
        <FullscreenLineIcon size={16} />
      </IconButton>
    </div>
  );
}

/* ─── View toggle (Gallery / Playground) ────────── */

function ViewToggle({
  viewMode,
  onChange,
  t,
}: {
  viewMode: ViewMode;
  onChange: (m: ViewMode) => void;
  t: ReturnType<typeof getNd>;
}) {
  const wrapperStyle: CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    gap: 2,
    padding: 2,
    border: `1px solid ${t.border}`,
    borderRadius: swatchRadii.md,
    background: t.surfaceInk,
  };

  const buttonStyle = (active: boolean): CSSProperties => ({
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    padding: "5px 10px",
    borderRadius: swatchRadii.sm,
    border: "none",
    background: active ? t.surfaceRaised : "transparent",
    color: active ? t.textDisplay : t.textSecondary,
    fontFamily: editorialFonts.body,
    fontSize: 12,
    fontWeight: active ? 600 : 500,
    cursor: "pointer",
    transition: "background 120ms ease-out, color 120ms ease-out",
  });

  return (
    <div style={wrapperStyle}>
      <button
        type="button"
        style={buttonStyle(viewMode === "gallery")}
        onClick={() => onChange("gallery")}
        aria-pressed={viewMode === "gallery"}
      >
        <Apps2LineIcon size={13} />
        Gallery
      </button>
      <button
        type="button"
        style={buttonStyle(viewMode === "playground")}
        onClick={() => onChange("playground")}
        aria-pressed={viewMode === "playground"}
      >
        <SettingsLineIcon size={13} />
        Playground
      </button>
    </div>
  );
}

/* ─── Preview frame ─────────────────────────────── */

function PreviewFrame({
  manifest,
  component,
  viewMode,
  propValues,
  onPropChange,
  onResetProps,
  ds,
  t,
}: {
  manifest: DSManifest;
  component: DSComponent;
  viewMode: ViewMode;
  propValues: Record<string, PropValue>;
  onPropChange: (name: string, value: PropValue) => void;
  onResetProps: () => void;
  ds: ReturnType<typeof resolveDsTokens>;
  t: ReturnType<typeof getNd>;
}) {
  const size = component.displaySize ?? inferDisplaySize(component.name);
  const frame = displaySizeFrame(size);
  const hasExamples = (component.examples?.length ?? 0) > 0;
  const hasProps = Object.keys(component.props ?? {}).length > 0;
  const Comp = toPascalCase(component.name);

  /* ── Gallery view ─────────────────────────────── */
  if (viewMode === "gallery") {
    // If no examples, fall through to single auto-example (sandbox handles it).
    return (
      <div
        style={{
          border: `1px solid ${t.border}`,
          borderRadius: 16,
          overflow: "hidden",
          background: ds.pageBg,
          width: "100%",
          minHeight: frame.height,
        }}
      >
        <LiveComponentSandbox
          manifest={manifest}
          component={component}
          examples={hasExamples ? component.examples : undefined}
          height={Math.max(frame.height, 420)}
          bare
        />
      </div>
    );
  }

  /* ── Playground view ──────────────────────────── */
  // Build a JSX snippet from current prop values
  const generatedJsx = hasProps
    ? jsxFromProps(Comp, component.props!, propValues)
    : `<${Comp} />`;

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: hasProps ? "minmax(0, 1fr) 280px" : "minmax(0, 1fr)",
        gap: 16,
        alignItems: "start",
      }}
    >
      <div
        style={{
          border: `1px solid ${t.border}`,
          borderRadius: 16,
          overflow: "hidden",
          background: ds.pageBg,
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: size === "xl" ? 0 : 24,
        }}
      >
        <div
          style={{
            width:
              typeof frame.width === "number"
                ? `min(${frame.width}px, 100%)`
                : frame.width,
            height: frame.height,
            overflow: "hidden",
            background: ds.pageBg,
          }}
        >
          <LiveComponentSandbox
            manifest={manifest}
            component={component}
            exampleCode={generatedJsx}
            mode="single"
            height={frame.height}
            bare
          />
        </div>
      </div>

      {hasProps && (
        <PlaygroundControls
          schema={component.props!}
          values={propValues}
          onChange={onPropChange}
          onReset={onResetProps}
        />
      )}
    </div>
  );
}

/* ─── Expanded fullscreen modal ─────────────────── */

function ExpandedModal({
  manifest,
  component,
  viewMode,
  propValues,
  onClose,
  t,
  ds,
}: {
  manifest: DSManifest;
  component: DSComponent;
  viewMode: ViewMode;
  propValues: Record<string, PropValue>;
  onClose: () => void;
  t: ReturnType<typeof getNd>;
  ds: ReturnType<typeof resolveDsTokens>;
}) {
  const Comp = toPascalCase(component.name);
  const hasExamples = (component.examples?.length ?? 0) > 0;
  const hasProps = Object.keys(component.props ?? {}).length > 0;
  const useGallery = viewMode === "gallery" && hasExamples;
  const generatedJsx =
    !useGallery && hasProps
      ? jsxFromProps(Comp, component.props!, propValues)
      : undefined;
  // Portal won't exist during SSR; render nothing until we're on the client.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  const overlayStyle: CSSProperties = {
    position: "fixed",
    inset: 0,
    zIndex: 200,
    background:
      ds.pageBg === "#000000" ? "rgba(0,0,0,0.85)" : "rgba(0,0,0,0.75)",
    backdropFilter: "blur(6px)",
    display: "flex",
    alignItems: "stretch",
    justifyContent: "stretch",
    padding: 24,
  };

  const frameStyle: CSSProperties = {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    gap: 12,
    background: t.black,
    borderRadius: 16,
    overflow: "hidden",
    border: `1px solid ${t.borderVisible}`,
  };

  const headerStyle: CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: 12,
    padding: "12px 16px",
    borderBottom: `1px solid ${t.border}`,
    background: t.surface,
  };

  const stageStyle: CSSProperties = {
    flex: 1,
    minHeight: 0,
    background: ds.pageBg,
    position: "relative",
  };

  return createPortal(
    <div
      style={overlayStyle}
      onClick={(e) => {
        // Close only on backdrop click, not on content click
        if (e.target === e.currentTarget) onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-label={`${component.name} preview, expanded`}
    >
      <div style={frameStyle}>
        <div style={headerStyle}>
          <span
            style={{
              fontFamily: editorialFonts.body,
              fontSize: 15,
              fontWeight: 600,
              color: t.textDisplay,
            }}
          >
            {component.name}
          </span>
          <span
            style={{
              fontFamily: editorialFonts.mono,
              fontSize: 10,
              color: t.textDisabled,
              letterSpacing: "0.06em",
              textTransform: "uppercase",
            }}
          >
            {component.file}
          </span>
          <div style={{ marginLeft: "auto", display: "flex", gap: 4 }}>
            <IconButton label="Exit fullscreen" onClick={onClose} t={t}>
              <FullscreenExitLineIcon size={16} />
            </IconButton>
            <IconButton label="Close" onClick={onClose} t={t}>
              <CloseLineIcon size={16} />
            </IconButton>
          </div>
        </div>

        <div style={stageStyle}>
          <LiveComponentSandbox
            manifest={manifest}
            component={component}
            examples={useGallery ? component.examples : undefined}
            exampleCode={generatedJsx}
            mode={useGallery ? "gallery" : "single"}
            height="100%"
            bare
          />
        </div>
      </div>
    </div>,
    document.body
  );
}

/* ─── Icon button ───────────────────────────────── */

/* ─── Tree search input ─────────────────────────── */

function TreeSearch({
  query,
  onChange,
  totalMatches,
  t,
}: {
  query: string;
  onChange: (q: string) => void;
  totalMatches: number;
  t: ReturnType<typeof getNd>;
}) {
  const [focused, setFocused] = useState(false);
  const hasQuery = query.trim().length > 0;

  const wrapperStyle: CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: 8,
    padding: "8px 10px",
    marginBottom: 10,
    background: t.surfaceInk,
    border: `1px solid ${focused ? t.borderStrong : t.border}`,
    borderRadius: swatchRadii.md,
    transition: "border-color 120ms ease-out",
  };

  return (
    <>
      <div style={wrapperStyle}>
        <svg
          width={14}
          height={14}
          viewBox="0 0 24 24"
          fill="none"
          stroke={focused ? t.textPrimary : t.textDisabled}
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden
        >
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <input
          type="text"
          value={query}
          placeholder="Search components…"
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          onChange={(e) => onChange(e.target.value)}
          aria-label="Search components"
          style={{
            flex: 1,
            border: "none",
            outline: "none",
            background: "transparent",
            color: t.textPrimary,
            fontFamily: editorialFonts.body,
            fontSize: 13,
            minWidth: 0,
          }}
        />
        {hasQuery && (
          <button
            type="button"
            onClick={() => onChange("")}
            aria-label="Clear search"
            style={{
              background: "transparent",
              border: "none",
              color: t.textSecondary,
              cursor: "pointer",
              padding: 2,
              display: "inline-flex",
            }}
          >
            <CloseLineIcon size={12} />
          </button>
        )}
      </div>
      {hasQuery && (
        <div
          style={{
            fontFamily: editorialFonts.mono,
            fontSize: 10,
            letterSpacing: "0.06em",
            color: t.textDisabled,
            textTransform: "uppercase",
            padding: "0 4px 8px",
          }}
        >
          {totalMatches} {totalMatches === 1 ? "match" : "matches"}
        </div>
      )}
    </>
  );
}

function IconButton({
  onClick,
  children,
  label,
  t,
  style,
}: {
  onClick: () => void;
  children: React.ReactNode;
  label: string;
  t: ReturnType<typeof getNd>;
  style?: CSSProperties;
}) {
  const [hovered, setHovered] = useState(false);
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        width: 32,
        height: 32,
        borderRadius: swatchRadii.md,
        border: "none",
        background: hovered ? t.surfaceRaised : "transparent",
        color: hovered ? t.textDisplay : t.textSecondary,
        cursor: "pointer",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        transition: "background 120ms ease-out, color 120ms ease-out",
        ...style,
      }}
    >
      {children}
    </button>
  );
}
