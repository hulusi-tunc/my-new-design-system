import { getAllManifests, getForks } from "@/lib/registry";
import { CatalogClient } from "../catalog-client";

export default async function CatalogPage() {
  const allManifests = await getAllManifests();

  const systemsWithForkCount = allManifests.map((m) => ({
    manifest: m,
    forkCount: getForks(allManifests, m.slug).length,
  }));

  return <CatalogClient systems={systemsWithForkCount} />;
}
