import type { DSManifest, DSTokenColors } from "@/lib/types";
import { getPlatformMeta } from "@/lib/platforms";

/**
 * Render a DSManifest as `design.md` — a Claude-readable style guide that
 * a downstream user can drop into their own project and feed to Claude as
 * design context. Optimized for terseness + pattern recognition over prose.
 */
export function manifestToDesignMd(manifest: DSManifest): string {
  const platformLabel = getPlatformMeta(manifest.platform).longLabel;
  const lines: string[] = [];

  // ── Header ──────────────────────────────────
  lines.push(`# ${manifest.name}`);
  lines.push("");
  lines.push(`> ${manifest.description}`);
  lines.push("");

  // ── At a glance ─────────────────────────────
  lines.push("## At a glance");
  lines.push("");
  lines.push(`- **Platform:** ${platformLabel}`);
  if (manifest.architecture) {
    lines.push(`- **Architecture:** ${manifest.architecture}`);
  }
  if (manifest.technology?.length) {
    lines.push(`- **Technology:** ${manifest.technology.join(", ")}`);
  }
  lines.push(`- **Repository:** ${manifest.repository}`);
  lines.push(`- **License:** ${manifest.license}`);
  lines.push(`- **Version:** ${manifest.version}`);
  lines.push("");

  // ── Color tokens ────────────────────────────
  const colorBlock = formatColors(manifest.tokens.colors);
  if (colorBlock) {
    lines.push("## Color tokens");
    lines.push("");
    lines.push(
      "Use these named tokens for any color. Don't introduce ad-hoc hex values."
    );
    lines.push("");
    lines.push(colorBlock);
    lines.push("");
  }

  // ── Typography ──────────────────────────────
  const typo = manifest.tokens.typography;
  lines.push("## Typography");
  lines.push("");
  lines.push(`- **Font family:** \`${typo.fontFamily}\``);
  if (typo.weights?.length) {
    lines.push(`- **Weights:** ${typo.weights.join(", ")}`);
  }
  lines.push(`- **Scale steps:** ${typo.scaleSteps}`);
  lines.push("");

  // ── Spacing ─────────────────────────────────
  const sp = manifest.tokens.spacing;
  lines.push("## Spacing");
  lines.push("");
  lines.push(`Base unit: \`${sp.unit}\` · ${sp.steps}-step scale.`);
  lines.push("");

  // ── Radius ──────────────────────────────────
  const r = manifest.tokens.radius;
  lines.push("## Radius");
  lines.push("");
  lines.push(`${r.steps}-step scale, full radius = \`${r.full}\`.`);
  lines.push("");

  // ── Components ──────────────────────────────
  if (manifest.components.length > 0) {
    lines.push(`## Components (${manifest.components.length})`);
    lines.push("");
    lines.push(
      "Reach for the design system's component before hand-rolling a new one."
    );
    lines.push("");
    for (const c of manifest.components) {
      const variantNote = c.variants ? ` · ${c.variants} variants` : "";
      lines.push(`- **${c.name}** — \`${c.file}\`${variantNote}`);
    }
    lines.push("");
  }

  // ── Install via Claude Code ─────────────────
  lines.push("## Install with Claude Code");
  lines.push("");
  lines.push(
    "Hubera serves this design system through an MCP server. With the `ds-registry` MCP added to Claude Code, ask:"
  );
  lines.push("");
  lines.push("```");
  lines.push(`Install the ${manifest.name} design system into this project`);
  lines.push("```");
  lines.push("");
  lines.push(
    `Or pull a single component (e.g. \`${manifest.components[0]?.name ?? "Button"}\`):`
  );
  lines.push("");
  lines.push("```");
  lines.push(
    `Install the ${manifest.components[0]?.name ?? "Button"} component from ${manifest.name}`
  );
  lines.push("```");
  lines.push("");

  // ── Footer ──────────────────────────────────
  lines.push("---");
  lines.push("");
  lines.push(
    `_Generated from \`${manifest.slug}\` · ${manifest.author?.name ?? "unknown"} · last updated ${manifest.updatedAt}_`
  );
  lines.push("");

  return lines.join("\n");
}

// ── Helpers ─────────────────────────────────────

function formatColors(colors: DSTokenColors): string | null {
  const entries = Object.entries(colors);
  if (entries.length === 0) return null;

  const blocks: string[] = [];
  for (const [scaleName, value] of entries) {
    if (typeof value === "string") {
      blocks.push(`- **${scaleName}** — \`${value}\``);
      continue;
    }
    if (!value || typeof value !== "object") continue;

    const stepEntries = Object.entries(value as Record<string, string>);
    if (stepEntries.length === 0) continue;

    blocks.push(`### ${capitalize(scaleName)}`);
    blocks.push("");
    blocks.push("| Step | Value |");
    blocks.push("| --- | --- |");
    for (const [step, hex] of stepEntries) {
      blocks.push(`| \`${step}\` | \`${hex}\` |`);
    }
    blocks.push("");
  }
  return blocks.join("\n").trim() || null;
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
