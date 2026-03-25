"use client";

import { createContext, useContext, useEffect, useState } from "react";

export type Role = "developer" | "designer";

const RoleContext = createContext<{
  role: Role;
  setRole: (role: Role) => void;
}>({ role: "developer", setRole: () => {} });

export function useRole() {
  return useContext(RoleContext);
}

export function RoleProvider({ children }: { children: React.ReactNode }) {
  const [role, setRole] = useState<Role>("developer");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("octopus-role") as Role | null;
    if (stored === "developer" || stored === "designer") {
      setRole(stored);
    }
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    localStorage.setItem("octopus-role", role);
  }, [role, mounted]);

  return (
    <RoleContext.Provider value={{ role, setRole }}>
      {children}
    </RoleContext.Provider>
  );
}
