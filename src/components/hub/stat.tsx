"use client";

import { type ReactNode } from "react";
import { useTheme } from "@/components/providers/theme-provider";
import { getNd, swatchRadii, space } from "@/lib/nothing-tokens";
import { Body, Label } from "./typography";

export interface StatProps {
  label: string;
  value: ReactNode;
  hint?: ReactNode;
}

export function Stat({ label, value, hint }: StatProps) {
  const { theme } = useTheme();
  const t = getNd(theme);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4, minWidth: 0 }}>
      <Label>{label}</Label>
      <span
        style={{
          fontFamily: "var(--font-space-grotesk), system-ui, sans-serif",
          fontSize: 22,
          fontWeight: 600,
          color: t.textDisplay,
          lineHeight: 1.1,
        }}
      >
        {value}
      </span>
      {hint && (
        <Body size="sm" tone="secondary">
          {hint}
        </Body>
      )}
    </div>
  );
}

interface StatRowProps {
  items: StatProps[];
}

export function StatRow({ items }: StatRowProps) {
  const { theme } = useTheme();
  const t = getNd(theme);
  return (
    <div
      style={{
        display: "flex",
        gap: space[6],
        padding: `${space[4]}px ${space[5]}px`,
        border: `1px solid ${t.border}`,
        borderRadius: swatchRadii.lg,
        background: t.surfaceInk,
        flexWrap: "wrap",
      }}
    >
      {items.map((it) => (
        <Stat key={it.label} {...it} />
      ))}
    </div>
  );
}
