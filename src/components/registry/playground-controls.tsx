"use client";

import { type CSSProperties } from "react";
import { useTheme } from "@/components/providers/theme-provider";
import { getNd, editorialFonts, swatchRadii } from "@/lib/nothing-tokens";
import type { DSPropType } from "@/lib/types";

/**
 * Controls panel for the Playground view.
 *
 * Renders one input per prop declared in `props`. The parent holds the
 * current state; this component is purely controlled — it emits changes
 * via `onChange`.
 */

export type PropValue = string | number | boolean;

interface PlaygroundControlsProps {
  schema: Record<string, DSPropType>;
  values: Record<string, PropValue>;
  onChange: (name: string, value: PropValue) => void;
  onReset?: () => void;
}

export function PlaygroundControls({
  schema,
  values,
  onChange,
  onReset,
}: PlaygroundControlsProps) {
  const { theme } = useTheme();
  const t = getNd(theme);

  const entries = Object.entries(schema);

  const panelStyle: CSSProperties = {
    display: "flex",
    flexDirection: "column",
    gap: 16,
    padding: 20,
    border: `1px solid ${t.border}`,
    borderRadius: 12,
    background: t.surface,
    minWidth: 240,
  };

  const headerStyle: CSSProperties = {
    display: "flex",
    alignItems: "baseline",
    justifyContent: "space-between",
    fontFamily: editorialFonts.mono,
    fontSize: 11,
    letterSpacing: "0.08em",
    textTransform: "uppercase",
    color: t.textSecondary,
    fontWeight: 600,
  };

  const fieldStyle: CSSProperties = {
    display: "flex",
    flexDirection: "column",
    gap: 6,
  };

  const labelStyle: CSSProperties = {
    fontFamily: editorialFonts.mono,
    fontSize: 10,
    letterSpacing: "0.06em",
    textTransform: "uppercase",
    color: t.textDisabled,
  };

  return (
    <aside style={panelStyle} aria-label="Component props">
      <div style={headerStyle}>
        <span>Controls</span>
        {onReset && (
          <button
            type="button"
            onClick={onReset}
            style={{
              background: "transparent",
              border: "none",
              padding: 0,
              cursor: "pointer",
              fontFamily: editorialFonts.mono,
              fontSize: 10,
              letterSpacing: "0.06em",
              textTransform: "uppercase",
              color: t.textDisabled,
            }}
          >
            Reset
          </button>
        )}
      </div>

      {entries.length === 0 ? (
        <p
          style={{
            fontFamily: editorialFonts.body,
            fontSize: 12,
            color: t.textDisabled,
            margin: 0,
          }}
        >
          No props declared for this component.
        </p>
      ) : (
        entries.map(([propName, propType]) => {
          const value = values[propName];
          return (
            <div key={propName} style={fieldStyle}>
              <label style={labelStyle}>{propName}</label>
              <Control
                name={propName}
                type={propType}
                value={value}
                onChange={(v) => onChange(propName, v)}
                t={t}
              />
            </div>
          );
        })
      )}
    </aside>
  );
}

/* ─── Individual control ──────────────────────────── */

function Control({
  name,
  type,
  value,
  onChange,
  t,
}: {
  name: string;
  type: DSPropType;
  value: PropValue | undefined;
  onChange: (v: PropValue) => void;
  t: ReturnType<typeof getNd>;
}) {
  const baseInputStyle: CSSProperties = {
    width: "100%",
    background: t.surfaceInk,
    border: `1px solid ${t.border}`,
    borderRadius: swatchRadii.md,
    padding: "7px 10px",
    fontFamily: editorialFonts.body,
    fontSize: 13,
    color: t.textPrimary,
    outline: "none",
  };

  switch (type.type) {
    case "enum":
      return (
        <select
          value={(value as string) ?? type.default ?? type.values[0] ?? ""}
          onChange={(e) => onChange(e.target.value)}
          style={{
            ...baseInputStyle,
            appearance: "none",
            WebkitAppearance: "none",
            MozAppearance: "none",
            backgroundImage: `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='10' height='6' viewBox='0 0 10 6' fill='none'><path d='M1 1l4 4 4-4' stroke='${encodeURIComponent(
              t.textSecondary
            )}' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/></svg>")`,
            backgroundRepeat: "no-repeat",
            backgroundPosition: "right 10px center",
            backgroundSize: "10px 6px",
            paddingRight: 28,
            cursor: "pointer",
          }}
        >
          {type.values.map((v) => (
            <option key={v} value={v}>
              {v}
            </option>
          ))}
        </select>
      );

    case "boolean": {
      const on = Boolean(value);
      return (
        <label
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            cursor: "pointer",
            fontFamily: editorialFonts.body,
            fontSize: 13,
            color: t.textPrimary,
          }}
        >
          <span
            role="switch"
            aria-checked={on}
            onClick={() => onChange(!on)}
            style={{
              width: 32,
              height: 18,
              borderRadius: 999,
              background: on ? t.accent : t.surfaceInk,
              border: `1px solid ${on ? t.accent : t.border}`,
              display: "inline-flex",
              alignItems: "center",
              padding: 2,
              transition: "background 120ms ease-out, border-color 120ms ease-out",
              cursor: "pointer",
            }}
          >
            <span
              style={{
                width: 12,
                height: 12,
                borderRadius: "50%",
                background: on ? t.accentFg : t.textSecondary,
                transform: `translateX(${on ? 14 : 0}px)`,
                transition: "transform 120ms ease-out",
              }}
            />
          </span>
          <span style={{ color: t.textSecondary, fontSize: 12 }}>
            {on ? "true" : "false"}
          </span>
        </label>
      );
    }

    case "number":
      return (
        <input
          type="number"
          value={(value as number) ?? type.default ?? ""}
          min={type.min}
          max={type.max}
          step={type.step}
          onChange={(e) => {
            const n = Number(e.target.value);
            if (!Number.isNaN(n)) onChange(n);
          }}
          style={baseInputStyle}
        />
      );

    case "string":
    default:
      if ("multiline" in type && type.multiline) {
        return (
          <textarea
            value={(value as string) ?? type.default ?? ""}
            onChange={(e) => onChange(e.target.value)}
            rows={2}
            style={{
              ...baseInputStyle,
              resize: "vertical",
              fontFamily: editorialFonts.body,
              minHeight: 48,
            }}
            placeholder={name}
          />
        );
      }
      return (
        <input
          type="text"
          value={(value as string) ?? type.default ?? ""}
          onChange={(e) => onChange(e.target.value)}
          style={baseInputStyle}
          placeholder={name}
        />
      );
  }
}

/* ─── Utilities ───────────────────────────────────── */

/** Build a JSX snippet for a component from its prop values. */
export function jsxFromProps(
  componentName: string,
  schema: Record<string, DSPropType>,
  values: Record<string, PropValue>
): string {
  const attrs: string[] = [];
  let childrenContent: string | null = null;

  for (const [propName, propType] of Object.entries(schema)) {
    const v = values[propName];
    if (v === undefined) continue;

    // Skip props whose value equals the default (cleaner output)
    if (propType.type === "boolean") {
      const def = propType.default ?? false;
      if (v === def) continue;
      // For booleans we render `loading` (shorthand) when true, omit when false
      if (v === true) attrs.push(propName);
      continue;
    }

    if (propType.type === "enum") {
      const def = propType.default ?? propType.values[0];
      if (v === def) continue;
      attrs.push(`${propName}="${String(v).replace(/"/g, '\\"')}"`);
      continue;
    }

    if (propType.type === "number") {
      const def = propType.default;
      if (v === def) continue;
      attrs.push(`${propName}={${v}}`);
      continue;
    }

    if (propType.type === "string") {
      const def = propType.default ?? "";
      if (v === def && propName !== "children") continue;

      if (propName === "children") {
        childrenContent = String(v);
      } else {
        attrs.push(`${propName}="${String(v).replace(/"/g, '\\"')}"`);
      }
    }
  }

  const attrsStr = attrs.length ? " " + attrs.join(" ") : "";

  if (childrenContent !== null) {
    return `<${componentName}${attrsStr}>${childrenContent}</${componentName}>`;
  }
  return `<${componentName}${attrsStr} />`;
}

/** Initial values for the controls, using each prop's declared default. */
export function initialValuesFromSchema(
  schema: Record<string, DSPropType>
): Record<string, PropValue> {
  const out: Record<string, PropValue> = {};
  for (const [name, type] of Object.entries(schema)) {
    if (type.type === "enum") {
      out[name] = type.default ?? type.values[0] ?? "";
    } else if (type.type === "boolean") {
      out[name] = type.default ?? false;
    } else if (type.type === "number") {
      out[name] = type.default ?? 0;
    } else {
      out[name] = type.default ?? "";
    }
  }
  return out;
}
