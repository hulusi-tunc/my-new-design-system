"use client";

import { type ReactNode } from "react";
import { useTheme } from "@/components/providers/theme-provider";
import { getNd, space } from "@/lib/nothing-tokens";
import { Stack } from "./layout";
import { Display, Body, Label } from "./typography";

interface EmptyStateProps {
  eyebrow?: string;
  title: string;
  description?: ReactNode;
  action?: ReactNode;
  icon?: ReactNode;
  padY?: keyof typeof space;
}

export function EmptyState({
  eyebrow,
  title,
  description,
  action,
  icon,
  padY = 10,
}: EmptyStateProps) {
  const { theme } = useTheme();
  const t = getNd(theme);
  return (
    <Stack
      gap={3}
      align="center"
      style={{
        paddingTop: space[padY],
        paddingBottom: space[padY],
        textAlign: "center",
        color: t.textSecondary,
      }}
    >
      {icon && (
        <div
          style={{
            display: "inline-flex",
            color: t.textDisabled,
            marginBottom: 4,
          }}
        >
          {icon}
        </div>
      )}
      {eyebrow && <Label>{eyebrow}</Label>}
      <Display level={4} tone="display" align="center">
        {title}
      </Display>
      {description && (
        <Body tone="secondary" style={{ maxWidth: 440 }}>
          {description}
        </Body>
      )}
      {action && <div style={{ marginTop: space[2] }}>{action}</div>}
    </Stack>
  );
}
