"use client";

import { useRole } from "@/components/providers/role-provider";
import { useTheme } from "@/components/providers/theme-provider";

export function DesignTip({
  children,
  title = "Design guideline",
}: {
  children: React.ReactNode;
  title?: string;
}) {
  const { role } = useRole();
  const { theme } = useTheme();

  if (role === "developer") return null;

  const isDark = theme === "dark";

  return (
    <div
      style={{
        borderLeft: "2px solid #7F56D9",
        background: isDark ? "rgba(127, 86, 217, 0.06)" : "rgba(127, 86, 217, 0.04)",
        borderRadius: 8,
        padding: "10px 14px",
        marginTop: 4,
        marginBottom: 4,
      }}
    >
      <span
        style={{
          display: "block",
          fontSize: 11,
          fontWeight: 600,
          color: isDark ? "#B692F6" : "#7F56D9",
          textTransform: "uppercase",
          letterSpacing: "0.05em",
          marginBottom: 4,
        }}
      >
        {title}
      </span>
      <span
        style={{
          fontSize: 13,
          lineHeight: 1.5,
          color: isDark ? "#D0D5DD" : "#475467",
        }}
      >
        {children}
      </span>
    </div>
  );
}
