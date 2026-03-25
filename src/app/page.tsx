"use client";

import Link from "next/link";
import { useRole } from "@/components/providers/role-provider";

export default function Home() {
  const { role } = useRole();

  return (
    <div className="max-w-2xl px-10 py-14">
      <h1 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100 mb-3">
        Introduction
      </h1>
      <p className="text-[14px] text-neutral-500 dark:text-neutral-400 leading-relaxed mb-8">
        Octopus is a set of design tokens for building consistent interfaces.
        {role === "developer"
          ? " Import the tokens and use them directly in your components."
          : " Explore tokens, colors, typography, and components below."}
      </p>

      {role === "developer" && (
        <pre className="mb-10">
          <code>{`import { colors } from "@/styles/design-tokens"

colors.brand[600]   // #7F56D9
colors.error[500]   // #F04438
colors.gray[900]    // #181D27`}</code>
        </pre>
      )}

      <h2 className="text-sm font-medium text-neutral-900 dark:text-neutral-100 mb-4">Pages</h2>

      <div className="space-y-1">
        <Link
          href="/installation"
          className="group flex items-center justify-between py-2.5 px-3 -mx-3 rounded-md hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
        >
          <div>
            <p className="text-[13px] font-medium text-neutral-800 dark:text-neutral-200">Installation</p>
            <p className="text-[12px] text-neutral-400 dark:text-neutral-500">Setup and usage</p>
          </div>
          <svg className="w-3.5 h-3.5 text-neutral-300 dark:text-neutral-600 group-hover:text-neutral-500 dark:group-hover:text-neutral-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" />
          </svg>
        </Link>

        <Link
          href="/colors"
          className="group flex items-center justify-between py-2.5 px-3 -mx-3 rounded-md hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
        >
          <div>
            <p className="text-[13px] font-medium text-neutral-800 dark:text-neutral-200">Colors</p>
            <p className="text-[12px] text-neutral-400 dark:text-neutral-500">29 palettes, 340+ tokens</p>
          </div>
          <svg className="w-3.5 h-3.5 text-neutral-300 dark:text-neutral-600 group-hover:text-neutral-500 dark:group-hover:text-neutral-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" />
          </svg>
        </Link>

        <Link
          href="/typography"
          className="group flex items-center justify-between py-2.5 px-3 -mx-3 rounded-md hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
        >
          <div>
            <p className="text-[13px] font-medium text-neutral-800 dark:text-neutral-200">Typography</p>
            <p className="text-[12px] text-neutral-400 dark:text-neutral-500">Inter, 4 weights, 11 size steps</p>
          </div>
          <svg className="w-3.5 h-3.5 text-neutral-300 dark:text-neutral-600 group-hover:text-neutral-500 dark:group-hover:text-neutral-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" />
          </svg>
        </Link>

        <Link
          href="/spacing"
          className="group flex items-center justify-between py-2.5 px-3 -mx-3 rounded-md hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
        >
          <div>
            <p className="text-[13px] font-medium text-neutral-800 dark:text-neutral-200">Spacing & Radius</p>
            <p className="text-[12px] text-neutral-400 dark:text-neutral-500">15 spacing steps, 11 radius values</p>
          </div>
          <svg className="w-3.5 h-3.5 text-neutral-300 dark:text-neutral-600 group-hover:text-neutral-500 dark:group-hover:text-neutral-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" />
          </svg>
        </Link>

        <Link
          href="/buttons"
          className="group flex items-center justify-between py-2.5 px-3 -mx-3 rounded-md hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
        >
          <div>
            <p className="text-[13px] font-medium text-neutral-800 dark:text-neutral-200">Button</p>
            <p className="text-[12px] text-neutral-400 dark:text-neutral-500">5 variants, 4 sizes, destructive & loading</p>
          </div>
          <svg className="w-3.5 h-3.5 text-neutral-300 dark:text-neutral-600 group-hover:text-neutral-500 dark:group-hover:text-neutral-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      </div>
    </div>
  );
}
