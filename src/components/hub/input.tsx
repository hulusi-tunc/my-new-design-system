"use client";

import {
  forwardRef,
  useState,
  type CSSProperties,
  type InputHTMLAttributes,
  type ReactNode,
  type TextareaHTMLAttributes,
} from "react";
import { useTheme } from "@/components/providers/theme-provider";
import {
  getNd,
  getShadow,
  motion,
  swatchRadii,
  applyType,
} from "@/lib/nothing-tokens";
import { Label } from "./typography";

type InputSize = "sm" | "md" | "lg";

const HEIGHTS: Record<InputSize, number> = { sm: 30, md: 36, lg: 42 };
const PADDING_X: Record<InputSize, number> = { sm: 10, md: 12, lg: 14 };
const TYPE_MAP: Record<InputSize, "bodyXs" | "bodySm" | "bodyMd"> = {
  sm: "bodyXs",
  md: "bodySm",
  lg: "bodyMd",
};

// ── Primitive visual shell (shared by Input + Textarea) ──

function fieldStyle(opts: {
  focused: boolean;
  invalid: boolean;
  disabled: boolean;
  t: ReturnType<typeof getNd>;
  sh: ReturnType<typeof getShadow>;
  size: InputSize;
  multiline?: boolean;
}): CSSProperties {
  const { focused, invalid, disabled, t, sh, size, multiline } = opts;
  const border = invalid
    ? t.danger
    : focused
      ? t.borderStrong
      : t.border;
  return {
    ...(applyType(TYPE_MAP[size]) as CSSProperties),
    width: "100%",
    background: disabled ? t.surfaceInk : t.surfaceInk,
    color: t.textPrimary,
    border: `1px solid ${border}`,
    borderRadius: swatchRadii.md,
    padding: multiline ? `10px ${PADDING_X[size]}px` : `0 ${PADDING_X[size]}px`,
    height: multiline ? undefined : HEIGHTS[size],
    minHeight: multiline ? HEIGHTS[size] * 2.2 : undefined,
    outline: "none",
    boxShadow: focused ? sh.focus : "none",
    transition: motion.transition.chrome,
    opacity: disabled ? 0.6 : 1,
    resize: multiline ? "vertical" : undefined,
    lineHeight: multiline ? 1.55 : 1,
  };
}

// ── Input ──

export interface InputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "size"> {
  inputSize?: InputSize;
  invalid?: boolean;
  leadingSlot?: ReactNode;
  trailingSlot?: ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  {
    inputSize = "md",
    invalid = false,
    leadingSlot,
    trailingSlot,
    style,
    onFocus,
    onBlur,
    disabled,
    ...rest
  },
  ref
) {
  const { theme } = useTheme();
  const t = getNd(theme);
  const sh = getShadow(theme);
  const [focused, setFocused] = useState(false);

  const shell = fieldStyle({
    focused,
    invalid,
    disabled: Boolean(disabled),
    t,
    sh,
    size: inputSize,
  });

  if (!leadingSlot && !trailingSlot) {
    return (
      <input
        ref={ref}
        disabled={disabled}
        style={{ ...shell, ...style }}
        onFocus={(e) => {
          setFocused(true);
          onFocus?.(e);
        }}
        onBlur={(e) => {
          setFocused(false);
          onBlur?.(e);
        }}
        {...rest}
      />
    );
  }

  // With slots: wrap shell on container, input transparent inside.
  return (
    <div
      style={{
        ...shell,
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
        padding: `0 ${PADDING_X[inputSize]}px`,
        height: HEIGHTS[inputSize],
      }}
    >
      {leadingSlot && (
        <span style={{ display: "inline-flex", color: t.textSecondary }}>
          {leadingSlot}
        </span>
      )}
      <input
        ref={ref}
        disabled={disabled}
        style={{
          flex: 1,
          border: "none",
          outline: "none",
          background: "transparent",
          color: t.textPrimary,
          minWidth: 0,
          ...(applyType(TYPE_MAP[inputSize]) as CSSProperties),
          lineHeight: 1,
          ...style,
        }}
        onFocus={(e) => {
          setFocused(true);
          onFocus?.(e);
        }}
        onBlur={(e) => {
          setFocused(false);
          onBlur?.(e);
        }}
        {...rest}
      />
      {trailingSlot && (
        <span style={{ display: "inline-flex", color: t.textDisabled }}>
          {trailingSlot}
        </span>
      )}
    </div>
  );
});

// ── Textarea ──

export interface TextareaProps
  extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  inputSize?: InputSize;
  invalid?: boolean;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  function Textarea(
    { inputSize = "md", invalid = false, style, onFocus, onBlur, disabled, ...rest },
    ref
  ) {
    const { theme } = useTheme();
    const t = getNd(theme);
    const sh = getShadow(theme);
    const [focused, setFocused] = useState(false);

    const shell = fieldStyle({
      focused,
      invalid,
      disabled: Boolean(disabled),
      t,
      sh,
      size: inputSize,
      multiline: true,
    });

    return (
      <textarea
        ref={ref}
        disabled={disabled}
        style={{ ...shell, ...style }}
        onFocus={(e) => {
          setFocused(true);
          onFocus?.(e);
        }}
        onBlur={(e) => {
          setFocused(false);
          onBlur?.(e);
        }}
        {...rest}
      />
    );
  }
);

// ── Field — label/hint/error wrapper ──

export interface FieldProps {
  id?: string;
  label?: string;
  hint?: string;
  error?: string;
  children: ReactNode;
}

export function Field({ id, label, hint, error, children }: FieldProps) {
  const { theme } = useTheme();
  const t = getNd(theme);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      {label && (
        <Label htmlFor={id} tone="secondary">
          {label}
        </Label>
      )}
      {children}
      {(hint || error) && (
        <span
          style={{
            fontFamily: "var(--font-space-grotesk), system-ui, sans-serif",
            fontSize: 12,
            color: error ? t.danger : t.textSecondary,
            lineHeight: 1.45,
          }}
        >
          {error ?? hint}
        </span>
      )}
    </div>
  );
}
