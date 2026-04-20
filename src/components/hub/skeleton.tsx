"use client";

import { type CSSProperties } from "react";
import { useTheme } from "@/components/providers/theme-provider";
import { getNd, swatchRadii } from "@/lib/nothing-tokens";

interface SkeletonProps {
  width?: number | string;
  height?: number | string;
  radius?: "sm" | "md" | "lg" | "full";
  style?: CSSProperties;
}

const RADIUS_MAP = {
  sm: swatchRadii.sm,
  md: swatchRadii.md,
  lg: swatchRadii.lg,
  full: swatchRadii.full,
};

export function Skeleton({
  width = "100%",
  height = 16,
  radius = "sm",
  style,
}: SkeletonProps) {
  const { theme } = useTheme();
  const t = getNd(theme);
  return (
    <span
      aria-busy="true"
      aria-hidden="true"
      style={{
        display: "block",
        width,
        height,
        borderRadius: RADIUS_MAP[radius],
        background: `linear-gradient(90deg, ${t.surface}, ${t.surfaceRaised}, ${t.surface})`,
        backgroundSize: "200% 100%",
        animation: "hub-shimmer 1.4s ease-in-out infinite",
        ...style,
      }}
    >
      <style>{`@keyframes hub-shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }`}</style>
    </span>
  );
}
