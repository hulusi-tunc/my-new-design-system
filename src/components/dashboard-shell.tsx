"use client";

import { DSTopNav, TOPNAV_HEIGHT } from "@/components/ds-topnav";
import { useTheme } from "@/components/providers/theme-provider";
import { getNd } from "@/lib/nothing-tokens";

interface DashboardShellProps {
  children: React.ReactNode;
}

export function DashboardShell({ children }: DashboardShellProps) {
  const { theme } = useTheme();
  const t = getNd(theme);

  return (
    <div style={{ minHeight: "100vh", background: t.black }}>
      <DSTopNav />
      <main style={{ paddingTop: TOPNAV_HEIGHT }}>{children}</main>
    </div>
  );
}
