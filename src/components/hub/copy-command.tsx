"use client";

import { useState, type CSSProperties, type ReactNode } from "react";
import { useTheme } from "@/components/providers/theme-provider";
import {
  getNd,
  motion,
  swatchRadii,
  applyType,
} from "@/lib/nothing-tokens";
import { Label } from "./typography";

interface CopyCommandProps {
  text: string;
  label?: ReactNode;
  style?: CSSProperties;
}

export function CopyCommand({ text, label = "Copy", style }: CopyCommandProps) {
  const { theme } = useTheme();
  const t = getNd(theme);
  const [copied, setCopied] = useState(false);
  const [hovered, setHovered] = useState(false);

  const onClick = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // clipboard blocked — silent
    }
  };

  return (
    <button
      type="button"
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 16,
        width: "100%",
        padding: "14px 16px",
        background: t.surfaceInk,
        border: `1px solid ${hovered ? t.borderStrong : t.border}`,
        borderRadius: swatchRadii.md,
        cursor: "pointer",
        transition: motion.transition.chrome,
        textAlign: "left",
        ...style,
      }}
    >
      <span
        style={{
          ...(applyType("monoMd") as CSSProperties),
          color: t.textPrimary,
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        }}
      >
        {text}
      </span>
      <Label tone={copied ? "accent" : "disabled"}>
        {copied ? "Copied" : label}
      </Label>
    </button>
  );
}
