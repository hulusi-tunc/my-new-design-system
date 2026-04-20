"use client";

import {
  forwardRef,
  useState,
  type CSSProperties,
  type SelectHTMLAttributes,
} from "react";
import { useTheme } from "@/components/providers/theme-provider";
import {
  getNd,
  getShadow,
  motion,
  swatchRadii,
  applyType,
} from "@/lib/nothing-tokens";
import ArrowDownSLineIcon from "remixicon-react/ArrowDownSLineIcon";

type SelectSize = "sm" | "md" | "lg";
const HEIGHTS: Record<SelectSize, number> = { sm: 30, md: 36, lg: 42 };
const PAD_X: Record<SelectSize, number> = { sm: 10, md: 12, lg: 14 };
const TYPE_MAP: Record<SelectSize, "bodyXs" | "bodySm" | "bodyMd"> = {
  sm: "bodyXs",
  md: "bodySm",
  lg: "bodyMd",
};

export interface SelectProps
  extends Omit<SelectHTMLAttributes<HTMLSelectElement>, "size"> {
  inputSize?: SelectSize;
  invalid?: boolean;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  { inputSize = "md", invalid = false, style, onFocus, onBlur, disabled, children, ...rest },
  ref
) {
  const { theme } = useTheme();
  const t = getNd(theme);
  const sh = getShadow(theme);
  const [focused, setFocused] = useState(false);

  const border = invalid
    ? t.danger
    : focused
      ? t.borderStrong
      : t.border;

  const wrapperStyle: CSSProperties = {
    position: "relative",
    display: "inline-flex",
    width: "100%",
  };

  const selectStyle: CSSProperties = {
    ...(applyType(TYPE_MAP[inputSize]) as CSSProperties),
    width: "100%",
    height: HEIGHTS[inputSize],
    padding: `0 ${PAD_X[inputSize] + 24}px 0 ${PAD_X[inputSize]}px`,
    background: t.surfaceInk,
    color: t.textPrimary,
    border: `1px solid ${border}`,
    borderRadius: swatchRadii.md,
    appearance: "none",
    cursor: disabled ? "not-allowed" : "pointer",
    outline: "none",
    boxShadow: focused ? sh.focus : "none",
    transition: motion.transition.chrome,
    opacity: disabled ? 0.6 : 1,
    lineHeight: 1,
    ...style,
  };

  return (
    <div style={wrapperStyle}>
      <select
        ref={ref}
        disabled={disabled}
        style={selectStyle}
        onFocus={(e) => {
          setFocused(true);
          onFocus?.(e);
        }}
        onBlur={(e) => {
          setFocused(false);
          onBlur?.(e);
        }}
        {...rest}
      >
        {children}
      </select>
      <span
        style={{
          position: "absolute",
          right: PAD_X[inputSize],
          top: "50%",
          transform: "translateY(-50%)",
          color: t.textSecondary,
          pointerEvents: "none",
        }}
      >
        <ArrowDownSLineIcon size={14} />
      </span>
    </div>
  );
});
