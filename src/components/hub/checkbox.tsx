"use client";

import {
  forwardRef,
  useState,
  type CSSProperties,
  type InputHTMLAttributes,
  type ReactNode,
} from "react";
import { useTheme } from "@/components/providers/theme-provider";
import {
  getNd,
  getShadow,
  motion,
  swatchRadii,
} from "@/lib/nothing-tokens";
import CheckLineIcon from "remixicon-react/CheckLineIcon";
import SubtractLineIcon from "remixicon-react/SubtractLineIcon";

interface CheckboxProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "size"> {
  indeterminate?: boolean;
  label?: ReactNode;
  description?: ReactNode;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  function Checkbox(
    {
      indeterminate = false,
      label,
      description,
      checked,
      defaultChecked,
      onChange,
      disabled,
      style: styleOverride,
      ...rest
    },
    ref
  ) {
    const { theme } = useTheme();
    const t = getNd(theme);
    const sh = getShadow(theme);
    const [focused, setFocused] = useState(false);
    const effectiveChecked = checked ?? defaultChecked ?? false;
    const on = indeterminate || effectiveChecked;

    const boxStyle: CSSProperties = {
      width: 16,
      height: 16,
      borderRadius: swatchRadii.sm,
      border: `1px solid ${on ? t.textDisplay : t.borderVisible}`,
      background: on ? t.textDisplay : "transparent",
      color: t.black,
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      flexShrink: 0,
      transition: motion.transition.chrome,
      boxShadow: focused ? sh.focus : "none",
    };

    return (
      <label
        style={{
          display: "inline-flex",
          alignItems: description ? "flex-start" : "center",
          gap: 10,
          cursor: disabled ? "not-allowed" : "pointer",
          opacity: disabled ? 0.55 : 1,
          fontFamily: "var(--font-space-grotesk), system-ui, sans-serif",
          color: t.textPrimary,
          ...styleOverride,
        }}
      >
        <span style={boxStyle}>
          {indeterminate ? (
            <SubtractLineIcon size={12} />
          ) : effectiveChecked ? (
            <CheckLineIcon size={12} />
          ) : null}
        </span>
        <input
          ref={ref}
          type="checkbox"
          checked={checked}
          defaultChecked={defaultChecked}
          onChange={onChange}
          disabled={disabled}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={{ position: "absolute", opacity: 0, pointerEvents: "none" }}
          {...rest}
        />
        {(label || description) && (
          <span
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 2,
              minWidth: 0,
            }}
          >
            {label && (
              <span style={{ fontSize: 14, lineHeight: 1.4, color: t.textDisplay }}>
                {label}
              </span>
            )}
            {description && (
              <span
                style={{
                  fontSize: 12,
                  lineHeight: 1.45,
                  color: t.textSecondary,
                }}
              >
                {description}
              </span>
            )}
          </span>
        )}
      </label>
    );
  }
);
