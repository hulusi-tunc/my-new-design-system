"use client";

import { useState, useCallback, type ReactNode } from "react";
import {
  SidebarNav,
  HeaderNav,
  NavItem,
  NavSection,
  NavDivider,
  NavExpandableItem,
  NavUserProfile,
  NavIconButton,
  NavMenuItem,
  NavMenuDivider,
  NavUserMenu,
  NavFooterCard,
  HeaderNavLink,
} from "@/components/ui/app-navigation";
import { Input } from "@/components/ui/input";
import { useTheme } from "@/components/providers/theme-provider";
import { getSemanticTokens } from "@/styles/design-tokens";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-12">
      <h2 className="text-[11px] font-semibold text-neutral-400 dark:text-neutral-500 uppercase tracking-widest mb-4">
        {title}
      </h2>
      {children}
    </section>
  );
}

function Preview({ children, noPad }: { children: React.ReactNode; noPad?: boolean }) {
  return (
    <div className={`border border-neutral-100 dark:border-neutral-800 rounded-lg overflow-hidden mb-3 ${noPad ? "" : "p-6"}`}>
      {children}
    </div>
  );
}

function Code({ children }: { children: string }) {
  return (
    <pre className="text-[12px]">
      <code>{children}</code>
    </pre>
  );
}

// ── Sample icons ─────────────────────────────────

const HomeIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
  </svg>
);
const DashboardIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /><rect x="14" y="14" width="7" height="7" />
  </svg>
);
const ProjectsIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2V3z" /><path d="M22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7V3z" />
  </svg>
);
const TasksIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 11l3 3L22 4" /><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" />
  </svg>
);
const UsersIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 00-3-3.87" /><path d="M16 3.13a4 4 0 010 7.75" />
  </svg>
);
const SettingsIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" />
  </svg>
);
const SupportIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" /><path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3" /><path d="M12 17h.01" />
  </svg>
);
const ReportingIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" />
  </svg>
);
const NotificationsIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 01-3.46 0" />
  </svg>
);
const CalendarIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);
const SearchIcon = ({ size = 20 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="9" cy="9" r="6" /><path d="M13.5 13.5L17 17" />
  </svg>
);
const LogoutIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" />
  </svg>
);
const FolderIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2v11z" />
  </svg>
);
const DocumentIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><polyline points="10 9 9 9 8 9" />
  </svg>
);
const InboxIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="22 12 16 12 14 15 10 15 8 12 2 12" /><path d="M5.45 5.11L2 12v6a2 2 0 002 2h16a2 2 0 002-2v-6l-3.45-6.89A2 2 0 0016.76 4H7.24a2 2 0 00-1.79 1.11z" />
  </svg>
);

const Logo = ({ white }: { white?: boolean }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
    <div style={{ width: 28, height: 28, borderRadius: 8, background: "#7F56D9", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <span style={{ color: "#fff", fontSize: 12, fontWeight: 700 }}>U</span>
    </div>
    <span style={{ fontSize: 16, fontWeight: 600, color: white ? "#fff" : undefined }}>Untitled UI</span>
  </div>
);

const UserAvatar = ({ name = "OR", src, size = 36 }: { name?: string; src?: string; size?: number }) => (
  src ? (
    <img src={src} alt={name} style={{ width: size, height: size, borderRadius: "50%", objectFit: "cover" }} />
  ) : (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        background: "linear-gradient(135deg, #F9F5FF, #E9D7FE)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: size * 0.38,
        fontWeight: 600,
        color: "#7F56D9",
        flexShrink: 0,
      }}
    >
      {name}
    </div>
  )
);

// ── Playground toggle ────────────────────────────

function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  const { theme, brandPalette } = useTheme();
  const t = getSemanticTokens(theme, brandPalette);

  return (
    <label
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        cursor: "pointer",
        fontSize: 13,
        lineHeight: "18px",
        fontWeight: 500,
        color: t.text.secondary,
        fontFamily: "var(--font-geist-sans), Inter, sans-serif",
        userSelect: "none",
      }}
    >
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        style={{
          width: 36,
          height: 20,
          borderRadius: 10,
          border: "none",
          padding: 2,
          cursor: "pointer",
          background: checked ? t.bg.brandSolid : t.bg.tertiary,
          transition: "background 150ms ease",
          flexShrink: 0,
          display: "flex",
          alignItems: "center",
        }}
      >
        <span
          style={{
            width: 16,
            height: 16,
            borderRadius: "50%",
            background: "#fff",
            boxShadow: "0 1px 3px rgba(0,0,0,0.15)",
            transition: "transform 150ms ease",
            transform: checked ? "translateX(16px)" : "translateX(0)",
          }}
        />
      </button>
      {label}
    </label>
  );
}

function ControlGroup({ title, children }: { title: string; children: ReactNode }) {
  const { theme, brandPalette } = useTheme();
  const t = getSemanticTokens(theme, brandPalette);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <div
        style={{
          fontSize: 11,
          fontWeight: 600,
          textTransform: "uppercase" as const,
          letterSpacing: "0.05em",
          color: t.text.quaternary,
          fontFamily: "var(--font-geist-sans), Inter, sans-serif",
        }}
      >
        {title}
      </div>
      {children}
    </div>
  );
}

// ── Sidebar Playground ───────────────────────────

function SidebarPlayground() {
  const { theme, brandPalette } = useTheme();
  const t = getSemanticTokens(theme, brandPalette);

  // Sidebar options
  const [darkVariant, setDarkVariant] = useState(false);
  const [showLogo, setShowLogo] = useState(true);
  const [showSearch, setShowSearch] = useState(true);

  // Footer options
  const [showFooter, setShowFooter] = useState(true);
  const [showEmail, setShowEmail] = useState(true);
  const [showOnline, setShowOnline] = useState(true);
  const [showLogout, setShowLogout] = useState(true);

  // Nav options
  const [showIcons, setShowIcons] = useState(true);
  const [showSectionHeadings, setShowSectionHeadings] = useState(false);
  const [showDivider, setShowDivider] = useState(true);
  const [showBadges, setShowBadges] = useState(true);
  const [showDots, setShowDots] = useState(false);
  const [showExpandable, setShowExpandable] = useState(false);

  // Extra options
  const [showFooterCard, setShowFooterCard] = useState(false);
  const [useAccountSwitcher, setUseAccountSwitcher] = useState(false);

  const [active, setActive] = useState("Dashboard");

  const isDark = darkVariant;

  const navItems = [
    { label: "Home", icon: <HomeIcon />, badge: undefined, dot: false },
    { label: "Dashboard", icon: <DashboardIcon />, badge: undefined, dot: false },
    { label: "Projects", icon: <ProjectsIcon />, badge: showBadges ? 3 : undefined, dot: false },
    { label: "Tasks", icon: <TasksIcon />, badge: showBadges ? 8 : undefined, dot: false },
    { label: "Reporting", icon: <ReportingIcon />, badge: undefined, dot: showDots },
    { label: "Users", icon: <UsersIcon />, badge: undefined, dot: false },
  ];

  const bottomItems = [
    { label: "Support", icon: <SupportIcon /> },
    { label: "Settings", icon: <SettingsIcon /> },
  ];

  return (
    <section className="mb-16">
      <h2 className="text-[11px] font-semibold text-neutral-400 dark:text-neutral-500 uppercase tracking-widest mb-4">
        Playground
      </h2>
      <div
        className="border border-neutral-100 dark:border-neutral-800 rounded-lg overflow-hidden"
        style={{ display: "flex", minHeight: 640 }}
      >
        {/* ── Live preview ── */}
        <div style={{ flexShrink: 0 }}>
          <SidebarNav
            variant={isDark ? "dark" : "default"}
            logo={showLogo ? <Logo white={isDark} /> : undefined}
            search={
              showSearch
                ? <Input inputSize="sm" leadingIcon={<SearchIcon size={20} />} placeholder="Search" />
                : undefined
            }
            footer={
              showFooter
                ? useAccountSwitcher
                  ? (
                    <NavUserMenu
                      accounts={[
                        { name: "Olivia Rhye", email: "olivia@untitledui.com", avatar: <UserAvatar />, online: showOnline },
                        { name: "Sienna Hewitt", email: "sienna@untitledui.com", avatar: <UserAvatar name="SH" /> },
                      ]}
                      menuItems={[
                        { label: "View profile", shortcut: "⌘K→P" },
                        { label: "Account settings", shortcut: "⌘S" },
                      ]}
                      onAddAccount={() => {}}
                      onSignOut={() => {}}
                      dark={isDark}
                    />
                  )
                  : (
                    <NavUserProfile
                      name="Olivia Rhye"
                      email={showEmail ? "olivia@untitledui.com" : undefined}
                      avatar={<UserAvatar />}
                      online={showOnline ? true : undefined}
                      trailing={showLogout ? <LogoutIcon /> : undefined}
                      dark={isDark}
                    />
                  )
                : undefined
            }
          >
            {/* Main nav items */}
            <NavSection label={showSectionHeadings ? "Main" : undefined} dark={isDark}>
              {showExpandable ? (
                <>
                  <NavItem
                    icon={showIcons ? <HomeIcon /> : undefined}
                    label="Home"
                    active={active === "Home"}
                    onClick={() => setActive("Home")}
                    dark={isDark}
                  />
                  <NavItem
                    icon={showIcons ? <DashboardIcon /> : undefined}
                    label="Dashboard"
                    active={active === "Dashboard"}
                    onClick={() => setActive("Dashboard")}
                    badge={showBadges ? "New" : undefined}
                    dot={showDots}
                    dark={isDark}
                  />
                  <NavExpandableItem
                    icon={showIcons ? <ProjectsIcon /> : undefined}
                    label="Projects"
                    badge={showBadges ? 3 : undefined}
                    defaultOpen
                    dark={isDark}
                  >
                    <NavItem label="Overview" active={active === "Overview"} onClick={() => setActive("Overview")} dark={isDark} />
                    <NavItem label="Analytics" active={active === "Analytics"} onClick={() => setActive("Analytics")} dark={isDark} />
                    <NavItem label="Reports" active={active === "Reports"} onClick={() => setActive("Reports")} badge={showBadges ? 5 : undefined} dark={isDark} />
                  </NavExpandableItem>
                  <NavExpandableItem
                    icon={showIcons ? <TasksIcon /> : undefined}
                    label="Tasks"
                    badge={showBadges ? 12 : undefined}
                    dark={isDark}
                  >
                    <NavItem label="My tasks" dark={isDark} />
                    <NavItem label="Assigned" dark={isDark} />
                  </NavExpandableItem>
                  <NavItem
                    icon={showIcons ? <UsersIcon /> : undefined}
                    label="Users"
                    active={active === "Users"}
                    onClick={() => setActive("Users")}
                    dark={isDark}
                  />
                </>
              ) : (
                navItems.map((item) => (
                  <NavItem
                    key={item.label}
                    icon={showIcons ? item.icon : undefined}
                    label={item.label}
                    badge={item.badge}
                    dot={item.dot}
                    dotColor={item.dot ? "#F04438" : undefined}
                    active={active === item.label}
                    onClick={() => setActive(item.label)}
                    dark={isDark}
                  />
                ))
              )}
            </NavSection>

            {showDivider && <NavDivider dark={isDark} />}

            {/* Bottom items */}
            <NavSection label={showSectionHeadings ? "Other" : undefined} dark={isDark}>
              {bottomItems.map((item) => (
                <NavItem
                  key={item.label}
                  icon={showIcons ? item.icon : undefined}
                  label={item.label}
                  active={active === item.label}
                  onClick={() => setActive(item.label)}
                  dark={isDark}
                />
              ))}
            </NavSection>

            {/* Footer card */}
            {showFooterCard && (
              <div style={{ marginTop: "auto", padding: "0 0 4px" }}>
                <NavFooterCard
                  variant="usage"
                  title="Used space"
                  progress={80}
                  description="Your team has used 80% of your available space."
                  onDismiss={() => {}}
                  primaryAction={{ label: "Upgrade plan" }}
                />
              </div>
            )}
          </SidebarNav>
        </div>

        {/* ── Controls panel ── */}
        <div
          style={{
            flex: 1,
            padding: 28,
            display: "flex",
            flexDirection: "column",
            gap: 24,
            background: t.bg.primary,
            borderLeft: `1px solid ${t.border.secondary}`,
            overflowY: "auto",
          }}
        >
          <div style={{ fontSize: 14, fontWeight: 600, color: t.text.primary, fontFamily: "var(--font-geist-sans), Inter, sans-serif" }}>
            Customize sidebar
          </div>

          <ControlGroup title="Appearance">
            <Toggle checked={darkVariant} onChange={setDarkVariant} label="Dark variant" />
            <Toggle checked={showLogo} onChange={setShowLogo} label="Logo" />
            <Toggle checked={showSearch} onChange={setShowSearch} label="Search bar" />
          </ControlGroup>

          <ControlGroup title="Footer / User profile">
            <Toggle checked={showFooter} onChange={setShowFooter} label="User profile" />
            <Toggle checked={useAccountSwitcher} onChange={setUseAccountSwitcher} label="Account switcher menu" />
            <Toggle checked={showEmail} onChange={setShowEmail} label="Email address" />
            <Toggle checked={showOnline} onChange={setShowOnline} label="Online indicator" />
            <Toggle checked={showLogout} onChange={setShowLogout} label="Logout icon" />
          </ControlGroup>

          <ControlGroup title="Navigation items">
            <Toggle checked={showIcons} onChange={setShowIcons} label="Icons" />
            <Toggle checked={showSectionHeadings} onChange={setShowSectionHeadings} label="Section headings" />
            <Toggle checked={showDivider} onChange={setShowDivider} label="Divider" />
            <Toggle checked={showBadges} onChange={setShowBadges} label="Badges" />
            <Toggle checked={showDots} onChange={setShowDots} label="Notification dots" />
            <Toggle checked={showExpandable} onChange={setShowExpandable} label="Expandable sub-items" />
          </ControlGroup>

          <ControlGroup title="Extras">
            <Toggle checked={showFooterCard} onChange={setShowFooterCard} label="Footer card (usage)" />
          </ControlGroup>
        </div>
      </div>
    </section>
  );
}

export default function NavigationPage() {
  const [sidebar1Active, setSidebar1Active] = useState("Dashboard");
  const [sidebar2Active, setSidebar2Active] = useState("Dashboard");
  const [sidebar3Active, setSidebar3Active] = useState("Dashboard");
  const [sidebar4Active, setSidebar4Active] = useState("Overview");
  const [sidebar5Active, setSidebar5Active] = useState("Home");
  const [headerActive, setHeaderActive] = useState("Dashboard");

  const mainNavItems = [
    { label: "Home", icon: <HomeIcon /> },
    { label: "Dashboard", icon: <DashboardIcon /> },
    { label: "Projects", icon: <ProjectsIcon /> },
    { label: "Tasks", icon: <TasksIcon />, badge: 8 },
    { label: "Reporting", icon: <ReportingIcon /> },
    { label: "Users", icon: <UsersIcon /> },
  ];

  return (
    <div className="px-10 py-14 max-w-5xl">
      <h1 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100 mb-2">
        Navigation
      </h1>
      <p className="text-[14px] text-neutral-500 dark:text-neutral-400 leading-relaxed mb-10 max-w-lg">
        Application navigation components — sidebar and header layouts with
        nav items, sections, badges, icons, dividers, user profiles, search,
        expandable sub-items, and dark variant.
      </p>

      {/* ── Playground ──────────────────────────────────── */}
      <SidebarPlayground />

      {/* ── 1. Sidebar with search & user profile ─────── */}
      <Section title="Sidebar with search & user profile">
        <Preview noPad>
          <div style={{ display: "flex", height: 620 }}>
            <SidebarNav
              logo={<Logo />}
              search={<Input inputSize="sm" leadingIcon={<SearchIcon size={20} />} placeholder="Search" />}
              footer={
                <NavUserProfile
                  name="Olivia Rhye"
                  email="olivia@untitledui.com"
                  avatar={<UserAvatar />}
                  online
                  trailing={<LogoutIcon />}
                />
              }
            >
              <NavSection>
                {mainNavItems.map((item) => (
                  <NavItem
                    key={item.label}
                    icon={item.icon}
                    label={item.label}
                    badge={item.badge}
                    active={sidebar1Active === item.label}
                    onClick={() => setSidebar1Active(item.label)}
                  />
                ))}
              </NavSection>

              <NavDivider />

              <NavSection>
                <NavItem icon={<SettingsIcon />} label="Settings" />
                <NavItem icon={<SupportIcon />} label="Support" />
              </NavSection>
            </SidebarNav>

            <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span className="text-neutral-300 dark:text-neutral-600 text-sm">Page content</span>
            </div>
          </div>
        </Preview>
        <Code>{`<SidebarNav
  logo={<Logo />}
  search={<Input leadingIcon={<SearchIcon />} placeholder="Search" />}
  footer={
    <NavUserProfile
      name="Olivia Rhye"
      email="olivia@untitledui.com"
      avatar={<Avatar />}
      online
      trailing={<LogoutIcon />}
    />
  }
>
  <NavSection>
    <NavItem icon={<HomeIcon />} label="Home" />
    <NavItem icon={<DashboardIcon />} label="Dashboard" active />
    <NavItem icon={<TasksIcon />} label="Tasks" badge={8} />
  </NavSection>
  <NavDivider />
  <NavSection>
    <NavItem icon={<SettingsIcon />} label="Settings" />
    <NavItem icon={<SupportIcon />} label="Support" />
  </NavSection>
</SidebarNav>`}</Code>
      </Section>

      {/* ── 2. Sidebar with section headings ───────────── */}
      <Section title="Sidebar with section headings">
        <Preview noPad>
          <div style={{ display: "flex", height: 520 }}>
            <SidebarNav
              logo={<Logo />}
              footer={<NavUserProfile name="Olivia Rhye" email="olivia@untitledui.com" avatar={<UserAvatar />} />}
            >
              <NavSection label="Main">
                <NavItem icon={<HomeIcon />} label="Home" />
                <NavItem icon={<DashboardIcon />} label="Dashboard" active={sidebar2Active === "Dashboard"} onClick={() => setSidebar2Active("Dashboard")} />
              </NavSection>
              <NavSection label="Workspace">
                <NavItem icon={<ProjectsIcon />} label="Projects" badge={3} active={sidebar2Active === "Projects"} onClick={() => setSidebar2Active("Projects")} />
                <NavItem icon={<TasksIcon />} label="Tasks" active={sidebar2Active === "Tasks"} onClick={() => setSidebar2Active("Tasks")} />
                <NavItem icon={<UsersIcon />} label="Team" active={sidebar2Active === "Team"} onClick={() => setSidebar2Active("Team")} />
              </NavSection>
            </SidebarNav>
            <div style={{ flex: 1 }} />
          </div>
        </Preview>
        <Code>{`<NavSection label="Main">
  <NavItem icon={<HomeIcon />} label="Home" active />
</NavSection>
<NavSection label="Workspace">
  <NavItem icon={<ProjectsIcon />} label="Projects" badge={3} />
</NavSection>`}</Code>
      </Section>

      {/* ── 3. Sidebar with expandable sub-items ──────── */}
      <Section title="Sidebar with expandable sub-items">
        <Preview noPad>
          <div style={{ display: "flex", height: 540 }}>
            <SidebarNav
              logo={<Logo />}
              footer={<NavUserProfile name="Olivia Rhye" email="olivia@untitledui.com" avatar={<UserAvatar />} online />}
            >
              <NavSection>
                <NavItem icon={<HomeIcon />} label="Home" />
                <NavItem icon={<DashboardIcon />} label="Dashboard" active={sidebar3Active === "Dashboard"} onClick={() => setSidebar3Active("Dashboard")} />
                <NavExpandableItem icon={<ProjectsIcon />} label="Projects" defaultOpen>
                  <NavItem label="Overview" active={sidebar3Active === "Overview"} onClick={() => setSidebar3Active("Overview")} />
                  <NavItem label="Notifications" dot active={sidebar3Active === "Notifications"} onClick={() => setSidebar3Active("Notifications")} />
                  <NavItem label="Analytics" active={sidebar3Active === "Analytics"} onClick={() => setSidebar3Active("Analytics")} />
                  <NavItem label="Saved reports" active={sidebar3Active === "Saved reports"} onClick={() => setSidebar3Active("Saved reports")} />
                </NavExpandableItem>
                <NavExpandableItem icon={<TasksIcon />} label="Tasks" badge={12}>
                  <NavItem label="Scheduled reports" />
                  <NavItem label="Notifications" />
                </NavExpandableItem>
                <NavItem icon={<UsersIcon />} label="Users" />
              </NavSection>

              <NavDivider />

              <NavSection>
                <NavItem icon={<SupportIcon />} label="Support" />
                <NavItem icon={<SettingsIcon />} label="Settings" />
              </NavSection>
            </SidebarNav>
            <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span className="text-neutral-300 dark:text-neutral-600 text-sm">Page content</span>
            </div>
          </div>
        </Preview>
        <Code>{`<NavExpandableItem icon={<ProjectsIcon />} label="Projects" defaultOpen>
  <NavItem label="Overview" active />
  <NavItem label="Notifications" dot />
  <NavItem label="Analytics" />
  <NavItem label="Saved reports" />
</NavExpandableItem>`}</Code>
      </Section>

      {/* ── 4. Sidebar — text only (no icons) ─────────── */}
      <Section title="Sidebar — text only (no icons)">
        <Preview noPad>
          <div style={{ display: "flex", height: 460 }}>
            <SidebarNav
              logo={<Logo />}
              footer={<NavUserProfile name="Olivia Rhye" email="olivia@untitledui.com" avatar={<UserAvatar />} />}
            >
              <NavSection label="Overview">
                <NavItem label="Notifications" active={sidebar4Active === "Notifications"} onClick={() => setSidebar4Active("Notifications")} badge={4} />
                <NavItem label="Analytics" active={sidebar4Active === "Analytics"} onClick={() => setSidebar4Active("Analytics")} />
                <NavItem label="Saved reports" active={sidebar4Active === "Saved reports"} onClick={() => setSidebar4Active("Saved reports")} />
                <NavItem label="Scheduled reports" active={sidebar4Active === "Scheduled reports"} onClick={() => setSidebar4Active("Scheduled reports")} />
                <NavItem label="Notifications" active={sidebar4Active === "Overview"} onClick={() => setSidebar4Active("Overview")} />
              </NavSection>
            </SidebarNav>
            <div style={{ flex: 1 }} />
          </div>
        </Preview>
        <Code>{`<NavSection label="Overview">
  <NavItem label="Notifications" badge={4} />
  <NavItem label="Analytics" active />
</NavSection>`}</Code>
      </Section>

      {/* ── 5. Dark sidebar variant ───────────────────── */}
      <Section title="Dark sidebar variant">
        <Preview noPad>
          <div style={{ display: "flex", height: 620 }}>
            <SidebarNav
              variant="dark"
              logo={<Logo white />}
              search={<Input inputSize="sm" leadingIcon={<SearchIcon size={20} />} placeholder="Search" />}
              footer={
                <NavUserProfile
                  name="Olivia Rhye"
                  email="olivia@untitledui.com"
                  avatar={<UserAvatar />}
                  online
                  trailing={<LogoutIcon />}
                  dark
                />
              }
            >
              <NavSection dark>
                {mainNavItems.map((item) => (
                  <NavItem
                    key={item.label}
                    icon={item.icon}
                    label={item.label}
                    badge={item.badge}
                    active={sidebar5Active === item.label}
                    onClick={() => setSidebar5Active(item.label)}
                    dark
                  />
                ))}
              </NavSection>

              <NavDivider dark />

              <NavSection dark>
                <NavItem icon={<SettingsIcon />} label="Settings" dark />
                <NavItem icon={<SupportIcon />} label="Support" dark />
              </NavSection>
            </SidebarNav>

            <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span className="text-neutral-300 dark:text-neutral-600 text-sm">Page content</span>
            </div>
          </div>
        </Preview>
        <Code>{`<SidebarNav variant="dark" logo={<Logo white />}>
  <NavSection dark>
    <NavItem icon={<HomeIcon />} label="Home" dark />
    <NavItem icon={<DashboardIcon />} label="Dashboard" active dark />
  </NavSection>
  <NavDivider dark />
  <NavSection dark>
    <NavItem icon={<SettingsIcon />} label="Settings" dark />
  </NavSection>
</SidebarNav>`}</Code>
      </Section>

      {/* ── 6. Sidebar with notification dots ──────────── */}
      <Section title="Sidebar with notification dots">
        <Preview noPad>
          <div style={{ display: "flex", height: 420 }}>
            <SidebarNav logo={<Logo />}>
              <NavSection>
                <NavItem icon={<HomeIcon />} label="Home" />
                <NavItem icon={<DashboardIcon />} label="Dashboard" active />
                <NavItem icon={<InboxIcon />} label="Inbox" dot dotColor="#F04438" />
                <NavItem icon={<NotificationsIcon />} label="Notifications" dot />
                <NavItem icon={<CalendarIcon />} label="Calendar" />
                <NavItem icon={<SettingsIcon />} label="Settings" />
              </NavSection>
            </SidebarNav>
            <div style={{ flex: 1 }} />
          </div>
        </Preview>
        <Code>{`<NavItem icon={<InboxIcon />} label="Inbox" dot dotColor="#F04438" />
<NavItem icon={<NotificationsIcon />} label="Notifications" dot />`}</Code>
      </Section>

      {/* ── 7. Sidebar with mixed content ─────────────── */}
      <Section title="Sidebar — full featured">
        <p className="text-[13px] text-neutral-500 dark:text-neutral-400 mb-4">
          Combining search, section headings, expandable items, badges, dots, divider, and user profile.
        </p>
        <Preview noPad>
          <div style={{ display: "flex", height: 660 }}>
            <SidebarNav
              logo={<Logo />}
              search={<Input inputSize="sm" leadingIcon={<SearchIcon size={20} />} placeholder="Search" />}
              footer={
                <NavUserProfile
                  name="Olivia Rhye"
                  email="olivia@untitledui.com"
                  avatar={<UserAvatar />}
                  online
                  trailing={<LogoutIcon />}
                />
              }
            >
              <NavSection label="Main">
                <NavItem icon={<HomeIcon />} label="Home" active />
                <NavItem icon={<DashboardIcon />} label="Dashboard" badge="New" />
                <NavItem icon={<InboxIcon />} label="Inbox" dot dotColor="#F04438" />
              </NavSection>

              <NavSection label="Workspace">
                <NavExpandableItem icon={<ProjectsIcon />} label="Projects" defaultOpen>
                  <NavItem label="All projects" active />
                  <NavItem label="Recent" />
                  <NavItem label="Favorites" badge={5} />
                </NavExpandableItem>
                <NavItem icon={<TasksIcon />} label="Tasks" badge={12} />
                <NavItem icon={<DocumentIcon />} label="Documents" />
                <NavItem icon={<CalendarIcon />} label="Calendar" />
              </NavSection>

              <NavDivider />

              <NavSection>
                <NavItem icon={<SupportIcon />} label="Support" />
                <NavItem icon={<SettingsIcon />} label="Settings" />
              </NavSection>
            </SidebarNav>

            <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span className="text-neutral-300 dark:text-neutral-600 text-sm">Page content</span>
            </div>
          </div>
        </Preview>
      </Section>

      {/* ── 8. Header navigation ──────────────────────── */}
      <Section title="Header navigation">
        <Preview noPad>
          <HeaderNav
            logo={<Logo />}
            actions={
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <NavItem icon={<SettingsIcon />} label="" onClick={() => {}} trailing={undefined} />
                <UserAvatar size={32} />
              </div>
            }
          >
            {["Home", "Dashboard", "Projects", "Tasks", "Reporting", "Users"].map((item) => (
              <HeaderNavLink
                key={item}
                label={item}
                active={headerActive === item}
                onClick={() => setHeaderActive(item)}
              />
            ))}
          </HeaderNav>
        </Preview>
        <Code>{`<HeaderNav logo={<Logo />} actions={<Avatar />}>
  <HeaderNavLink label="Home" />
  <HeaderNavLink label="Dashboard" active />
  <HeaderNavLink label="Projects" />
</HeaderNav>`}</Code>
      </Section>

      {/* ── 9. Nav item states ────────────────────────── */}
      <Section title="Nav item states">
        <Preview>
          <div style={{ width: 272, display: "flex", flexDirection: "column", gap: 2 }}>
            <NavItem icon={<HomeIcon />} label="Default" />
            <NavItem icon={<DashboardIcon />} label="Active" active />
            <NavItem icon={<TasksIcon />} label="With badge" badge={12} />
            <NavItem icon={<InboxIcon />} label="With dot" dot dotColor="#F04438" />
            <NavItem icon={<NotificationsIcon />} label="With dot (green)" dot />
            <NavItem label="Text only (no icon)" />
          </div>
        </Preview>
      </Section>

      {/* ── 10. NavDivider ────────────────────────────── */}
      <Section title="Nav divider">
        <Preview>
          <div style={{ width: 272, display: "flex", flexDirection: "column", gap: 2 }}>
            <NavItem icon={<HomeIcon />} label="Above divider" />
            <NavDivider />
            <NavItem icon={<SettingsIcon />} label="Below divider" />
          </div>
        </Preview>
        <Code>{`<NavDivider />`}</Code>
      </Section>

      {/* ── 11. NavUserProfile ────────────────────────── */}
      <Section title="User profile">
        <Preview>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 32 }}>
            <div style={{ width: 256 }}>
              <span className="text-[12px] text-neutral-500 dark:text-neutral-400 mb-2 block">With online indicator</span>
              <NavUserProfile name="Olivia Rhye" email="olivia@untitledui.com" avatar={<UserAvatar />} online trailing={<LogoutIcon />} />
            </div>
            <div style={{ width: 256 }}>
              <span className="text-[12px] text-neutral-500 dark:text-neutral-400 mb-2 block">Offline</span>
              <NavUserProfile name="Olivia Rhye" email="olivia@untitledui.com" avatar={<UserAvatar />} online={false} />
            </div>
            <div style={{ width: 256 }}>
              <span className="text-[12px] text-neutral-500 dark:text-neutral-400 mb-2 block">Name only</span>
              <NavUserProfile name="Olivia Rhye" avatar={<UserAvatar />} />
            </div>
          </div>
        </Preview>
        <Code>{`<NavUserProfile
  name="Olivia Rhye"
  email="olivia@untitledui.com"
  avatar={<Avatar />}
  online
  trailing={<LogoutIcon />}
/>`}</Code>
      </Section>

      {/* ── 12. Nav icon button ─────────────────────── */}
      <Section title="Nav icon button">
        <p className="text-[13px] text-neutral-500 dark:text-neutral-400 mb-4">
          Icon-only buttons for notification bells, settings, etc. Circle and square shapes with badge support.
        </p>
        <Preview>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 24 }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 6, alignItems: "center" }}>
              <span className="text-[11px] text-neutral-400 dark:text-neutral-500">Circle</span>
              <div style={{ display: "flex", gap: 8 }}>
                <NavIconButton icon={<NotificationsIcon />} shape="circle" aria-label="Notifications" />
                <NavIconButton icon={<NotificationsIcon />} shape="circle" active aria-label="Notifications" />
                <NavIconButton icon={<NotificationsIcon />} shape="circle" badge aria-label="Notifications" />
              </div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6, alignItems: "center" }}>
              <span className="text-[11px] text-neutral-400 dark:text-neutral-500">Square</span>
              <div style={{ display: "flex", gap: 8 }}>
                <NavIconButton icon={<NotificationsIcon />} shape="square" aria-label="Notifications" />
                <NavIconButton icon={<NotificationsIcon />} shape="square" active aria-label="Notifications" />
                <NavIconButton icon={<NotificationsIcon />} shape="square" badge aria-label="Notifications" />
              </div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6, alignItems: "center" }}>
              <span className="text-[11px] text-neutral-400 dark:text-neutral-500">Sizes</span>
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <NavIconButton icon={<NotificationsIcon />} size="sm" aria-label="Notifications" />
                <NavIconButton icon={<NotificationsIcon />} size="md" aria-label="Notifications" />
                <NavIconButton icon={<NotificationsIcon />} size="lg" aria-label="Notifications" />
              </div>
            </div>
          </div>
        </Preview>
        <Code>{`<NavIconButton icon={<BellIcon />} shape="circle" />
<NavIconButton icon={<BellIcon />} shape="square" active />
<NavIconButton icon={<BellIcon />} badge />`}</Code>
      </Section>

      {/* ── 13. Nav menu item ──────────────────────────── */}
      <Section title="Nav menu item">
        <p className="text-[13px] text-neutral-500 dark:text-neutral-400 mb-4">
          Dropdown menu items with icon, label, and optional keyboard shortcut.
        </p>
        <Preview>
          <div style={{ width: 260, display: "flex", flexDirection: "column", gap: 0 }}>
            <NavMenuItem
              icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>}
              label="View profile"
              shortcut="⌘K→P"
            />
            <NavMenuItem
              icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9" /></svg>}
              label="Account settings"
              shortcut="⌘S"
            />
            <NavMenuItem
              icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2V3z" /><path d="M22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7V3z" /></svg>}
              label="Documentation"
            />
            <NavMenuDivider />
            <NavMenuItem
              icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></svg>}
              label="Sign out"
            />
          </div>
        </Preview>
        <Code>{`<NavMenuItem icon={<ProfileIcon />} label="View profile" shortcut="⌘K→P" />
<NavMenuItem icon={<SettingsIcon />} label="Account settings" shortcut="⌘S" />
<NavMenuDivider />
<NavMenuItem icon={<LogoutIcon />} label="Sign out" />`}</Code>
      </Section>

      {/* ── 14. User menu (account switcher) ───────────── */}
      <Section title="User menu (account switcher)">
        <p className="text-[13px] text-neutral-500 dark:text-neutral-400 mb-4">
          Full user menu dropdown with profile actions, account switching, and sign out.
          Click the profile to open.
        </p>
        <Preview>
          <div style={{ width: 280, minHeight: 80 }}>
            <NavUserMenu
              accounts={[
                { name: "Olivia Rhye", email: "olivia@untitledui.com", avatar: <UserAvatar />, online: true },
                { name: "Sienna Hewitt", email: "sienna@untitledui.com", avatar: <UserAvatar name="SH" />, online: false },
              ]}
              menuItems={[
                { icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>, label: "View profile", shortcut: "⌘K→P" },
                { icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06" /></svg>, label: "Account settings", shortcut: "⌘S" },
                { icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2V3z" /><path d="M22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7V3z" /></svg>, label: "Documentation" },
              ]}
              onAddAccount={() => {}}
              onSignOut={() => {}}
            />
          </div>
        </Preview>
        <Code>{`<NavUserMenu
  accounts={[
    { name: "Olivia Rhye", email: "olivia@untitledui.com", online: true },
    { name: "Sienna Hewitt", email: "sienna@untitledui.com" },
  ]}
  menuItems={[
    { icon: <ProfileIcon />, label: "View profile", shortcut: "⌘K→P" },
    { icon: <SettingsIcon />, label: "Account settings", shortcut: "⌘S" },
  ]}
  onAddAccount={() => {}}
  onSignOut={() => {}}
/>`}</Code>
      </Section>

      {/* ── 15. Footer cards ──────────────────────────── */}
      <Section title="Sidebar footer cards">
        <p className="text-[13px] text-neutral-500 dark:text-neutral-400 mb-4">
          Banners for usage meters, new feature announcements, and upgrade prompts. Place inside the sidebar&apos;s nav area.
        </p>
        <Preview>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 16 }}>
            <div style={{ width: 252 }}>
              <span className="text-[12px] text-neutral-500 dark:text-neutral-400 mb-2 block">Usage</span>
              <NavFooterCard
                variant="usage"
                title="Used space"
                progress={80}
                description="Your team has used 80% of your available space. Need more?"
                onDismiss={() => {}}
                primaryAction={{ label: "Upgrade plan" }}
              />
            </div>
            <div style={{ width: 252 }}>
              <span className="text-[12px] text-neutral-500 dark:text-neutral-400 mb-2 block">Announcement</span>
              <NavFooterCard
                variant="announcement"
                title="New features available!"
                description="Check out the new dashboard view. Pages now load faster."
                onDismiss={() => {}}
                primaryAction={{ label: "What's new?" }}
              />
            </div>
            <div style={{ width: 252 }}>
              <span className="text-[12px] text-neutral-500 dark:text-neutral-400 mb-2 block">Upgrade</span>
              <NavFooterCard
                variant="upgrade"
                title="Upgrade to PRO"
                description="Unlock 500+ integrations, 40 GB data, and advanced reporting."
                primaryAction={{ label: "Upgrade now" }}
              />
            </div>
            <div style={{ width: 252 }}>
              <span className="text-[12px] text-neutral-500 dark:text-neutral-400 mb-2 block">Support</span>
              <NavFooterCard
                variant="support"
                title="Need help with something?"
                description="Our expert team is ready to help."
                primaryAction={{ label: "Chat to support" }}
                secondaryAction={{ label: "Learn more" }}
              />
            </div>
          </div>
        </Preview>
        <Code>{`<NavFooterCard variant="usage" progress={80} title="Used space"
  description="Your team has used 80%..." onDismiss={() => {}}
  primaryAction={{ label: "Upgrade plan" }} />

<NavFooterCard variant="announcement" title="New features!"
  description="Check out the new dashboard view."
  primaryAction={{ label: "What's new?" }} />

<NavFooterCard variant="upgrade" title="Upgrade to PRO"
  description="Unlock 500+ integrations..."
  primaryAction={{ label: "Upgrade now" }} />`}</Code>
      </Section>

      {/* ── 16. Sidebar with footer card ──────────────── */}
      <Section title="Sidebar with footer card">
        <Preview noPad>
          <div style={{ display: "flex", height: 560 }}>
            <SidebarNav
              logo={<Logo />}
              footer={<NavUserProfile name="Olivia Rhye" email="olivia@untitledui.com" avatar={<UserAvatar />} online trailing={<LogoutIcon />} />}
            >
              <NavSection>
                <NavItem icon={<HomeIcon />} label="Home" />
                <NavItem icon={<DashboardIcon />} label="Dashboard" active />
                <NavItem icon={<ProjectsIcon />} label="Projects" badge={3} />
                <NavItem icon={<TasksIcon />} label="Tasks" />
                <NavItem icon={<UsersIcon />} label="Users" />
              </NavSection>
              <NavDivider />
              <NavSection>
                <NavItem icon={<SettingsIcon />} label="Settings" />
                <NavItem icon={<SupportIcon />} label="Support" />
              </NavSection>
              <div style={{ marginTop: "auto", padding: "0 0 4px" }}>
                <NavFooterCard
                  variant="usage"
                  title="Used space"
                  progress={80}
                  description="Your team has used 80% of your available space."
                  onDismiss={() => {}}
                  primaryAction={{ label: "Upgrade plan" }}
                />
              </div>
            </SidebarNav>
            <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span className="text-neutral-300 dark:text-neutral-600 text-sm">Page content</span>
            </div>
          </div>
        </Preview>
      </Section>

      {/* ── 17. Sidebar with user menu ────────────────── */}
      <Section title="Sidebar with account switcher">
        <Preview noPad>
          <div style={{ display: "flex", height: 580 }}>
            <SidebarNav
              logo={<Logo />}
              footer={
                <NavUserMenu
                  accounts={[
                    { name: "Olivia Rhye", email: "olivia@untitledui.com", avatar: <UserAvatar />, online: true },
                    { name: "Sienna Hewitt", email: "sienna@untitledui.com", avatar: <UserAvatar name="SH" /> },
                  ]}
                  menuItems={[
                    { label: "View profile", shortcut: "⌘K→P" },
                    { label: "Account settings", shortcut: "⌘S" },
                    { label: "Documentation" },
                  ]}
                  onAddAccount={() => {}}
                  onSignOut={() => {}}
                />
              }
            >
              <NavSection>
                <NavItem icon={<HomeIcon />} label="Home" />
                <NavItem icon={<DashboardIcon />} label="Dashboard" active />
                <NavItem icon={<ProjectsIcon />} label="Projects" badge={3} />
                <NavItem icon={<TasksIcon />} label="Tasks" badge={8} />
                <NavItem icon={<ReportingIcon />} label="Reporting" />
                <NavItem icon={<UsersIcon />} label="Users" />
              </NavSection>
              <NavDivider />
              <NavSection>
                <NavItem icon={<SettingsIcon />} label="Settings" />
                <NavItem icon={<SupportIcon />} label="Support" />
              </NavSection>
            </SidebarNav>
            <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span className="text-neutral-300 dark:text-neutral-600 text-sm">Page content</span>
            </div>
          </div>
        </Preview>
        <Code>{`<SidebarNav
  footer={
    <NavUserMenu
      accounts={[...]}
      menuItems={[...]}
      onAddAccount={() => {}}
      onSignOut={() => {}}
    />
  }
>
  ...
</SidebarNav>`}</Code>
      </Section>

      {/* ── Usage ─────────────────────────────────────── */}
      <section className="pt-8 border-t border-neutral-100 dark:border-neutral-800">
        <h2 className="text-[11px] font-semibold text-neutral-400 dark:text-neutral-500 uppercase tracking-widest mb-3">
          Usage
        </h2>
        <Code>{`import {
  SidebarNav, HeaderNav,
  NavItem, NavSection, NavDivider,
  NavExpandableItem, NavUserProfile,
  NavIconButton, NavMenuItem, NavMenuDivider,
  NavUserMenu, NavFooterCard,
  HeaderNavLink,
} from "@/components/ui/app-navigation"

// Sidebar with all features
<SidebarNav
  logo={<Logo />}
  search={<Input leadingIcon={<SearchIcon />} placeholder="Search" />}
  footer={<NavUserProfile name="Olivia Rhye" email="olivia@untitledui.com" online />}
>
  <NavSection label="Main">
    <NavItem icon={<Icon />} label="Home" active />
    <NavItem icon={<Icon />} label="Inbox" dot dotColor="#F04438" />
  </NavSection>
  <NavDivider />
  <NavSection>
    <NavItem icon={<Icon />} label="Settings" />
  </NavSection>
</SidebarNav>

// Icon button
<NavIconButton icon={<BellIcon />} shape="circle" badge />

// User menu with account switching
<NavUserMenu
  accounts={[{ name: "Olivia Rhye", email: "olivia@untitledui.com", online: true }]}
  menuItems={[{ label: "View profile", shortcut: "⌘K→P" }]}
  onSignOut={() => {}}
/>

// Footer card
<NavFooterCard variant="usage" progress={80} title="Used space"
  primaryAction={{ label: "Upgrade" }} />`}</Code>
      </section>
    </div>
  );
}
