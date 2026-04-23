"use client";

import {
  forwardRef,
  useRef,
  useState,
  useCallback,
  useEffect,
  type KeyboardEvent,
  type ClipboardEvent,
} from "react";
import { getSemanticTokens } from "@/styles/design-tokens";
import { useTheme } from "@/components/providers/theme-provider";

export type VerificationCodeSize = "sm" | "md";

export interface VerificationCodeInputProps {
  /** Number of digit boxes (default 6) */
  length?: number;
  /** sm = 48px box, md = 64px box */
  size?: VerificationCodeSize;
  /** Label above the input */
  label?: string;
  /** Hint text below (hidden when error is set) */
  hint?: string;
  /** Error message below */
  error?: string;
  /** Controlled value */
  value?: string;
  /** Called when the code changes */
  onChange?: (value: string) => void;
  /** Called when all digits are filled */
  onComplete?: (value: string) => void;
  disabled?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

const sizeConfig: Record<
  VerificationCodeSize,
  { boxW: number; boxH: number; fontSize: number; lineHeight: number; radius: number; gap: number }
> = {
  sm: { boxW: 48, boxH: 48, fontSize: 30, lineHeight: 38, radius: 8, gap: 8 },
  md: { boxW: 64, boxH: 64, fontSize: 36, lineHeight: 44, radius: 8, gap: 12 },
};

export const VerificationCodeInput = forwardRef<HTMLDivElement, VerificationCodeInputProps>(
  function VerificationCodeInput(
    {
      length = 6,
      size = "sm",
      label,
      hint,
      error,
      value: controlledValue,
      onChange,
      onComplete,
      disabled = false,
      style,
    },
    ref
  ) {
    const { theme, brandPalette } = useTheme();
    const tokens = getSemanticTokens(theme, brandPalette);
    const c = sizeConfig[size];
    const hasError = !!error;

    const [internalValue, setInternalValue] = useState(() =>
      (controlledValue || "").padEnd(length, "").slice(0, length)
    );
    const [focusedIndex, setFocusedIndex] = useState<number | null>(null);
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

    const digits = controlledValue !== undefined
      ? controlledValue.padEnd(length, "").slice(0, length)
      : internalValue;

    const updateValue = useCallback(
      (newValue: string) => {
        const padded = newValue.padEnd(length, "").slice(0, length);
        if (controlledValue === undefined) {
          setInternalValue(padded);
        }
        onChange?.(padded.replace(/ /g, ""));
        const trimmed = padded.replace(/ /g, "");
        if (trimmed.length === length) {
          onComplete?.(trimmed);
        }
      },
      [length, controlledValue, onChange, onComplete]
    );

    useEffect(() => {
      inputRefs.current = inputRefs.current.slice(0, length);
    }, [length]);

    const handleChange = (index: number, char: string) => {
      if (disabled) return;
      const digit = char.replace(/[^0-9]/g, "").slice(-1);
      if (!digit) return;

      const arr = digits.split("");
      arr[index] = digit;
      updateValue(arr.join(""));

      // move focus to next
      if (index < length - 1) {
        inputRefs.current[index + 1]?.focus();
      }
    };

    const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
      if (disabled) return;

      if (e.key === "Backspace") {
        e.preventDefault();
        const arr = digits.split("");
        if (arr[index] && arr[index] !== " ") {
          arr[index] = " ";
          updateValue(arr.join(""));
        } else if (index > 0) {
          arr[index - 1] = " ";
          updateValue(arr.join(""));
          inputRefs.current[index - 1]?.focus();
        }
      } else if (e.key === "ArrowLeft" && index > 0) {
        inputRefs.current[index - 1]?.focus();
      } else if (e.key === "ArrowRight" && index < length - 1) {
        inputRefs.current[index + 1]?.focus();
      }
    };

    const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
      e.preventDefault();
      if (disabled) return;
      const pasted = e.clipboardData.getData("text").replace(/[^0-9]/g, "").slice(0, length);
      if (pasted) {
        updateValue(pasted);
        const nextIndex = Math.min(pasted.length, length - 1);
        inputRefs.current[nextIndex]?.focus();
      }
    };

    const wrapperStyle: React.CSSProperties = {
      display: "flex",
      flexDirection: "column",
      gap: 6,
      fontFamily: "var(--font-sans), system-ui, sans-serif",
      ...style,
    };

    const labelStyle: React.CSSProperties = {
      fontSize: 14,
      lineHeight: "20px",
      fontWeight: 500,
      color: tokens.text.secondary,
    };

    const hintStyle: React.CSSProperties = {
      fontSize: 14,
      lineHeight: "20px",
      color: hasError ? tokens.text.errorPrimary : tokens.text.tertiary,
    };

    const getBoxStyle = (index: number): React.CSSProperties => {
      const isFocused = focusedIndex === index;
      const hasDig = digits[index] && digits[index] !== " ";

      const borderColor = disabled
        ? tokens.border.disabled
        : hasError
          ? tokens.border.error
          : isFocused
            ? tokens.border.brand
            : hasDig
              ? tokens.border.primary
              : tokens.border.primary;

      const shadow = isFocused && !disabled
        ? hasError
          ? `0 0 0 4px ${tokens.bg.errorSecondary}`
          : `0 0 0 4px ${tokens.bg.brandSecondary}`
        : "none";

      return {
        width: c.boxW,
        height: c.boxH,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        border: `1px solid ${borderColor}`,
        borderRadius: c.radius,
        background: disabled ? tokens.bg.disabledSubtle : tokens.bg.primary,
        boxShadow: shadow,
        transition: "border-color 120ms ease, box-shadow 120ms ease",
      };
    };

    const digitInputStyle: React.CSSProperties = {
      width: "100%",
      height: "100%",
      border: "none",
      outline: "none",
      background: "transparent",
      textAlign: "center",
      fontSize: c.fontSize,
      lineHeight: `${c.lineHeight}px`,
      fontWeight: 500,
      fontFamily: "inherit",
      color: disabled ? tokens.text.disabled : tokens.text.primary,
      caretColor: "transparent",
      cursor: disabled ? "not-allowed" : "text",
    };

    return (
      <div ref={ref} style={wrapperStyle}>
        {label && <label style={labelStyle}>{label}</label>}

        <div style={{ display: "flex", gap: c.gap }}>
          {Array.from({ length }).map((_, i) => (
            <div key={i} style={getBoxStyle(i)}>
              <input
                ref={(el) => { inputRefs.current[i] = el; }}
                type="text"
                inputMode="numeric"
                maxLength={1}
                disabled={disabled}
                value={digits[i] === " " ? "" : digits[i] || ""}
                style={digitInputStyle}
                onChange={(e) => handleChange(i, e.target.value)}
                onKeyDown={(e) => handleKeyDown(i, e)}
                onPaste={handlePaste}
                onFocus={() => setFocusedIndex(i)}
                onBlur={() => setFocusedIndex(null)}
                aria-label={`Digit ${i + 1}`}
              />
            </div>
          ))}
        </div>

        {(hint || error) && (
          <span style={hintStyle}>{error || hint}</span>
        )}
      </div>
    );
  }
);
