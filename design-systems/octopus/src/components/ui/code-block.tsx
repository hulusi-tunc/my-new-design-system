"use client";

import { useRole } from "@/components/providers/role-provider";

export function CodeBlock({ children }: { children: string }) {
  const { role } = useRole();

  if (role === "designer") return null;

  return (
    <pre className="text-[12px]">
      <code>{children}</code>
    </pre>
  );
}
