"use client";

import Link from "next/link";
import { useTheme } from "@/components/providers/theme-provider";
import { useRole, type Role } from "@/components/providers/role-provider";

function SunIcon() {
  return (
    <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="5" />
      <line x1="12" y1="1" x2="12" y2="3" />
      <line x1="12" y1="21" x2="12" y2="23" />
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
      <line x1="1" y1="12" x2="3" y2="12" />
      <line x1="21" y1="12" x2="23" y2="12" />
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  );
}

function RoleToggle() {
  const { role, setRole } = useRole();

  const options: { label: string; value: Role }[] = [
    { label: "Developer", value: "developer" },
    { label: "Designer", value: "designer" },
  ];

  return (
    <div className="flex rounded-full bg-neutral-100 dark:bg-neutral-800 p-0.5">
      {options.map((opt) => (
        <button
          key={opt.value}
          onClick={() => setRole(opt.value)}
          aria-pressed={role === opt.value}
          className={`px-2.5 py-1 text-[11px] font-medium rounded-full transition-colors ${
            role === opt.value
              ? "bg-white dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 shadow-sm"
              : "text-neutral-400 dark:text-neutral-500 hover:text-neutral-600 dark:hover:text-neutral-300"
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

export function DSHeader() {
  const { theme, toggle } = useTheme();

  return (
    <header className="fixed top-0 left-0 right-0 h-12 bg-white/90 dark:bg-[#0A0D12]/90 backdrop-blur-sm border-b border-neutral-100 dark:border-neutral-800 z-50 flex items-center px-5">
      <Link href="/" className="flex items-center gap-2 shrink-0">
        <span className="w-5 h-5 rounded bg-neutral-900 dark:bg-white flex items-center justify-center">
          <span className="text-white dark:text-neutral-900 text-[10px] font-bold leading-none">O</span>
        </span>
        <span className="text-[13px] font-semibold text-neutral-900 dark:text-neutral-100">Octopus</span>
      </Link>

      <div className="ml-auto flex items-center gap-3">
        <span className="text-[11px] text-neutral-300 dark:text-neutral-600 font-mono">v1.0.0</span>
        <RoleToggle />
        <button
          onClick={toggle}
          className="w-8 h-8 flex items-center justify-center rounded-md text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
          aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
        >
          {theme === "dark" ? <SunIcon /> : <MoonIcon />}
        </button>
      </div>
    </header>
  );
}
