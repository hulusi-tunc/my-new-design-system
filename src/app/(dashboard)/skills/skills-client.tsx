"use client";

import {
  useState,
  useMemo,
  useRef,
  useEffect,
  type CSSProperties,
} from "react";
import { useTheme } from "@/components/providers/theme-provider";
import { getNd, editorialFonts, swatchRadii } from "@/lib/nothing-tokens";

// Remix icons
import Filter3LineIcon from "remixicon-react/Filter3LineIcon";
import CloseLineIcon from "remixicon-react/CloseLineIcon";

interface Skill {
  slug: string;
  name: string;
  category: string;
  author: string;
  description: string;
  tags: string[];
}

const SKILLS: Skill[] = [
  {
    slug: "emil-design-eng",
    name: "Emil Design Eng",
    category: "Polish",
    author: "emilkowalski",
    description:
      "Emil Kowalski's philosophy on UI polish, component design, animation decisions, and the invisible details that make software feel great.",
    tags: ["animation", "polish", "micro-interactions"],
  },
  {
    slug: "impeccable",
    name: "Impeccable",
    category: "Frontend",
    author: "pbakaus",
    description:
      "Create distinctive, production-grade frontend interfaces with high design quality. Avoids generic AI aesthetics.",
    tags: ["frontend", "craft", "quality"],
  },
  {
    slug: "polish",
    name: "Polish",
    category: "Polish",
    author: "pbakaus",
    description:
      "Cross-cutting polish pass across spacing, typography, color, and motion for any existing interface.",
    tags: ["review", "polish"],
  },
  {
    slug: "layout",
    name: "Layout",
    category: "Structure",
    author: "pbakaus",
    description:
      "Lay out a page or component with rhythm, hierarchy, and responsive structure.",
    tags: ["layout", "grid"],
  },
  {
    slug: "typeset",
    name: "Typeset",
    category: "Typography",
    author: "pbakaus",
    description:
      "Build a type system: scale, pairing, leading, tracking, optical sizes.",
    tags: ["typography", "type-scale"],
  },
  {
    slug: "critique",
    name: "Critique",
    category: "Review",
    author: "pbakaus",
    description:
      "Run a constructive design critique on a component, page, or flow with actionable feedback.",
    tags: ["review", "feedback"],
  },
  {
    slug: "delight",
    name: "Delight",
    category: "Polish",
    author: "pbakaus",
    description:
      "Add small, carefully-chosen moments of delight — micro-interactions, transitions, easter eggs.",
    tags: ["motion", "micro-interactions"],
  },
  {
    slug: "minimalist-ui",
    name: "Minimalist UI",
    category: "Style",
    author: "Leonxlnx",
    description:
      "Apply a strict minimalist visual direction to any interface with restrained palettes and typography.",
    tags: ["minimal", "style"],
  },
  {
    slug: "industrial-brutalist-ui",
    name: "Industrial Brutalist",
    category: "Style",
    author: "Leonxlnx",
    description:
      "Brutalist/industrial UI direction with raw forms, heavy typography, and monochrome palettes.",
    tags: ["brutalist", "style"],
  },
  {
    slug: "high-end-visual-design",
    name: "High-End Visual",
    category: "Style",
    author: "Leonxlnx",
    description:
      "Luxury / premium visual treatment with careful restraint, custom type, and refined color.",
    tags: ["luxury", "premium"],
  },
  {
    slug: "shape",
    name: "Shape",
    category: "Structure",
    author: "pbakaus",
    description:
      "Shape a feature from a rough idea into a buildable spec before code is written.",
    tags: ["specs", "shaping"],
  },
  {
    slug: "distill",
    name: "Distill",
    category: "Writing",
    author: "pbakaus",
    description:
      "Distill a complex idea into the smallest, clearest version that still communicates.",
    tags: ["writing", "copy"],
  },
];

type CategoryOption = "All" | "Polish" | "Frontend" | "Structure" | "Typography" | "Style" | "Review" | "Writing";

const CATEGORY_TABS: CategoryOption[] = [
  "All",
  "Polish",
  "Frontend",
  "Structure",
  "Typography",
  "Style",
  "Review",
  "Writing",
];

interface FilterGroup {
  key: string;
  label: string;
  options: string[];
}

// Derive filter groups from data
function buildFilterGroups(): FilterGroup[] {
  const authors = Array.from(new Set(SKILLS.map((s) => s.author))).sort();
  const tags = Array.from(new Set(SKILLS.flatMap((s) => s.tags))).sort();
  return [
    { key: "authors", label: "Authors", options: authors },
    { key: "tags", label: "Tags", options: tags },
  ];
}

const FILTER_GROUPS = buildFilterGroups();

/* ─────────────────────────────────────── Component ─────────────────────────────────────── */

export function SkillsClient() {
  const { theme } = useTheme();
  const t = getNd(theme);
  const [category, setCategory] = useState<CategoryOption>("All");
  const [filterPanelOpen, setFilterPanelOpen] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const panelRef = useRef<HTMLDivElement | null>(null);
  const filterButtonRef = useRef<HTMLButtonElement | null>(null);

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

  const filtered = useMemo(() => {
    let result = SKILLS;

    if (category !== "All") {
      result = result.filter((s) => s.category === category);
    }

    const authorFilters = FILTER_GROUPS[0].options.filter((o) =>
      selected.has(o)
    );
    if (authorFilters.length > 0) {
      result = result.filter((s) => authorFilters.includes(s.author));
    }

    const tagFilters = FILTER_GROUPS[1].options.filter((o) => selected.has(o));
    if (tagFilters.length > 0) {
      result = result.filter((s) =>
        s.tags.some((tag) => tagFilters.includes(tag))
      );
    }

    return result;
  }, [category, selected]);

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

  /* ── styles ──────────────────────────── */

  const pageStyle: CSSProperties = {
    minHeight: "calc(100vh - 60px)",
    background: t.black,
    color: t.textPrimary,
    fontFamily: editorialFonts.body,
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

  const tabsStyle: CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    gap: 22,
    flexWrap: "wrap",
  };

  const tabStyle = (active: boolean): CSSProperties => ({
    background: "transparent",
    border: "none",
    borderBottom: `2px solid ${active ? t.textDisplay : "transparent"}`,
    cursor: "pointer",
    padding: "6px 0",
    fontFamily: editorialFonts.body,
    fontSize: 14,
    fontWeight: active ? 600 : 500,
    lineHeight: 1.2,
    color: active ? t.textDisplay : t.textSecondary,
    transition: "color 120ms ease-out, border-color 120ms ease-out",
    marginBottom: -1,
  });

  const filterButtonStyle: CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    background: filterPanelOpen ? t.surfaceRaised : t.surface,
    border: `1px solid ${filterPanelOpen ? t.borderVisible : t.border}`,
    borderRadius: swatchRadii.md,
    padding: "7px 12px",
    fontFamily: editorialFonts.body,
    fontSize: 13,
    fontWeight: 500,
    lineHeight: 1.2,
    color: t.textPrimary,
    cursor: "pointer",
    transition: "background 120ms ease-out, border-color 120ms ease-out",
  };

  const gridStyle: CSSProperties = {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
    gap: "20px 16px",
    padding: "4px 32px 48px",
  };

  /* ── render ──────────────────────────── */

  return (
    <div style={pageStyle}>
      {/* Filter row */}
      <div style={filterRowStyle}>
        <div style={tabsStyle}>
          {CATEGORY_TABS.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setCategory(cat)}
              style={tabStyle(category === cat)}
            >
              {cat}
            </button>
          ))}
        </div>

        <button
          ref={filterButtonRef}
          type="button"
          onClick={() => setFilterPanelOpen((v) => !v)}
          style={filterButtonStyle}
        >
          <Filter3LineIcon size={14} color={t.textPrimary} />
          Filter
          {activeCount > 0 && (
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                minWidth: 18,
                height: 18,
                padding: "0 5px",
                borderRadius: swatchRadii.full,
                background: t.accent,
                color: t.accentFg,
                fontFamily: editorialFonts.mono,
                fontSize: 10,
                fontWeight: 600,
                lineHeight: 1,
              }}
            >
              {activeCount}
            </span>
          )}
        </button>

        {filterPanelOpen && (
          <FilterPanel
            ref={panelRef}
            groups={FILTER_GROUPS}
            selected={selected}
            onToggle={toggleOption}
            onClear={clearAll}
            onClose={() => setFilterPanelOpen(false)}
            t={t}
          />
        )}
      </div>

      {/* Active chips */}
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
      {filtered.length === 0 ? (
        <div
          style={{
            padding: "60px 32px",
            textAlign: "center",
            fontSize: 14,
            color: t.textSecondary,
          }}
        >
          No skills match your filters
        </div>
      ) : (
        <div style={gridStyle}>
          {filtered.map((skill) => (
            <SkillCard key={skill.slug} skill={skill} t={t} />
          ))}
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────────────────── Filter Panel ─────────────────────────────────── */

function FilterPanel({
  ref,
  groups,
  selected,
  onToggle,
  onClear,
  onClose,
  t,
}: {
  ref: React.RefObject<HTMLDivElement | null>;
  groups: FilterGroup[];
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
        width: 560,
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

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 18,
        }}
      >
        {groups.map((group) => (
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
              {group.options.map((opt) => (
                <FilterChip
                  key={opt}
                  label={opt}
                  active={selected.has(opt)}
                  onClick={() => onToggle(opt)}
                  t={t}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
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
        background: active
          ? t.textDisplay
          : hovered
            ? t.surfaceRaised
            : t.surfaceInk,
        color: active ? t.black : hovered ? t.textDisplay : t.textPrimary,
        border: `1px solid ${active ? t.textDisplay : t.border}`,
        borderRadius: swatchRadii.full,
        padding: "6px 12px",
        fontFamily: editorialFonts.body,
        fontSize: 12,
        fontWeight: active ? 600 : 500,
        lineHeight: 1.2,
        cursor: "pointer",
        transition:
          "background 120ms ease-out, color 120ms ease-out, border-color 120ms ease-out",
      }}
    >
      {label}
    </button>
  );
}

/* ─────────────────────────────────────── Skill Card ─────────────────────────────────────── */

function SkillCard({
  skill,
  t,
}: {
  skill: Skill;
  t: ReturnType<typeof getNd>;
}) {
  const [hovered, setHovered] = useState(false);

  const cardStyle: CSSProperties = {
    display: "flex",
    flexDirection: "column",
    gap: 10,
    padding: 18,
    borderRadius: swatchRadii.lg,
    border: `1px solid ${hovered ? t.borderVisible : t.border}`,
    background: hovered ? t.surfaceRaised : t.surface,
    transition: "border-color 120ms ease-out, background 120ms ease-out",
    cursor: "default",
  };

  const categoryStyle: CSSProperties = {
    fontSize: 10,
    fontWeight: 600,
    letterSpacing: "0.06em",
    textTransform: "uppercase",
    color: t.textDisabled,
    fontFamily: editorialFonts.mono,
  };

  const nameStyle: CSSProperties = {
    fontSize: 15,
    fontWeight: 600,
    color: t.textDisplay,
    letterSpacing: "-0.01em",
    margin: 0,
    marginTop: 4,
  };

  const descStyle: CSSProperties = {
    fontSize: 13,
    lineHeight: 1.5,
    color: t.textSecondary,
    margin: 0,
    display: "-webkit-box",
    WebkitLineClamp: 3,
    WebkitBoxOrient: "vertical",
    overflow: "hidden",
  };

  const metaStyle: CSSProperties = {
    fontSize: 11,
    color: t.textDisabled,
    fontFamily: editorialFonts.mono,
    display: "flex",
    alignItems: "center",
    gap: 8,
  };

  const tagsStyle: CSSProperties = {
    display: "flex",
    gap: 4,
    flexWrap: "wrap",
    marginTop: "auto",
    paddingTop: 4,
  };

  const tagStyle: CSSProperties = {
    fontFamily: editorialFonts.mono,
    fontSize: 10,
    color: t.textSecondary,
    background: t.surfaceInk,
    padding: "3px 7px",
    borderRadius: swatchRadii.sm,
    border: `1px solid ${t.border}`,
  };

  return (
    <div
      style={cardStyle}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div>
        <span style={categoryStyle}>{skill.category}</span>
        <h3 style={nameStyle}>{skill.name}</h3>
      </div>
      <p style={descStyle}>{skill.description}</p>
      <div style={metaStyle}>
        <span>by {skill.author}</span>
      </div>
      <div style={tagsStyle}>
        {skill.tags.map((tag) => (
          <span key={tag} style={tagStyle}>
            {tag}
          </span>
        ))}
      </div>
    </div>
  );
}
