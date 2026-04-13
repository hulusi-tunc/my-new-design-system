/**
 * Static dependency map for inter-component dependencies.
 * Key = component file name, Value = array of other component files it depends on.
 */
const COMPONENT_DEPS: Record<string, string[]> = {
  "badge-group.tsx": ["badge.tsx"],
};

/**
 * Components that require role-provider.tsx (in addition to theme-provider).
 */
const ROLE_PROVIDER_CONSUMERS = new Set([
  "code-block.tsx",
  "design-tip.tsx",
]);

export function getComponentDependencies(fileName: string): string[] {
  return COMPONENT_DEPS[fileName] ?? [];
}

export function needsRoleProvider(fileName: string): boolean {
  return ROLE_PROVIDER_CONSUMERS.has(fileName);
}

/**
 * Resolve the full list of component files needed for a given component,
 * including its inter-component dependencies (but not core deps).
 */
export function resolveComponentFiles(fileName: string): string[] {
  const files = new Set<string>();
  const queue = [fileName];

  while (queue.length > 0) {
    const current = queue.pop()!;
    if (files.has(current)) continue;
    files.add(current);
    for (const dep of getComponentDependencies(current)) {
      queue.push(dep);
    }
  }

  return Array.from(files);
}
