"use client";

import { useRole } from "@/components/providers/role-provider";
import { DesignTip } from "@/components/ui/design-tip";

export default function InstallationPage() {
  const { role } = useRole();

  return (
    <div className="max-w-2xl px-10 py-14">
      <h1 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100 mb-3">
        Installation
      </h1>
      <p className="text-[14px] text-neutral-500 dark:text-neutral-400 leading-relaxed mb-8">
        Add Octopus tokens to your project in two steps.
      </p>

      {role === "developer" ? (
        <>
          <section className="mb-8">
            <h2 className="text-[13px] font-medium text-neutral-900 dark:text-neutral-100 mb-2">
              1. Add the tokens file
            </h2>
            <p className="text-[13px] text-neutral-500 dark:text-neutral-400 mb-3">
              Copy <code>design-tokens.ts</code> to your styles directory.
            </p>
            <pre>
              <code>{`src/
  styles/
    design-tokens.ts`}</code>
            </pre>
          </section>

          <section className="mb-8">
            <h2 className="text-[13px] font-medium text-neutral-900 dark:text-neutral-100 mb-2">
              2. Import and use
            </h2>
            <pre>
              <code>{`import { colors } from "@/styles/design-tokens"

// Inline styles
<div style={{ background: colors.brand[600] }} />

// Tailwind arbitrary values
<div className="bg-[#7F56D9]" />`}</code>
            </pre>
          </section>

          <section>
            <h2 className="text-[13px] font-medium text-neutral-900 dark:text-neutral-100 mb-2">
              Scale reference
            </h2>
            <p className="text-[13px] text-neutral-500 dark:text-neutral-400 mb-3">
              Every palette uses the same 12-step scale:
            </p>
            <pre>
              <code>{`25     lightest — subtle backgrounds
50-100 backgrounds, hover states
200    borders, dividers
300    active borders
400    placeholder text
500    secondary text, icons
600    primary actions, buttons
700    hover on primary
800    active/pressed
900    high contrast text
950    darkest — near black`}</code>
            </pre>
          </section>
        </>
      ) : (
        <DesignTip title="For designers">
          This page covers developer setup. Head to the Foundations or Components sections to explore tokens, colors, typography, and UI components.
        </DesignTip>
      )}
    </div>
  );
}
