#!/usr/bin/env node

/**
 * Seed script — imports all local design systems from design-systems/*
 * into Supabase. Uses the service role key to bypass RLS.
 *
 * Usage:
 *   node scripts/seed-supabase.mjs
 *
 * Requires these env vars (loaded from .env.local):
 *   NEXT_PUBLIC_SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
 */

import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import { createClient } from "@supabase/supabase-js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");

// ── Load env vars from .env.local ──

async function loadEnv() {
  try {
    const raw = await fs.readFile(path.join(ROOT, ".env.local"), "utf-8");
    for (const line of raw.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eq = trimmed.indexOf("=");
      if (eq === -1) continue;
      const key = trimmed.slice(0, eq).trim();
      const value = trimmed.slice(eq + 1).trim().replace(/^["']|["']$/g, "");
      if (!process.env[key]) {
        process.env[key] = value;
      }
    }
  } catch {
    console.error("ERROR: .env.local not found. Create it from .env.local.example first.");
    process.exit(1);
  }
}

await loadEnv();

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error("ERROR: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY required in .env.local");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { persistSession: false },
});

// ── Read all manifests from design-systems/ ──

async function readAllManifests() {
  const dir = path.join(ROOT, "design-systems");
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const manifests = [];

  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    const manifestPath = path.join(dir, entry.name, "ds-manifest.json");
    try {
      const raw = await fs.readFile(manifestPath, "utf-8");
      manifests.push(JSON.parse(raw));
    } catch {
      // skip
    }
  }

  return manifests;
}

// ── Upsert a manifest into the database ──

async function upsertManifest(manifest) {
  const row = {
    slug: manifest.slug,
    name: manifest.name,
    description: manifest.description,
    version: manifest.version,
    owner_id: null, // seed data has no owner yet
    repository_url: manifest.repository,
    manifest_path: "ds-manifest.json",
    install_path: manifest.installPath ?? null,
    default_branch: "main",
    technology: manifest.technology ?? [],
    tags: manifest.tags ?? [],
    architecture: manifest.architecture ?? null,
    license: manifest.license ?? "MIT",
    parent_id: null, // resolved in second pass
    manifest: manifest,
    published: true,
  };

  const { data, error } = await supabase
    .from("design_systems")
    .upsert(row, { onConflict: "slug" })
    .select()
    .single();

  if (error) {
    console.error(`  ✗ Failed to upsert "${manifest.slug}":`, error.message);
    return null;
  }

  console.log(`  ✓ ${manifest.slug} (${manifest.name})`);
  return data;
}

// ── Resolve parent_id relationships (second pass) ──

async function resolveParents(manifests) {
  const { data: allSystems, error } = await supabase
    .from("design_systems")
    .select("id, slug");

  if (error) {
    console.error("  ✗ Failed to fetch systems for parent resolution:", error.message);
    return;
  }

  const slugToId = new Map(allSystems.map((s) => [s.slug, s.id]));

  for (const manifest of manifests) {
    if (!manifest.parent) continue;
    const parentId = slugToId.get(manifest.parent);
    if (!parentId) {
      console.warn(`  ! Parent "${manifest.parent}" for "${manifest.slug}" not found`);
      continue;
    }

    const { error: updateError } = await supabase
      .from("design_systems")
      .update({ parent_id: parentId })
      .eq("slug", manifest.slug);

    if (updateError) {
      console.error(`  ✗ Failed to set parent for "${manifest.slug}":`, updateError.message);
    } else {
      console.log(`  ✓ ${manifest.slug} → parent: ${manifest.parent}`);
    }
  }
}

// ── Main ──

async function main() {
  console.log("Reading manifests from design-systems/...");
  const manifests = await readAllManifests();
  console.log(`Found ${manifests.length} design systems\n`);

  console.log("Upserting into Supabase...");
  for (const manifest of manifests) {
    await upsertManifest(manifest);
  }

  console.log("\nResolving parent relationships...");
  await resolveParents(manifests);

  console.log("\nDone.");
}

main().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
