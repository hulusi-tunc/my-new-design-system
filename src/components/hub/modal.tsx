"use client";

import {
  useEffect,
  useRef,
  type CSSProperties,
  type ReactNode,
  type MouseEvent,
} from "react";
import { createPortal } from "react-dom";
import { useTheme } from "@/components/providers/theme-provider";
import {
  getNd,
  getShadow,
  swatchRadii,
  zLayer,
  space,
} from "@/lib/nothing-tokens";
import { Label } from "./typography";
import { IconButton } from "./button";
import CloseLineIcon from "remixicon-react/CloseLineIcon";

type ModalSize = "sm" | "md" | "lg" | "xl";
const WIDTH: Record<ModalSize, number> = {
  sm: 420,
  md: 560,
  lg: 720,
  xl: 960,
};

interface ModalProps {
  open: boolean;
  onClose: () => void;
  size?: ModalSize;
  eyebrow?: string;
  title?: ReactNode;
  description?: ReactNode;
  children?: ReactNode;
  footer?: ReactNode;
  /** If true, clicking the backdrop does not close. Default false. */
  persistent?: boolean;
  /** Remove the default padding inside the body area. */
  bodyPad?: boolean;
  "aria-label"?: string;
}

export function Modal({
  open,
  onClose,
  size = "md",
  eyebrow,
  title,
  description,
  children,
  footer,
  persistent = false,
  bodyPad = true,
  "aria-label": ariaLabel,
}: ModalProps) {
  const { theme } = useTheme();
  const t = getNd(theme);
  const sh = getShadow(theme);
  const wrapperRef = useRef<HTMLDivElement | null>(null);

  // Escape + body scroll lock
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !persistent) onClose();
    };
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, persistent, onClose]);

  if (!open) return null;
  if (typeof document === "undefined") return null;

  const handleBackdropClick = (e: MouseEvent<HTMLDivElement>) => {
    if (persistent) return;
    if (e.target === wrapperRef.current) onClose();
  };

  const backdropStyle: CSSProperties = {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.6)",
    backdropFilter: "blur(4px)",
    WebkitBackdropFilter: "blur(4px)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: space[6],
    zIndex: zLayer.modal,
  };

  const cardStyle: CSSProperties = {
    width: "100%",
    maxWidth: WIDTH[size],
    maxHeight: "90vh",
    display: "flex",
    flexDirection: "column",
    background: t.surface,
    border: `1px solid ${t.border}`,
    borderRadius: swatchRadii.xl + 4,
    boxShadow: sh.high,
    overflow: "hidden",
  };

  return createPortal(
    <div
      ref={wrapperRef}
      role="dialog"
      aria-modal="true"
      aria-label={ariaLabel}
      onClick={handleBackdropClick}
      style={backdropStyle}
    >
      <div
        style={cardStyle}
        onClick={(e) => e.stopPropagation()}
      >
        {(eyebrow || title || description) && (
          <header
            style={{
              display: "flex",
              gap: space[4],
              padding: `${space[6]}px ${space[6]}px ${space[4]}px`,
            }}
          >
            <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: space[2] }}>
              {eyebrow && <Label>{eyebrow}</Label>}
              {title && (
                <h2
                  style={{
                    margin: 0,
                    fontFamily: "var(--font-space-grotesk), system-ui, sans-serif",
                    fontSize: 22,
                    fontWeight: 600,
                    letterSpacing: "-0.015em",
                    color: t.textDisplay,
                    lineHeight: 1.2,
                  }}
                >
                  {title}
                </h2>
              )}
              {description && (
                <p
                  style={{
                    margin: 0,
                    fontFamily: "var(--font-space-grotesk), system-ui, sans-serif",
                    fontSize: 14,
                    lineHeight: 1.55,
                    color: t.textSecondary,
                  }}
                >
                  {description}
                </p>
              )}
            </div>
            <IconButton
              variant="ghost"
              size="sm"
              aria-label="Close"
              onClick={onClose}
            >
              <CloseLineIcon size={16} />
            </IconButton>
          </header>
        )}

        <div
          style={{
            flex: 1,
            overflow: "auto",
            padding: bodyPad ? `0 ${space[6]}px ${space[6]}px` : 0,
          }}
        >
          {children}
        </div>

        {footer && (
          <footer
            style={{
              padding: `${space[4]}px ${space[6]}px`,
              borderTop: `1px solid ${t.border}`,
              display: "flex",
              gap: space[3],
              justifyContent: "flex-end",
              alignItems: "center",
            }}
          >
            {footer}
          </footer>
        )}
      </div>
    </div>,
    document.body
  );
}
