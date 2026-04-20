import { notFound } from "next/navigation";
import {
  getAllManifests,
  getForks,
  getManifestsByCategory,
} from "@/lib/registry";
import { CATEGORIES, isValidCategory } from "@/lib/platforms";
import { CatalogClient } from "../../catalog-client";

export async function generateStaticParams() {
  return CATEGORIES.map((c) => ({ category: c.slug }));
}

interface PageProps {
  params: Promise<{ category: string }>;
}

export default async function CatalogCategoryPage({ params }: PageProps) {
  const { category } = await params;
  if (!isValidCategory(category)) notFound();

  const [categoryManifests, allManifests] = await Promise.all([
    getManifestsByCategory(category),
    getAllManifests(),
  ]);

  const systemsWithForkCount = categoryManifests.map((m) => ({
    manifest: m,
    forkCount: getForks(allManifests, m.slug).length,
  }));

  return <CatalogClient category={category} systems={systemsWithForkCount} />;
}
