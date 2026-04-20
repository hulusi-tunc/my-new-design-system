import type { DSPlatform } from "@/lib/types";

/**
 * Static inter-component dependency map, keyed by platform.
 * Key = component file name, Value = array of other component files it depends on.
 */
const COMPONENT_DEPS: Record<DSPlatform, Record<string, string[]>> = {
  "web-react": {
    "badge-group.tsx": ["badge.tsx"],
  },
  "ios-swiftui": {},
  "android-compose": {},
  flutter: {},
  "react-native": {},
};

/**
 * Components that require a role-provider-like file. Currently only
 * relevant for web-react.
 */
const ROLE_PROVIDER_CONSUMERS: Record<DSPlatform, ReadonlySet<string>> = {
  "web-react": new Set(["code-block.tsx", "design-tip.tsx"]),
  "ios-swiftui": new Set(),
  "android-compose": new Set(),
  flutter: new Set(),
  "react-native": new Set(),
};

export function getComponentDependencies(
  platform: DSPlatform,
  fileName: string
): string[] {
  return COMPONENT_DEPS[platform]?.[fileName] ?? [];
}

export function needsRoleProvider(
  platform: DSPlatform,
  fileName: string
): boolean {
  return ROLE_PROVIDER_CONSUMERS[platform]?.has(fileName) ?? false;
}

/**
 * Resolve the full list of component files needed for a given component,
 * including its inter-component dependencies (but not core deps).
 */
export function resolveComponentFiles(
  platform: DSPlatform,
  fileName: string
): string[] {
  const files = new Set<string>();
  const queue = [fileName];

  while (queue.length > 0) {
    const current = queue.pop()!;
    if (files.has(current)) continue;
    files.add(current);
    for (const dep of getComponentDependencies(platform, current)) {
      queue.push(dep);
    }
  }

  return Array.from(files);
}
