"use client";

import { type CSSProperties, type ReactNode, type ElementType } from "react";
import { space, type SpaceKey } from "@/lib/nothing-tokens";

type Gap = SpaceKey;
type Align = "start" | "center" | "end" | "baseline" | "stretch";
type Justify = "start" | "center" | "end" | "between" | "around";

const ALIGN_MAP: Record<Align, CSSProperties["alignItems"]> = {
  start: "flex-start",
  center: "center",
  end: "flex-end",
  baseline: "baseline",
  stretch: "stretch",
};

const JUSTIFY_MAP: Record<Justify, CSSProperties["justifyContent"]> = {
  start: "flex-start",
  center: "center",
  end: "flex-end",
  between: "space-between",
  around: "space-around",
};

/* ── Stack — vertical ──────────────────────────────── */

interface StackProps {
  as?: ElementType;
  gap?: Gap;
  align?: Align;
  justify?: Justify;
  padding?: Gap;
  children: ReactNode;
  style?: CSSProperties;
  className?: string;
}

export function Stack({
  as: Tag = "div",
  gap = 4,
  align,
  justify,
  padding,
  children,
  style,
  className,
}: StackProps) {
  const Component = Tag as ElementType;
  return (
    <Component
      className={className}
      style={{
        display: "flex",
        flexDirection: "column",
        gap: space[gap],
        alignItems: align ? ALIGN_MAP[align] : undefined,
        justifyContent: justify ? JUSTIFY_MAP[justify] : undefined,
        padding: padding != null ? space[padding] : undefined,
        minWidth: 0,
        ...style,
      }}
    >
      {children}
    </Component>
  );
}

/* ── Row — horizontal ──────────────────────────────── */

interface RowProps extends StackProps {
  wrap?: boolean;
}

export function Row({
  as: Tag = "div",
  gap = 3,
  align = "center",
  justify,
  padding,
  wrap,
  children,
  style,
  className,
}: RowProps) {
  const Component = Tag as ElementType;
  return (
    <Component
      className={className}
      style={{
        display: "flex",
        flexDirection: "row",
        gap: space[gap],
        alignItems: ALIGN_MAP[align],
        justifyContent: justify ? JUSTIFY_MAP[justify] : undefined,
        padding: padding != null ? space[padding] : undefined,
        flexWrap: wrap ? "wrap" : "nowrap",
        minWidth: 0,
        ...style,
      }}
    >
      {children}
    </Component>
  );
}

/* ── Container — max-width wrapper ────────────────── */

interface ContainerProps {
  width?: "sm" | "md" | "lg" | "xl" | "full";
  padX?: Gap;
  children: ReactNode;
  style?: CSSProperties;
}

const WIDTH_MAP = {
  sm: 640,
  md: 820,
  lg: 1040,
  xl: 1200,
  full: undefined,
} as const;

export function Container({
  width = "lg",
  padX = 6,
  children,
  style,
}: ContainerProps) {
  return (
    <div
      style={{
        maxWidth: WIDTH_MAP[width],
        margin: "0 auto",
        paddingLeft: space[padX],
        paddingRight: space[padX],
        width: "100%",
        ...style,
      }}
    >
      {children}
    </div>
  );
}

/* ── Divider ──────────────────────────────────────── */

export function Divider({
  orientation = "horizontal",
  spacing,
  style,
}: {
  orientation?: "horizontal" | "vertical";
  spacing?: Gap;
  style?: CSSProperties;
}) {
  const s = spacing != null ? space[spacing] : undefined;
  return (
    <div
      style={{
        height: orientation === "horizontal" ? 1 : "auto",
        width: orientation === "vertical" ? 1 : "auto",
        alignSelf: orientation === "vertical" ? "stretch" : undefined,
        background: "currentColor",
        opacity: 0.12,
        marginTop: orientation === "horizontal" ? s : undefined,
        marginBottom: orientation === "horizontal" ? s : undefined,
        marginLeft: orientation === "vertical" ? s : undefined,
        marginRight: orientation === "vertical" ? s : undefined,
        ...style,
      }}
    />
  );
}
