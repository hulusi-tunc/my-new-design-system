import fs from "fs";
import path from "path";

const REGISTRY_DIR = path.join(process.cwd(), "design-systems");
const PUBLIC_DIR = path.join(process.cwd(), "public", "registry");

// Ensure public/registry exists
if (!fs.existsSync(PUBLIC_DIR)) {
  fs.mkdirSync(PUBLIC_DIR, { recursive: true });
}

// Read all design system directories
const entries = fs.readdirSync(REGISTRY_DIR, { withFileTypes: true });

for (const entry of entries) {
  if (!entry.isDirectory()) continue;

  const screenshotsDir = path.join(REGISTRY_DIR, entry.name, "screenshots");
  if (!fs.existsSync(screenshotsDir)) continue;

  const targetDir = path.join(PUBLIC_DIR, entry.name);
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }

  const files = fs.readdirSync(screenshotsDir);
  for (const file of files) {
    const src = path.join(screenshotsDir, file);
    const dest = path.join(targetDir, file);
    fs.copyFileSync(src, dest);
  }

  console.log(`Copied screenshots for: ${entry.name}`);
}

console.log("Screenshot copy complete.");
