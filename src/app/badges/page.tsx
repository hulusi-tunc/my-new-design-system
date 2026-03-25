"use client";

import { Badge, type BadgeColor, type BadgeType, type BadgeSize } from "@/components/ui/badge";
import { BadgeGroup, type BadgeGroupType, type BadgeGroupPosition } from "@/components/ui/badge-group";
import { CodeBlock } from "@/components/ui/code-block";
import { DesignTip } from "@/components/ui/design-tip";

const badgeColors: { name: string; value: BadgeColor }[] = [
  { name: "Gray", value: "gray" },
  { name: "Brand", value: "brand" },
  { name: "Error", value: "error" },
  { name: "Warning", value: "warning" },
  { name: "Success", value: "success" },
  { name: "Gray blue", value: "gray-blue" },
  { name: "Blue light", value: "blue-light" },
  { name: "Blue", value: "blue" },
  { name: "Indigo", value: "indigo" },
  { name: "Purple", value: "purple" },
  { name: "Pink", value: "pink" },
  { name: "Orange", value: "orange" },
];

const badgeTypes: { name: string; value: BadgeType; description: string }[] = [
  { name: "Pill color", value: "pill-color", description: "Fully rounded with colored background." },
  { name: "Badge color", value: "badge-color", description: "Slightly rounded with colored background." },
  { name: "Badge modern", value: "badge-modern", description: "White background with shadow." },
];

const badgeSizes: BadgeSize[] = ["sm", "md", "lg"];

function Section({ title, children }: { title: string; children: React.ReactNode }) {
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


const PlaceholderIcon = ({ size = 12 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 1v10M1 6h10" />
  </svg>
);

const ArrowUpIcon = ({ size = 12 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 10V2M3 5l3-3 3 3" />
  </svg>
);

export default function BadgesPage() {
  return (
    <div className="px-10 py-14 max-w-4xl">
      <h1 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100 mb-2">Badge</h1>
      <p className="text-[14px] text-neutral-500 dark:text-neutral-400 leading-relaxed mb-10 max-w-lg">
        Badges highlight status, category, or count. They come in 3 types, 3 sizes,
        12 colors, and support dots, icons, avatars, and close actions.
      </p>

      {/* Types × Colors */}
      <Section title="Types">
        {badgeTypes.map((t) => (
          <div key={t.value} className="mb-6">
            <div className="flex items-baseline gap-2 mb-2">
              <span className="text-[13px] font-medium text-neutral-800 dark:text-neutral-200">{t.name}</span>
              <span className="text-[11px] text-neutral-400 dark:text-neutral-500">{t.description}</span>
            </div>
            <Preview>
              {badgeColors.map((c) => (
                <Badge key={c.value} type={t.value} color={c.value}>
                  Label
                </Badge>
              ))}
            </Preview>
            <CodeBlock>{`<Badge type="${t.value}" color="brand">Label</Badge>`}</CodeBlock>
            <DesignTip>Pill badges work best for status indicators. Badge-modern is ideal for tags in cards or settings panels.</DesignTip>
          </div>
        ))}
      </Section>

      {/* Sizes */}
      <Section title="Sizes">
        <p className="text-[13px] text-neutral-500 dark:text-neutral-400 mb-4">
          Three sizes: sm (12px text), md (12px text, wider padding), and lg (14px text).
        </p>
        {badgeSizes.map((s) => (
          <div key={s} className="mb-4">
            <span className="text-[13px] font-medium text-neutral-800 dark:text-neutral-200 block mb-2">{s}</span>
            <Preview>
              {(["pill-color", "badge-color", "badge-modern"] as BadgeType[]).map((t) => (
                <Badge key={t} size={s} type={t} color="brand">
                  Label
                </Badge>
              ))}
            </Preview>
          </div>
        ))}
        <CodeBlock>{`<Badge size="lg" type="pill-color">Label</Badge>`}</CodeBlock>
        <DesignTip>Use sm for inline labels, md for standalone badges, lg for marketing or hero contexts.</DesignTip>
      </Section>

      {/* With Dot */}
      <Section title="With dot">
        <p className="text-[13px] text-neutral-500 dark:text-neutral-400 mb-4">
          A small colored dot indicates live status or category.
        </p>
        <Preview>
          {badgeColors.map((c) => (
            <Badge key={c.value} icon="dot" color={c.value}>
              Label
            </Badge>
          ))}
        </Preview>
        <CodeBlock>{`<Badge icon="dot" color="success">Label</Badge>`}</CodeBlock>
        <DesignTip>Map colors to semantic meaning consistently: green for success, red for error, yellow for warning. Avoid more than 3 badge colors in a single view.</DesignTip>
      </Section>

      {/* With Icon Leading */}
      <Section title="With icon leading">
        <Preview>
          {badgeColors.slice(0, 6).map((c) => (
            <Badge key={c.value} icon="icon-leading" color={c.value} iconLeading={<ArrowUpIcon />}>
              Label
            </Badge>
          ))}
        </Preview>
        <CodeBlock>{`<Badge icon="icon-leading" iconLeading={<ArrowUpIcon />}>Label</Badge>`}</CodeBlock>
      </Section>

      {/* With Icon Trailing */}
      <Section title="With icon trailing">
        <Preview>
          {badgeColors.slice(0, 6).map((c) => (
            <Badge key={c.value} icon="icon-trailing" color={c.value} iconTrailing={<PlaceholderIcon />}>
              Label
            </Badge>
          ))}
        </Preview>
        <CodeBlock>{`<Badge icon="icon-trailing" iconTrailing={<Icon />}>Label</Badge>`}</CodeBlock>
      </Section>

      {/* With X Close */}
      <Section title="With close button">
        <p className="text-[13px] text-neutral-500 dark:text-neutral-400 mb-4">
          An X close button for removable/dismissible badges.
        </p>
        <Preview>
          {badgeColors.slice(0, 6).map((c) => (
            <Badge key={c.value} icon="x-close" color={c.value} onClose={() => {}}>
              Label
            </Badge>
          ))}
        </Preview>
        <CodeBlock>{`<Badge icon="x-close" onClose={() => handleClose()}>Label</Badge>`}</CodeBlock>
        <DesignTip>Dismissible badges should always have a clear re-add path. Don't use them for permanent categories.</DesignTip>
      </Section>

      {/* With Avatar */}
      <Section title="With avatar">
        <Preview>
          {(["brand", "error", "success", "blue", "purple", "orange"] as BadgeColor[]).map((c) => (
            <Badge
              key={c}
              icon="avatar"
              color={c}
              avatar={
                <img
                  src="https://randomuser.me/api/portraits/women/44.jpg"
                  alt="Avatar"
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              }
            >
              Label
            </Badge>
          ))}
        </Preview>
        <CodeBlock>{`<Badge icon="avatar" avatar={<img src="..." />}>Label</Badge>`}</CodeBlock>
      </Section>

      {/* Icon Only */}
      <Section title="Icon only">
        <Preview>
          {badgeColors.slice(0, 6).map((c) => (
            <Badge key={c.value} icon="icon-only" color={c.value} iconLeading={<PlaceholderIcon />} />
          ))}
        </Preview>
        <CodeBlock>{`<Badge icon="icon-only" iconLeading={<Icon />} />`}</CodeBlock>
      </Section>

      {/* Badge color type with dots */}
      <Section title="Badge color with dots">
        <Preview>
          {badgeColors.map((c) => (
            <Badge key={c.value} type="badge-color" icon="dot" color={c.value}>
              Label
            </Badge>
          ))}
        </Preview>
      </Section>

      {/* Badge modern with dots */}
      <Section title="Badge modern with dots">
        <Preview>
          {badgeColors.map((c) => (
            <Badge key={c.value} type="badge-modern" icon="dot" color={c.value}>
              Label
            </Badge>
          ))}
        </Preview>
      </Section>

      {/* Color palette – all types × all colors */}
      <Section title="Full color palette">
        <p className="text-[13px] text-neutral-500 dark:text-neutral-400 mb-4">
          All 12 colors across all 3 badge types.
        </p>
        <div className="overflow-x-auto">
          <table className="text-[12px] text-neutral-600 dark:text-neutral-400">
            <thead>
              <tr>
                <th className="text-left pr-6 pb-3 font-medium">Color</th>
                <th className="text-left pr-6 pb-3 font-medium">Pill color</th>
                <th className="text-left pr-6 pb-3 font-medium">Badge color</th>
                <th className="text-left pb-3 font-medium">Badge modern</th>
              </tr>
            </thead>
            <tbody>
              {badgeColors.map((c) => (
                <tr key={c.value}>
                  <td className="pr-6 py-2 text-neutral-800 dark:text-neutral-200">{c.name}</td>
                  <td className="pr-6 py-2">
                    <Badge type="pill-color" color={c.value}>Label</Badge>
                  </td>
                  <td className="pr-6 py-2">
                    <Badge type="badge-color" color={c.value}>Label</Badge>
                  </td>
                  <td className="py-2">
                    <Badge type="badge-modern" color={c.value}>Label</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      {/* Badge Group */}
      <Section title="Badge group">
        <p className="text-[13px] text-neutral-500 dark:text-neutral-400 mb-4">
          A compound badge with a nested label badge, text content, and optional icon.
        </p>
        <div className="mb-6">
          <span className="text-[13px] font-medium text-neutral-800 dark:text-neutral-200 block mb-2">Leading badge</span>
          <Preview>
            {(["brand", "error", "warning", "success", "gray"] as BadgeColor[]).map((c) => (
              <BadgeGroup key={c} color={c} badgePosition="leading" badgeLabel="New feature">
                We've just released a new feature
              </BadgeGroup>
            ))}
          </Preview>
          <CodeBlock>{`<BadgeGroup color="brand" badgeLabel="New feature">Message</BadgeGroup>`}</CodeBlock>
        </div>
        <div className="mb-6">
          <span className="text-[13px] font-medium text-neutral-800 dark:text-neutral-200 block mb-2">Trailing badge</span>
          <Preview>
            {(["brand", "error", "success"] as BadgeColor[]).map((c) => (
              <BadgeGroup key={c} color={c} badgePosition="trailing" badgeLabel="New">
                We've just released a new feature
              </BadgeGroup>
            ))}
          </Preview>
          <CodeBlock>{`<BadgeGroup badgePosition="trailing" badgeLabel="New">Message</BadgeGroup>`}</CodeBlock>
        </div>
        <div className="mb-6">
          <span className="text-[13px] font-medium text-neutral-800 dark:text-neutral-200 block mb-2">Modern style</span>
          <Preview>
            {(["brand", "gray", "error"] as BadgeColor[]).map((c) => (
              <BadgeGroup key={c} type="badge-modern" color={c} badgeLabel="Release">
                Check out the latest updates
              </BadgeGroup>
            ))}
          </Preview>
          <CodeBlock>{`<BadgeGroup type="badge-modern" badgeLabel="Release">Message</BadgeGroup>`}</CodeBlock>
        </div>
        <div>
          <span className="text-[13px] font-medium text-neutral-800 dark:text-neutral-200 block mb-2">Large size</span>
          <Preview>
            <BadgeGroup size="lg" color="brand" badgeLabel="New feature">
              We've just released a new feature
            </BadgeGroup>
            <BadgeGroup size="lg" type="badge-modern" color="brand" badgeLabel="Release">
              Check out the latest updates
            </BadgeGroup>
          </Preview>
          <CodeBlock>{`<BadgeGroup size="lg" badgeLabel="New feature">Message</BadgeGroup>`}</CodeBlock>
        </div>
      </Section>
    </div>
  );
}
