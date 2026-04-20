"use client";

import { type CSSProperties, type ReactNode, type ElementType } from "react";
import { useTheme } from "@/components/providers/theme-provider";
import { getNd, applyType, type TypeKey } from "@/lib/nothing-tokens";

type Tone = "display" | "primary" | "secondary" | "disabled" | "accent";

function toneColor(tone: Tone, t: ReturnType<typeof getNd>): string {
  switch (tone) {
    case "display":
      return t.textDisplay;
    case "primary":
      return t.textPrimary;
    case "secondary":
      return t.textSecondary;
    case "disabled":
      return t.textDisabled;
    case "accent":
      return t.accent;
  }
}

interface TextProps {
  as?: ElementType;
  type?: TypeKey;
  tone?: Tone;
  align?: "left" | "center" | "right";
  truncate?: boolean;
  style?: CSSProperties;
  children: ReactNode;
  htmlFor?: string;
}

export function Text({
  as,
  type: typeKey = "bodyMd",
  tone = "primary",
  align,
  truncate,
  style,
  children,
  htmlFor,
}: TextProps) {
  const Tag = (as ?? "p") as ElementType;
  const { theme } = useTheme();
  const t = getNd(theme);
  const merged: CSSProperties = {
    margin: 0,
    color: toneColor(tone, t),
    textAlign: align,
    ...(applyType(typeKey) as CSSProperties),
    ...(truncate
      ? { overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }
      : {}),
    ...style,
  };
  const extraProps = htmlFor ? { htmlFor } : {};
  return (
    <Tag style={merged} {...extraProps}>
      {children}
    </Tag>
  );
}

// Convenience aliases

export function Display({
  level = 2,
  tone = "display",
  children,
  align,
  style,
}: {
  level?: 1 | 2 | 3 | 4 | 5;
  tone?: Tone;
  children: ReactNode;
  align?: "left" | "center" | "right";
  style?: CSSProperties;
}) {
  const map: Record<number, TypeKey> = {
    1: "display1",
    2: "display2",
    3: "display3",
    4: "display4",
    5: "display5",
  };
  const tag = (`h${Math.min(level, 6)}` as unknown) as ElementType;
  return (
    <Text as={tag} type={map[level]} tone={tone} align={align} style={style}>
      {children}
    </Text>
  );
}

export function Body({
  size = "md",
  tone = "primary",
  children,
  style,
}: {
  size?: "sm" | "md" | "lg" | "xs";
  tone?: Tone;
  children: ReactNode;
  style?: CSSProperties;
}) {
  const key: TypeKey = size === "lg" ? "bodyLg" : size === "sm" ? "bodySm" : size === "xs" ? "bodyXs" : "bodyMd";
  return (
    <Text type={key} tone={tone} style={style}>
      {children}
    </Text>
  );
}

export function Label({
  tone = "disabled",
  htmlFor,
  size = "md",
  children,
  style,
}: {
  tone?: Tone;
  htmlFor?: string;
  size?: "sm" | "md";
  children: ReactNode;
  style?: CSSProperties;
}) {
  return (
    <Text
      as={htmlFor ? "label" : "span"}
      type={size === "sm" ? "labelSm" : "label"}
      tone={tone}
      htmlFor={htmlFor}
      style={style}
    >
      {children}
    </Text>
  );
}

export function Mono({
  size = "md",
  tone = "primary",
  children,
  style,
}: {
  size?: "sm" | "md";
  tone?: Tone;
  children: ReactNode;
  style?: CSSProperties;
}) {
  return (
    <Text type={size === "sm" ? "monoSm" : "monoMd"} tone={tone} style={style}>
      {children}
    </Text>
  );
}
