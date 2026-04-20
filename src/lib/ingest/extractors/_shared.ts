export function commonAncestor(paths: string[]): string | null {
  if (paths.length === 0) return null;
  if (paths.length === 1) return paths[0];
  const segs = paths.map((p) => p.split("/"));
  const prefix: string[] = [];
  for (let i = 0; i < segs[0].length; i++) {
    const seg = segs[0][i];
    if (segs.every((s) => s[i] === seg)) prefix.push(seg);
    else break;
  }
  return prefix.join("/") || null;
}

export function dirname(p: string): string {
  const idx = p.lastIndexOf("/");
  return idx === -1 ? "" : p.slice(0, idx);
}

export function suggestSlug(repo: string): string {
  return repo
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);
}

export function toTitleCase(s: string): string {
  return s
    .split(/[-_\s]+/)
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}
