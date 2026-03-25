"use client";

import { spacing, radius } from "@/styles/design-tokens";
import { useRole } from "@/components/providers/role-provider";
import { DesignTip } from "@/components/ui/design-tip";

export default function SpacingPage() {
  const { role } = useRole();

  return (
    <div className="px-10 py-14 max-w-4xl">
      <h1 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100 mb-2">
        Spacing & Radius
      </h1>
      <p className="text-[14px] text-neutral-500 dark:text-neutral-400 leading-relaxed mb-10 max-w-lg">
        Consistent spacing and border radius tokens for layout, padding, gaps, and rounded corners.
      </p>

      {/* Spacing */}
      <section id="spacing" className="mb-14">
        <h2 className="text-[11px] font-semibold text-neutral-400 dark:text-neutral-500 uppercase tracking-widest mb-5">
          Spacing
        </h2>
        <div className="space-y-2">
          {Object.entries(spacing).map(([k, v]) => (
            <div key={k} className="flex items-center gap-4">
              <span className="text-[12px] font-mono text-neutral-500 dark:text-neutral-400 w-10 shrink-0 text-right">{k}</span>
              <div
                className="h-4 bg-violet-200 dark:bg-violet-800 rounded-sm"
                style={{ width: Math.min(v, 200) }}
              />
              <span className="text-[11px] font-mono text-neutral-400 dark:text-neutral-500">{v}px</span>
            </div>
          ))}
        </div>
        {role === "developer" && (
          <pre className="mt-6">
            <code>{`import { spacing } from "@/styles/design-tokens"

spacing.md     // 8
spacing.xl     // 16
spacing["2xl"] // 20
spacing["4xl"] // 32`}</code>
          </pre>
        )}
        <DesignTip>Use 8px as your base unit. Most spacing tokens are multiples of 4 or 8 for consistent vertical rhythm.</DesignTip>
      </section>

      {/* Radius */}
      <section id="radius" className="mb-14">
        <h2 className="text-[11px] font-semibold text-neutral-400 dark:text-neutral-500 uppercase tracking-widest mb-5">
          Radius
        </h2>
        <div className="space-y-3">
          {Object.entries(radius).map(([k, v]) => (
            <div key={k} className="flex items-center gap-4">
              <span className="text-[12px] font-mono text-neutral-500 dark:text-neutral-400 w-10 shrink-0 text-right">{k}</span>
              <div
                className="w-12 h-12 border-2 border-violet-300 dark:border-violet-600 bg-violet-50 dark:bg-violet-950"
                style={{ borderRadius: Math.min(v, 9999) }}
              />
              <span className="text-[11px] font-mono text-neutral-400 dark:text-neutral-500">{v === 9999 ? "9999px (full)" : `${v}px`}</span>
            </div>
          ))}
        </div>
        {role === "developer" && (
          <pre className="mt-6">
            <code>{`import { radius } from "@/styles/design-tokens"

radius.sm   // 6
radius.md   // 8
radius.xl   // 12
radius.full // 9999`}</code>
          </pre>
        )}
        <DesignTip>Use sm–md radius for inputs and cards, lg–xl for modals and containers, full for avatars and pills.</DesignTip>
      </section>
    </div>
  );
}
