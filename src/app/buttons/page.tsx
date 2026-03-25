"use client";

import { Button, type ButtonVariant, type ButtonSize } from "@/components/ui/button";
import {
  SocialButton,
  SocialButtonGroup,
  type SocialPlatform,
  type SocialButtonTheme,
} from "@/components/ui/social-button";
import { CloseButton, type CloseButtonSize } from "@/components/ui/close-button";
import { UtilityButton, type UtilityButtonSize, type UtilityButtonHierarchy } from "@/components/ui/utility-button";
import { CodeBlock } from "@/components/ui/code-block";
import { DesignTip } from "@/components/ui/design-tip";

const variants: { name: string; value: ButtonVariant; description: string }[] = [
  { name: "Primary", value: "primary", description: "High-emphasis actions like Save, Submit, Confirm." },
  { name: "Secondary", value: "secondary", description: "Medium-emphasis, alternative actions." },
  { name: "Tertiary", value: "tertiary", description: "Low-emphasis, subtle actions." },
  { name: "Link color", value: "link-color", description: "Inline link styled with brand color." },
  { name: "Link gray", value: "link-gray", description: "Inline link styled with neutral color." },
];

const sizes: ButtonSize[] = ["sm", "md", "lg", "xl"];

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section id={title.toLowerCase().replace(/\s+/g, "-")} className="mb-12">
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


const PlaceholderIcon = ({ size = 20 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="10" cy="10" r="8" />
  </svg>
);

export default function ButtonsPage() {
  return (
    <div className="px-10 py-14 max-w-4xl">
      <h1 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100 mb-2">Button</h1>
      <p className="text-[14px] text-neutral-500 dark:text-neutral-400 leading-relaxed mb-10 max-w-lg">
        Buttons trigger actions. They come in 5 variants, 4 sizes, and
        support destructive, loading, icon-only, and disabled states.
      </p>

      {/* Variants */}
      <Section title="Variants">
        {variants.map((v) => (
          <div key={v.value} className="mb-6">
            <div className="flex items-baseline gap-2 mb-2">
              <span className="text-[13px] font-medium text-neutral-800 dark:text-neutral-200">{v.name}</span>
              <span className="text-[11px] text-neutral-400 dark:text-neutral-500">{v.description}</span>
            </div>
            <Preview>
              {sizes.map((s) => (
                <Button key={s} variant={v.value} size={s}>
                  Button CTA
                </Button>
              ))}
            </Preview>
            <CodeBlock>{`<Button variant="${v.value}">Button CTA</Button>`}</CodeBlock>
            <DesignTip>Use Primary for the single most important action on a page. Demote secondary actions to avoid competing CTAs.</DesignTip>
          </div>
        ))}
      </Section>

      {/* Destructive */}
      <Section title="Destructive">
        <p className="text-[13px] text-neutral-500 dark:text-neutral-400 mb-4">
          Add <code>destructive</code> to any variant for danger actions.
        </p>
        {(["primary", "secondary", "tertiary", "link-color"] as ButtonVariant[]).map((v) => (
          <div key={v} className="mb-4">
            <Preview>
              {sizes.map((s) => (
                <Button key={s} variant={v} size={s} destructive>
                  Button CTA
                </Button>
              ))}
            </Preview>
          </div>
        ))}
        <CodeBlock>{`<Button variant="primary" destructive>Delete</Button>`}</CodeBlock>
        <DesignTip>Reserve destructive styling for irreversible actions like deletion. Always pair with a confirmation dialog.</DesignTip>
      </Section>

      {/* Sizes */}
      <Section title="Sizes">
        <Preview>
          {sizes.map((s) => (
            <Button key={s} size={s}>
              {s.toUpperCase()}
            </Button>
          ))}
        </Preview>
        <div className="text-[12px] text-neutral-400 dark:text-neutral-500 font-mono mb-3 flex gap-6">
          <span>sm — 36px</span>
          <span>md — 40px</span>
          <span>lg — 44px</span>
          <span>xl — 48px</span>
        </div>
        <CodeBlock>{`<Button size="sm">Small</Button>
<Button size="lg">Large</Button>`}</CodeBlock>
        <DesignTip>Use md (40px) as the default. Use lg/xl for hero CTAs and sm for dense UI like table rows.</DesignTip>
      </Section>

      {/* With icons */}
      <Section title="With icons">
        <Preview>
          <Button iconLeft={<PlaceholderIcon />}>Leading</Button>
          <Button iconRight={<PlaceholderIcon />}>Trailing</Button>
          <Button iconLeft={<PlaceholderIcon />} iconRight={<PlaceholderIcon />}>
            Both
          </Button>
        </Preview>
        <CodeBlock>{`<Button iconLeft={<Icon />}>Leading</Button>
<Button iconRight={<Icon />}>Trailing</Button>`}</CodeBlock>
        <DesignTip>Leading icons reinforce the action (e.g., plus icon for "Add"). Trailing icons suggest navigation (e.g., arrow for "Continue").</DesignTip>
      </Section>

      {/* Icon only */}
      <Section title="Icon only">
        <Preview>
          {(["primary", "secondary", "tertiary"] as ButtonVariant[]).map((v) => (
            <span key={v} className="flex gap-2">
              {sizes.map((s) => (
                <Button key={s} variant={v} size={s} iconOnly iconLeft={<PlaceholderIcon />} />
              ))}
            </span>
          ))}
        </Preview>
        <CodeBlock>{`<Button variant="secondary" iconOnly iconLeft={<Icon />} />`}</CodeBlock>
      </Section>

      {/* Destructive icon only */}
      <Section title="Destructive icon only">
        <Preview>
          {(["primary", "secondary", "tertiary"] as ButtonVariant[]).map((v) => (
            <span key={v} className="flex gap-2">
              {sizes.map((s) => (
                <Button key={s} variant={v} size={s} destructive iconOnly iconLeft={<PlaceholderIcon />} />
              ))}
            </span>
          ))}
        </Preview>
      </Section>

      {/* States */}
      <Section title="States">
        <div className="space-y-4">
          <div>
            <span className="text-[12px] text-neutral-500 dark:text-neutral-400 mb-2 block">Disabled</span>
            <Preview>
              <Button disabled>Disabled</Button>
              <Button variant="secondary" disabled>Disabled</Button>
              <Button variant="tertiary" disabled>Disabled</Button>
            </Preview>
          </div>
          <div>
            <span className="text-[12px] text-neutral-500 dark:text-neutral-400 mb-2 block">Loading</span>
            <Preview>
              <Button loading>Submitting...</Button>
              <Button variant="secondary" loading>Submitting...</Button>
              <Button variant="tertiary" loading>Submitting...</Button>
            </Preview>
          </div>
          <div>
            <span className="text-[12px] text-neutral-500 dark:text-neutral-400 mb-2 block">Destructive loading</span>
            <Preview>
              <Button destructive loading>Submitting...</Button>
              <Button variant="secondary" destructive loading>Submitting...</Button>
            </Preview>
          </div>
        </div>
        <CodeBlock>{`<Button disabled>Disabled</Button>
<Button loading>Submitting...</Button>`}</CodeBlock>
        <DesignTip>Always provide a loading state for async actions. Disable buttons only when the form is incomplete, not as a generic "not ready" indicator.</DesignTip>
      </Section>

      {/* ── Social Buttons ────────────────────────────── */}
      <div className="pt-10 mt-10 border-t border-neutral-100 dark:border-neutral-800">
        <h1 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100 mb-2">Social Button</h1>
        <p className="text-[14px] text-neutral-500 dark:text-neutral-400 leading-relaxed mb-10 max-w-lg">
          Social login buttons for Google, Facebook, Apple, and X (Twitter).
          Available in 3 themes, 4 sizes, and two layouts: full-width with
          text or compact icon-only.
        </p>
      </div>

      {/* Social — Themes (Buttons) */}
      <Section title="Social — Themes (Buttons)">
        {(
          [
            { name: "Brand", value: "brand" as SocialButtonTheme, description: "Platform brand colors. Google uses white bg, others use brand bg." },
            { name: "Color", value: "color" as SocialButtonTheme, description: "White background with colored platform icons." },
            { name: "Gray", value: "gray" as SocialButtonTheme, description: "White background with monochrome gray icons." },
          ] as const
        ).map((t) => (
          <div key={t.value} className="mb-6">
            <div className="flex items-baseline gap-2 mb-2">
              <span className="text-[13px] font-medium text-neutral-800 dark:text-neutral-200">{t.name}</span>
              <span className="text-[11px] text-neutral-400 dark:text-neutral-500">{t.description}</span>
            </div>
            <Preview>
              <div style={{ width: 320 }}>
                <SocialButtonGroup layout="buttons" theme={t.value} />
              </div>
            </Preview>
          </div>
        ))}
        <CodeBlock>{`<SocialButtonGroup layout="buttons" theme="brand" />`}</CodeBlock>
      </Section>

      {/* Social — Themes (Icons) */}
      <Section title="Social — Themes (Icons)">
        {(["brand", "color", "gray"] as SocialButtonTheme[]).map((t) => (
          <div key={t} className="mb-6">
            <div className="flex items-baseline gap-2 mb-2">
              <span className="text-[13px] font-medium text-neutral-800 dark:text-neutral-200 capitalize">{t}</span>
            </div>
            <Preview>
              <div style={{ width: 320 }}>
                <SocialButtonGroup layout="icons" theme={t} />
              </div>
            </Preview>
          </div>
        ))}
        <CodeBlock>{`<SocialButtonGroup layout="icons" theme="gray" />`}</CodeBlock>
      </Section>

      {/* Social — Individual */}
      <Section title="Social — Individual buttons">
        <p className="text-[13px] text-neutral-500 dark:text-neutral-400 mb-4">
          Each platform as a standalone button across all themes.
        </p>
        {(["google", "facebook", "apple", "twitter"] as SocialPlatform[]).map((p) => (
          <div key={p} className="mb-4">
            <span className="text-[12px] text-neutral-500 dark:text-neutral-400 mb-2 block capitalize">{p === "twitter" ? "X (Twitter)" : p}</span>
            <Preview>
              {(["brand", "color", "gray"] as SocialButtonTheme[]).map((t) => (
                <SocialButton key={t} platform={p} theme={t} showText={false} style={{ width: "auto" }} />
              ))}
            </Preview>
          </div>
        ))}
        <CodeBlock>{`<SocialButton platform="google" theme="brand" />`}</CodeBlock>
      </Section>

      {/* Social — All platforms */}
      <Section title="Social — All platforms">
        <Preview>
          <div style={{ width: 320 }}>
            <SocialButtonGroup
              layout="buttons"
              theme="brand"
              platforms={["google", "facebook", "apple", "twitter"]}
            />
          </div>
          <div style={{ width: 320 }}>
            <SocialButtonGroup
              layout="icons"
              theme="brand"
              platforms={["google", "facebook", "apple", "twitter"]}
            />
          </div>
        </Preview>
        <CodeBlock>{`<SocialButtonGroup
  layout="buttons"
  theme="brand"
  platforms={["google", "facebook", "apple", "twitter"]}
/>`}</CodeBlock>
      </Section>

      {/* Social — Disabled */}
      <Section title="Social — Disabled">
        <Preview>
          <div style={{ width: 320 }}>
            <SocialButton platform="google" theme="brand" disabled />
          </div>
          <div style={{ width: 320 }}>
            <SocialButton platform="facebook" theme="brand" disabled />
          </div>
        </Preview>
        <CodeBlock>{`<SocialButton platform="google" disabled />`}</CodeBlock>
      </Section>

      {/* ── Close Button ───────────────────────────── */}
      <div className="pt-10 mt-10 border-t border-neutral-100 dark:border-neutral-800">
        <h1 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100 mb-2">Close Button</h1>
        <p className="text-[14px] text-neutral-500 dark:text-neutral-400 leading-relaxed mb-10 max-w-lg">
          Icon-only button for dismissing modals, drawers, toasts, and banners.
          3 sizes, works on light and dark backgrounds.
        </p>
      </div>

      <Section title="Close — Sizes">
        <Preview>
          {(["sm", "md", "lg"] as CloseButtonSize[]).map((s) => (
            <CloseButton key={s} size={s} />
          ))}
        </Preview>
        <CodeBlock>{`<CloseButton size="sm" />
<CloseButton size="md" />
<CloseButton size="lg" />`}</CodeBlock>
      </Section>

      <Section title="Close — Dark background">
        <div className="border border-neutral-100 dark:border-neutral-800 rounded-lg p-6 flex flex-wrap items-center gap-3 mb-3 bg-neutral-900">
          {(["sm", "md", "lg"] as CloseButtonSize[]).map((s) => (
            <CloseButton key={s} size={s} darkBackground />
          ))}
        </div>
        <CodeBlock>{`<CloseButton size="md" darkBackground />`}</CodeBlock>
      </Section>

      <Section title="Close — Disabled">
        <Preview>
          <CloseButton disabled />
          <CloseButton size="md" disabled />
          <CloseButton size="lg" disabled />
        </Preview>
      </Section>

      {/* ── Utility Button ──────────────────────────── */}
      <div className="pt-10 mt-10 border-t border-neutral-100 dark:border-neutral-800">
        <h1 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100 mb-2">Utility Button</h1>
        <p className="text-[14px] text-neutral-500 dark:text-neutral-400 leading-relaxed mb-10 max-w-lg">
          Compact icon-only button for toolbars, table rows, and inline actions.
          2 sizes (xs, sm) and 2 hierarchies (secondary with border, tertiary ghost).
        </p>
      </div>

      <Section title="Utility — Secondary">
        <Preview>
          {(["xs", "sm"] as UtilityButtonSize[]).map((s) => (
            <UtilityButton key={s} size={s} hierarchy="secondary" />
          ))}
        </Preview>
        <CodeBlock>{`<UtilityButton size="sm" hierarchy="secondary" icon={<Icon />} />`}</CodeBlock>
      </Section>

      <Section title="Utility — Tertiary">
        <Preview>
          {(["xs", "sm"] as UtilityButtonSize[]).map((s) => (
            <UtilityButton key={s} size={s} hierarchy="tertiary" />
          ))}
        </Preview>
        <CodeBlock>{`<UtilityButton size="xs" hierarchy="tertiary" icon={<Icon />} />`}</CodeBlock>
      </Section>

      <Section title="Utility — Disabled">
        <Preview>
          <UtilityButton size="sm" hierarchy="secondary" disabled />
          <UtilityButton size="sm" hierarchy="tertiary" disabled />
          <UtilityButton size="xs" hierarchy="secondary" disabled />
          <UtilityButton size="xs" hierarchy="tertiary" disabled />
        </Preview>
      </Section>

      {/* Usage */}
      <section className="pt-8 border-t border-neutral-100 dark:border-neutral-800">
        <h2 className="text-[11px] font-semibold text-neutral-400 dark:text-neutral-500 uppercase tracking-widest mb-3">
          Usage
        </h2>
        <CodeBlock>{`import { Button } from "@/components/ui/button"
import { CloseButton } from "@/components/ui/close-button"
import { UtilityButton } from "@/components/ui/utility-button"
import { SocialButton, SocialButtonGroup } from "@/components/ui/social-button"

<Button variant="primary" size="md">Save changes</Button>

<CloseButton size="md" />

<UtilityButton size="sm" hierarchy="secondary" icon={<SettingsIcon />} />

<SocialButtonGroup layout="buttons" theme="brand" />`}</CodeBlock>
      </section>
    </div>
  );
}
