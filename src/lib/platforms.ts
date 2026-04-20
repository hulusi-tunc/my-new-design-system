import type { DSPlatform } from "./types";

// ── Specific platforms (full list, used by MCP install tools + import flow) ──

export interface PlatformMeta {
  slug: DSPlatform;
  label: string;        // "Web", "iOS", ...
  longLabel: string;    // "Web · React"
  description: string;
}

export const PLATFORMS: readonly PlatformMeta[] = [
  { slug: "web-react", label: "Web", longLabel: "Web · React", description: "React + Tailwind systems" },
  { slug: "ios-swiftui", label: "iOS", longLabel: "iOS · SwiftUI", description: "SwiftUI systems" },
  { slug: "android-compose", label: "Android", longLabel: "Android · Compose", description: "Jetpack Compose systems" },
  { slug: "flutter", label: "Flutter", longLabel: "Flutter", description: "Cross-platform Dart" },
  { slug: "react-native", label: "React Native", longLabel: "React Native", description: "React Native systems" },
] as const;

export function getPlatformMeta(slug: DSPlatform): PlatformMeta {
  return PLATFORMS.find((p) => p.slug === slug) ?? PLATFORMS[0];
}

export function isValidPlatform(slug: string): slug is DSPlatform {
  return PLATFORMS.some((p) => p.slug === slug);
}

// ── Browsing categories (top-level mode: just Web | Mobile) ──

export type PlatformCategory = "web" | "mobile";

export interface CategoryMeta {
  slug: PlatformCategory;
  label: string;
  description: string;
  searchLabel: string;       // used in search placeholder: "web" | "mobile"
  platforms: DSPlatform[];   // which DSPlatforms belong to this category
}

export const CATEGORIES: readonly CategoryMeta[] = [
  {
    slug: "web",
    label: "Web",
    description: "React, Tailwind, and CSS-based systems",
    searchLabel: "web",
    platforms: ["web-react"],
  },
  {
    slug: "mobile",
    label: "Mobile",
    description: "iOS, Android, Flutter, React Native",
    searchLabel: "mobile",
    platforms: ["ios-swiftui", "android-compose", "flutter", "react-native"],
  },
] as const;

export const DEFAULT_CATEGORY: PlatformCategory = "web";
export const CATEGORY_COOKIE = "hubera-category";

export function getCategoryMeta(slug: PlatformCategory): CategoryMeta {
  return CATEGORIES.find((c) => c.slug === slug) ?? CATEGORIES[0];
}

export function getCategoryForPlatform(platform: DSPlatform): PlatformCategory {
  return (
    CATEGORIES.find((c) => c.platforms.includes(platform))?.slug ?? DEFAULT_CATEGORY
  );
}

export function isValidCategory(slug: string): slug is PlatformCategory {
  return CATEGORIES.some((c) => c.slug === slug);
}
