import { createClient } from "@supabase/supabase-js";
import type { Database } from "./supabase/types";
import type { DSManifest, DSPlatform } from "./types";
import { getCategoryMeta, type PlatformCategory } from "./platforms";

/**
 * Stateless public Supabase client for reading published design systems.
 * Works in any context (build-time SSG, server components, edge) — no cookies.
 * Only reads; RLS policy "Published design systems are viewable by everyone"
 * ensures only published rows come back.
 */
function getPublicClient() {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { persistSession: false } }
  );
}

type ManifestRow = { manifest: unknown };
type SlugRow = { slug: string };

export async function getAllManifests(): Promise<DSManifest[]> {
  const supabase = getPublicClient();
  const { data, error } = await supabase
    .from("design_systems")
    .select("manifest")
    .eq("published", true)
    .order("updated_at", { ascending: false });

  if (error || !data) return [];
  const rows = data as unknown as ManifestRow[];
  return rows
    .map((row) => row.manifest as DSManifest | null)
    .filter((m): m is DSManifest => m !== null);
}

export async function getManifestBySlug(
  slug: string
): Promise<DSManifest | null> {
  const supabase = getPublicClient();
  const { data, error } = await supabase
    .from("design_systems")
    .select("manifest")
    .eq("slug", slug)
    .eq("published", true)
    .maybeSingle();

  if (error || !data) return null;
  const row = data as unknown as ManifestRow;
  return (row.manifest as DSManifest | null) ?? null;
}

export async function getManifestsByPlatform(
  platform: DSPlatform
): Promise<DSManifest[]> {
  const supabase = getPublicClient();
  const { data, error } = await supabase
    .from("design_systems")
    .select("manifest")
    .eq("published", true)
    .eq("platform", platform)
    .order("updated_at", { ascending: false });

  if (error || !data) return [];
  const rows = data as unknown as ManifestRow[];
  return rows
    .map((row) => row.manifest as DSManifest | null)
    .filter((m): m is DSManifest => m !== null);
}

export async function getManifestsByCategory(
  category: PlatformCategory
): Promise<DSManifest[]> {
  const meta = getCategoryMeta(category);
  const supabase = getPublicClient();
  // Filter by the JSONB `manifest.platform` field — works whether or not
  // the dedicated `platform` column has been migrated in yet.
  const { data, error } = await supabase
    .from("design_systems")
    .select("manifest")
    .eq("published", true)
    .in("manifest->>platform", meta.platforms as string[])
    .order("updated_at", { ascending: false });

  if (error || !data) return [];
  const rows = data as unknown as ManifestRow[];
  return rows
    .map((row) => row.manifest as DSManifest | null)
    .filter((m): m is DSManifest => m !== null);
}

export async function getAllSlugs(): Promise<string[]> {
  const supabase = getPublicClient();
  const { data, error } = await supabase
    .from("design_systems")
    .select("slug")
    .eq("published", true);

  if (error || !data) return [];
  const rows = data as unknown as SlugRow[];
  return rows.map((row) => row.slug);
}

export function getForks(
  allManifests: DSManifest[],
  parentSlug: string
): DSManifest[] {
  return allManifests.filter((m) => m.parent === parentSlug);
}
