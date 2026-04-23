"use client";

import { forwardRef, useState, useRef, useEffect, type ReactNode, type HTMLAttributes } from "react";
import { useTheme } from "@/components/providers/theme-provider";
import { getSemanticTokens, colors, type SemanticTokens } from "@/styles/design-tokens";

// ── Helpers ──────────────────────────────────────

function useTokens(): SemanticTokens {
  const { theme, brandPalette } = useTheme();
  return getSemanticTokens(theme, brandPalette);
}

/** Dark-sidebar tokens: always use dark semantic tokens for the sidebar chrome,
 *  regardless of the page theme. */
function useDarkTokens(): SemanticTokens {
  const { brandPalette } = useTheme();
  return getSemanticTokens("dark", brandPalette);
}

// ── Nav Divider ──────────────────────────────────

export function NavDivider({ dark }: { dark?: boolean }) {
  const lightT = useTokens();
  const darkT = useDarkTokens();
  const t = dark ? darkT : lightT;

  return (
    <div
      style={{
        height: 1,
        background: t.border.secondary,
        margin: "8px 0",
      }}
    />
  );
}

// ── Nav User Profile ─────────────────────────────

export interface NavUserProfileProps {
  name: string;
  email?: string;
  avatar?: ReactNode;
  online?: boolean;
  trailing?: ReactNode;
  onClick?: () => void;
  dark?: boolean;
}

export function NavUserProfile({ name, email, avatar, online, trailing, onClick, dark }: NavUserProfileProps) {
  const lightT = useTokens();
  const darkT = useDarkTokens();
  const t = dark ? darkT : lightT;

  const defaultAvatar = (
    <div
      style={{
        width: 36,
        height: 36,
        borderRadius: "50%",
        background: t.bg.tertiary,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 14,
        fontWeight: 600,
        color: t.text.secondary,
        flexShrink: 0,
      }}
    >
      {name.charAt(0).toUpperCase()}
    </div>
  );

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: "4px 0",
        cursor: onClick ? "pointer" : "default",
        fontFamily: "var(--font-sans), system-ui, sans-serif",
      }}
      onClick={onClick}
    >
      <div style={{ position: "relative", flexShrink: 0 }}>
        {avatar || defaultAvatar}
        {online !== undefined && (
          <span
            style={{
              position: "absolute",
              bottom: 0,
              right: 0,
              width: 10,
              height: 10,
              borderRadius: "50%",
              background: online ? colors.success[500] : colors.gray[400],
              border: `2px solid ${t.bg.primary}`,
            }}
          />
        )}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontSize: 14,
            lineHeight: "20px",
            fontWeight: 600,
            color: t.text.primary,
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {name}
        </div>
        {email && (
          <div
            style={{
              fontSize: 14,
              lineHeight: "20px",
              fontWeight: 400,
              color: t.text.tertiary,
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {email}
          </div>
        )}
      </div>
      {trailing && (
        <span style={{ display: "flex", alignItems: "center", flexShrink: 0, color: t.fg.quaternary }}>
          {trailing}
        </span>
      )}
    </div>
  );
}

// ── Nav Item ──────────────────────────────────────

export interface NavItemProps {
  icon?: ReactNode;
  label: string;
  badge?: string | number;
  /** Show a small notification dot */
  dot?: boolean;
  dotColor?: string;
  active?: boolean;
  href?: string;
  onClick?: () => void;
  trailing?: ReactNode;
  /** Use dark-sidebar token palette */
  dark?: boolean;
}

export function NavItem({ icon, label, badge, dot, dotColor, active, href, onClick, trailing, dark }: NavItemProps) {
  const lightT = useTokens();
  const darkT = useDarkTokens();
  const t = dark ? darkT : lightT;

  const baseStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: 8,
    padding: "8px 12px",
    borderRadius: 6,
    fontSize: 14,
    lineHeight: "20px",
    fontWeight: 600,
    fontFamily: "var(--font-sans), system-ui, sans-serif",
    color: active ? t.text.secondaryHover : t.text.secondary,
    background: active ? t.bg.active : "transparent",
    cursor: "pointer",
    transition: "background 100ms, color 100ms",
    border: "none",
    width: "100%",
    textDecoration: "none",
    textAlign: "left",
  };

  const content = (
    <>
      {icon && (
        <span style={{ width: 20, height: 20, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, color: active ? t.fg.secondary : t.fg.tertiary }}>
          {icon}
        </span>
      )}
      <span style={{ flex: 1, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
        {label}
      </span>
      {dot && (
        <span
          style={{
            width: 8,
            height: 8,
            borderRadius: "50%",
            background: dotColor || colors.success[500],
            flexShrink: 0,
          }}
        />
      )}
      {badge !== undefined && (
        <span
          style={{
            fontSize: 12,
            lineHeight: "18px",
            fontWeight: 500,
            padding: "2px 8px",
            borderRadius: 9999,
            background: t.bg.secondary,
            border: `1px solid ${t.border.secondary}`,
            color: t.text.secondary,
            flexShrink: 0,
          }}
        >
          {badge}
        </span>
      )}
      {trailing && (
        <span style={{ width: 16, height: 16, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, color: t.fg.quaternary }}>
          {trailing}
        </span>
      )}
    </>
  );

  const hoverHandler = (e: React.MouseEvent<HTMLElement>) => {
    if (!active) {
      e.currentTarget.style.background = t.bg.primaryHover;
      e.currentTarget.style.color = t.text.secondaryHover;
    }
  };
  const leaveHandler = (e: React.MouseEvent<HTMLElement>) => {
    if (!active) {
      e.currentTarget.style.background = "transparent";
      e.currentTarget.style.color = t.text.secondary;
    }
  };

  if (href) {
    return (
      <a href={href} style={baseStyle} onMouseEnter={hoverHandler} onMouseLeave={leaveHandler}>
        {content}
      </a>
    );
  }

  return (
    <button type="button" onClick={onClick} style={baseStyle} onMouseEnter={hoverHandler} onMouseLeave={leaveHandler}>
      {content}
    </button>
  );
}

// ── Nav Expandable Item ──────────────────────────

export interface NavExpandableItemProps {
  icon?: ReactNode;
  label: string;
  badge?: string | number;
  defaultOpen?: boolean;
  children: ReactNode;
  dark?: boolean;
}

const ChevronIcon = ({ open, size = 16 }: { open: boolean; size?: number }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 16 16"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    style={{ transition: "transform 150ms ease", transform: open ? "rotate(90deg)" : "rotate(0deg)" }}
  >
    <path d="M6 4l4 4-4 4" />
  </svg>
);

export function NavExpandableItem({ icon, label, badge, defaultOpen = false, children, dark }: NavExpandableItemProps) {
  const [open, setOpen] = useState(defaultOpen);
  const lightT = useTokens();
  const darkT = useDarkTokens();
  const t = dark ? darkT : lightT;

  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          padding: "8px 12px",
          borderRadius: 6,
          fontSize: 14,
          lineHeight: "20px",
          fontWeight: 600,
          fontFamily: "var(--font-sans), system-ui, sans-serif",
          color: t.text.secondary,
          background: "transparent",
          cursor: "pointer",
          transition: "background 100ms, color 100ms",
          border: "none",
          width: "100%",
          textAlign: "left",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = t.bg.primaryHover;
          e.currentTarget.style.color = t.text.secondaryHover;
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = "transparent";
          e.currentTarget.style.color = t.text.secondary;
        }}
      >
        {icon && (
          <span style={{ width: 20, height: 20, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, color: t.fg.tertiary }}>
            {icon}
          </span>
        )}
        <span style={{ flex: 1, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
          {label}
        </span>
        {badge !== undefined && (
          <span
            style={{
              fontSize: 12,
              lineHeight: "18px",
              fontWeight: 500,
              padding: "2px 8px",
              borderRadius: 9999,
              background: t.bg.secondary,
              border: `1px solid ${t.border.secondary}`,
              color: t.text.secondary,
              flexShrink: 0,
            }}
          >
            {badge}
          </span>
        )}
        <span style={{ width: 16, height: 16, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, color: t.fg.quaternary }}>
          <ChevronIcon open={open} />
        </span>
      </button>
      {open && (
        <div style={{ display: "flex", flexDirection: "column", gap: 2, paddingLeft: 28, marginTop: 2 }}>
          {children}
        </div>
      )}
    </div>
  );
}

// ── Nav Section ───────────────────────────────────

export function NavSection({ label, children, dark }: { label?: string; children: ReactNode; dark?: boolean }) {
  const lightT = useTokens();
  const darkT = useDarkTokens();
  const t = dark ? darkT : lightT;

  return (
    <div style={{ marginBottom: 4 }}>
      {label && (
        <div
          style={{
            fontSize: 12,
            lineHeight: "18px",
            fontWeight: 600,
            color: t.text.quaternary,
            padding: "6px 12px",
            fontFamily: "var(--font-sans), system-ui, sans-serif",
          }}
        >
          {label}
        </div>
      )}
      <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
        {children}
      </div>
    </div>
  );
}

// ── Sidebar Navigation ────────────────────────────

export type SidebarVariant = "default" | "dark";

export interface SidebarNavProps extends HTMLAttributes<HTMLElement> {
  logo?: ReactNode;
  footer?: ReactNode;
  search?: ReactNode;
  width?: number;
  /** "dark" renders the sidebar with a dark background regardless of theme */
  variant?: SidebarVariant;
}

export const SidebarNav = forwardRef<HTMLElement, SidebarNavProps>(
  function SidebarNav({ logo, footer, search, width = 280, variant = "default", children, style, ...rest }, ref) {
    const lightT = useTokens();
    const darkT = useDarkTokens();
    const isDark = variant === "dark";
    const t = isDark ? darkT : lightT;

    return (
      <aside
        ref={ref}
        style={{
          width,
          height: "100%",
          display: "flex",
          flexDirection: "column",
          background: isDark ? colors.gray[900] : t.bg.primary,
          borderRight: `1px solid ${isDark ? colors.gray[800] : t.border.secondary}`,
          fontFamily: "var(--font-sans), system-ui, sans-serif",
          ...style,
        }}
        {...rest}
      >
        {/* Logo */}
        {logo && (
          <div style={{ padding: "24px 16px 8px" }}>
            {logo}
          </div>
        )}

        {/* Search */}
        {search && (
          <div style={{ padding: "0 12px 4px" }}>
            {search}
          </div>
        )}

        {/* Navigation */}
        <nav style={{ flex: 1, overflow: "auto", padding: "8px 12px" }}>
          {children}
        </nav>

        {/* Footer */}
        {footer && (
          <div style={{ borderTop: `1px solid ${isDark ? colors.gray[800] : t.border.secondary}`, padding: "16px 16px" }}>
            {footer}
          </div>
        )}
      </aside>
    );
  }
);

// ── Header Navigation ─────────────────────────────

export interface HeaderNavProps extends HTMLAttributes<HTMLElement> {
  logo?: ReactNode;
  actions?: ReactNode;
}

export const HeaderNav = forwardRef<HTMLElement, HeaderNavProps>(
  function HeaderNav({ logo, actions, children, style, ...rest }, ref) {
    const t = useTokens();

    return (
      <header
        ref={ref}
        style={{
          display: "flex",
          alignItems: "center",
          height: 72,
          padding: "0 16px 0 20px",
          background: t.bg.primary,
          borderBottom: `1px solid ${t.border.secondary}`,
          fontFamily: "var(--font-sans), system-ui, sans-serif",
          ...style,
        }}
        {...rest}
      >
        {logo && (
          <div style={{ marginRight: 24, display: "flex", alignItems: "center", flexShrink: 0 }}>
            {logo}
          </div>
        )}

        <nav style={{ display: "flex", alignItems: "center", gap: 4, flex: 1 }}>
          {children}
        </nav>

        {actions && (
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginLeft: 16, flexShrink: 0 }}>
            {actions}
          </div>
        )}
      </header>
    );
  }
);

// ── Header Nav Link ───────────────────────────────

export interface HeaderNavLinkProps {
  label: string;
  active?: boolean;
  href?: string;
  onClick?: () => void;
}

export function HeaderNavLink({ label, active, href, onClick }: HeaderNavLinkProps) {
  const t = useTokens();

  const baseStyle: React.CSSProperties = {
    fontSize: 14,
    lineHeight: "20px",
    fontWeight: 600,
    color: active ? t.text.secondaryHover : t.text.tertiary,
    padding: "8px 12px",
    borderRadius: 6,
    cursor: "pointer",
    background: active ? t.bg.active : "transparent",
    border: "none",
    textDecoration: "none",
    transition: "background 100ms, color 100ms",
    whiteSpace: "nowrap",
    fontFamily: "var(--font-sans), system-ui, sans-serif",
  };

  const hoverHandler = (e: React.MouseEvent<HTMLElement>) => {
    if (!active) {
      e.currentTarget.style.background = t.bg.primaryHover;
      e.currentTarget.style.color = t.text.secondaryHover;
    }
  };
  const leaveHandler = (e: React.MouseEvent<HTMLElement>) => {
    if (!active) {
      e.currentTarget.style.background = "transparent";
      e.currentTarget.style.color = t.text.tertiary;
    }
  };

  if (href) {
    return (
      <a href={href} style={baseStyle} onMouseEnter={hoverHandler} onMouseLeave={leaveHandler}>
        {label}
      </a>
    );
  }

  return (
    <button type="button" onClick={onClick} style={baseStyle} onMouseEnter={hoverHandler} onMouseLeave={leaveHandler}>
      {label}
    </button>
  );
}

// ── Nav Icon Button ──────────────────────────────

export type NavIconButtonShape = "circle" | "square";
export type NavIconButtonSize = "sm" | "md" | "lg";

export interface NavIconButtonProps {
  icon: ReactNode;
  shape?: NavIconButtonShape;
  size?: NavIconButtonSize;
  active?: boolean;
  badge?: boolean;
  onClick?: () => void;
  dark?: boolean;
  "aria-label"?: string;
}

const iconBtnSizes: Record<NavIconButtonSize, { box: number; icon: number; radius: number; squareRadius: number }> = {
  sm: { box: 36, icon: 20, radius: 9999, squareRadius: 8 },
  md: { box: 40, icon: 20, radius: 9999, squareRadius: 10 },
  lg: { box: 44, icon: 24, radius: 9999, squareRadius: 10 },
};

export function NavIconButton({ icon, shape = "circle", size = "md", active, badge, onClick, dark, ...rest }: NavIconButtonProps) {
  const lightT = useTokens();
  const darkT = useDarkTokens();
  const t = dark ? darkT : lightT;
  const c = iconBtnSizes[size];

  const baseStyle: React.CSSProperties = {
    width: c.box,
    height: c.box,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: shape === "circle" ? c.radius : c.squareRadius,
    border: active ? `1px solid ${t.border.brand}` : "1px solid transparent",
    background: active ? t.bg.brandPrimary : "transparent",
    color: active ? t.fg.brandPrimary : t.fg.tertiary,
    cursor: "pointer",
    transition: "all 120ms ease",
    position: "relative",
    padding: 0,
    flexShrink: 0,
  };

  return (
    <button
      type="button"
      onClick={onClick}
      style={baseStyle}
      onMouseEnter={(e) => {
        if (!active) {
          e.currentTarget.style.background = t.bg.primaryHover;
          e.currentTarget.style.color = t.fg.secondary;
        }
      }}
      onMouseLeave={(e) => {
        if (!active) {
          e.currentTarget.style.background = "transparent";
          e.currentTarget.style.color = t.fg.tertiary;
        }
      }}
      onFocus={(e) => {
        e.currentTarget.style.boxShadow = `0 0 0 4px ${t.bg.brandSecondary}`;
        e.currentTarget.style.borderColor = t.border.brand;
      }}
      onBlur={(e) => {
        e.currentTarget.style.boxShadow = "none";
        if (!active) e.currentTarget.style.borderColor = "transparent";
      }}
      {...rest}
    >
      <span style={{ width: c.icon, height: c.icon, display: "flex", alignItems: "center", justifyContent: "center" }}>
        {icon}
      </span>
      {badge && (
        <span
          style={{
            position: "absolute",
            top: shape === "circle" ? 8 : 6,
            right: shape === "circle" ? 8 : 6,
            width: 8,
            height: 8,
            borderRadius: "50%",
            background: colors.error[500],
            border: `2px solid ${t.bg.primary}`,
          }}
        />
      )}
    </button>
  );
}

// ── Nav Menu Item ────────────────────────────────

export interface NavMenuItemProps {
  icon?: ReactNode;
  label: string;
  shortcut?: string;
  onClick?: () => void;
  destructive?: boolean;
  dark?: boolean;
}

export function NavMenuItem({ icon, label, shortcut, onClick, destructive, dark }: NavMenuItemProps) {
  const lightT = useTokens();
  const darkT = useDarkTokens();
  const t = dark ? darkT : lightT;

  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        width: "100%",
        padding: "9px 12px",
        border: "none",
        background: "transparent",
        cursor: "pointer",
        fontFamily: "var(--font-sans), system-ui, sans-serif",
        fontSize: 14,
        lineHeight: "20px",
        fontWeight: 500,
        color: destructive ? t.text.errorPrimary : t.text.secondary,
        textAlign: "left",
        transition: "background 100ms",
        borderRadius: 6,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = t.bg.primaryHover;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = "transparent";
      }}
    >
      {icon && (
        <span style={{ width: 16, height: 16, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, color: destructive ? t.fg.errorPrimary : t.fg.tertiary }}>
          {icon}
        </span>
      )}
      <span style={{ flex: 1 }}>{label}</span>
      {shortcut && (
        <span style={{ fontSize: 12, lineHeight: "18px", color: t.text.quaternary, flexShrink: 0 }}>
          {shortcut}
        </span>
      )}
    </button>
  );
}

// ── Nav Menu Divider ─────────────────────────────

export function NavMenuDivider({ dark }: { dark?: boolean }) {
  const lightT = useTokens();
  const darkT = useDarkTokens();
  const t = dark ? darkT : lightT;

  return <div style={{ height: 1, background: t.border.secondary, margin: "4px 0" }} />;
}

// ── Nav User Menu ────────────────────────────────

export interface NavUserMenuAccount {
  name: string;
  email: string;
  avatar?: ReactNode;
  online?: boolean;
}

export interface NavUserMenuProps {
  accounts: NavUserMenuAccount[];
  activeIndex?: number;
  onSwitch?: (index: number) => void;
  onAddAccount?: () => void;
  onSignOut?: () => void;
  menuItems?: { icon?: ReactNode; label: string; shortcut?: string; onClick?: () => void }[];
  dark?: boolean;
}

export function NavUserMenu({ accounts, activeIndex = 0, onSwitch, onAddAccount, onSignOut, menuItems, dark }: NavUserMenuProps) {
  const lightT = useTokens();
  const darkT = useDarkTokens();
  const t = dark ? darkT : lightT;
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const active = accounts[activeIndex] || accounts[0];

  // Close on click outside
  useEffect(() => {
    if (!open) return;
    function handler(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const chevronUpDown = (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 6l3-3 3 3" /><path d="M5 10l3 3 3-3" />
    </svg>
  );

  return (
    <div ref={containerRef} style={{ position: "relative", fontFamily: "var(--font-sans), system-ui, sans-serif" }}>
      {/* Trigger */}
      <button
        type="button"
        onClick={() => setOpen(!open)}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          width: "100%",
          padding: "4px 0",
          border: "none",
          background: "transparent",
          cursor: "pointer",
          textAlign: "left",
        }}
      >
        <div style={{ position: "relative", flexShrink: 0 }}>
          {active.avatar || (
            <div style={{ width: 36, height: 36, borderRadius: "50%", background: t.bg.tertiary, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 600, color: t.text.secondary }}>
              {active.name.charAt(0)}
            </div>
          )}
          {active.online !== undefined && (
            <span style={{ position: "absolute", bottom: 0, right: 0, width: 10, height: 10, borderRadius: "50%", background: active.online ? colors.success[500] : colors.gray[400], border: `2px solid ${t.bg.primary}` }} />
          )}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 14, lineHeight: "20px", fontWeight: 600, color: t.text.primary, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{active.name}</div>
          <div style={{ fontSize: 14, lineHeight: "20px", fontWeight: 400, color: t.text.tertiary, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{active.email}</div>
        </div>
        <span style={{ flexShrink: 0, color: t.fg.quaternary, display: "flex" }}>{chevronUpDown}</span>
      </button>

      {/* Dropdown */}
      {open && (
        <div
          style={{
            position: "absolute",
            bottom: "calc(100% + 8px)",
            left: 0,
            width: 280,
            background: t.bg.primary,
            border: `1px solid ${t.border.secondary}`,
            borderRadius: 10,
            boxShadow: "0 12px 24px -4px rgba(0,0,0,0.12), 0 4px 8px -2px rgba(0,0,0,0.06)",
            padding: "4px 0",
            zIndex: 50,
          }}
        >
          {/* Menu items */}
          {menuItems && menuItems.length > 0 && (
            <div style={{ padding: "4px 6px" }}>
              {menuItems.map((item, i) => (
                <NavMenuItem
                  key={i}
                  icon={item.icon}
                  label={item.label}
                  shortcut={item.shortcut}
                  onClick={() => { item.onClick?.(); setOpen(false); }}
                />
              ))}
            </div>
          )}

          {menuItems && menuItems.length > 0 && <NavMenuDivider />}

          {/* Switch account */}
          {accounts.length > 1 && (
            <>
              <div style={{ padding: "8px 16px 4px", fontSize: 12, lineHeight: "18px", fontWeight: 600, color: t.text.quaternary }}>
                Switch account
              </div>
              <div style={{ padding: "0 6px" }}>
                {accounts.map((acc, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => { onSwitch?.(i); setOpen(false); }}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      width: "100%",
                      padding: "8px 10px",
                      border: "none",
                      background: "transparent",
                      cursor: "pointer",
                      textAlign: "left",
                      borderRadius: 6,
                      transition: "background 100ms",
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = t.bg.primaryHover; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
                  >
                    <div style={{ position: "relative", flexShrink: 0 }}>
                      {acc.avatar || (
                        <div style={{ width: 32, height: 32, borderRadius: "50%", background: t.bg.tertiary, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 600, color: t.text.secondary }}>
                          {acc.name.charAt(0)}
                        </div>
                      )}
                      {acc.online !== undefined && (
                        <span style={{ position: "absolute", bottom: -1, right: -1, width: 10, height: 10, borderRadius: "50%", background: acc.online ? colors.success[500] : colors.gray[400], border: `2px solid ${t.bg.primary}` }} />
                      )}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 14, lineHeight: "20px", fontWeight: 600, color: t.text.primary, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{acc.name}</div>
                      <div style={{ fontSize: 14, lineHeight: "20px", fontWeight: 400, color: t.text.tertiary, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{acc.email}</div>
                    </div>
                    {/* Radio indicator */}
                    <span
                      style={{
                        width: 16,
                        height: 16,
                        borderRadius: "50%",
                        border: `2px solid ${i === activeIndex ? t.fg.brandPrimary : t.border.primary}`,
                        background: i === activeIndex ? t.fg.brandPrimary : "transparent",
                        flexShrink: 0,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      {i === activeIndex && (
                        <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#fff" }} />
                      )}
                    </span>
                  </button>
                ))}
              </div>
            </>
          )}

          {/* Add account */}
          {onAddAccount && (
            <div style={{ padding: "4px 6px" }}>
              <button
                type="button"
                onClick={() => { onAddAccount(); setOpen(false); }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 6,
                  width: "100%",
                  padding: "8px 12px",
                  border: `1px solid ${t.border.secondary}`,
                  borderRadius: 6,
                  background: "transparent",
                  cursor: "pointer",
                  fontSize: 14,
                  lineHeight: "20px",
                  fontWeight: 500,
                  color: t.text.secondary,
                  fontFamily: "inherit",
                  transition: "background 100ms",
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = t.bg.primaryHover; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <line x1="8" y1="3" x2="8" y2="13" /><line x1="3" y1="8" x2="13" y2="8" />
                </svg>
                Add account
              </button>
            </div>
          )}

          {/* Sign out */}
          {onSignOut && (
            <>
              <NavMenuDivider />
              <div style={{ padding: "4px 6px" }}>
                <NavMenuItem
                  icon={
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" />
                    </svg>
                  }
                  label="Sign out"
                  onClick={() => { onSignOut(); setOpen(false); }}
                />
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

// ── Nav Footer Card ──────────────────────────────

export type NavFooterCardVariant = "usage" | "announcement" | "upgrade" | "support";

export interface NavFooterCardProps {
  variant?: NavFooterCardVariant;
  title?: string;
  description?: string;
  /** 0-100 for usage variant */
  progress?: number;
  primaryAction?: { label: string; onClick?: () => void };
  secondaryAction?: { label: string; onClick?: () => void };
  onDismiss?: () => void;
  dark?: boolean;
}

export function NavFooterCard({
  variant = "announcement",
  title,
  description,
  progress,
  primaryAction,
  secondaryAction,
  onDismiss,
  dark,
}: NavFooterCardProps) {
  const lightT = useTokens();
  const darkT = useDarkTokens();
  const t = dark ? darkT : lightT;

  const cardStyle: React.CSSProperties = {
    padding: 16,
    borderRadius: 10,
    border: `1px solid ${t.border.secondary}`,
    background: t.bg.primary,
    fontFamily: "var(--font-sans), system-ui, sans-serif",
    display: "flex",
    flexDirection: "column",
    gap: 12,
  };

  return (
    <div style={cardStyle}>
      {/* Usage progress bar */}
      {variant === "usage" && progress !== undefined && (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontSize: 14, fontWeight: 600, color: t.text.primary }}>{title || "Used space"}</span>
            <span style={{ fontSize: 14, fontWeight: 600, color: t.text.primary }}>{progress}%</span>
          </div>
          <div style={{ height: 8, borderRadius: 4, background: t.bg.tertiary, overflow: "hidden" }}>
            <div
              style={{
                height: "100%",
                width: `${Math.min(100, Math.max(0, progress))}%`,
                borderRadius: 4,
                background: progress >= 80 ? colors.warning[500] : t.bg.brandSolid,
                transition: "width 300ms ease",
              }}
            />
          </div>
          {description && (
            <span style={{ fontSize: 13, lineHeight: "18px", color: t.text.tertiary }}>{description}</span>
          )}
        </div>
      )}

      {/* Announcement / Upgrade / Support */}
      {variant !== "usage" && (
        <>
          {title && (
            <div style={{ fontSize: 14, fontWeight: 600, color: t.text.primary, lineHeight: "20px" }}>
              {variant === "announcement" && (
                <span style={{ display: "inline-block", marginRight: 6 }}>
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ verticalAlign: "text-bottom" }}>
                    <circle cx="8" cy="8" r="7" stroke={t.fg.brandPrimary} strokeWidth="1.5" />
                    <path d="M8 5v3" stroke={t.fg.brandPrimary} strokeWidth="1.5" strokeLinecap="round" />
                    <circle cx="8" cy="11" r="0.75" fill={t.fg.brandPrimary} />
                  </svg>
                </span>
              )}
              {variant === "upgrade" && (
                <span style={{ display: "inline-block", marginRight: 6 }}>
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ verticalAlign: "text-bottom" }}>
                    <path d="M8 2l2 4h4l-3 3 1 4-4-2-4 2 1-4-3-3h4l2-4z" fill={colors.warning[400]} />
                  </svg>
                </span>
              )}
              {title}
            </div>
          )}
          {description && (
            <span style={{ fontSize: 13, lineHeight: "18px", color: t.text.tertiary }}>{description}</span>
          )}
        </>
      )}

      {/* Actions */}
      {(primaryAction || secondaryAction || onDismiss) && (
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          {onDismiss && (
            <button
              type="button"
              onClick={onDismiss}
              style={{
                padding: 0,
                border: "none",
                background: "transparent",
                fontSize: 14,
                fontWeight: 600,
                color: t.text.tertiary,
                cursor: "pointer",
                fontFamily: "inherit",
              }}
            >
              Dismiss
            </button>
          )}
          {secondaryAction && (
            <button
              type="button"
              onClick={secondaryAction.onClick}
              style={{
                padding: 0,
                border: "none",
                background: "transparent",
                fontSize: 14,
                fontWeight: 600,
                color: t.text.tertiary,
                cursor: "pointer",
                fontFamily: "inherit",
              }}
            >
              {secondaryAction.label}
            </button>
          )}
          {primaryAction && (
            <button
              type="button"
              onClick={primaryAction.onClick}
              style={{
                padding: variant === "upgrade" ? "8px 14px" : 0,
                border: variant === "upgrade" ? `1px solid ${t.border.brand}` : "none",
                borderRadius: variant === "upgrade" ? 8 : 0,
                background: variant === "upgrade" ? t.bg.brandSolid : "transparent",
                fontSize: 14,
                fontWeight: 600,
                color: variant === "upgrade" ? t.text.white : t.fg.brandPrimary,
                cursor: "pointer",
                fontFamily: "inherit",
                width: variant === "upgrade" ? "100%" : "auto",
              }}
            >
              {primaryAction.label}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
