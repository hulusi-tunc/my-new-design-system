"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type CSSProperties } from "react";
import { useTheme } from "@/components/providers/theme-provider";
import { getNd, editorialFonts, motion } from "@/lib/nothing-tokens";
import { CATEGORIES, type PlatformCategory } from "@/lib/platforms";
import {
  useCurrentCategory,
  setCurrentCategory,
} from "@/lib/use-current-category";
import { Popover, PopoverItem } from "@/components/hub";

import CheckLineIcon from "remixicon-react/CheckLineIcon";

type Variant = "topnav" | "compact";

interface DesignSystemsNavProps {
  label?: string;
  variant?: Variant;
  active?: boolean;
}

/**
 * "Design Systems" nav item with a hover-revealed category popover.
 * Click the label → navigates to /catalog/[lastChosenCategory].
 * Hover the label → popover opens with Web / Mobile options.
 */
export function DesignSystemsNav({
  label = "Design Systems",
  variant = "topnav",
  active = false,
}: DesignSystemsNavProps) {
  const { theme } = useTheme();
  const t = getNd(theme);
  const router = useRouter();
  const category = useCurrentCategory();
  const [hovered, setHovered] = useState(false);

  const handleSelect = (slug: PlatformCategory) => {
    setCurrentCategory(slug);
    router.push(`/catalog/${slug}`);
  };

  const href = `/catalog/${category}`;
  const compact = variant === "compact";

  const triggerStyle: CSSProperties = compact
    ? {
        fontFamily: editorialFonts.mono,
        fontSize: 11,
        letterSpacing: "0.08em",
        textTransform: "uppercase",
        fontWeight: 400,
        padding: "6px 10px",
        color: active || hovered ? t.textDisplay : t.textSecondary,
        textDecoration: "none",
        transition: `color ${motion.transition.chrome}`,
      }
    : {
        fontFamily: editorialFonts.body,
        fontSize: 14,
        fontWeight: active ? 600 : 500,
        color: active || hovered ? t.textDisplay : t.textSecondary,
        textDecoration: "none",
        padding: "6px 2px",
        transition: `color ${motion.transition.chrome}`,
      };

  return (
    <Popover
      triggerKind="hover"
      placement="bottom-start"
      menuWidth={260}
      trigger={
        <Link
          href={href}
          style={triggerStyle}
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
        >
          {label}
        </Link>
      }
    >
      {CATEGORIES.map((meta) => (
        <PopoverItem
          key={meta.slug}
          title={meta.label}
          description={meta.description}
          active={meta.slug === category}
          onSelect={() => handleSelect(meta.slug)}
          trailingSlot={
            meta.slug === category ? (
              <span style={{ display: "inline-flex", color: t.textDisplay }}>
                <CheckLineIcon size={14} />
              </span>
            ) : null
          }
        />
      ))}
    </Popover>
  );
}
