"use client";

import { useState } from "react";
import { Tag, type TagSize } from "@/components/ui/tag";
import { CodeBlock } from "@/components/ui/code-block";
import { DesignTip } from "@/components/ui/design-tip";

const sizes: TagSize[] = ["sm", "md", "lg"];

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

function Preview({ children }: { children: React.ReactNode }) {
  return (
    <div className="border border-neutral-100 dark:border-neutral-800 rounded-lg p-6 flex flex-wrap items-center gap-3 mb-3">
      {children}
    </div>
  );
}


export default function TagsPage() {
  const [checked, setChecked] = useState<Record<string, boolean>>({});

  function toggle(id: string) {
    setChecked((prev) => ({ ...prev, [id]: !prev[id] }));
  }

  return (
    <div className="px-10 py-14 max-w-4xl">
      <h1 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100 mb-2">Tag</h1>
      <p className="text-[14px] text-neutral-500 dark:text-neutral-400 leading-relaxed mb-10 max-w-lg">
        Tags are compact elements for filtering, categorization, and multi-select.
        They support dots, avatars, icons, counts, checkboxes, and dismissal.
      </p>

      {/* Sizes */}
      <Section title="Sizes">
        <Preview>
          {sizes.map((s) => (
            <Tag key={s} size={s}>Label</Tag>
          ))}
        </Preview>
        <div className="text-[12px] text-neutral-400 dark:text-neutral-500 font-mono mb-3 flex gap-6">
          <span>sm — 24px</span>
          <span>md — 24px</span>
          <span>lg — 28px</span>
        </div>
        <CodeBlock>{`<Tag size="sm">Label</Tag>
<Tag size="md">Label</Tag>
<Tag size="lg">Label</Tag>`}</CodeBlock>
        <DesignTip>Use md as the default size. sm works well in dense filter bars where space is limited.</DesignTip>
      </Section>

      {/* Dismissible */}
      <Section title="Dismissible">
        <Preview>
          {sizes.map((s) => (
            <Tag key={s} size={s} onDismiss={() => {}}>Label</Tag>
          ))}
        </Preview>
        <CodeBlock>{`<Tag onDismiss={() => handleRemove(id)}>Label</Tag>`}</CodeBlock>
        <DesignTip>Ensure dismissed tags can be re-added. Show a count of hidden tags if space is limited.</DesignTip>
      </Section>

      {/* Count */}
      <Section title="With count">
        <Preview>
          {sizes.map((s) => (
            <Tag key={s} size={s} count={5}>Label</Tag>
          ))}
        </Preview>
        <CodeBlock>{`<Tag count={5}>Label</Tag>`}</CodeBlock>
      </Section>

      {/* Dot */}
      <Section title="With dot">
        <Preview>
          <Tag dot>Label</Tag>
          <Tag dot dotColor="#2E90FA">Label</Tag>
          <Tag dot dotColor="#F79009">Label</Tag>
          <Tag dot dotColor="#F04438">Label</Tag>
          <Tag dot dotColor="#9E77ED">Label</Tag>
        </Preview>
        <Preview>
          <Tag dot onDismiss={() => {}}>Label</Tag>
          <Tag dot count={3}>Label</Tag>
        </Preview>
        <CodeBlock>{`<Tag dot>Active</Tag>
<Tag dot dotColor="#F04438">Error</Tag>
<Tag dot onDismiss={() => {}}>Dismissible</Tag>`}</CodeBlock>
        <DesignTip>Dots communicate status at a glance. Use consistent dot colors across all tag instances in the same view.</DesignTip>
      </Section>

      {/* Checkbox */}
      <Section title="With checkbox">
        <Preview>
          {sizes.map((s) => (
            <Tag
              key={s}
              size={s}
              checkbox
              checked={!!checked[`check-${s}`]}
              onCheckedChange={() => toggle(`check-${s}`)}
            >
              Label
            </Tag>
          ))}
        </Preview>
        <Preview>
          <Tag checkbox checked={!!checked["check-close"]} onCheckedChange={() => toggle("check-close")} onDismiss={() => {}}>
            Dismissible
          </Tag>
          <Tag checkbox checked={!!checked["check-count"]} onCheckedChange={() => toggle("check-count")} count={12}>
            With count
          </Tag>
          <Tag checkbox checked={!!checked["check-dot"]} onCheckedChange={() => toggle("check-dot")} dot>
            With dot
          </Tag>
        </Preview>
        <CodeBlock>{`const [checked, setChecked] = useState(false)

<Tag
  checkbox
  checked={checked}
  onCheckedChange={setChecked}
>
  Option
</Tag>`}</CodeBlock>
        <DesignTip>Use checkbox tags for multi-select filter patterns. Group them with a clear "Select all" / "Clear" action.</DesignTip>
      </Section>

      {/* Combinations */}
      <Section title="Combinations">
        <Preview>
          <Tag size="lg" dot dotColor="#17B26A" onDismiss={() => {}}>Active</Tag>
          <Tag size="lg" dot dotColor="#F04438" count={3}>Errors</Tag>
          <Tag size="lg" checkbox checked={!!checked["combo-1"]} onCheckedChange={() => toggle("combo-1")} onDismiss={() => {}}>
            Selectable
          </Tag>
          <Tag size="sm" count={42}>Items</Tag>
          <Tag size="md" dot dotColor="#2E90FA" onDismiss={() => {}}>In progress</Tag>
        </Preview>
      </Section>

      {/* Disabled */}
      <Section title="Disabled">
        <Preview>
          <Tag disabled>Label</Tag>
          <Tag disabled onDismiss={() => {}}>Label</Tag>
          <Tag disabled count={5}>Label</Tag>
          <Tag disabled dot>Label</Tag>
          <Tag disabled checkbox checked>Label</Tag>
        </Preview>
      </Section>

      {/* Usage */}
      <section className="pt-8 border-t border-neutral-100 dark:border-neutral-800">
        <h2 className="text-[11px] font-semibold text-neutral-400 dark:text-neutral-500 uppercase tracking-widest mb-3">
          Usage
        </h2>
        <CodeBlock>{`import { Tag } from "@/components/ui/tag"

// Basic
<Tag>Feature</Tag>

// Dismissible with dot
<Tag dot dotColor="#17B26A" onDismiss={() => remove(id)}>
  Active
</Tag>

// Checkbox with count
<Tag checkbox checked={checked} onCheckedChange={setChecked} count={5}>
  Option
</Tag>

// Sizes
<Tag size="sm">Small</Tag>
<Tag size="lg">Large</Tag>`}</CodeBlock>
      </section>
    </div>
  );
}
