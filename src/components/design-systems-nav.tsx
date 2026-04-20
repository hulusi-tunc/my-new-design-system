"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  useRef,
  useState,
  type CSSProperties,
  type FocusEvent,
} from "react";
import { useTheme } from "@/components/providers/theme-provider";
import { getNd, editorialFonts, swatchRadii } from "@/lib/nothing-tokens";
import { CATEGORIES, type PlatformCategory, type CategoryMeta } from "@/lib/platforms";
import {
  useCurrentCategory,
  setCurrentCategory,
} from "@/lib/use-current-category";

import CheckLineIcon from "remixicon-react/CheckLineIcon";

type Variant = "topnav" | "compact";

interface DesignSystemsNavProps {
  label?: string;
  variant?: Variant;
  active?: boolean;
}

const HOVER_CLOSE_DELAY = 140;

/**
 * "Design Systems" nav item with a hover-revealed category popover.
 *
 * - Click the label → navigates to /catalog/[lastChosenCategory]
 * - Hover the label or popover → popover opens (Web / Mobile)
 * - Click a popover item → navigates + persists cookie
 * - Keyboard focus opens the popover for a11y
 */
export function DesignSystemsNav({
  label = "Design Systems",
  variant = "topnav",
  active = false,
}: DesignSystemsNavProps) {
  const { theme } = useTheme();
  const t = getNd(theme);
  const router = useRouter();
  const category = useCurrentCategory();
  const [open, setOpen] = useState(false);
  const [hovered, setHovered] = useState(false);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearCloseTimer = () => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
  };

  const openNow = () => {
    clearCloseTimer();
    setOpen(true);
  };

  const scheduleClose = () => {
    clearCloseTimer();
    closeTimerRef.current = setTimeout(() => {
      setOpen(false);
    }, HOVER_CLOSE_DELAY);
  };

  const handleBlur = (e: FocusEvent<HTMLDivElement>) => {
    // Only close if focus leaves the wrapper entirely
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      scheduleClose();
    }
  };

  const handleSelect = (slug: PlatformCategory) => {
    setCurrentCategory(slug);
    setOpen(false);
    router.push(`/catalog/${slug}`);
  };

  const href = `/catalog/${category}`;

  // ── styles ──

  const compact = variant === "compact";

  const triggerStyle: CSSProperties = compact
    ? {
        fontFamily: editorialFonts.mono,
        fontSize: 11,
        letterSpacing: "0.08em",
        textTransform: "uppercase",
        fontWeight: 400,
        padding: "6px 10px",
        color: active || hovered ? t.textDisplay : t.textSecondary,
        textDecoration: "none",
        transition: "color 240ms cubic-bezier(0.165, 0.84, 0.44, 1)",
      }
    : {
        fontFamily: editorialFonts.body,
        fontSize: 14,
        fontWeight: active ? 600 : 500,
        color: active || hovered ? t.textDisplay : t.textSecondary,
        textDecoration: "none",
        padding: "6px 2px",
        transition: "color 120ms ease-out",
      };

  const menuStyle: CSSProperties = {
    position: "absolute",
    top: "calc(100% + 8px)",
    left: compact ? 4 : 0,
    minWidth: 260,
    background: t.surface,
    border: `1px solid ${t.borderVisible}`,
    borderRadius: swatchRadii.lg,
    boxShadow:
      theme === "dark"
        ? "0 12px 40px rgba(0,0,0,0.55)"
        : "0 12px 40px rgba(15,15,20,0.14)",
    padding: 6,
    zIndex: 60,
    fontFamily: editorialFonts.body,
  };

  return (
    <div
      onMouseEnter={() => {
        setHovered(true);
        openNow();
      }}
      onMouseLeave={() => {
        setHovered(false);
        scheduleClose();
      }}
      onFocus={openNow}
      onBlur={handleBlur}
      style={{ position: "relative", display: "inline-flex" }}
    >
      <Link
        href={href}
        style={triggerStyle}
        aria-haspopup="menu"
        aria-expanded={open}
      >
        {label}
      </Link>

      {open && (
        <div role="menu" style={menuStyle}>
          {CATEGORIES.map((meta) => (
            <CategoryOption
              key={meta.slug}
              meta={meta}
              active={meta.slug === category}
              onSelect={() => handleSelect(meta.slug)}
              t={t}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function CategoryOption({
  meta,
  active,
  onSelect,
  t,
}: {
  meta: CategoryMeta;
  active: boolean;
  onSelect: () => void;
  t: ReturnType<typeof getNd>;
}) {
  const [hovered, setHovered] = useState(false);
  return (
    <button
      type="button"
      role="menuitemradio"
      aria-checked={active}
      onClick={onSelect}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        width: "100%",
        padding: "10px 12px",
        background: hovered ? t.surfaceRaised : "transparent",
        border: "none",
        borderRadius: swatchRadii.md,
        cursor: "pointer",
        textAlign: "left",
        fontFamily: editorialFonts.body,
        transition: "background 120ms ease-out",
      }}
    >
      <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 2 }}>
        <span
          style={{
            fontSize: 13,
            fontWeight: active ? 600 : 500,
            color: t.textDisplay,
            lineHeight: 1.2,
          }}
        >
          {meta.label}
        </span>
        <span
          style={{
            fontSize: 11,
            color: t.textSecondary,
            lineHeight: 1.3,
          }}
        >
          {meta.description}
        </span>
      </div>
      <span
        style={{
          width: 16,
          height: 16,
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          opacity: active ? 1 : 0,
          color: t.textDisplay,
        }}
      >
        <CheckLineIcon size={14} />
      </span>
    </button>
  );
}
