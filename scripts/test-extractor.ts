import { extractManifest } from "../src/lib/ingest";

async function main() {
  const result = await extractManifest({
    repoUrl: "https://github.com/hulusi-tunc/my-new-design-system",
    platform: "web-react",
  });

  if (!result.ok) {
    console.error("FAILED:", result.error);
    process.exit(1);
  }

  const draft = result.draft;
  console.log("─── DRAFT MANIFEST ───────────────────────────────");
  console.log("slug:           ", draft.slug);
  console.log("name:           ", draft.name);
  console.log("platform:       ", draft.platform);
  console.log("technology:     ", draft.technology);
  console.log("architecture:   ", draft.architecture);
  console.log("componentsDir:  ", draft.sourceLayout.componentsDir);
  console.log("source files:");
  for (const f of draft.sourceLayout.files) {
    console.log(`  · ${f.role.padEnd(15)} → ${f.path}`);
  }
  console.log("components:     ", draft.components?.length ?? 0);
  for (const c of draft.components ?? []) {
    console.log(
      `  · ${c.name.padEnd(20)} ${c.file}${c.variants ? ` (${c.variants} exports)` : ""}`
    );
  }
  console.log("colors:         ", Object.keys(draft.tokens?.colors ?? {}).length);
  console.log("warnings:       ", draft.warnings.length);
  for (const w of draft.warnings) {
    console.log(`  ⚠ [${w.kind}] ${w.message}`);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
