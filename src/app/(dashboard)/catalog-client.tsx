"use client";

import { useState, useMemo, useRef, useEffect, type CSSProperties } from "react";
import { useTheme } from "@/components/providers/theme-provider";
import { getNd, editorialFonts, swatchRadii } from "@/lib/nothing-tokens";
import { DSCard } from "@/components/registry/ds-card";
import { Button, Badge, EmptyState as HubEmptyState } from "@/components/hub";
import { getCategoryMeta, type PlatformCategory } from "@/lib/platforms";
import type { DSManifest } from "@/lib/types";

// Remix icons
import Filter3LineIcon from "remixicon-react/Filter3LineIcon";
import CloseLineIcon from "remixicon-react/CloseLineIcon";
import AddLineIcon from "remixicon-react/AddLineIcon";

type Filter = "all" | "original" | "forked";

interface SystemEntry {
  manifest: DSManifest;
  forkCount: number;
}

/* ─────────────────────────────────────── Filter groups ─────────────────────────────────── */

interface FilterGroup {
  key: string;
  label: string;
  options: string[];
}

const FILTER_GROUPS: FilterGroup[] = [
  {
    key: "categories",
    label: "Categories",
    options: ["Dashboards", "Marketing", "E-commerce", "Mobile", "Portfolio", "Admin"],
  },
  {
    key: "foundations",
    label: "Foundations",
    options: ["Color", "Typography", "Spacing", "Icons", "Motion", "Components"],
  },
  {
    key: "technology",
    label: "Technology",
    options: ["React", "Next.js", "Tailwind", "CSS Vars", "Vue", "TypeScript"],
  },
  {
    key: "popular",
    label: "Popular",
    options: ["Most Forked", "Recent", "Trending", "New", "Staff Picks"],
  },
];

/* ─────────────────────────────────────── Catalog ─────────────────────────────────────── */

interface CatalogClientProps {
  category: PlatformCategory;
  systems: SystemEntry[];
}

export function CatalogClient({ category, systems }: CatalogClientProps) {
  const { theme } = useTheme();
  const t = getNd(theme);
  const categoryMeta = getCategoryMeta(category);
  const [filter, setFilter] = useState<Filter>("all");
  const [filterPanelOpen, setFilterPanelOpen] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const panelRef = useRef<HTMLDivElement | null>(null);
  const filterButtonRef = useRef<HTMLButtonElement | null>(null);

  // Close panel when clicking outside
  useEffect(() => {
    if (!filterPanelOpen) return;
    const onClick = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        panelRef.current &&
        !panelRef.current.contains(target) &&
        filterButtonRef.current &&
        !filterButtonRef.current.contains(target)
      ) {
        setFilterPanelOpen(false);
      }
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [filterPanelOpen]);

  const manifests = useMemo(() => systems.map((s) => s.manifest), [systems]);

  const forkMap = useMemo(
    () => new Map(systems.map((s) => [s.manifest.slug, s.forkCount])),
    [systems]
  );

  const filtered = useMemo(() => {
    let result = manifests;

    if (filter === "original") {
      result = result.filter((m) => m.parent === null);
    } else if (filter === "forked") {
      result = result.filter((m) => m.parent !== null);
    }

    // Selected technology filters: match if any selected tech is in manifest.technology
    const techFilters = FILTER_GROUPS.find((g) => g.key === "technology")!
      .options.filter((o) => selected.has(o));
    if (techFilters.length > 0) {
      const needles = techFilters.map((f) =>
        f.toLowerCase().replace(/\./g, "").replace(/\s+/g, "-")
      );
      result = result.filter((m) =>
        m.technology.some((tech) => {
          const norm = tech.toLowerCase();
          return needles.some((n) => norm.includes(n) || n.includes(norm));
        })
      );
    }

    // Popular sort
    if (selected.has("Most Forked")) {
      result = [...result].sort(
        (a, b) => (forkMap.get(b.slug) ?? 0) - (forkMap.get(a.slug) ?? 0)
      );
    }
    if (selected.has("Recent") || selected.has("New")) {
      result = [...result].sort(
        (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      );
    }

    return result;
  }, [manifests, filter, selected, forkMap]);

  const activeCount = selected.size;

  const toggleOption = (opt: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(opt)) next.delete(opt);
      else next.add(opt);
      return next;
    });
  };

  const clearAll = () => setSelected(new Set());

  const filters: { key: Filter; label: string }[] = [
    { key: "all", label: "All" },
    { key: "original", label: "Original" },
    { key: "forked", label: "Forked" },
  ];

  /* ── styles ────────────────────────────── */

  const pageStyle: CSSProperties = {
    minHeight: "100vh",
    background: t.black,
    color: t.textPrimary,
  };

  const filterRowStyle: CSSProperties = {
    position: "relative",
    padding: "28px 32px 20px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 16,
    flexWrap: "wrap",
  };

  const filterTabsStyle: CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    gap: 24,
  };

  const rightActionsStyle: CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    gap: 10,
  };

  /* ── render ──────────────────────────── */

  return (
    <div style={pageStyle}>
      {/* Filter row */}
      <div style={filterRowStyle}>
        {/* Underline filter tabs */}
        <div style={filterTabsStyle}>
          {filters.map((f) => {
            const active = filter === f.key;
            return (
              <button
                key={f.key}
                type="button"
                onClick={() => setFilter(f.key)}
                style={{
                  background: "transparent",
                  border: "none",
                  borderBottom: `2px solid ${
                    active ? t.textDisplay : "transparent"
                  }`,
                  cursor: "pointer",
                  padding: "6px 0",
                  fontFamily: editorialFonts.body,
                  fontSize: 14,
                  fontWeight: active ? 600 : 500,
                  lineHeight: 1.2,
                  color: active ? t.textDisplay : t.textSecondary,
                  transition:
                    "color 120ms ease-out, border-color 120ms ease-out",
                  marginBottom: -1,
                }}
              >
                {f.label}
              </button>
            );
          })}
        </div>

        {/* Right actions: Filter button + Submit */}
        <div style={rightActionsStyle}>
          <span ref={filterButtonRef} style={{ display: "inline-flex" }}>
            <Button
              variant="secondary"
              size="md"
              leadingIcon={<Filter3LineIcon size={14} />}
              trailingIcon={
                activeCount > 0 ? (
                  <Badge tone="accent" variant="solid" size="sm">
                    {activeCount}
                  </Badge>
                ) : undefined
              }
              onClick={() => setFilterPanelOpen((v) => !v)}
            >
              Filter
            </Button>
          </span>

          <Button
            variant="primary"
            size="md"
            href="/ingest/new"
            leadingIcon={<AddLineIcon size={14} />}
          >
            Submit system
          </Button>
        </div>

        {/* Filter panel */}
        {filterPanelOpen && (
          <FilterPanel
            ref={panelRef}
            selected={selected}
            onToggle={toggleOption}
            onClear={clearAll}
            onClose={() => setFilterPanelOpen(false)}
            t={t}
          />
        )}
      </div>

      {/* Active filter chips — show below filter row when filters are selected */}
      {activeCount > 0 && (
        <div
          style={{
            padding: "0 32px 16px",
            display: "flex",
            flexWrap: "wrap",
            gap: 6,
            alignItems: "center",
          }}
        >
          {Array.from(selected).map((opt) => (
            <button
              key={opt}
              type="button"
              onClick={() => toggleOption(opt)}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                padding: "5px 10px",
                background: t.accentSubtle,
                color: t.textDisplay,
                border: `1px solid ${t.border}`,
                borderRadius: swatchRadii.full,
                fontFamily: editorialFonts.body,
                fontSize: 12,
                fontWeight: 500,
                cursor: "pointer",
                transition: "background 120ms ease-out",
              }}
            >
              {opt}
              <CloseLineIcon size={12} color={t.textSecondary} />
            </button>
          ))}
          <button
            type="button"
            onClick={clearAll}
            style={{
              background: "transparent",
              border: "none",
              color: t.textSecondary,
              fontFamily: editorialFonts.body,
              fontSize: 12,
              padding: "5px 8px",
              cursor: "pointer",
              textDecoration: "underline",
              marginLeft: 4,
            }}
          >
            Clear all
          </button>
        </div>
      )}

      {/* Grid */}
      <section style={{ padding: "4px 32px 48px" }}>
        {filtered.length === 0 ? (
          <EmptyState
            platformLabel={categoryMeta.label}
            hasAnySystems={systems.length > 0}
            hasActiveFilters={activeCount > 0 || filter !== "all"}
            onClearFilters={() => {
              setFilter("all");
              clearAll();
            }}
            t={t}
          />
        ) : (
          <div
            className="swatch-catalog-grid"
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
              gap: "28px 24px",
            }}
          >
            {filtered.map((manifest) => (
              <DSCard
                key={manifest.slug}
                manifest={manifest}
                forkCount={forkMap.get(manifest.slug) ?? 0}
              />
            ))}
          </div>
        )}
        <style jsx>{`
          @media (max-width: 1100px) {
            .swatch-catalog-grid {
              grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
            }
          }
          @media (max-width: 680px) {
            .swatch-catalog-grid {
              grid-template-columns: minmax(0, 1fr) !important;
            }
          }
        `}</style>
      </section>
    </div>
  );
}

/* ─────────────────────────────────────── Filter Panel ─────────────────────────────────── */

function FilterPanel({
  ref,
  selected,
  onToggle,
  onClear,
  onClose,
  t,
}: {
  ref: React.RefObject<HTMLDivElement | null>;
  selected: Set<string>;
  onToggle: (opt: string) => void;
  onClear: () => void;
  onClose: () => void;
  t: ReturnType<typeof getNd>;
}) {
  return (
    <div
      ref={ref}
      style={{
        position: "absolute",
        top: "calc(100% - 6px)",
        right: 32,
        width: 640,
        maxWidth: "calc(100vw - 64px)",
        background: t.surface,
        border: `1px solid ${t.borderVisible}`,
        borderRadius: swatchRadii.lg,
        boxShadow: "0 10px 40px rgba(0,0,0,0.35)",
        zIndex: 60,
        padding: 20,
        fontFamily: editorialFonts.body,
      }}
    >
      {/* header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 16,
          paddingBottom: 12,
          borderBottom: `1px solid ${t.border}`,
        }}
      >
        <span
          style={{
            fontFamily: editorialFonts.body,
            fontSize: 13,
            fontWeight: 600,
            color: t.textDisplay,
          }}
        >
          Filters
        </span>
        <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
          {selected.size > 0 && (
            <button
              type="button"
              onClick={onClear}
              style={{
                background: "transparent",
                border: "none",
                color: t.textSecondary,
                fontFamily: editorialFonts.body,
                fontSize: 12,
                cursor: "pointer",
                padding: 0,
              }}
            >
              Clear all
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            aria-label="Close filter panel"
            style={{
              width: 26,
              height: 26,
              borderRadius: swatchRadii.sm,
              background: "transparent",
              border: "none",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              color: t.textSecondary,
              cursor: "pointer",
              padding: 0,
            }}
          >
            <CloseLineIcon size={14} color={t.textSecondary} />
          </button>
        </div>
      </div>

      {/* groups */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(2, 1fr)",
          gap: "20px 28px",
        }}
      >
        {FILTER_GROUPS.map((group) => (
          <div key={group.key}>
            <div
              style={{
                fontFamily: editorialFonts.mono,
                fontSize: 10,
                fontWeight: 500,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                color: t.textDisabled,
                marginBottom: 10,
              }}
            >
              {group.label}
            </div>
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: 6,
              }}
            >
              {group.options.map((opt) => {
                const active = selected.has(opt);
                return (
                  <FilterChip
                    key={opt}
                    label={opt}
                    active={active}
                    onClick={() => onToggle(opt)}
                    t={t}
                  />
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function EmptyState({
  platformLabel,
  hasAnySystems,
  hasActiveFilters,
  onClearFilters,
}: {
  platformLabel: string;
  hasAnySystems: boolean;
  hasActiveFilters: boolean;
  onClearFilters: () => void;
  t: ReturnType<typeof getNd>;
}) {
  if (hasAnySystems && hasActiveFilters) {
    return (
      <HubEmptyState
        title="No systems match your filters"
        action={
          <Button variant="ghost" size="sm" onClick={onClearFilters}>
            Clear filters
          </Button>
        }
        padY={8}
      />
    );
  }

  return (
    <HubEmptyState
      eyebrow={platformLabel}
      title="No design systems for this platform yet"
      description="Be the first to publish one — fork an existing system or submit a repo and we'll extract the tokens and components for you."
      action={
        <Button variant="primary" size="md" href="/ingest/new">
          Submit a system
        </Button>
      }
    />
  );
}

function FilterChip({
  label,
  active,
  onClick,
  t,
}: {
  label: string;
  active: boolean;
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
        background: active ? t.textDisplay : hovered ? t.surfaceRaised : t.surfaceInk,
        color: active ? t.black : hovered ? t.textDisplay : t.textPrimary,
        border: `1px solid ${active ? t.textDisplay : t.border}`,
        borderRadius: swatchRadii.full,
        padding: "6px 12px",
        fontFamily: editorialFonts.body,
        fontSize: 12,
        fontWeight: active ? 600 : 500,
        lineHeight: 1.2,
        cursor: "pointer",
        transition: "background 120ms ease-out, color 120ms ease-out, border-color 120ms ease-out",
      }}
    >
      {label}
    </button>
  );
}
