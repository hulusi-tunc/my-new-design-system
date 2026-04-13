"use client";

import { useMemo, useState, type CSSProperties } from "react";
import Link from "next/link";
import { useTheme } from "@/components/providers/theme-provider";
import { getNd, editorialFonts } from "@/lib/nothing-tokens";
import type { DSManifest } from "@/lib/types";

// ── Types ──────────────────────────────────────────

export interface RelatedSystemsProps {
  /** All manifests in the registry */
  allManifests: DSManifest[];
  /** The slug of the currently viewed design system (highlighted) */
  currentSlug: string;
}

interface TreeNode {
  manifest: DSManifest;
  children: TreeNode[];
  depth: number;
}

// ── Build flat list with depth info ────────────────

function buildFlatTree(manifests: DSManifest[]): TreeNode[] {
  const bySlug = new Map<string, DSManifest>();
  for (const m of manifests) {
    bySlug.set(m.slug, m);
  }

  const childMap = new Map<string, DSManifest[]>();
  const roots: DSManifest[] = [];

  for (const m of manifests) {
    const parentSlug = m.parent;
    if (!parentSlug || !bySlug.has(parentSlug)) {
      roots.push(m);
    } else {
      if (!childMap.has(parentSlug)) {
        childMap.set(parentSlug, []);
      }
      childMap.get(parentSlug)!.push(m);
    }
  }

  // Walk depth-first to flatten into ordered list with depth
  const out: TreeNode[] = [];
  function walk(manifest: DSManifest, depth: number) {
    const kids = (childMap.get(manifest.slug) ?? []).map((m) => ({
      manifest: m,
      children: [],
      depth: depth + 1,
    }));
    out.push({ manifest, children: kids, depth });
    for (const child of childMap.get(manifest.slug) ?? []) {
      walk(child, depth + 1);
    }
  }

  for (const r of roots) {
    walk(r, 0);
  }

  return out;
}

// ── Tree row (editorial list entry) ────────────────

function TreeRow({
  node,
  index,
  isCurrent,
}: {
  node: TreeNode;
  index: number;
  isCurrent: boolean;
}) {
  const { theme } = useTheme();
  const t = getNd(theme);
  const [hovered, setHovered] = useState(false);

  const childCount = node.children.length;
  const isFork = node.depth > 0;

  const rowStyle: CSSProperties = {
    display: "grid",
    gridTemplateColumns: "48px 1fr auto",
    alignItems: "baseline",
    gap: 24,
    padding: "20px 0",
    borderTop: `1px solid ${t.border}`,
    transition: "background 120ms ease",
    background: hovered ? t.surface : "transparent",
    textDecoration: "none",
    color: "inherit",
  };

  const numberStyle: CSSProperties = {
    fontFamily: editorialFonts.mono,
    fontSize: 11,
    letterSpacing: "0.08em",
    color: isCurrent ? t.accent : t.textDisabled,
    textTransform: "uppercase",
  };

  const nameWrapStyle: CSSProperties = {
    minWidth: 0,
    paddingLeft: node.depth * 24,
  };

  const nameStyle: CSSProperties = {
    fontFamily: editorialFonts.display,
    fontSize: 22,
    fontWeight: 400,
    letterSpacing: "-0.01em",
    color: isCurrent ? t.accent : t.textDisplay,
    lineHeight: 1.15,
    margin: 0,
    display: "flex",
    alignItems: "baseline",
    gap: 12,
  };

  const labelStyle: CSSProperties = {
    fontFamily: editorialFonts.mono,
    fontSize: 11,
    letterSpacing: "0.06em",
    color: t.textSecondary,
    textTransform: "uppercase",
    marginTop: 6,
    display: "flex",
    flexWrap: "wrap",
    gap: 12,
  };

  const sepStyle: CSSProperties = { color: t.textDisabled };

  const metaStyle: CSSProperties = {
    fontFamily: editorialFonts.mono,
    fontSize: 11,
    letterSpacing: "0.04em",
    color: t.textDisabled,
    textTransform: "uppercase",
    textAlign: "right",
    whiteSpace: "nowrap",
  };

  const youBadgeStyle: CSSProperties = {
    fontFamily: editorialFonts.mono,
    fontSize: 9,
    letterSpacing: "0.1em",
    color: t.accent,
    textTransform: "uppercase",
    border: `1px solid ${t.accent}`,
    padding: "2px 6px",
  };

  const labelParts: string[] = [];
  if (isFork) labelParts.push(`FORK · DEPTH ${node.depth}`);
  else labelParts.push("ROOT SYSTEM");
  if (childCount > 0)
    labelParts.push(`${childCount} ${childCount === 1 ? "FORK" : "FORKS"}`);

  return (
    <Link
      href={`/ds/${node.manifest.slug}`}
      style={rowStyle}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <span style={numberStyle}>{String(index + 1).padStart(2, "0")}</span>
      <div style={nameWrapStyle}>
        <h3 style={nameStyle}>
          <span>{node.manifest.name}</span>
          {isCurrent && <span style={youBadgeStyle}>YOU ARE HERE</span>}
        </h3>
        <div style={labelStyle}>
          {labelParts.map((part, i) => (
            <span key={part}>
              {part}
              {i < labelParts.length - 1 && (
                <span style={sepStyle}>{"  /  "}</span>
              )}
            </span>
          ))}
        </div>
      </div>
      <span style={metaStyle}>
        v{node.manifest.version} · BY {node.manifest.author.name.toUpperCase()}
      </span>
    </Link>
  );
}

// ── Main component ─────────────────────────────────

export function RelatedSystems({ allManifests, currentSlug }: RelatedSystemsProps) {
  const { theme } = useTheme();
  const t = getNd(theme);

  const flat = useMemo(() => buildFlatTree(allManifests), [allManifests]);

  if (flat.length === 0) {
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

    return <div style={emptyStyle}>NO RELATED SYSTEMS FOUND</div>;
  }

  const containerStyle: CSSProperties = {
    display: "flex",
    flexDirection: "column",
    borderBottom: `1px solid ${t.border}`,
  };

  return (
    <div style={containerStyle}>
      {flat.map((node, i) => (
        <TreeRow
          key={node.manifest.slug}
          node={node}
          index={i}
          isCurrent={node.manifest.slug === currentSlug}
        />
      ))}
    </div>
  );
}
