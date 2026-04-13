"use client";

import { useState } from "react";
import { useTheme } from "@/components/providers/theme-provider";
import { getNd } from "@/lib/nothing-tokens";

export interface SearchFilterProps {
  query: string;
  onQueryChange: (query: string) => void;
  resultCount: number;
  totalCount: number;
  placeholder?: string;
}

export function SearchFilter({
  query,
  onQueryChange,
  resultCount,
  totalCount,
  placeholder = "Search...",
}: SearchFilterProps) {
  const { theme } = useTheme();
  const t = getNd(theme);
  const [focused, setFocused] = useState(false);

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        borderBottom: `1px solid ${focused ? t.textPrimary : t.borderVisible}`,
        transition:
          "border-color 200ms cubic-bezier(0.25, 0.1, 0.25, 1)",
        gap: 8,
      }}
    >
      {/* Search icon — monoline, 1.5px stroke */}
      <svg
        width={16}
        height={16}
        viewBox="0 0 24 24"
        fill="none"
        stroke={focused ? t.textPrimary : t.textSecondary}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{
          flexShrink: 0,
          transition:
            "stroke 200ms cubic-bezier(0.25, 0.1, 0.25, 1)",
        }}
      >
        <circle cx="11" cy="11" r="8" />
        <line x1="21" y1="21" x2="16.65" y2="16.65" />
      </svg>

      <input
        type="text"
        value={query}
        onChange={(e) => onQueryChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        placeholder={placeholder}
        style={{
          flex: 1,
          border: "none",
          outline: "none",
          background: "transparent",
          fontFamily:
            "'Space Grotesk', var(--font-space-grotesk), sans-serif",
          fontSize: 14,
          color: t.textPrimary,
          padding: "10px 0",
          minWidth: 0,
        }}
        aria-label="Search design systems"
      />

      {query && (
        <span
          style={{
            fontFamily:
              "'Space Mono', var(--font-space-mono), monospace",
            fontSize: 11,
            letterSpacing: "0.04em",
            color: t.textDisabled,
            flexShrink: 0,
          }}
        >
          {resultCount}/{totalCount}
        </span>
      )}

      {query && (
        <button
          onClick={() => onQueryChange("")}
          style={{
            background: "transparent",
            border: "none",
            color: t.textSecondary,
            cursor: "pointer",
            padding: 4,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transition:
              "color 150ms cubic-bezier(0.25, 0.1, 0.25, 1)",
          }}
          aria-label="Clear search"
        >
          <svg
            width={14}
            height={14}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.5}
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      )}
    </div>
  );
}
