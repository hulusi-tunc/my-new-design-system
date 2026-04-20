"use client";

import {
  useId,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import { useTheme } from "@/components/providers/theme-provider";
import {
  getNd,
  getShadow,
  motion,
  swatchRadii,
  zLayer,
} from "@/lib/nothing-tokens";

type Placement = "top" | "bottom" | "left" | "right";

interface TooltipProps {
  content: ReactNode;
  placement?: Placement;
  delayMs?: number;
  children: ReactNode;
}

export function Tooltip({
  content,
  placement = "top",
  delayMs = 200,
  children,
}: TooltipProps) {
  const { theme } = useTheme();
  const t = getNd(theme);
  const sh = getShadow(theme);
  const [visible, setVisible] = useState(false);
  const [timer, setTimer] = useState<ReturnType<typeof setTimeout> | null>(null);
  const id = useId();

  const open = () => {
    if (timer) clearTimeout(timer);
    setTimer(setTimeout(() => setVisible(true), delayMs));
  };
  const close = () => {
    if (timer) clearTimeout(timer);
    setVisible(false);
  };

  const tipPositionStyle: CSSProperties = (() => {
    switch (placement) {
      case "top":
        return {
          bottom: "calc(100% + 8px)",
          left: "50%",
          transform: "translateX(-50%)",
        };
      case "bottom":
        return {
          top: "calc(100% + 8px)",
          left: "50%",
          transform: "translateX(-50%)",
        };
      case "left":
        return {
          right: "calc(100% + 8px)",
          top: "50%",
          transform: "translateY(-50%)",
        };
      case "right":
        return {
          left: "calc(100% + 8px)",
          top: "50%",
          transform: "translateY(-50%)",
        };
    }
  })();

  return (
    <span
      style={{ position: "relative", display: "inline-flex" }}
      onMouseEnter={open}
      onMouseLeave={close}
      onFocus={open}
      onBlur={close}
      aria-describedby={visible ? id : undefined}
    >
      {children}
      {visible && (
        <span
          id={id}
          role="tooltip"
          style={{
            position: "absolute",
            ...tipPositionStyle,
            padding: "6px 10px",
            background: t.surface,
            border: `1px solid ${t.borderVisible}`,
            borderRadius: swatchRadii.md,
            boxShadow: sh.medium,
            color: t.textDisplay,
            fontFamily: "var(--font-space-grotesk), system-ui, sans-serif",
            fontSize: 11,
            fontWeight: 500,
            letterSpacing: "0.02em",
            whiteSpace: "nowrap",
            zIndex: zLayer.popover,
            pointerEvents: "none",
            transition: motion.transition.chrome,
          }}
        >
          {content}
        </span>
      )}
    </span>
  );
}
