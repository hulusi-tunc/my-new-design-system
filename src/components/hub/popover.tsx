"use client";

import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
  type FocusEvent,
} from "react";
import { useTheme } from "@/components/providers/theme-provider";
import {
  getNd,
  getShadow,
  motion,
  swatchRadii,
  zLayer,
} from "@/lib/nothing-tokens";

type Trigger = "hover" | "click";
type Placement = "bottom-start" | "bottom-end" | "bottom-center";

const HOVER_CLOSE_DELAY = 140;

interface PopoverProps {
  trigger: ReactNode;
  children: ReactNode;
  triggerKind?: Trigger;
  placement?: Placement;
  offset?: number;
  menuWidth?: number | string;
  /** Called when an item inside requests close (e.g. after selection) */
  onClose?: () => void;
}

/**
 * Headless-ish popover primitive. Handles hover-or-click trigger,
 * outside-click / escape / blur to close, and positioning relative to
 * the trigger. Content is rendered raw — callers style it or use
 * PopoverMenu helpers.
 */
export function Popover({
  trigger,
  children,
  triggerKind = "click",
  placement = "bottom-start",
  offset = 8,
  menuWidth,
  onClose,
}: PopoverProps) {
  const { theme } = useTheme();
  const t = getNd(theme);
  const sh = getShadow(theme);
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearCloseTimer = () => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
  };

  const close = () => {
    clearCloseTimer();
    setOpen(false);
    onClose?.();
  };

  const openNow = () => {
    clearCloseTimer();
    setOpen(true);
  };

  const scheduleClose = () => {
    clearCloseTimer();
    closeTimerRef.current = setTimeout(() => setOpen(false), HOVER_CLOSE_DELAY);
  };

  // Outside click + escape
  useEffect(() => {
    if (!open) return;
    const onDocClick = (e: MouseEvent) => {
      if (wrapperRef.current?.contains(e.target as Node)) return;
      close();
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onKey);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const handleBlur = (e: FocusEvent<HTMLDivElement>) => {
    if (!e.currentTarget.contains(e.relatedTarget as Node)) scheduleClose();
  };

  const wrapperHandlers =
    triggerKind === "hover"
      ? {
          onMouseEnter: openNow,
          onMouseLeave: scheduleClose,
          onFocus: openNow,
          onBlur: handleBlur,
        }
      : {};

  const triggerHandlers =
    triggerKind === "click"
      ? {
          onClick: () => setOpen((v) => !v),
        }
      : {};

  const menuLeft =
    placement === "bottom-end"
      ? "auto"
      : placement === "bottom-center"
        ? "50%"
        : 0;
  const menuRight = placement === "bottom-end" ? 0 : "auto";
  const menuTransform = placement === "bottom-center" ? "translateX(-50%)" : "none";

  const menuStyle: CSSProperties = {
    position: "absolute",
    top: `calc(100% + ${offset}px)`,
    left: menuLeft,
    right: menuRight,
    transform: menuTransform,
    minWidth: menuWidth ?? 220,
    background: t.surface,
    border: `1px solid ${t.borderVisible}`,
    borderRadius: swatchRadii.lg,
    boxShadow: sh.medium,
    padding: 6,
    zIndex: zLayer.popover,
    transition: motion.transition.chrome,
  };

  return (
    <div
      ref={wrapperRef}
      style={{ position: "relative", display: "inline-flex" }}
      {...wrapperHandlers}
    >
      <div
        {...triggerHandlers}
        style={{ display: "inline-flex", cursor: triggerKind === "click" ? "pointer" : undefined }}
        aria-haspopup="menu"
        aria-expanded={open}
      >
        {trigger}
      </div>

      {open && (
        <div ref={menuRef} role="menu" style={menuStyle}>
          {children}
        </div>
      )}
    </div>
  );
}

/* ── PopoverItem — styled row used inside Popover children ──────── */

interface PopoverItemProps {
  onSelect?: () => void;
  active?: boolean;
  leadingSlot?: ReactNode;
  trailingSlot?: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  disabled?: boolean;
}

export function PopoverItem({
  onSelect,
  active,
  leadingSlot,
  trailingSlot,
  title,
  description,
  disabled,
}: PopoverItemProps) {
  const { theme } = useTheme();
  const t = getNd(theme);
  const [hovered, setHovered] = useState(false);

  return (
    <button
      type="button"
      role="menuitem"
      disabled={disabled}
      onClick={onSelect}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        width: "100%",
        padding: "10px 12px",
        background: hovered && !disabled ? t.surfaceRaised : "transparent",
        border: "none",
        borderRadius: swatchRadii.md,
        cursor: disabled ? "not-allowed" : "pointer",
        textAlign: "left",
        transition: motion.transition.chrome,
        opacity: disabled ? 0.55 : 1,
      }}
    >
      {leadingSlot && (
        <span style={{ display: "inline-flex", color: t.textSecondary }}>
          {leadingSlot}
        </span>
      )}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 2 }}>
        <span
          style={{
            fontFamily: "var(--font-space-grotesk), system-ui, sans-serif",
            fontSize: 13,
            fontWeight: active ? 600 : 500,
            color: t.textDisplay,
            lineHeight: 1.2,
          }}
        >
          {title}
        </span>
        {description && (
          <span
            style={{
              fontFamily: "var(--font-space-grotesk), system-ui, sans-serif",
              fontSize: 11,
              color: t.textSecondary,
              lineHeight: 1.3,
            }}
          >
            {description}
          </span>
        )}
      </div>
      {trailingSlot}
    </button>
  );
}
